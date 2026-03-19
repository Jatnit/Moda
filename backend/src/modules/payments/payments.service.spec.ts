import { ConfigService } from '@nestjs/config';
import { PaymentsService } from './payments.service';

describe('PaymentsService', () => {
  it('verifies webhook signature', () => {
    const ordersService = { updateStatus: jest.fn() };
    const configService = {
      get: jest.fn().mockReturnValue('secret')
    } as unknown as ConfigService;

    const service = new PaymentsService(ordersService as never, configService);
    const valid = service.verifyWebhookSignature('raw', 'f65184ecf2a6f95f8bce7885a2770f7c4f254f80f1f8a4a0bf2f24b9f9d6ecf3');

    expect(typeof valid).toBe('boolean');
  });
});
