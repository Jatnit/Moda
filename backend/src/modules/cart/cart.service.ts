import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

function toId(value: string): bigint {
  return BigInt(value);
}

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async getCart(userId: string) {
    const uid = toId(userId);
    const cart = await this.prisma.cart.findFirst({
      where: { userId: uid, status: 'ACTIVE' as any },
      include: { items: true }
    });

    if (!cart) {
      return { id: null, userId, items: [] };
    }

    return {
      id: cart.id.toString(),
      userId,
      items: cart.items.map((item) => ({
        productId: item.productId.toString(),
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice)
      }))
    };
  }

  async upsertCart(userId: string, items: unknown) {
    const uid = toId(userId);
    const normalized = Array.isArray(items) ? items : [];

    const cart =
      (await this.prisma.cart.findFirst({ where: { userId: uid, status: 'ACTIVE' as any } })) ||
      (await this.prisma.cart.create({ data: { userId: uid, status: 'ACTIVE' } }));

    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    for (const raw of normalized as Array<any>) {
      const productId = raw?.productId ? BigInt(String(raw.productId)) : null;
      const quantity = Number(raw?.quantity ?? 1);
      if (!productId || !Number.isFinite(quantity) || quantity <= 0) continue;

      const product = await this.prisma.product.findUnique({ where: { id: productId } });
      if (!product) continue;

      await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
          unitPrice: product.price
        }
      });
    }

    return this.getCart(userId);
  }
}
