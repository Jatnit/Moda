import { Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    const rows = await this.prisma.user.findMany({
      include: { roles: { include: { role: true } } },
      orderBy: { createdAt: 'desc' }
    });

    return rows.map((row) => ({
      id: row.id.toString(),
      email: row.email,
      fullName: row.fullName,
      role: (row.roles[0]?.role.code ?? UserRole.CUSTOMER) as UserRole,
      isActive: row.status === 'ACTIVE',
      createdAt: row.createdAt
    }));
  }

  async updateRole(userId: string, role: UserRole) {
    const uid = BigInt(userId);
    const roleRow = await this.prisma.role.findUnique({ where: { code: role } });
    if (!roleRow) return { ok: false };

    await this.prisma.userRoleMap.deleteMany({ where: { userId: uid } });
    await this.prisma.userRoleMap.create({ data: { userId: uid, roleId: roleRow.id } });

    return { ok: true };
  }

  setLock(userId: string, locked: boolean) {
    return this.prisma.user.update({
      where: { id: BigInt(userId) },
      data: { status: locked ? 'LOCKED' : 'ACTIVE' }
    });
  }
}
