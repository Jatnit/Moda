import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';

@ApiTags('orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  list(@Req() req: Request) {
    return this.ordersService.listByUser(String((req as any).user.sub));
  }

  @Post()
  create(@Req() req: Request, @Body() body: CreateOrderDto) {
    return this.ordersService.createOrder(String((req as any).user.sub), { items: body.items });
  }
}
