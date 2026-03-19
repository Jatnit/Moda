import { useMemo, useState } from 'react';
import { getCartItems, saveCartItems } from '../../utils/cart';

export function CartPage() {
  const [items, setItems] = useState(getCartItems());
  const total = useMemo(() => items.reduce((sum, item) => sum + (item.price ?? 0) * item.quantity, 0), [items]);

  const remove = (productId: string) => {
    const next = items.filter((item) => item.productId !== productId);
    setItems(next);
    saveCartItems(next);
  };

  return (
    <section>
      <h2>Cart</h2>
      {items.length === 0 ? <p>No items in cart.</p> : null}
      <ul>
        {items.map((item) => (
          <li key={item.productId}>
            {item.name ?? item.productId} x{item.quantity} - ${item.price ?? 0}
            <button type="button" className="ghost" onClick={() => remove(item.productId)}>
              Remove
            </button>
          </li>
        ))}
      </ul>
      <p>Total: ${total}</p>
    </section>
  );
}
