import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { useSeo } from '../../hooks/useSeo';

type Product = {
  id: string;
  name: string;
  price: number;
};

export function ProductListPage() {
  useSeo({
    title: 'Moda | Products',
    description: 'Browse product catalog and discover the latest Moda items.'
  });

  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    api
      .get<Product[]>('/products')
      .then((res) => setProducts(res.data))
      .catch(() => setProducts([]));
  }, []);

  return (
    <section className="page-section">
      <div className="page-head">
        <h2>Products</h2>
        <p>Discover curated essentials for everyday style.</p>
      </div>

      <div className="chip-row">
        <span className="chip">New Arrival</span>
        <span className="chip">Office Wear</span>
        <span className="chip">Weekend Edit</span>
        <span className="chip">Party Night</span>
      </div>

      <ul className="list-grid">
        {products.map((product) => (
          <li key={product.id} className="list-card">
            <Link className="list-card-title" to={`/products/${product.id}`}>
              {product.name}
            </Link>
            <p>${product.price}</p>
          </li>
        ))}
      </ul>

      <article className="line-card">
        <div>
          <strong>Need a quick size recommendation?</strong>
          <p className="muted">Chat with our stylist team for personalized fit suggestions.</p>
        </div>
        <a className="cta-link" href="/auth">
          Get Style Help
        </a>
      </article>
    </section>
  );
}
