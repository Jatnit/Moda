import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { BuilderSchema, defaultBuilderSchema, PageRenderer } from '../../components/builder/PageRenderer';

export function HomePage() {
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
    <section>
      <PageRenderer schema={schema} products={products} posts={posts} />
    </section>
  );
}
