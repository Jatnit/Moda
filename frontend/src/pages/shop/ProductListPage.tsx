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
    <section>
      <h2>Products</h2>
      <ul>
        {products.map((product) => (
          <li key={product.id}>
            <Link to={`/products/${product.id}`}>{product.name}</Link> - ${product.price}
          </li>
        ))}
      </ul>
    </section>
  );
}
