import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCartItems, saveCartItems } from '../../utils/cart';
import { SectionHeading } from '../../components/ui/SectionHeading';
import './CartPage.css';

export function CartPage() {
  const [items, setItems] = useState(getCartItems());
  const total = useMemo(() => items.reduce((sum, item) => sum + (item.price ?? 0) * item.quantity, 0), [items]);

  const formatPrice = (v: number) => v.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

  const updateQty = (productId: string, delta: number) => {
    const next = items.map((item) =>
      item.productId === productId ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    );
    setItems(next);
    saveCartItems(next);
  };

  const remove = (productId: string) => {
    const next = items.filter((item) => item.productId !== productId);
    setItems(next);
    saveCartItems(next);
  };

  return (
    <div className="cart-page container animate-fade-up">
      <SectionHeading
        kicker="Shopping Bag"
        title="Giỏ hàng của bạn"
        subtitle={items.length > 0 ? `${items.length} sản phẩm` : undefined}
      />

      {items.length === 0 ? (
        <div className="cart-page__empty">
          <div className="cart-page__empty-icon">🛍️</div>
          <h3>Giỏ hàng trống</h3>
          <p className="text-muted">Hãy khám phá bộ sưu tập và thêm sản phẩm yêu thích!</p>
          <Link to="/products" className="cta-link">
            Mua sắm ngay →
          </Link>
        </div>
      ) : (
        <div className="cart-page__layout">
          {/* Cart items */}
          <div className="cart-page__items">
            {items.map((item) => (
              <article key={item.productId} className="cart-page__item">
                <div className="cart-page__item-img">
                  <img
                    src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=120&h=150&fit=crop&q=80"
                    alt={item.name ?? item.productId}
                    loading="lazy"
                  />
                </div>
                <div className="cart-page__item-info">
                  <Link to={`/products/${item.productId}`} className="cart-page__item-name">
                    {item.name ?? item.productId}
                  </Link>
                  <span className="cart-page__item-price">{formatPrice(item.price ?? 0)}</span>
                  <div className="cart-page__item-qty">
                    <button type="button" className="cart-page__qty-btn" onClick={() => updateQty(item.productId, -1)}>−</button>
                    <span>{item.quantity}</span>
                    <button type="button" className="cart-page__qty-btn" onClick={() => updateQty(item.productId, 1)}>+</button>
                  </div>
                </div>
                <div className="cart-page__item-end">
                  <span className="cart-page__item-subtotal">{formatPrice((item.price ?? 0) * item.quantity)}</span>
                  <button type="button" className="cart-page__remove-btn" onClick={() => remove(item.productId)} title="Xóa">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              </article>
            ))}
          </div>

          {/* Summary sidebar */}
          <aside className="cart-page__summary">
            <h4 className="cart-page__summary-title">Tóm tắt đơn hàng</h4>
            <div className="cart-page__summary-rows">
              <div className="cart-page__summary-row">
                <span>Tạm tính</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="cart-page__summary-row">
                <span>Phí giao hàng</span>
                <span className="text-accent">{total >= 799000 ? 'Miễn phí' : formatPrice(30000)}</span>
              </div>
            </div>
            <div className="cart-page__summary-total">
              <span>Tổng cộng</span>
              <span>{formatPrice(total >= 799000 ? total : total + 30000)}</span>
            </div>
            <Link to="/checkout" className="cta-link cart-page__checkout-btn">
              Thanh toán
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </Link>
            {total < 799000 && (
              <p className="cart-page__free-ship-note">
                Thêm {formatPrice(799000 - total)} nữa để được <strong>miễn phí giao hàng</strong>!
              </p>
            )}
          </aside>
        </div>
      )}

      {/* Upsell */}
      <article className="cart-page__upsell">
        <div className="cart-page__upsell-icon">💎</div>
        <div>
          <strong>Ưu đãi thành viên Moda Club</strong>
          <p className="text-muted text-sm">Đăng nhập để nhận mã giảm giá theo hạng thành viên.</p>
        </div>
        <Link to="/auth" className="ghost-link">Đăng nhập</Link>
      </article>
    </div>
  );
}
