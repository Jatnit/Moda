import { OrdersService } from './orders.service';

describe('OrdersService', () => {
  it('creates order with items', async () => {
    const prisma = {
      $transaction: jest.fn().mockImplementation(async (fn: (tx: any) => Promise<any>) =>
        fn({
          product: {
            findMany: jest.fn().mockResolvedValue([{ id: 'p1', price: 100 }])
          },
          order: {
            create: jest.fn().mockResolvedValue({ id: 'o1' })
          }
        })
      )
    };

    const service = new OrdersService(prisma as never);
    const order = await service.createOrder('u1', { items: [{ productId: 'p1', quantity: 2 }] });

    expect(order).toEqual({ id: 'o1' });
  });
});
