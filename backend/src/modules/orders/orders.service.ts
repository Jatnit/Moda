import { Injectable } from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  createOrder(userId: string, input: { items: Array<{ productId: string; quantity: number }> }) {
    return this.prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({
        where: { id: { in: input.items.map((i) => i.productId) } }
      });

      const total = input.items.reduce((acc, item) => {
        const product = products.find((p) => p.id === item.productId);
        const price = product ? Number(product.price) : 0;
        return acc + price * item.quantity;
      }, 0);

      return tx.order.create({
        data: {
          userId,
          status: OrderStatus.AWAITING_PAYMENT,
          totalAmount: total,
          items: {
            create: input.items.map((item) => {
              const product = products.find((p) => p.id === item.productId);
              return {
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: Number(product?.price ?? 0)
              };
            })
          }
        },
        include: { items: true }
      });
    });
  }

  listByUser(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  updateStatus(id: string, status: OrderStatus, paymentRef?: string) {
    return this.prisma.$transaction(async (tx) => {
      const current = await tx.order.findUnique({ where: { id } });
      const updated = await tx.order.update({ where: { id }, data: { status, paymentRef } });
      await tx.orderStatusHistory.create({
        data: {
          orderId: id,
          fromStatus: current?.status,
          toStatus: status,
          note: paymentRef ? `paymentRef:${paymentRef}` : undefined
        }
      });
      return updated;
    });
  }
}
