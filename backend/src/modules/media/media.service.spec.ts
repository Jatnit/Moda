import { ConfigService } from '@nestjs/config';
import { MediaOwnerType } from './dto/request-signed-upload.dto';
import { MediaService } from './media.service';

describe('MediaService', () => {
  const prisma: any = {
    media: {
      findMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      upsert: jest.fn(),
      deleteMany: jest.fn()
    },
    product: { findUnique: jest.fn() },
    post: { findUnique: jest.fn() },
    page: { findUnique: jest.fn() },
    user: { findUnique: jest.fn() }
  };
  prisma.$transaction = jest.fn(async (fn: (tx: any) => Promise<any>) => fn(prisma));

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

  it('builds thumb/medium/large variants', () => {
    const service = new MediaService(prisma as never, config);
    const variants = service.buildResponsiveVariants('https://res.cloudinary.com/demo/image/upload/v1/x.jpg');

    expect(variants.thumb).toContain('w_200,h_200');
    expect(variants.medium).toContain('w_640');
    expect(variants.large).toContain('w_1280');
  });

  it('cleans up orphan media by owner relation', async () => {
    prisma.media.findMany.mockResolvedValue([
      { id: 'm1', publicId: 'a', ownerType: 'product', ownerId: 'p1' },
      { id: 'm2', publicId: 'b', ownerType: 'product', ownerId: 'missing' }
    ]);
    prisma.product.findUnique.mockImplementation(({ where }: any) =>
      Promise.resolve(where.id === 'p1' ? { id: 'p1' } : null)
    );
    prisma.media.deleteMany.mockResolvedValue({ count: 1 });

    const service = new MediaService(prisma as never, config);
    const result = await service.cleanupOrphans();

    expect(result.deletedCount).toBe(1);
    expect(result.orphanIds).toContain('m2');
  });
});
