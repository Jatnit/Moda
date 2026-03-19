import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.setting.findMany({ orderBy: { key: 'asc' } });
  }

  async upsert(key: string, value: unknown) {
    const normalized = (value ?? {}) as Prisma.InputJsonValue;
    return this.prisma.setting.upsert({
      where: { key },
      update: { value: normalized },
      create: { key, value: normalized }
    });
  }
}
