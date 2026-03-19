import { Body, Controller, ForbiddenException, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiTags } from '@nestjs/swagger';
import { randomBytes } from 'crypto';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private getRefreshCookieOptions() {
    const isProd = process.env.NODE_ENV === 'production';
    return {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax' as const,
      path: '/api/v1/auth',
      maxAge: 7 * 24 * 60 * 60 * 1000
    };
  }

  private getCsrfCookieOptions() {
    const isProd = process.env.NODE_ENV === 'production';
    return {
      httpOnly: false,
      secure: isProd,
      sameSite: 'lax' as const,
      path: '/api/v1/auth',
      maxAge: 7 * 24 * 60 * 60 * 1000
    };
  }

  private issueCsrfToken() {
    return randomBytes(24).toString('hex');
  }

  private assertCsrf(req: Request) {
    const cookieToken = req.cookies?.csrf_token as string | undefined;
    const headerToken = req.headers['x-csrf-token'];
    const requestToken = Array.isArray(headerToken) ? headerToken[0] : headerToken;
    if (!cookieToken || !requestToken || cookieToken !== requestToken) {
      throw new ForbiddenException('Invalid CSRF token');
    }
  }

  @Get('csrf-token')
  csrfToken(@Res({ passthrough: true }) res: Response) {
    const token = this.issueCsrfToken();
    res.cookie('csrf_token', token, this.getCsrfCookieOptions());
    return { csrfToken: token };
  }

  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('register')
  async register(@Body() body: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const tokens = await this.authService.register(body);
    res.cookie('refresh_token', tokens.refreshToken, this.getRefreshCookieOptions());
    const csrfToken = this.issueCsrfToken();
    res.cookie('csrf_token', csrfToken, this.getCsrfCookieOptions());
    return { accessToken: tokens.accessToken, user: tokens.user };
  }

  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('login')
  async login(@Body() body: LoginDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const tokens = await this.authService.login(body, req.ip);
    res.cookie('refresh_token', tokens.refreshToken, this.getRefreshCookieOptions());
    const csrfToken = this.issueCsrfToken();
    res.cookie('csrf_token', csrfToken, this.getCsrfCookieOptions());
    return { accessToken: tokens.accessToken, user: tokens.user };
  }

  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    this.assertCsrf(req);
    const tokenFromCookie = req.cookies?.refresh_token as string | undefined;
    const tokenFromHeader = req.headers.authorization?.replace('Bearer ', '');
    const tokens = await this.authService.refreshToken(tokenFromCookie ?? tokenFromHeader ?? '');
    res.cookie('refresh_token', tokens.refreshToken, this.getRefreshCookieOptions());
    const csrfToken = this.issueCsrfToken();
    res.cookie('csrf_token', csrfToken, this.getCsrfCookieOptions());
    return { accessToken: tokens.accessToken, user: tokens.user };
  }

  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    this.assertCsrf(req);
    await this.authService.logout(String((req as any).user.sub));
    res.clearCookie('refresh_token', { path: '/api/v1/auth' });
    res.clearCookie('csrf_token', { path: '/api/v1/auth' });
    return { ok: true };
  }
}
