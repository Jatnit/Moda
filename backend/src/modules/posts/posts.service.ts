import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

function serializePost(row: any) {
  return {
    id: row.id.toString(),
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt ?? undefined,
    content: row.content ?? undefined,
    status: row.status,
    createdAt: row.createdAt
  };
}

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    const rows = await this.prisma.post.findMany({
      where: { status: 'PUBLISHED' as any },
      orderBy: { createdAt: 'desc' }
    });
    return rows.map(serializePost);
  }

  async create(data: { title: string; slug: string; excerpt?: string; content: string }) {
    const row = await this.prisma.post.create({
      data: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        status: 'DRAFT' as any
      }
    });
    return serializePost(row);
  }

  createAdvanced(data: {
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
    return this.prisma.post.upsert({
      where: { slug: data.slug },
      update: {
        title: data.title,
        excerpt: data.excerpt,
        content: data.content,
        status: ((data.status ?? 'DRAFT') as any),
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription
      },
      create: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        status: ((data.status ?? 'DRAFT') as any),
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription
      }
    }).then(serializePost);
  }
}
