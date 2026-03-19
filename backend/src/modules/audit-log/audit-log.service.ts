import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' } });
  }

  create(input: { userId?: string; action: string; resource: string; resourceId?: string; metadata?: unknown }) {
    const data: Prisma.AuditLogUncheckedCreateInput = {
      userId: input.userId,
      action: input.action,
      resource: input.resource,
      resourceId: input.resourceId,
      metadata: (input.metadata ?? null) as Prisma.InputJsonValue
    };
    return this.prisma.auditLog.create({ data });
  }
}
