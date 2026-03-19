import { Injectable, NotFoundException } from '@nestjs/common';
import { PageStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { sanitizeDeep } from '../../common/utils/sanitize.util';

function parseSchema(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return { blocks: [] };
  }
}

@Injectable()
export class BuilderService {
  constructor(private readonly prisma: PrismaService) {}

  async listPages() {
    const pages = await this.prisma.page.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        versions: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    return pages.map((page) => ({
      id: page.id.toString(),
      slug: page.slug,
      status: page.status,
      version: page.currentVersionNo,
      latest: page.versions[0]
        ? {
            id: page.versions[0].id.toString(),
            versionNo: page.versions[0].versionNo,
            jsonSchema: parseSchema(page.versions[0].jsonSchema),
            createdAt: page.versions[0].createdAt
          }
        : null
    }));
  }

  async saveDraft(input: { slug: string; jsonSchema: unknown; createdBy?: string }) {
    const cleanedSchema = sanitizeDeep(input.jsonSchema);
    const page = await this.prisma.page.upsert({
      where: { slug: input.slug },
      update: { status: PageStatus.DRAFT, currentVersionNo: { increment: 1 } },
      create: { slug: input.slug, name: input.slug, status: PageStatus.DRAFT }
    });

    const version = await this.prisma.pageVersion.create({
      data: {
        pageId: page.id,
        versionNo: page.currentVersionNo,
        jsonSchema: JSON.stringify(cleanedSchema),
        isPublished: false
      }
    });

    return {
      page: {
        id: page.id.toString(),
        slug: page.slug,
        status: page.status,
        version: page.currentVersionNo
      },
      version: {
        id: version.id.toString(),
        versionNo: version.versionNo,
        jsonSchema: parseSchema(version.jsonSchema)
      }
    };
  }

  async publish(pageId: string) {
    const updated = await this.prisma.page.update({
      where: { id: BigInt(pageId) },
      data: { status: PageStatus.PUBLISHED }
    });

    return {
      id: updated.id.toString(),
      slug: updated.slug,
      status: updated.status,
      version: updated.currentVersionNo
    };
  }

  async preview(pageId: string) {
    const latest = await this.prisma.pageVersion.findFirst({
      where: { pageId: BigInt(pageId) },
      orderBy: { createdAt: 'desc' }
    });

    if (!latest) {
      throw new NotFoundException('No page version found');
    }

    return {
      id: latest.id.toString(),
      pageId: latest.pageId.toString(),
      versionNo: latest.versionNo,
      jsonSchema: parseSchema(latest.jsonSchema),
      createdAt: latest.createdAt
    };
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
    return {
      page: { id: page.id.toString(), slug: page.slug, status: page.status, version: page.currentVersionNo },
      latest: latest
        ? {
            id: latest.id.toString(),
            versionNo: latest.versionNo,
            jsonSchema: parseSchema(latest.jsonSchema),
            createdAt: latest.createdAt
          }
        : null
    };
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
    return {
      page: { id: page.id.toString(), slug: page.slug, status: page.status, version: page.currentVersionNo },
      latest: latest
        ? {
            id: latest.id.toString(),
            versionNo: latest.versionNo,
            jsonSchema: parseSchema(latest.jsonSchema),
            createdAt: latest.createdAt
          }
        : null
    };
  }

  async listVersions(pageId: string) {
    const versions = await this.prisma.pageVersion.findMany({
      where: { pageId: BigInt(pageId) },
      orderBy: { createdAt: 'desc' }
    });

    return versions.map((item) => ({
      id: item.id.toString(),
      versionNo: item.versionNo,
      createdAt: item.createdAt
    }));
  }

  async rollback(pageId: string, versionId: string) {
    const version = await this.prisma.pageVersion.findFirst({
      where: { id: BigInt(versionId), pageId: BigInt(pageId) }
    });
    if (!version) {
      throw new NotFoundException('Version not found');
    }

    const page = await this.prisma.page.update({
      where: { id: BigInt(pageId) },
      data: { currentVersionNo: { increment: 1 }, status: PageStatus.DRAFT }
    });

    const rollbackVersion = await this.prisma.pageVersion.create({
      data: {
        pageId: page.id,
        versionNo: page.currentVersionNo,
        jsonSchema: version.jsonSchema,
        isPublished: false
      }
    });

    return {
      page: { id: page.id.toString(), slug: page.slug, status: page.status, version: page.currentVersionNo },
      rollbackVersion: {
        id: rollbackVersion.id.toString(),
        versionNo: rollbackVersion.versionNo,
        createdAt: rollbackVersion.createdAt
      }
    };
  }

  async listReusableBlocks() {
    const setting = await this.prisma.setting.findUnique({ where: { key: 'builder_reusable_blocks' } });
    return parseSchema(setting?.value ?? '[]');
  }

  async saveReusableBlock(input: { name: string; block: unknown }) {
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
      update: { value: JSON.stringify(list) },
      create: { key: 'builder_reusable_blocks', value: JSON.stringify(list) }
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
        blocks: [{ id: `text-${Date.now()}`, type: 'text', props: { content: 'Tell users your value proposition.' } }]
      },
      {
        name: 'Product Showcase',
        blocks: [{ id: `grid-${Date.now()}`, type: 'product-grid', props: { title: 'Featured', limit: 6 } }]
      }
    ];
  }
}
