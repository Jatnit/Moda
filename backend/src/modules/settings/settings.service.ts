import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

function parseJson(value: string | null) {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    const rows = await this.prisma.setting.findMany({ orderBy: { key: 'asc' } });
    return rows.map((row) => ({
      id: row.id.toString(),
      key: row.key,
      value: parseJson(row.value),
      updatedAt: row.updatedAt
    }));
  }

  async upsert(key: string, value: unknown) {
    const serialized = JSON.stringify(value ?? {});
    const row = await this.prisma.setting.upsert({
      where: { key },
      update: { value: serialized },
      create: { key, value: serialized }
    });

    return {
      id: row.id.toString(),
      key: row.key,
      value: parseJson(row.value),
      updatedAt: row.updatedAt
    };
  }
}
