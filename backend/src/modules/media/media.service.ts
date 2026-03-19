import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { AttachMediaDto } from './dto/attach-media.dto';
import { MediaOwnerType, RequestSignedUploadDto } from './dto/request-signed-upload.dto';

@Injectable()
export class MediaService {
  private readonly allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService
  ) {}

  list() {
    return this.prisma.media.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async createMetadata(input: AttachMediaDto) {
    return this.prisma.$transaction(async (tx) => {
      if (input.replaceExisting && input.ownerId) {
        await tx.media.deleteMany({
          where: {
            ownerType: input.ownerType,
            ownerId: input.ownerId,
            publicId: { not: input.publicId }
          }
        });
      }

      const createPayload = {
        publicId: input.publicId,
        secureUrl: input.secureUrl,
        resourceType: input.resourceType,
        format: input.format,
        width: input.width,
        height: input.height,
        bytes: input.bytes,
        folder: input.folder,
        altText: input.altText,
        ownerType: input.ownerType,
        ownerId: input.ownerId,
        createdBy: input.createdBy
      };

      return tx.media.upsert({
        where: { publicId: input.publicId },
        update: {
          secureUrl: input.secureUrl,
          resourceType: input.resourceType,
          format: input.format,
          width: input.width,
          height: input.height,
          bytes: input.bytes,
          folder: input.folder,
          altText: input.altText,
          ownerType: input.ownerType,
          ownerId: input.ownerId,
          createdBy: input.createdBy
        },
        create: createPayload
      });
    });
  }

  deleteByPublicId(publicId: string) {
    return this.prisma.media.delete({ where: { publicId } });
  }

  buildSignedUploadParams(input: RequestSignedUploadDto) {
    if (!this.allowedMimeTypes.has(input.mimeType)) {
      throw new BadRequestException('Unsupported MIME type');
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME', '');
    const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY', '');
    const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET', '');
    const folder = this.resolveFolder(input.ownerType, input.ownerId);

    const toSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    const signature = createHash('sha1').update(toSign).digest('hex');

    return {
      cloudName,
      apiKey,
      folder,
      timestamp,
      signature,
      uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`
    };
  }

  transformToOptimizedUrl(url: string): string {
    if (!url.includes('/upload/')) {
      return url;
    }
    return url.replace('/upload/', '/upload/f_auto,q_auto/');
  }

  buildResponsiveVariants(url: string) {
    if (!url.includes('/upload/')) {
      return {
        thumb: url,
        medium: url,
        large: url
      };
    }

    return {
      thumb: url.replace('/upload/', '/upload/f_auto,q_auto,c_fill,w_200,h_200/'),
      medium: url.replace('/upload/', '/upload/f_auto,q_auto,c_fit,w_640/'),
      large: url.replace('/upload/', '/upload/f_auto,q_auto,c_fit,w_1280/')
    };
  }

  async cleanupOrphans() {
    const items = await this.prisma.media.findMany({
      where: { ownerId: { not: null } },
      select: { id: true, publicId: true, ownerType: true, ownerId: true }
    });

    const orphanIds: string[] = [];

    for (const item of items) {
      const ownerId = item.ownerId ?? '';
      let exists = true;

      if (item.ownerType === 'product') {
        exists = !!(await this.prisma.product.findUnique({ where: { id: ownerId }, select: { id: true } }));
      } else if (item.ownerType === 'post') {
        exists = !!(await this.prisma.post.findUnique({ where: { id: ownerId }, select: { id: true } }));
      } else if (item.ownerType === 'builder') {
        exists = !!(await this.prisma.page.findUnique({ where: { id: ownerId }, select: { id: true } }));
      } else if (item.ownerType === 'avatar') {
        exists = !!(await this.prisma.user.findUnique({ where: { id: ownerId }, select: { id: true } }));
      }

      if (!exists) {
        orphanIds.push(item.id);
      }
    }

    const deleted = orphanIds.length
      ? await this.prisma.media.deleteMany({ where: { id: { in: orphanIds } } })
      : { count: 0 };

    return { checked: items.length, deletedCount: deleted.count, orphanIds };
  }

  private resolveFolder(ownerType: MediaOwnerType, ownerId?: string): string {
    if (ownerType === MediaOwnerType.PRODUCT) {
      return `products/${ownerId ?? 'temp'}`;
    }
    if (ownerType === MediaOwnerType.POST) {
      return `posts/${ownerId ?? 'temp'}`;
    }
    if (ownerType === MediaOwnerType.AVATAR) {
      return `users/avatars/${ownerId ?? 'temp'}`;
    }
    return `builder/${ownerId ?? 'temp'}`;
  }
}
