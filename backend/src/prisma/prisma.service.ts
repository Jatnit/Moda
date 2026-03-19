import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    const maxRetries = 10;
    const delayMs = 1500;
    let lastError: unknown;

    for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
      try {
        await this.$connect();
        return;
      } catch (error) {
        lastError = error;
        if (attempt === maxRetries) break;
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    throw lastError;
  }

  async enableShutdownHooks(app: INestApplication): Promise<void> {
    (this as any).$on('beforeExit', async () => {
      await app.close();
    });
  }
}
