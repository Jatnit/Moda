import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
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

  createMetadata(input: {
    publicId: string;
    secureUrl: string;
    resourceType: string;
    format: string;
    width: number;
    height: number;
    bytes: number;
    folder: string;
    altText?: string;
    ownerType: string;
    ownerId?: string;
    createdBy?: string;
  }) {
    return this.prisma.media.create({ data: input });
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
