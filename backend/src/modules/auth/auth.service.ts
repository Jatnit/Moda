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
    const roleCode = UserRole.CUSTOMER;

    const user = await this.prisma.user.create({
      data: {
        email: input.email.toLowerCase(),
        passwordHash,
        fullName: input.fullName,
        status: 'ACTIVE'
      }
    });

    const role = await this.prisma.role.findUnique({ where: { code: roleCode } });
    if (role) {
      await this.prisma.userRoleMap.create({
        data: {
          userId: user.id,
          roleId: role.id
        }
      });
    }

    return this.issueTokens(user.id, roleCode, user.email, undefined, undefined);
  }

  async login(input: LoginDto, ipAddress?: string) {
    const attemptKey = `${input.email.toLowerCase()}|${ipAddress ?? 'unknown'}`;
    this.assertNotBlocked(attemptKey);

    const user = await this.prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });

    if (!user || !(await argon2.verify(user.passwordHash, input.password))) {
      this.recordFailure(attemptKey);
      await this.writeAudit({
        action: 'AUTH_LOGIN_FAILED',
        resource: 'auth',
        metadata: { email: input.email.toLowerCase(), ipAddress: ipAddress ?? null }
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    const roleMap = await this.prisma.userRoleMap.findFirst({
      where: { userId: user.id },
      include: { role: true },
      orderBy: { createdAt: 'asc' }
    });

    const role = (roleMap?.role.code ?? UserRole.CUSTOMER) as UserRole;

    this.resetFailures(attemptKey);
    await this.writeAudit({
      userId: user.id,
      action: 'AUTH_LOGIN_SUCCESS',
      resource: 'auth',
      resourceId: String(user.id),
      metadata: { email: user.email, ipAddress: ipAddress ?? null }
    });

    return this.issueTokens(user.id, role, user.email, ipAddress, undefined);
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET')
      });

      const userId = BigInt(payload.sub);
      const existing = await this.prisma.refreshToken.findFirst({
        where: {
          userId,
          revokedAt: null,
          expiresAt: { gt: new Date() }
        },
        orderBy: { createdAt: 'desc' }
      });

      if (!existing) {
        throw new UnauthorizedException('Refresh token revoked');
      }

      const isValid = await argon2.verify(existing.tokenHash, refreshToken);
      if (!isValid) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.issueTokens(userId, payload.role as UserRole, payload.email, undefined, undefined);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string) {
    await this.prisma.refreshToken.updateMany({
      where: { userId: BigInt(userId), revokedAt: null },
      data: { revokedAt: new Date() }
    });
    await this.writeAudit({ userId: BigInt(userId), action: 'AUTH_LOGOUT', resource: 'auth', resourceId: userId });
    return { ok: true };
  }

  private async issueTokens(
    userId: bigint,
    role: UserRole,
    email: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    const payload = { sub: userId.toString(), role, email };

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
    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: refreshTokenHash,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        ipAddress: ipAddress ?? null,
        userAgent: userAgent ?? null
      }
    });

    return { accessToken, refreshToken, user: { id: userId.toString(), email, role } };
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
    userId?: bigint;
    action: string;
    resource: string;
    resourceId?: string;
    metadata?: unknown;
  }) {
    await this.prisma.auditLog.create({
      data: {
        userId: input.userId,
        action: input.action,
        resource: input.resource,
        resourceId: input.resourceId ?? '-',
        metadata: input.metadata ? JSON.stringify(input.metadata) : null
      }
    });
  }
}
