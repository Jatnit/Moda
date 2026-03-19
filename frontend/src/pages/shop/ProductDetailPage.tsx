import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../api/client';
import { useSeo } from '../../hooks/useSeo';
import { addToCart } from '../../utils/cart';

type Product = {
  id: string;
  name: string;
  description?: string;
  price: number;
};

export function ProductDetailPage() {
  const { id = '' } = useParams();
  const [product, setProduct] = useState<Product | null>(null);

  useSeo({
    title: product ? `Moda | ${product.name}` : 'Moda | Product',
    description: product?.description ?? 'Product details and pricing.'
  });

  useEffect(() => {
    api
      .get<Product>(`/products/${id}`)
      .then((res) => setProduct(res.data))
      .catch(() => setProduct(null));
  }, [id]);

  if (!product) {
    return <p>Product not found.</p>;
  }

  return (
    <section className="page-section">
      <article className="detail-card">
        <h2>{product.name}</h2>
        <p>{product.description}</p>
        <strong>${product.price}</strong>
        <div className="row-actions" style={{ marginTop: 10 }}>
          <button
            type="button"
            onClick={() =>
              addToCart({
                productId: product.id,
                quantity: 1,
                name: product.name,
                price: product.price
              })
            }
          >
            Add to cart
          </button>
        </div>
      </article>

      <section className="editorial-grid">
        <article className="editorial-card">
          <h3>Material & Craft</h3>
          <p>Chất vải mềm nhẹ, đường may sắc nét, giữ form tốt sau nhiều lần giặt.</p>
        </article>
        <article className="editorial-card">
          <h3>Fit Advice</h3>
          <p>Nếu bạn thích mặc relaxed fit, hãy tăng 1 size so với bình thường.</p>
        </article>
        <article className="editorial-card">
          <h3>Shipping & Return</h3>
          <p>Giao nhanh toàn quốc và hỗ trợ đổi trả trong 14 ngày.</p>
        </article>
      </section>
    </section>
  );
}
