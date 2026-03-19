import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { BuilderSchema, defaultBuilderSchema, PageRenderer } from '../../components/builder/PageRenderer';

type Product = { id: string; name: string; price: number };

export function AdminBuilderPage() {
  const [slug, setSlug] = useState('home');
  const [schemaText, setSchemaText] = useState(JSON.stringify(defaultBuilderSchema, null, 2));
  const [pageId, setPageId] = useState('');
  const [message, setMessage] = useState('');
  const [products, setProducts] = useState<Product[]>([]);

  const parsedSchema = (() => {
    try {
      return JSON.parse(schemaText) as BuilderSchema;
    } catch {
      return defaultBuilderSchema;
    }
  })();

  const load = async () => {
    try {
      const [builderResponse, productResponse] = await Promise.all([
        api.get(`/builder/pages/slug/${slug}`),
        api.get<Product[]>('/products')
      ]);
      const latest = builderResponse.data?.latest?.jsonSchema;
      const id = builderResponse.data?.page?.id as string | undefined;
      if (latest) {
        setSchemaText(JSON.stringify(latest, null, 2));
      }
      if (id) {
        setPageId(id);
      }
      setProducts(productResponse.data);
    } catch {
      setMessage('No existing page found, using default schema.');
    }
  };

  const saveDraft = async () => {
    try {
      const response = await api.post('/builder/pages/draft', {
        slug,
        jsonSchema: parsedSchema
      });
      setPageId(response.data?.page?.id ?? '');
      setMessage('Draft saved.');
    } catch {
      setMessage('Save draft failed. Check JSON schema.');
    }
  };

  const publish = async () => {
    if (!pageId) {
      setMessage('Save draft first to get pageId.');
      return;
    }
    try {
      await api.post(`/builder/pages/${pageId}/publish`);
      setMessage('Published successfully.');
    } catch {
      setMessage('Publish failed.');
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <section className="stack">
      <h2>Builder Level 1</h2>
      <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="Page slug" />
      <textarea
        value={schemaText}
        onChange={(e) => setSchemaText(e.target.value)}
        rows={16}
        style={{ width: '100%' }}
      />
      <div className="row-actions">
        <button type="button" onClick={load}>
          Reload
        </button>
        <button type="button" onClick={saveDraft}>
          Save Draft
        </button>
        <button type="button" onClick={publish}>
          Publish
        </button>
      </div>
      <p>{message}</p>
      <h3>Preview Before Publish</h3>
      <PageRenderer schema={parsedSchema} products={products} />
    </section>
  );
}

