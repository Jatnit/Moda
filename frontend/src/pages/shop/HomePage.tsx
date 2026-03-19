import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { BuilderSchema, defaultBuilderSchema, PageRenderer } from '../../components/builder/PageRenderer';
import { useSeo } from '../../hooks/useSeo';

export function HomePage() {
  useSeo({
    title: 'Moda | Home',
    description: 'Moda ecommerce homepage with dynamic builder sections and featured products.'
  });

  const [schema, setSchema] = useState<BuilderSchema>(defaultBuilderSchema);
  const [products, setProducts] = useState<Array<{ id: string; name: string; price: number }>>([]);
  const [posts, setPosts] = useState<Array<{ id: string; title: string; excerpt?: string }>>([]);

  useEffect(() => {
    Promise.all([api.get('/builder/public/home'), api.get('/products'), api.get('/posts')])
      .then(([pageRes, productsRes, postsRes]) => {
        const jsonSchema = pageRes.data?.latest?.jsonSchema as BuilderSchema | undefined;
        if (jsonSchema?.blocks) {
          setSchema(jsonSchema);
        }
        setProducts(productsRes.data);
        setPosts(postsRes.data);
      })
      .catch(() => undefined);
  }, []);

  return (
    <section className="page-section">
      <article className="fashion-hero">
        <p className="fashion-kicker">Moda Atelier</p>
        <h2>Thanh lịch theo cách của bạn</h2>
        <p>
          Bộ sưu tập mới lấy cảm hứng từ nét tối giản Paris, phối cùng tông màu blush và navy cho phong cách sang
          trọng mỗi ngày.
        </p>
        <div className="row-actions">
          <a className="cta-link" href="/products">
            Mua bộ sưu tập
          </a>
          <a className="ghost-link" href="/auth">
            Tham gia thành viên
          </a>
        </div>
      </article>

      <div className="feature-strip">
        <span>Free ship từ 799K</span>
        <span>Đổi trả 14 ngày</span>
        <span>Styling tư vấn 1-1</span>
        <span>Hàng mới mỗi tuần</span>
      </div>

      <PageRenderer schema={schema} products={products} posts={posts} />

      <section className="editorial-grid">
        <article className="editorial-card">
          <h3>Workwear Edit</h3>
          <p>Form dáng chỉn chu cho ngày đi làm nhưng vẫn thoải mái suốt ngày dài.</p>
        </article>
        <article className="editorial-card">
          <h3>Weekend Soft</h3>
          <p>Chất liệu mềm, bảng màu dịu nhẹ dành cho cuối tuần thư thái.</p>
        </article>
        <article className="editorial-card">
          <h3>Evening Classy</h3>
          <p>Điểm nhấn hồng ngọc trên nền navy tạo cảm giác sang trọng cho buổi tối.</p>
        </article>
      </section>

      {posts.length > 0 ? (
        <section className="page-section">
          <div className="page-head">
            <h3>Journal & Styling Notes</h3>
            <p>Gợi ý phối đồ và xu hướng mới để bạn cập nhật phong cách mỗi ngày.</p>
          </div>
          <div className="cards">
            {posts.slice(0, 3).map((post) => (
              <article key={post.id}>
                <h4>{post.title}</h4>
                <p>{post.excerpt ?? 'Đọc thêm trong mục Journal.'}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </section>
  );
}
