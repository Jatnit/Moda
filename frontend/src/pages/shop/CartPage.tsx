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
    <section className="page-section">
      <div className="page-head">
        <h2>Cart</h2>
        <p>Review your selections before checkout.</p>
      </div>
      {items.length === 0 ? <p className="muted">No items in cart.</p> : null}
      <ul className="list-stack">
        {items.map((item) => (
          <li key={item.productId} className="line-card">
            <div>
              <strong>{item.name ?? item.productId}</strong>
              <p className="muted">
                Qty: {item.quantity} • ${item.price ?? 0}
              </p>
            </div>
            <button type="button" className="ghost" onClick={() => remove(item.productId)}>
              Remove
            </button>
          </li>
        ))}
      </ul>
      <p className="summary-total">Total: ${total}</p>

      <article className="line-card">
        <div>
          <strong>Ưu đãi thành viên Moda Club</strong>
          <p className="muted">Đăng nhập để nhận mã giảm giá theo hạng thành viên.</p>
        </div>
        <a className="ghost-link" href="/auth">
          Đăng nhập ngay
        </a>
      </article>
    </section>
  );
}
