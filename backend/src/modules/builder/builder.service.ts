import { Injectable, NotFoundException } from '@nestjs/common';
import { PageStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class BuilderService {
  constructor(private readonly prisma: PrismaService) {}

  listPages() {
    return this.prisma.page.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        versions: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });
  }

  async saveDraft(input: { slug: string; jsonSchema: unknown; createdBy?: string }) {
    const page = await this.prisma.page.upsert({
      where: { slug: input.slug },
      update: { status: PageStatus.DRAFT, version: { increment: 1 } },
      create: { slug: input.slug, status: PageStatus.DRAFT }
    });

    const version = await this.prisma.pageVersion.create({
      data: {
        pageId: page.id,
        jsonSchema: input.jsonSchema as Prisma.InputJsonValue,
        createdBy: input.createdBy
      }
    });

    return { page, version };
  }

  async publish(pageId: string) {
    const page = await this.prisma.page.findUnique({ where: { id: pageId } });
    if (!page) {
      throw new NotFoundException('Page not found');
    }

    return this.prisma.page.update({
      where: { id: pageId },
      data: { status: PageStatus.PUBLISHED }
    });
  }

  async preview(pageId: string) {
    const latest = await this.prisma.pageVersion.findFirst({
      where: { pageId },
      orderBy: { createdAt: 'desc' }
    });

    if (!latest) {
      throw new NotFoundException('No page version found');
    }

    return latest;
  }

  async latestBySlug(slug: string) {
    const page = await this.prisma.page.findUnique({ where: { slug } });
    if (!page) {
      throw new NotFoundException('Page not found');
    }
    const latest = await this.prisma.pageVersion.findFirst({
      where: { pageId: page.id },
      orderBy: { createdAt: 'desc' }
    });
    return { page, latest };
  }

  async publishedBySlug(slug: string) {
    const page = await this.prisma.page.findFirst({
      where: { slug, status: PageStatus.PUBLISHED }
    });
    if (!page) {
      throw new NotFoundException('Published page not found');
    }
    const latest = await this.prisma.pageVersion.findFirst({
      where: { pageId: page.id },
      orderBy: { createdAt: 'desc' }
    });
    return { page, latest };
  }
}
