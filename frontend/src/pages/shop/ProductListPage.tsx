import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { ProductCard } from '../../components/ui/ProductCard';
import { SectionHeading } from '../../components/ui/SectionHeading';
import { useSeo } from '../../hooks/useSeo';
import type { Product } from '../../types/product';
import './ProductListPage.css';

const CATEGORIES = ['Tất cả', 'New Arrival', 'Office Wear', 'Weekend Edit', 'Party Night', 'Sale'];

export function ProductListPage() {
  useSeo({
    title: 'Moda | Sản Phẩm',
    description: 'Khám phá bộ sưu tập thời trang trẻ trung tại Moda. Cập nhật mẫu mới mỗi tuần.'
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    api
      .get<Product[]>('/products')
      .then((res) => setProducts(res.data ?? []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = products.filter((p) => {
    const matchesSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      activeCategory === 'Tất cả' || p.category === activeCategory || p.tags?.includes(activeCategory);
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="products-page container">
      {/* Page header */}
      <section className="products-page__header">
        <SectionHeading
          kicker="Collection"
          title="Sản phẩm"
          subtitle="Curated essentials cho phong cách trẻ trung mỗi ngày. Cập nhật mẫu mới hàng tuần."
        />
      </section>

      {/* Filters */}
      <section className="products-page__filters">
        <div className="products-page__search-wrap">
          <svg className="products-page__search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            type="text"
            className="products-page__search"
            placeholder="Tìm kiếm sản phẩm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="products-page__chips">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`chip ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Product grid */}
      <section className="products-page__grid-section">
        {loading ? (
          <div className="products-page__grid stagger">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="skeleton" style={{ height: 360, borderRadius: 'var(--radius-xl)' }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="products-page__empty">
            <p>Không tìm thấy sản phẩm phù hợp.</p>
            <button type="button" className="btn-ghost" onClick={() => { setActiveCategory('Tất cả'); setSearchQuery(''); }}>
              Xem tất cả
            </button>
          </div>
        ) : (
          <>
            <p className="products-page__count">{filtered.length} sản phẩm</p>
            <div className="products-page__grid stagger">
              {filtered.map((product, idx) => (
                <ProductCard key={product.id} product={product} isNew={idx < 2} />
              ))}
            </div>
          </>
        )}
      </section>

      {/* Style help CTA */}
      <section className="products-page__cta">
        <div className="products-page__cta-content">
          <div>
            <h4>Cần tư vấn chọn size?</h4>
            <p className="text-muted">Chat với đội ngũ stylist để nhận gợi ý phù hợp nhất với bạn.</p>
          </div>
          <a className="cta-link" href="/auth">
            Nhận tư vấn
          </a>
        </div>
      </section>
    </div>
  );
}
