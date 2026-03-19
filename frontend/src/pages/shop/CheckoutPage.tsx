import { useMemo, useState } from 'react';
import { api } from '../../api/client';
import { getCartItems, saveCartItems } from '../../utils/cart';

export function CheckoutPage() {
  const items = useMemo(() => getCartItems(), []);
  const [result, setResult] = useState('');

  const checkout = async () => {
    try {
      const orderResponse = await api.post('/orders', {
        items: items.map((item) => ({ productId: item.productId, quantity: item.quantity }))
      });
      const order = orderResponse.data as { id: string; totalAmount: number };

      const paymentResponse = await api.post('/payments/sepay/init', {
        orderId: order.id,
        amount: Number(order.totalAmount ?? 0)
      });

      saveCartItems([]);
      setResult(JSON.stringify({ order, payment: paymentResponse.data }, null, 2));
    } catch {
      setResult('Checkout failed. You need to login and make sure cart has valid product IDs.');
    }
  };

  return (
    <section>
      <h2>Checkout</h2>
      <p>Items: {items.length}</p>
      <button type="button" onClick={checkout}>
        Create Order + Init SEPAY
      </button>
      <pre>{result}</pre>
    </section>
  );
}
