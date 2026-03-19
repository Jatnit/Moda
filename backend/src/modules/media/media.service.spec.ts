import { ConfigService } from '@nestjs/config';
import { MediaOwnerType } from './dto/request-signed-upload.dto';
import { MediaService } from './media.service';

describe('MediaService', () => {
  const prisma = {
    media: {
      findMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn()
    }
  };

  const config = {
    get: jest.fn((key: string, fallback?: string) => {
      if (key === 'CLOUDINARY_CLOUD_NAME') return 'demo';
      if (key === 'CLOUDINARY_API_KEY') return 'api-key';
      if (key === 'CLOUDINARY_API_SECRET') return 'api-secret';
      return fallback;
    })
  } as unknown as ConfigService;

  it('builds signed upload params for image file', () => {
    const service = new MediaService(prisma as never, config);
    const result = service.buildSignedUploadParams({
      ownerType: MediaOwnerType.PRODUCT,
      ownerId: 'p1',
      mimeType: 'image/png',
      fileSize: 1000
    });

    expect(result.uploadUrl).toContain('cloudinary.com');
    expect(result.folder).toBe('products/p1');
  });

  it('adds f_auto,q_auto transform to url', () => {
    const service = new MediaService(prisma as never, config);
    const url = service.transformToOptimizedUrl('https://res.cloudinary.com/demo/image/upload/v1/x.jpg');

    expect(url).toContain('/upload/f_auto,q_auto/');
  });
});
