import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../api/client';
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
    <section>
      <h2>{product.name}</h2>
      <p>{product.description}</p>
      <strong>${product.price}</strong>
      <div>
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
    </section>
  );
}
