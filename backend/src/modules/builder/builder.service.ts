import { Injectable, NotFoundException } from '@nestjs/common';
import { PageStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { sanitizeDeep } from '../../common/utils/sanitize.util';

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
    const cleanedSchema = sanitizeDeep(input.jsonSchema);
    const page = await this.prisma.page.upsert({
      where: { slug: input.slug },
      update: { status: PageStatus.DRAFT, version: { increment: 1 } },
      create: { slug: input.slug, status: PageStatus.DRAFT }
    });

    const version = await this.prisma.pageVersion.create({
      data: {
        pageId: page.id,
        jsonSchema: cleanedSchema as Prisma.InputJsonValue,
        createdBy: input.createdBy
      }
    });

    await this.prisma.auditLog.create({
      data: {
        userId: input.createdBy,
        action: 'BUILDER_SAVE_DRAFT',
        resource: 'builder_page',
        resourceId: page.id,
        metadata: {
          slug: input.slug,
          versionId: version.id
        }
      }
    });

    return { page, version };
  }

  async publish(pageId: string, actorId?: string) {
    const page = await this.prisma.page.findUnique({ where: { id: pageId } });
    if (!page) {
      throw new NotFoundException('Page not found');
    }

    const updated = await this.prisma.page.update({
      where: { id: pageId },
      data: { status: PageStatus.PUBLISHED }
    });

    await this.prisma.auditLog.create({
      data: {
        userId: actorId,
        action: 'BUILDER_PUBLISH',
        resource: 'builder_page',
        resourceId: pageId
      }
    });
    return updated;
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

  listVersions(pageId: string) {
    return this.prisma.pageVersion.findMany({
      where: { pageId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async rollback(pageId: string, versionId: string, actorId?: string) {
    const version = await this.prisma.pageVersion.findFirst({
      where: { id: versionId, pageId }
    });
    if (!version) {
      throw new NotFoundException('Version not found');
    }

    const page = await this.prisma.page.update({
      where: { id: pageId },
      data: { version: { increment: 1 }, status: PageStatus.DRAFT }
    });

    const rollbackVersion = await this.prisma.pageVersion.create({
      data: {
        pageId,
        jsonSchema: version.jsonSchema as Prisma.InputJsonValue,
        createdBy: actorId ?? version.createdBy
      }
    });

    await this.prisma.auditLog.create({
      data: {
        userId: actorId,
        action: 'BUILDER_ROLLBACK',
        resource: 'builder_page',
        resourceId: pageId,
        metadata: {
          fromVersionId: versionId,
          rollbackVersionId: rollbackVersion.id
        }
      }
    });

    return { page, rollbackVersion };
  }

  async listReusableBlocks() {
    const setting = await this.prisma.setting.findUnique({
      where: { key: 'builder_reusable_blocks' }
    });
    return (setting?.value ?? []) as unknown[];
  }

  async saveReusableBlock(input: { name: string; block: unknown; actorId?: string }) {
    const list = (await this.listReusableBlocks()) as Array<{ name: string; block: unknown }>;
    const cleanedBlock = sanitizeDeep(input.block);
    const existingIndex = list.findIndex((item) => item.name === input.name);
    if (existingIndex >= 0) {
      list[existingIndex] = { name: input.name, block: cleanedBlock };
    } else {
      list.push({ name: input.name, block: cleanedBlock });
    }

    await this.prisma.setting.upsert({
      where: { key: 'builder_reusable_blocks' },
      update: { value: list as Prisma.InputJsonValue },
      create: { key: 'builder_reusable_blocks', value: list as Prisma.InputJsonValue }
    });

    await this.prisma.auditLog.create({
      data: {
        userId: input.actorId,
        action: 'BUILDER_SAVE_REUSABLE',
        resource: 'builder_reusable_block',
        metadata: { name: input.name }
      }
    });

    return list;
  }

  listTemplates() {
    return [
      {
        name: 'Hero + CTA',
        blocks: [
          { id: `hero-${Date.now()}`, type: 'hero', props: { title: 'Your Main Headline', subtitle: 'Subtitle' } },
          { id: `button-${Date.now()}`, type: 'button', props: { label: 'Shop Now', href: '/products' } }
        ]
      },
      {
        name: 'Feature Text',
        blocks: [
          { id: `text-${Date.now()}`, type: 'text', props: { content: 'Tell users your value proposition.' } }
        ]
      },
      {
        name: 'Product Showcase',
        blocks: [{ id: `grid-${Date.now()}`, type: 'product-grid', props: { title: 'Featured', limit: 6 } }]
      },
      {
        name: 'Template: Product Page',
        blocks: [
          {
            id: `hero-product-${Date.now()}`,
            type: 'hero',
            props: { title: '{{products.0.name}}', subtitle: 'Price: ${{products.0.price}}' }
          },
          {
            id: `product-grid-${Date.now()}`,
            type: 'product-grid',
            props: { title: 'Related Products', source: 'products', limit: 4 }
          }
        ]
      },
      {
        name: 'Template: Post Page',
        blocks: [
          {
            id: `hero-post-${Date.now()}`,
            type: 'hero',
            props: { title: '{{posts.0.title}}', subtitle: '{{posts.0.excerpt}}' }
          },
          {
            id: `post-grid-${Date.now()}`,
            type: 'product-grid',
            props: { title: 'Latest Posts', source: 'posts', limit: 4 }
          }
        ]
      },
      {
        name: 'Template: Category Page',
        blocks: [
          {
            id: `category-text-${Date.now()}`,
            type: 'text',
            props: { content: 'Category landing powered by builder theme template.' }
          },
          {
            id: `category-products-${Date.now()}`,
            type: 'product-grid',
            props: { title: 'Category Products', source: 'products', limit: 8 }
          }
        ]
      }
    ];
  }
}
