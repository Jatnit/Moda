import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import * as argon2 from 'argon2';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  private static readonly failedAttempts = new Map<string, { count: number; lockUntil?: number }>();
  private static readonly maxAttempts = 5;
  private static readonly lockDurationMs = 15 * 60_000;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async register(input: RegisterDto) {
    const passwordHash = await argon2.hash(input.password, { type: argon2.argon2id });

    const user = await this.prisma.user.create({
      data: {
        email: input.email.toLowerCase(),
        passwordHash,
        fullName: input.fullName,
        role: input.role ?? UserRole.CUSTOMER
      }
    });

    return this.issueTokens(user.id, user.role, user.email);
  }

  async login(input: LoginDto, ipAddress?: string) {
    const attemptKey = `${input.email.toLowerCase()}|${ipAddress ?? 'unknown'}`;
    this.assertNotBlocked(attemptKey);

    const user = await this.prisma.user.findUnique({
      where: { email: input.email.toLowerCase() }
    });

    if (!user || !(await argon2.verify(user.passwordHash, input.password))) {
      this.recordFailure(attemptKey);
      await this.writeAudit({
        action: 'AUTH_LOGIN_FAILED',
        resource: 'auth',
        metadata: {
          email: input.email.toLowerCase(),
          ipAddress: ipAddress ?? null
        }
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    this.resetFailures(attemptKey);
    await this.writeAudit({
      userId: user.id,
      action: 'AUTH_LOGIN_SUCCESS',
      resource: 'auth',
      resourceId: user.id,
      metadata: {
        email: user.email,
        ipAddress: ipAddress ?? null
      }
    });

    return this.issueTokens(user.id, user.role, user.email);
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET')
      });

      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user?.refreshTokenHash) {
        throw new UnauthorizedException('Refresh token revoked');
      }

      const isValid = await argon2.verify(user.refreshTokenHash, refreshToken);
      if (!isValid) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.issueTokens(payload.sub, payload.role, payload.email);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: null }
    });
    await this.writeAudit({
      userId,
      action: 'AUTH_LOGOUT',
      resource: 'auth',
      resourceId: userId
    });
    return { ok: true };
  }

  private async issueTokens(userId: string, role: UserRole, email: string) {
    const payload = { sub: userId, role, email };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: '15m'
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: '7d'
      })
    ]);

    const refreshTokenHash = await argon2.hash(refreshToken, { type: argon2.argon2id });
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash }
    });

    return { accessToken, refreshToken, user: { id: userId, email, role } };
  }

  private assertNotBlocked(key: string) {
    const state = AuthService.failedAttempts.get(key);
    if (!state?.lockUntil) return;
    if (Date.now() > state.lockUntil) {
      AuthService.failedAttempts.delete(key);
      return;
    }
    throw new UnauthorizedException('Too many failed attempts. Try again later.');
  }

  private recordFailure(key: string) {
    const state = AuthService.failedAttempts.get(key) ?? { count: 0 };
    const nextCount = state.count + 1;
    if (nextCount >= AuthService.maxAttempts) {
      AuthService.failedAttempts.set(key, {
        count: nextCount,
        lockUntil: Date.now() + AuthService.lockDurationMs
      });
      return;
    }
    AuthService.failedAttempts.set(key, { count: nextCount });
  }

  private resetFailures(key: string) {
    AuthService.failedAttempts.delete(key);
  }

  private async writeAudit(input: {
    userId?: string;
    action: string;
    resource: string;
    resourceId?: string;
    metadata?: unknown;
  }) {
    const create = (this.prisma as any)?.auditLog?.create;
    if (typeof create !== 'function') return;
    await create({
      data: {
        userId: input.userId,
        action: input.action,
        resource: input.resource,
        resourceId: input.resourceId,
        metadata: input.metadata as any
      }
    });
  }
}
