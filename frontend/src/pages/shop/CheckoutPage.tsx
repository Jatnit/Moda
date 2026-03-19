import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { getCartItems, saveCartItems } from '../../utils/cart';
import { SectionHeading } from '../../components/ui/SectionHeading';
import './CheckoutPage.css';

export function CheckoutPage() {
  const items = useMemo(() => getCartItems(), []);
  const total = useMemo(() => items.reduce((s, i) => s + (i.price ?? 0) * i.quantity, 0), [items]);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [shippingInfo, setShippingInfo] = useState({ name: '', phone: '', address: '' });

  const formatPrice = (v: number) => v.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

  const checkout = async () => {
    setLoading(true);
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
      setSuccess(true);
      setResult(JSON.stringify({ order, payment: paymentResponse.data }, null, 2));
    } catch {
      setResult('Thanh toán thất bại. Vui lòng đăng nhập và kiểm tra giỏ hàng.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="checkout-page container animate-fade-up">
        <div className="checkout-page__success">
          <div className="checkout-page__success-icon">✓</div>
          <h2>Đặt hàng thành công!</h2>
          <p className="text-muted">
            Cảm ơn bạn đã mua sắm tại Moda. Đơn hàng của bạn đang được xử lý.
          </p>
          <div className="checkout-page__success-actions">
            <Link to="/" className="cta-link">Tiếp tục mua sắm</Link>
            <Link to="/account" className="ghost-link">Xem đơn hàng</Link>
          </div>
          <details className="checkout-page__result-details">
            <summary>Chi tiết phản hồi</summary>
            <pre>{result}</pre>
          </details>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page container animate-fade-up">
      <SectionHeading kicker="Secure Checkout" title="Thanh toán" />

      {items.length === 0 ? (
        <div className="checkout-page__empty">
          <p className="text-muted">Giỏ hàng trống. Vui lòng thêm sản phẩm trước khi thanh toán.</p>
          <Link to="/products" className="cta-link">Mua sắm ngay</Link>
        </div>
      ) : (
        <div className="checkout-page__layout">
          {/* Shipping form */}
          <div className="checkout-page__form-section">
            <div className="checkout-page__card">
              <h4 className="checkout-page__card-title">
                <span className="checkout-page__step">1</span>
                Thông tin giao hàng
              </h4>
              <div className="checkout-page__form">
                <div className="checkout-page__field">
                  <label>Họ và tên</label>
                  <input
                    value={shippingInfo.name}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, name: e.target.value })}
                    placeholder="Nguyễn Văn A"
                  />
                </div>
                <div className="checkout-page__field">
                  <label>Số điện thoại</label>
                  <input
                    value={shippingInfo.phone}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                    placeholder="0912 345 678"
                  />
                </div>
                <div className="checkout-page__field">
                  <label>Địa chỉ giao hàng</label>
                  <textarea
                    value={shippingInfo.address}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                    placeholder="Số nhà, đường, quận/huyện, tỉnh/thành phố"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            <div className="checkout-page__card">
              <h4 className="checkout-page__card-title">
                <span className="checkout-page__step">2</span>
                Phương thức thanh toán
              </h4>
              <div className="checkout-page__payment-methods">
                <label className="checkout-page__payment-option active">
                  <input type="radio" name="payment" defaultChecked />
                  <span className="checkout-page__payment-label">
                    🏦 Chuyển khoản ngân hàng (SEPAY)
                  </span>
                </label>
                <label className="checkout-page__payment-option">
                  <input type="radio" name="payment" disabled />
                  <span className="checkout-page__payment-label text-muted">
                    💳 Thẻ tín dụng (Sắp ra mắt)
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Order summary */}
          <aside className="checkout-page__order-summary">
            <h4 className="checkout-page__card-title">Đơn hàng ({items.length} sản phẩm)</h4>
            <div className="checkout-page__order-items">
              {items.map((item) => (
                <div key={item.productId} className="checkout-page__order-item">
                  <div className="checkout-page__order-item-info">
                    <span className="checkout-page__order-item-name">{item.name ?? item.productId}</span>
                    <span className="text-muted text-sm">x{item.quantity}</span>
                  </div>
                  <span>{formatPrice((item.price ?? 0) * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="checkout-page__totals">
              <div className="checkout-page__total-row">
                <span>Tạm tính</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="checkout-page__total-row">
                <span>Phí giao hàng</span>
                <span className="text-accent">{total >= 799000 ? 'Miễn phí' : formatPrice(30000)}</span>
              </div>
              <div className="checkout-page__total-row checkout-page__total-row--final">
                <span>Tổng thanh toán</span>
                <span>{formatPrice(total >= 799000 ? total : total + 30000)}</span>
              </div>
            </div>
            <button
              type="button"
              className="btn-accent checkout-page__pay-btn"
              onClick={checkout}
              disabled={loading}
            >
              {loading ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
            </button>

            <div className="checkout-page__trust">
              <span>🔒 Thanh toán bảo mật</span>
              <span>🔄 Đổi trả 14 ngày</span>
              <span>📦 Giao hàng nhanh</span>
            </div>

            {result && !success && (
              <div className="checkout-page__error">{result}</div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
