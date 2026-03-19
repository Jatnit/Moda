import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' } });
  }

  create(input: { userId?: string; action: string; resource: string; resourceId?: string; metadata?: unknown }) {
    return this.prisma.auditLog.create({
      data: {
        userId: input.userId ? BigInt(input.userId) : null,
        action: input.action,
        resource: input.resource,
        resourceId: input.resourceId ?? '-',
        metadata: input.metadata ? JSON.stringify(input.metadata) : null
      }
    });
  }
}
