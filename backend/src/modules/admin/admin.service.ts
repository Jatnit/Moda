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

  listOrders() {
    return this.prisma.order.findMany({
      include: {
        user: { select: { id: true, email: true, fullName: true } },
        items: true,
        statusHistory: { orderBy: { createdAt: 'desc' } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async updateOrderStatus(orderId: string, status: OrderStatus, note?: string) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id: orderId } });
      const updated = await tx.order.update({ where: { id: orderId }, data: { status } });
      await tx.orderStatusHistory.create({
        data: {
          orderId,
          fromStatus: order?.status,
          toStatus: status,
          note
        }
      });
      return updated;
    });
  }

  listOrderHistory(orderId: string) {
    return this.prisma.orderStatusHistory.findMany({
      where: { orderId },
      orderBy: { createdAt: 'desc' }
    });
  }

  listUsersAdvanced() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  lockUser(userId: string, locked: boolean) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { isActive: !locked }
    });
  }

  resetRole(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { role: UserRole.CUSTOMER }
    });
  }

  listCategories() {
    return this.prisma.postCategory.findMany({ orderBy: { createdAt: 'desc' } });
  }

  listTags() {
    return this.prisma.postTag.findMany({ orderBy: { createdAt: 'desc' } });
  }

  createCategory(name: string, slug: string) {
    return this.prisma.postCategory.upsert({
      where: { slug },
      update: { name },
      create: { name, slug }
    });
  }

  createTag(name: string, slug: string) {
    return this.prisma.postTag.upsert({
      where: { slug },
      update: { name },
      create: { name, slug }
    });
  }

  createPostAdvanced(input: {
    title: string;
    slug: string;
    excerpt?: string;
    content: string;
    status?: string;
    seoTitle?: string;
    seoDescription?: string;
    categories?: string[];
    tags?: string[];
  }) {
    return this.prisma.$transaction(async (tx) => {
      const post = await tx.post.upsert({
        where: { slug: input.slug },
        update: {
          title: input.title,
          excerpt: input.excerpt,
          content: input.content,
          status: input.status ?? 'DRAFT',
          seoTitle: input.seoTitle,
          seoDescription: input.seoDescription
        },
        create: {
          title: input.title,
          slug: input.slug,
          excerpt: input.excerpt,
          content: input.content,
          status: input.status ?? 'DRAFT',
          seoTitle: input.seoTitle,
          seoDescription: input.seoDescription
        }
      });

      await tx.postCategoryMap.deleteMany({ where: { postId: post.id } });
      await tx.postTagMap.deleteMany({ where: { postId: post.id } });

      for (const categorySlug of input.categories ?? []) {
        const category = await tx.postCategory.upsert({
          where: { slug: categorySlug },
          update: {},
          create: { slug: categorySlug, name: categorySlug }
        });
        await tx.postCategoryMap.create({ data: { postId: post.id, categoryId: category.id } });
      }

      for (const tagSlug of input.tags ?? []) {
        const tag = await tx.postTag.upsert({
          where: { slug: tagSlug },
          update: {},
          create: { slug: tagSlug, name: tagSlug }
        });
        await tx.postTagMap.create({ data: { postId: post.id, tagId: tag.id } });
      }

      return post;
    });
  }

  logAccess(input: { userId?: string; ipAddress?: string; device?: string; route: string; method: string }) {
    return this.prisma.accessLog.create({ data: input });
  }

  listAccessLogs() {
    return this.prisma.accessLog.findMany({
      include: { user: { select: { id: true, email: true, fullName: true } } },
      orderBy: { createdAt: 'desc' }
    });
  }
}
