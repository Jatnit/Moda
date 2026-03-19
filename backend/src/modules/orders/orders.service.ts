import { Injectable } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async createOrder(userId: string, input: { items: Array<{ productId: string; quantity: number }> }) {
    return this.prisma.$transaction(async (tx) => {
      const userIdNum = BigInt(userId);
      const productIds = input.items.map((i) => BigInt(i.productId));
      const products = await tx.product.findMany({ where: { id: { in: productIds } } });

      const total = input.items.reduce((acc, item) => {
        const pid = BigInt(item.productId);
        const product = products.find((p) => p.id === pid);
        const price = product ? Number(product.price) : 0;
        return acc + price * item.quantity;
      }, 0);

      const orderNo = `ORD${Date.now()}`;

      const order = await tx.order.create({
        data: {
          orderNo,
          userId: userIdNum,
          status: OrderStatus.PENDING,
          customerName: 'Online Customer',
          customerEmail: null,
          customerPhone: '0000000000',
          shippingLine1: 'N/A',
          shippingCity: 'N/A',
          shippingCountry: 'Vietnam',
          grandTotal: total,
          items: {
            create: input.items.map((item) => {
              const pid = BigInt(item.productId);
              const product = products.find((p) => p.id === pid);
              const unitPrice = Number(product?.price ?? 0);
              return {
                productId: pid,
                sku: product?.sku ?? `SKU-${item.productId}`,
                productName: product?.name ?? `Product ${item.productId}`,
                quantity: item.quantity,
                unitPrice,
                lineTotal: unitPrice * item.quantity
              };
            })
          }
        },
        include: { items: true }
      });

      return {
        id: order.id.toString(),
        totalAmount: Number(order.grandTotal),
        items: order.items.map((it) => ({
          id: it.id.toString(),
          productId: it.productId?.toString() ?? null,
          quantity: it.quantity,
          unitPrice: Number(it.unitPrice)
        }))
      };
    });
  }

  async listByUser(userId: string) {
    const userIdNum = BigInt(userId);
    const rows = await this.prisma.order.findMany({
      where: { userId: userIdNum },
      include: { items: true },
      orderBy: { createdAt: 'desc' }
    });

    return rows.map((order) => ({
      id: order.id.toString(),
      orderNo: order.orderNo,
      status: order.status,
      totalAmount: Number(order.grandTotal),
      createdAt: order.createdAt,
      items: order.items.map((it) => ({
        id: it.id.toString(),
        productId: it.productId?.toString() ?? null,
        quantity: it.quantity,
        unitPrice: Number(it.unitPrice)
      }))
    }));
  }

  async updateStatus(id: string, status: OrderStatus, paymentRef?: string) {
    const orderId = BigInt(id);
    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { status }
    });

    await this.prisma.auditLog.create({
      data: {
        userId: updated.userId,
        action: 'ORDER_STATUS_UPDATED',
        resource: 'order',
        resourceId: String(updated.id),
        metadata: JSON.stringify({ status, paymentRef: paymentRef ?? null })
      }
    });

    return {
      id: updated.id.toString(),
      status: updated.status,
      totalAmount: Number(updated.grandTotal)
    };
  }
}
