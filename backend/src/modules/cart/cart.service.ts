import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  getCart(userId: string) {
    return this.prisma.cart.findFirst({ where: { userId } });
  }

  upsertCart(userId: string, items: unknown) {
    const normalized = (items ?? []) as Prisma.InputJsonValue;
    return this.prisma.cart.upsert({
      where: { userId },
      update: { items: normalized },
      create: { userId, items: normalized }
    });
  }
}
