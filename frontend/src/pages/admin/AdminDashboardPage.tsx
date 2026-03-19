import { useEffect, useState } from 'react';
import { api } from '../../api/client';

type DashboardData = {
  users: number;
  products: number;
  orders: number;
  posts: number;
};

export function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [name, setName] = useState('Sample Product');
  const [slug, setSlug] = useState('sample-product');
  const [price, setPrice] = useState(99);
  const [stock, setStock] = useState(10);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api
      .get<DashboardData>('/admin/dashboard')
      .then((response) => setData(response.data))
      .catch(() => setData(null));
  }, []);

  const createProduct = async () => {
    try {
      await api.post('/products', {
        name,
        slug,
        description: 'Created from admin dashboard',
        price: Number(price),
        stock: Number(stock),
        images: []
      });
      setMessage('Product created.');
    } catch {
      setMessage('Create product failed (slug may already exist).');
    }
  };

  return (
    <section className="page-section">
      <div className="page-head">
        <h2>Admin Dashboard</h2>
        <p>Quick overview of business activity and content status.</p>
      </div>
      {data ? (
        <div className="cards">
          <article>
            <h3>Users</h3>
            <p>{data.users}</p>
          </article>
          <article>
            <h3>Products</h3>
            <p>{data.products}</p>
          </article>
          <article>
            <h3>Orders</h3>
            <p>{data.orders}</p>
          </article>
          <article>
            <h3>Posts</h3>
            <p>{data.posts}</p>
          </article>
        </div>
      ) : (
        <p>Unable to load dashboard stats.</p>
      )}
      <section className="stack form-panel">
        <h3>Quick Create Product</h3>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
        <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="Slug" />
        <input value={price} onChange={(e) => setPrice(Number(e.target.value))} placeholder="Price" />
        <input value={stock} onChange={(e) => setStock(Number(e.target.value))} placeholder="Stock" />
        <button type="button" onClick={createProduct}>
          Create Product
        </button>
        <p>{message}</p>
      </section>
    </section>
  );
}
