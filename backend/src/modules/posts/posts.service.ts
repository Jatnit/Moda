import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.post.findMany({ orderBy: { createdAt: 'desc' } });
  }

  create(data: { title: string; slug: string; excerpt?: string; content: string }) {
    return this.prisma.post.create({ data });
  }

  async createAdvanced(data: {
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
      const post = await tx.post.create({
        data: {
          title: data.title,
          slug: data.slug,
          excerpt: data.excerpt,
          content: data.content,
          status: data.status ?? 'DRAFT',
          seoTitle: data.seoTitle,
          seoDescription: data.seoDescription
        }
      });

      for (const slug of data.categories ?? []) {
        const category = await tx.postCategory.upsert({
          where: { slug },
          update: {},
          create: { slug, name: slug }
        });
        await tx.postCategoryMap.upsert({
          where: { postId_categoryId: { postId: post.id, categoryId: category.id } },
          update: {},
          create: { postId: post.id, categoryId: category.id }
        });
      }

      for (const slug of data.tags ?? []) {
        const tag = await tx.postTag.upsert({
          where: { slug },
          update: {},
          create: { slug, name: slug }
        });
        await tx.postTagMap.upsert({
          where: { postId_tagId: { postId: post.id, tagId: tag.id } },
          update: {},
          create: { postId: post.id, tagId: tag.id }
        });
      }

      return post;
    });
  }
}
