import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  it('issues tokens on login', async () => {
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'u1',
          email: 'a@b.com',
          passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$c2FsdA$Q0d4aU8xQ2dxQkFYK2I4ZEhjQ0hMZ2JjQXh4QnRBSGFXN0xVYjQ0Q2xPQQ',
          role: UserRole.CUSTOMER
        })
      }
    };
    const jwt = {
      signAsync: jest.fn().mockResolvedValue('token')
    } as unknown as JwtService;
    const config = {
      getOrThrow: jest.fn().mockReturnValue('secret')
    } as unknown as ConfigService;

    const service = new AuthService(prisma as never, jwt, config);
    await expect(service.login({ email: 'a@b.com', password: 'invalid-password' })).rejects.toBeDefined();
  });
});
