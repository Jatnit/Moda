import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../../api/client';
import { useSeo } from '../../hooks/useSeo';
import { addToCart } from '../../utils/cart';
import type { Product } from '../../types/product';
import './ProductDetailPage.css';

export function ProductDetailPage() {
  const { id = '' } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addedFeedback, setAddedFeedback] = useState(false);

  useSeo({
    title: product ? `Moda | ${product.name}` : 'Moda | Product',
    description: product?.description ?? 'Chi tiết sản phẩm và giá tại Moda Fashion House.'
  });

  useEffect(() => {
    api
      .get<Product>(`/products/${id}`)
      .then((res) => setProduct(res.data))
      .catch(() => setProduct(null));
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({ productId: product.id, quantity, name: product.name, price: product.price });
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 2000);
  };

  const formatPrice = (v: number) => v.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

  if (!product) {
    return (
      <div className="detail-page container">
        <div className="detail-page__not-found">
          <h2>Sản phẩm không tồn tại</h2>
          <p className="text-muted">Sản phẩm bạn tìm không có hoặc đã bị xóa.</p>
          <Link to="/products" className="btn-ghost">← Quay lại</Link>
        </div>
      </div>
    );
  }

  const images = product.images?.length
    ? product.images
    : [
        'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&h=750&fit=crop&q=80',
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=750&fit=crop&q=80',
        'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&h=750&fit=crop&q=80',
      ];

  const sizes = product.sizes ?? ['S', 'M', 'L', 'XL'];

  return (
    <div className="detail-page container animate-fade-up">
      {/* Breadcrumb */}
      <nav className="detail-page__breadcrumb">
        <Link to="/">Trang chủ</Link>
        <span>/</span>
        <Link to="/products">Sản phẩm</Link>
        <span>/</span>
        <span className="text-muted">{product.name}</span>
      </nav>

      <div className="detail-page__layout">
        {/* Image gallery */}
        <div className="detail-page__gallery">
          <div className="detail-page__main-img">
            <img src={images[selectedImage]} alt={product.name} />
          </div>
          {images.length > 1 && (
            <div className="detail-page__thumbs">
              {images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  className={`detail-page__thumb ${i === selectedImage ? 'active' : ''}`}
                  onClick={() => setSelectedImage(i)}
                >
                  <img src={img} alt={`${product.name} view ${i + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="detail-page__info">
          {product.category && <span className="badge badge-accent">{product.category}</span>}
          <h1 className="detail-page__name">{product.name}</h1>

          <div className="detail-page__pricing">
            <span className="detail-page__price">{formatPrice(product.price)}</span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="detail-page__compare">{formatPrice(product.compareAtPrice)}</span>
            )}
          </div>

          <p className="detail-page__desc">
            {product.description ?? 'Sản phẩm thời trang cao cấp, chất liệu mềm nhẹ, form dáng trẻ trung phù hợp cho nhiều dịp.'}
          </p>

          {/* Size selector */}
          <div className="detail-page__option">
            <label className="detail-page__option-label">Kích thước</label>
            <div className="detail-page__sizes">
              {sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  className={`detail-page__size-btn ${selectedSize === size ? 'active' : ''}`}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div className="detail-page__option">
            <label className="detail-page__option-label">Số lượng</label>
            <div className="detail-page__qty">
              <button type="button" className="detail-page__qty-btn" onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
              <span className="detail-page__qty-value">{quantity}</span>
              <button type="button" className="detail-page__qty-btn" onClick={() => setQuantity(quantity + 1)}>+</button>
            </div>
          </div>

          {/* Actions */}
          <div className="detail-page__actions">
            <button type="button" className="btn-accent detail-page__add-btn" onClick={handleAddToCart}>
              {addedFeedback ? '✓ Đã thêm!' : 'Thêm vào giỏ hàng'}
            </button>
            <Link to="/cart" className="btn-ghost">
              Xem giỏ hàng
            </Link>
          </div>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="detail-page__tags">
              {product.tags.map((tag) => (
                <span key={tag} className="chip">{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Info cards */}
      <div className="detail-page__details">
        <article className="detail-page__detail-card">
          <div className="detail-page__detail-icon">🧵</div>
          <h4>Chất liệu & Thiết kế</h4>
          <p>Chất vải mềm nhẹ, đường may sắc nét, giữ form tốt sau nhiều lần giặt.</p>
        </article>
        <article className="detail-page__detail-card">
          <div className="detail-page__detail-icon">📏</div>
          <h4>Hướng dẫn chọn size</h4>
          <p>Nếu bạn thích mặc relaxed fit, hãy tăng 1 size so với bình thường.</p>
        </article>
        <article className="detail-page__detail-card">
          <div className="detail-page__detail-icon">🚚</div>
          <h4>Vận chuyển & Đổi trả</h4>
          <p>Giao nhanh toàn quốc và hỗ trợ đổi trả miễn phí trong 14 ngày.</p>
        </article>
      </div>
    </div>
  );
}
