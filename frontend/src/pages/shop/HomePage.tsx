import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { BuilderSchema, defaultBuilderSchema, PageRenderer } from '../../components/builder/PageRenderer';

export function HomePage() {
  const [schema, setSchema] = useState<BuilderSchema>(defaultBuilderSchema);
  const [products, setProducts] = useState<Array<{ id: string; name: string; price: number }>>([]);

  useEffect(() => {
    Promise.all([api.get('/builder/public/home'), api.get('/products')])
      .then(([pageRes, productsRes]) => {
        const jsonSchema = pageRes.data?.latest?.jsonSchema as BuilderSchema | undefined;
        if (jsonSchema?.blocks) {
          setSchema(jsonSchema);
        }
        setProducts(productsRes.data);
      })
      .catch(() => undefined);
  }, []);

  return (
    <section>
      <PageRenderer schema={schema} products={products} />
    </section>
  );
}
