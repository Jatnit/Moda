import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { BuilderSchema, defaultBuilderSchema, PageRenderer } from '../../components/builder/PageRenderer';
import { FeatureBanner } from '../../components/ui/FeatureBanner';
import { ProductCard } from '../../components/ui/ProductCard';
import { SectionHeading } from '../../components/ui/SectionHeading';
import { useSeo } from '../../hooks/useSeo';
import type { Product } from '../../types/product';
import type { Post } from '../../types/post';
import './HomePage.css';

export function HomePage() {
  useSeo({
    title: 'Moda | Thời Trang Trẻ Trung – Fashion House',
    description: 'Khám phá bộ sưu tập thời trang trẻ trung, phong cách hiện đại tại Moda Fashion House.'
  });

  const [schema, setSchema] = useState<BuilderSchema>(defaultBuilderSchema);
  const [products, setProducts] = useState<Product[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/builder/public/home'), api.get('/products'), api.get('/posts')])
      .then(([pageRes, productsRes, postsRes]) => {
        const jsonSchema = pageRes.data?.latest?.jsonSchema as BuilderSchema | undefined;
        if (jsonSchema?.blocks) setSchema(jsonSchema);
        setProducts(productsRes.data ?? []);
        setPosts(postsRes.data ?? []);
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="home">
      {/* ─── Hero Section ─── */}
      <section className="home__hero">
        <div className="container home__hero-inner">
          <div className="home__hero-content animate-fade-up">
            <span className="home__hero-kicker">New Collection 2026</span>
            <h1 className="home__hero-title">
              Phong cách <em>trẻ trung</em>
              <br />theo cách của bạn
            </h1>
            <p className="home__hero-desc">
              Bộ sưu tập mới lấy cảm hứng từ nét tối giản hiện đại, phối cùng tông màu blush và navy cho vẻ ngoài
              thanh lịch mỗi ngày.
            </p>
            <div className="home__hero-actions">
              <Link to="/products" className="cta-link">
                Mua ngay
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </Link>
              <Link to="/auth" className="ghost-link">
                Tham gia Moda Club
              </Link>
            </div>
          </div>
          <div className="home__hero-visual animate-fade-up" style={{ animationDelay: '200ms' }}>
            <div className="home__hero-img-stack">
              <div className="home__hero-img home__hero-img--1">
                <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=520&fit=crop&q=80" alt="Fashion model" loading="eager" />
              </div>
              <div className="home__hero-img home__hero-img--2">
                <img src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=300&h=400&fit=crop&q=80" alt="Fashion look" loading="eager" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section className="home__section container">
        <FeatureBanner />
      </section>

      {/* ─── Builder content ─── */}
      <section className="home__section container">
        <PageRenderer schema={schema} products={products} posts={posts} />
      </section>

      {/* ─── Featured Products ─── */}
      <section className="home__section container">
        <div className="home__section-header">
          <SectionHeading
            kicker="Bestsellers"
            title="Sản phẩm nổi bật"
            subtitle="Những item được yêu thích nhất tuần này. Phong cách trẻ trung, chất lượng premium."
          />
          <Link to="/products" className="btn-ghost home__view-all">
            Xem tất cả →
          </Link>
        </div>

        {loading ? (
          <div className="home__product-grid stagger">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton" style={{ height: 360, borderRadius: 'var(--radius-xl)' }} />
            ))}
          </div>
        ) : (
          <div className="home__product-grid stagger">
            {products.slice(0, 8).map((product, idx) => (
              <ProductCard key={product.id} product={product} isNew={idx < 2} />
            ))}
          </div>
        )}
      </section>

      {/* ─── Editorial Grid ─── */}
      <section className="home__section container">
        <SectionHeading
          kicker="Style Guide"
          title="Cảm hứng phong cách"
          subtitle="Khám phá xu hướng mới và gợi ý phối đồ dành riêng cho bạn."
          align="center"
        />
        <div className="home__editorial stagger">
          <article className="home__editorial-card home__editorial-card--wide">
            <div className="home__editorial-img">
              <img src="https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=400&fit=crop&q=80" alt="Workwear" loading="lazy" decoding="async" />
            </div>
            <div className="home__editorial-body">
              <span className="badge badge-accent">Trending</span>
              <h3>Workwear Edit</h3>
              <p>Form dáng chỉn chu cho ngày đi làm nhưng vẫn thoải mái suốt ngày dài.</p>
              <Link to="/products" className="home__editorial-link">Khám phá →</Link>
            </div>
          </article>
          <article className="home__editorial-card">
            <div className="home__editorial-img">
              <img src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&h=500&fit=crop&q=80" alt="Weekend" loading="lazy" decoding="async" />
            </div>
            <div className="home__editorial-body">
              <h3>Weekend Soft</h3>
              <p>Chất liệu mềm, bảng màu dịu nhẹ cho cuối tuần thư thái.</p>
              <Link to="/products" className="home__editorial-link">Khám phá →</Link>
            </div>
          </article>
          <article className="home__editorial-card">
            <div className="home__editorial-img">
              <img src="https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&h=500&fit=crop&q=80" alt="Evening" loading="lazy" decoding="async" />
            </div>
            <div className="home__editorial-body">
              <h3>Evening Classy</h3>
              <p>Điểm nhấn hồng ngọc trên nền navy sang trọng cho buổi tối.</p>
              <Link to="/products" className="home__editorial-link">Khám phá →</Link>
            </div>
          </article>
        </div>
      </section>

      {/* ─── Journal / Posts ─── */}
      {posts.length > 0 && (
        <section className="home__section container">
          <SectionHeading
            kicker="Journal"
            title="Styling Notes"
            subtitle="Gợi ý phối đồ và xu hướng mới để bạn cập nhật phong cách mỗi ngày."
          />
          <div className="home__posts stagger">
            {posts.slice(0, 3).map((post) => (
              <article key={post.id} className="home__post-card animate-fade-up">
                <div className="home__post-thumbnail">
                  <img
                    src={post.coverImage ?? 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=260&fit=crop&q=80'}
                    alt={post.title}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="home__post-body">
                  {post.category && <span className="badge badge-navy">{post.category}</span>}
                  <h4>{post.title}</h4>
                  <p className="text-muted">{post.excerpt ?? 'Đọc thêm trong mục Journal.'}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* ─── CTA Banner ─── */}
      <section className="home__cta">
        <div className="container home__cta-inner">
          <h2>Trở thành thành viên Moda Club</h2>
          <p>Nhận ưu đãi đặc biệt, early access cho sản phẩm mới và chương trình loyalty.</p>
          <Link to="/auth" className="cta-link home__cta-btn">
            Đăng ký ngay
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
