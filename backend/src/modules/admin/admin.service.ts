import { OrderStatus, UserRole } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async dashboard() {
    const [users, products, orders, posts] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.product.count(),
      this.prisma.order.count(),
      this.prisma.post.count()
    ]);

    return { users, products, orders, posts };
  }

  async listOrders() {
    const rows = await this.prisma.order.findMany({ include: { items: true }, orderBy: { createdAt: 'desc' } });
    return rows.map((row) => ({
      id: row.id.toString(),
      orderNo: row.orderNo,
      status: row.status,
      totalAmount: Number(row.grandTotal),
      createdAt: row.createdAt,
      items: row.items.map((it) => ({ id: it.id.toString(), quantity: it.quantity, unitPrice: Number(it.unitPrice) }))
    }));
  }

  async updateOrderStatus(orderId: string, status: OrderStatus, note?: string) {
    const updated = await this.prisma.order.update({ where: { id: BigInt(orderId) }, data: { status } });
    await this.prisma.auditLog.create({
      data: {
        userId: updated.userId,
        action: 'ORDER_STATUS_UPDATED',
        resource: 'order',
        resourceId: String(updated.id),
        metadata: JSON.stringify({ note: note ?? null, status })
      }
    });
    return updated;
  }

  listOrderHistory(orderId: string) {
    return this.prisma.auditLog.findMany({
      where: { resource: 'order', resourceId: orderId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async listUsersAdvanced() {
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
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    }));
  }

  lockUser(userId: string, locked: boolean) {
    return this.prisma.user.update({
      where: { id: BigInt(userId) },
      data: { status: locked ? 'LOCKED' : 'ACTIVE' }
    });
  }

  async resetRole(userId: string) {
    const uid = BigInt(userId);
    const role = await this.prisma.role.findUnique({ where: { code: UserRole.CUSTOMER } });
    if (!role) return { ok: false };
    await this.prisma.userRoleMap.deleteMany({ where: { userId: uid } });
    await this.prisma.userRoleMap.create({ data: { userId: uid, roleId: role.id } });
    return { ok: true };
  }

  listCategories() {
    return this.prisma.postCategory.findMany({ orderBy: { createdAt: 'desc' } });
  }

  listTags() {
    return this.prisma.postTag.findMany({ orderBy: { createdAt: 'desc' } });
  }

  createCategory(name: string, slug: string) {
    return this.prisma.postCategory.upsert({ where: { slug }, update: { name }, create: { name, slug } });
  }

  createTag(name: string, slug: string) {
    return this.prisma.postTag.upsert({ where: { slug }, update: { name }, create: { name, slug } });
  }

  updateCategory(id: string, input: { name?: string; slug?: string }) {
    return this.prisma.postCategory.update({ where: { id: BigInt(id) }, data: input });
  }

  deleteCategory(id: string) {
    return this.prisma.postCategory.delete({ where: { id: BigInt(id) } });
  }

  updateTag(id: string, input: { name?: string; slug?: string }) {
    return this.prisma.postTag.update({ where: { id: BigInt(id) }, data: input });
  }

  deleteTag(id: string) {
    return this.prisma.postTag.delete({ where: { id: BigInt(id) } });
  }

  createPostAdvanced(input: {
    title: string;
    slug: string;
    excerpt?: string;
    content: string;
    status?: string;
    seoTitle?: string;
    seoDescription?: string;
  }) {
    return this.prisma.post.upsert({
      where: { slug: input.slug },
      update: {
        title: input.title,
        excerpt: input.excerpt,
        content: input.content,
        status: (input.status as any) ?? 'DRAFT',
        seoTitle: input.seoTitle,
        seoDescription: input.seoDescription
      },
      create: {
        title: input.title,
        slug: input.slug,
        excerpt: input.excerpt,
        content: input.content,
        status: (input.status as any) ?? 'DRAFT',
        seoTitle: input.seoTitle,
        seoDescription: input.seoDescription
      }
    });
  }

  listPostsAdvanced() {
    return this.prisma.post.findMany({ orderBy: { createdAt: 'desc' } });
  }

  getPostAdvanced(id: string) {
    return this.prisma.post.findUnique({ where: { id: BigInt(id) } });
  }

  updatePostAdvanced(
    id: string,
    input: {
      title?: string;
      slug?: string;
      excerpt?: string;
      content?: string;
      status?: string;
      seoTitle?: string;
      seoDescription?: string;
    }
  ) {
    return this.prisma.post.update({ where: { id: BigInt(id) }, data: { ...(input as any) } });
  }

  deletePostAdvanced(id: string) {
    return this.prisma.post.delete({ where: { id: BigInt(id) } });
  }

  logAccess(input: { userId?: string; ipAddress?: string; device?: string; route: string; method: string }) {
    return this.prisma.accessLog.create({
      data: {
        userId: input.userId ? BigInt(input.userId) : null,
        ipAddress: input.ipAddress,
        device: input.device,
        route: `${input.method} ${input.route}`,
        method: true
      }
    });
  }

  listAccessLogs() {
    return this.prisma.accessLog.findMany({ orderBy: { createdAt: 'desc' } });
  }
}
