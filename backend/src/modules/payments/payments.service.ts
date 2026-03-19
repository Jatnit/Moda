import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OrderStatus } from '@prisma/client';
import { createHmac } from 'crypto';
import { OrdersService } from '../orders/orders.service';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly configService: ConfigService
  ) {}

  initSepay(orderId: string, amount: number) {
    return {
      provider: 'SEPAY',
      orderId,
      amount,
      apiKeyConfigured: !!this.configService.get<string>('SEPAY_API_KEY'),
      checkoutUrl: `https://sepay.vn/checkout/${orderId}`
    };
  }

  verifyWebhookSignature(rawBody: string, signature: string): boolean {
    const secret = this.configService.get<string>('SEPAY_WEBHOOK_SECRET', '');
    const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
    return expected === signature;
  }

  async handleWebhook(payload: Record<string, string>) {
    if (!payload.orderId) {
      return { ok: false, reason: 'Missing orderId' };
    }

    const status = payload.status === 'PAID' ? OrderStatus.PAID : OrderStatus.FAILED;
    await this.ordersService.updateStatus(payload.orderId, status, payload.transactionId);

    return { ok: true };
  }
}
