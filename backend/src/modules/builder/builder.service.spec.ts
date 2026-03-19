import { NotFoundException } from '@nestjs/common';
import { BuilderService } from './builder.service';

describe('BuilderService', () => {
  it('throws when publishing unknown page', async () => {
    const prisma = {
      page: {
        findUnique: jest.fn().mockResolvedValue(null)
      }
    };

    const service = new BuilderService(prisma as never);
    await expect(service.publish('missing')).rejects.toBeInstanceOf(NotFoundException);
  });
});
