import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import { media_resource_type } from '@prisma/client';
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

  async list() {
    const rows = await this.prisma.media.findMany({ orderBy: { createdAt: 'desc' } });
    return rows.map((row) => ({
      id: row.id.toString(),
      publicId: row.publicId,
      secureUrl: row.secureUrl,
      resourceType: row.resourceType,
      format: row.format,
      width: row.width,
      height: row.height,
      bytes: row.bytes ? Number(row.bytes) : null,
      folder: row.folder,
      altText: row.altText,
      createdAt: row.createdAt
    }));
  }

  async createMetadata(input: AttachMediaDto) {
    const createdBy = input.createdBy ? BigInt(input.createdBy) : null;

    const row = await this.prisma.media.upsert({
      where: { publicId: input.publicId },
      update: {
        secureUrl: input.secureUrl,
        resourceType: this.mapResourceType(input.resourceType),
        format: input.format,
        width: input.width,
        height: input.height,
        bytes: BigInt(input.bytes),
        folder: input.folder,
        altText: input.altText,
        createdBy
      },
      create: {
        publicId: input.publicId,
        secureUrl: input.secureUrl,
        resourceType: this.mapResourceType(input.resourceType),
        format: input.format,
        width: input.width,
        height: input.height,
        bytes: BigInt(input.bytes),
        folder: input.folder,
        altText: input.altText,
        createdBy
      }
    });

    return {
      id: row.id.toString(),
      publicId: row.publicId,
      secureUrl: row.secureUrl
    };
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
    return { checked: 0, deletedCount: 0, orphanIds: [] as string[] };
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

  private mapResourceType(value: string): media_resource_type {
    if (value === 'video') return media_resource_type.video;
    if (value === 'raw') return media_resource_type.raw;
    return media_resource_type.image;
  }
}
