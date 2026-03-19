import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiTags } from '@nestjs/swagger';
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

  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('register')
  async register(@Body() body: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const tokens = await this.authService.register(body);
    res.cookie('refresh_token', tokens.refreshToken, this.getRefreshCookieOptions());
    return { accessToken: tokens.accessToken, user: tokens.user };
  }

  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('login')
  async login(@Body() body: LoginDto, @Res({ passthrough: true }) res: Response) {
    const tokens = await this.authService.login(body);
    res.cookie('refresh_token', tokens.refreshToken, this.getRefreshCookieOptions());
    return { accessToken: tokens.accessToken, user: tokens.user };
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const tokenFromCookie = req.cookies?.refresh_token as string | undefined;
    const tokenFromHeader = req.headers.authorization?.replace('Bearer ', '');
    const tokens = await this.authService.refreshToken(tokenFromCookie ?? tokenFromHeader ?? '');
    res.cookie('refresh_token', tokens.refreshToken, this.getRefreshCookieOptions());
    return { accessToken: tokens.accessToken, user: tokens.user };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    await this.authService.logout(String((req as any).user.sub));
    res.clearCookie('refresh_token', { path: '/api/v1/auth' });
    return { ok: true };
  }
}
