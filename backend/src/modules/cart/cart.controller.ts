import { Body, Controller, Get, Put, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpsertCartDto } from './dto/upsert-cart.dto';
import { CartService } from './cart.service';

@ApiTags('cart')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  get(@Req() req: Request) {
    return this.cartService.getCart(String((req as any).user.sub));
  }

  @Put()
  upsert(@Req() req: Request, @Body() body: UpsertCartDto) {
    return this.cartService.upsertCart(String((req as any).user.sub), body.items ?? []);
  }
}
