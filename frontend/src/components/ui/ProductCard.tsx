import { Link } from 'react-router-dom';
import type { Product } from '../../types/product';
import { addToCart } from '../../utils/cart';
import './ProductCard.css';

interface ProductCardProps {
  product: Product;
  /** Show a "NEW" badge */
  isNew?: boolean;
}

export function ProductCard({ product, isNew }: ProductCardProps) {
  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : null;

  const thumbnail =
    product.images?.[0] ??
    `https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&h=500&fit=crop&q=80`;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({ productId: product.id, quantity: 1, name: product.name, price: product.price });
  };

  const formatPrice = (v: number) =>
    v.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

  return (
    <article className="product-card animate-fade-up">
      <Link to={`/products/${product.id}`} className="product-card__link">
        <div className="product-card__img-wrap">
          <img
            src={thumbnail}
            alt={product.name}
            className="product-card__img"
            loading="lazy"
            decoding="async"
          />
          <div className="product-card__overlay">
            <button type="button" className="product-card__quick-add btn-accent" onClick={handleAdd}>
              + Thêm vào giỏ
            </button>
          </div>
          {isNew && <span className="badge badge-new product-card__badge">NEW</span>}
          {discount && (
            <span className="badge badge-accent product-card__badge product-card__badge--discount">
              −{discount}%
            </span>
          )}
        </div>
        <div className="product-card__info">
          <h4 className="product-card__name">{product.name}</h4>
          {product.category && (
            <span className="product-card__category">{product.category}</span>
          )}
          <div className="product-card__pricing">
            <span className="product-card__price">{formatPrice(product.price)}</span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="product-card__compare">{formatPrice(product.compareAtPrice)}</span>
            )}
          </div>
          {product.colors && product.colors.length > 0 && (
            <div className="product-card__colors">
              {product.colors.slice(0, 4).map((color) => (
                <span
                  key={color}
                  className="product-card__color-dot"
                  style={{ background: color }}
                  title={color}
                />
              ))}
              {product.colors.length > 4 && (
                <span className="product-card__color-more">+{product.colors.length - 4}</span>
              )}
            </div>
          )}
        </div>
      </Link>
    </article>
  );
}
