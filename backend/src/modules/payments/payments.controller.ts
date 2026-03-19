import { Body, Controller, Headers, HttpCode, Post, RawBodyRequest, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { InitSepayDto } from './dto/init-sepay.dto';
import { PaymentsService } from './payments.service';

@ApiTags('payments')
@Controller('payments/sepay')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('init')
  init(@Body() body: InitSepayDto) {
    return this.paymentsService.initSepay(body.orderId, body.amount);
  }

  @Post('webhook')
  @HttpCode(200)
  async webhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-sepay-signature') signature: string,
    @Body() body: Record<string, string>
  ) {
    const rawBody = req.rawBody?.toString() ?? JSON.stringify(body);
    const verified = this.paymentsService.verifyWebhookSignature(rawBody, signature ?? '');

    if (!verified) {
      return { ok: false, reason: 'invalid signature' };
    }

    return this.paymentsService.handleWebhook(body);
  }
}
