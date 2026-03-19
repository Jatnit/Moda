import { DragEvent, useEffect, useMemo, useState } from 'react';
import { api } from '../../api/client';
import { BuilderBlock, BuilderSchema, defaultBuilderSchema, PageRenderer } from '../../components/builder/PageRenderer';

type Product = { id: string; name: string; price: number };
type Post = { id: string; title: string; excerpt?: string };
type PreviewMode = 'desktop' | 'tablet' | 'mobile';

function updateBlock(blocks: BuilderBlock[], id: string, updater: (block: BuilderBlock) => BuilderBlock): BuilderBlock[] {
  return blocks.map((block) => {
    if (block.id === id) return updater(block);
    if (!block.children) return block;
    return { ...block, children: updateBlock(block.children, id, updater) };
  });
}

export function AdminBuilderPage() {
  const [slug, setSlug] = useState('home');
  const [schema, setSchema] = useState<BuilderSchema>(defaultBuilderSchema);
  const [schemaText, setSchemaText] = useState(JSON.stringify(defaultBuilderSchema, null, 2));
  const [pageId, setPageId] = useState('');
  const [message, setMessage] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [mode, setMode] = useState<PreviewMode>('desktop');
  const [selectedBlockId, setSelectedBlockId] = useState<string>('');
  const [reusableName, setReusableName] = useState('hero-reusable');
  const [reusableBlocks, setReusableBlocks] = useState<Array<{ name: string; block: BuilderBlock }>>([]);
  const [templates, setTemplates] = useState<Array<{ name: string; blocks: BuilderBlock[] }>>([]);
  const [versions, setVersions] = useState<Array<{ id: string; createdAt: string }>>([]);

  const selectedBlock = useMemo(() => {
    const flat: BuilderBlock[] = [];
    const walk = (blocks: BuilderBlock[]) => {
      for (const block of blocks) {
        flat.push(block);
        if (block.children) walk(block.children);
      }
    };
    walk(schema.blocks);
    return flat.find((item) => item.id === selectedBlockId);
  }, [schema.blocks, selectedBlockId]);

  const syncText = (next: BuilderSchema) => {
    setSchema(next);
    setSchemaText(JSON.stringify(next, null, 2));
  };

  const load = async () => {
    try {
      const [builderResponse, productResponse, postResponse, templatesResponse, reusableResponse] = await Promise.all([
        api.get(`/builder/pages/slug/${slug}`),
        api.get<Product[]>('/products'),
        api.get<Post[]>('/posts'),
        api.get('/builder/templates'),
        api.get('/builder/reusable-blocks')
      ]);

      const latest = builderResponse.data?.latest?.jsonSchema as BuilderSchema | undefined;
      const id = builderResponse.data?.page?.id as string | undefined;
      const parsed = latest?.blocks ? latest : defaultBuilderSchema;

      syncText(parsed);
      if (id) {
        setPageId(id);
        const versionsResponse = await api.get(`/builder/pages/${id}/versions`);
        setVersions(versionsResponse.data);
      }
      setProducts(productResponse.data);
      setPosts(postResponse.data);
      setTemplates(templatesResponse.data ?? []);
      setReusableBlocks((reusableResponse.data ?? []) as Array<{ name: string; block: BuilderBlock }>);
      setMessage('Loaded builder resources.');
    } catch {
      setMessage('No existing page found, using default schema.');
    }
  };

  const saveDraft = async () => {
    try {
      const response = await api.post('/builder/pages/draft', {
        slug,
        jsonSchema: schema
      });
      const id = response.data?.page?.id as string | undefined;
      if (id) {
        setPageId(id);
        const versionsResponse = await api.get(`/builder/pages/${id}/versions`);
        setVersions(versionsResponse.data);
      }
      setMessage('Draft saved.');
    } catch {
      setMessage('Save draft failed.');
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

  const rollback = async (versionId: string) => {
    if (!pageId) return;
    try {
      await api.post(`/builder/pages/${pageId}/rollback`, { versionId });
      await load();
      setMessage('Rollback done.');
    } catch {
      setMessage('Rollback failed.');
    }
  };

  const reorderTopBlocks = (fromId: string, toId: string) => {
    const next = [...schema.blocks];
    const fromIndex = next.findIndex((item) => item.id === fromId);
    const toIndex = next.findIndex((item) => item.id === toId);
    if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return;
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    syncText({ blocks: next });
  };

  const onDragStart = (event: DragEvent<HTMLDivElement>, id: string) => {
    event.dataTransfer.setData('text/plain', id);
  };

  const onDrop = (event: DragEvent<HTMLDivElement>, id: string) => {
    event.preventDefault();
    const fromId = event.dataTransfer.getData('text/plain');
    reorderTopBlocks(fromId, id);
  };

  const addRowTemplate = () => {
    const row: BuilderBlock = {
      id: `row-${Date.now()}`,
      type: 'row',
      style: { padding: 8, responsive: { desktop: { cols: 2 }, tablet: { cols: 1 }, mobile: { cols: 1 } } },
      children: [
        { id: `text-${Date.now()}`, type: 'text', props: { content: 'Column 1' } },
        { id: `text-${Date.now() + 1}`, type: 'text', props: { content: 'Column 2' } }
      ]
    };
    syncText({ blocks: [...schema.blocks, row] });
  };

  const applyTemplate = (index: number) => {
    const selected = templates[index];
    if (!selected) return;
    syncText({ blocks: [...schema.blocks, ...selected.blocks] });
  };

  const saveReusable = async () => {
    const block = schema.blocks.find((item) => item.id === selectedBlockId);
    if (!block) {
      setMessage('Select a top-level block first.');
      return;
    }
    await api.post('/builder/reusable-blocks', { name: reusableName, block });
    const response = await api.get('/builder/reusable-blocks');
    setReusableBlocks(response.data ?? []);
    setMessage('Reusable block saved.');
  };

  const insertReusable = (index: number) => {
    const item = reusableBlocks[index];
    if (!item) return;
    const cloned = JSON.parse(JSON.stringify(item.block)) as BuilderBlock;
    cloned.id = `${cloned.id}-${Date.now()}`;
    syncText({ blocks: [...schema.blocks, cloned] });
  };

  const applyStyleToSelected = (field: 'padding' | 'margin', value: number) => {
    if (!selectedBlockId) return;
    syncText({
      blocks: updateBlock(schema.blocks, selectedBlockId, (block) => ({
        ...block,
        style: { ...(block.style ?? {}), [field]: value }
      }))
    });
  };

  const applyColsToSelected = (target: PreviewMode, cols: number) => {
    if (!selectedBlockId) return;
    syncText({
      blocks: updateBlock(schema.blocks, selectedBlockId, (block) => ({
        ...block,
        style: {
          ...(block.style ?? {}),
          responsive: {
            ...(block.style?.responsive ?? {}),
            [target]: { cols }
          }
        }
      }))
    });
  };

  const applyBindingPreset = (preset: 'hero-first-product' | 'text-first-post' | 'grid-posts') => {
    if (!selectedBlockId) return;
    const nextBlocks = updateBlock(schema.blocks, selectedBlockId, (block) => {
      if (preset === 'hero-first-product' && block.type === 'hero') {
        return {
          ...block,
          props: {
            ...(block.props ?? {}),
            title: '{{products.0.name}}',
            subtitle: 'Price: ${{products.0.price}}'
          }
        };
      }

      if (preset === 'text-first-post' && block.type === 'text') {
        return {
          ...block,
          props: {
            ...(block.props ?? {}),
            content: '{{posts.0.title}} - {{posts.0.excerpt}}'
          }
        };
      }

      if (preset === 'grid-posts' && block.type === 'product-grid') {
        return {
          ...block,
          props: {
            ...(block.props ?? {}),
            source: 'posts',
            title: 'Latest posts',
            limit: 4
          }
        };
      }

      return block;
    });

    syncText({ blocks: nextBlocks });
  };

  const applyVisibilityPreset = (preset: 'products-exists' | 'posts-exists' | 'clear') => {
    if (!selectedBlockId) return;
    const nextBlocks = updateBlock(schema.blocks, selectedBlockId, (block) => {
      const nextProps = { ...(block.props ?? {}) } as Record<string, unknown>;
      if (preset === 'clear') {
        delete nextProps.visibility;
      } else {
        nextProps.visibility = {
          path: preset === 'products-exists' ? 'products.0.id' : 'posts.0.id',
          operator: 'exists'
        };
      }
      return {
        ...block,
        props: nextProps
      };
    });

    syncText({ blocks: nextBlocks });
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <section className="stack">
      <h2>Builder Level 2 (Pro)</h2>
      <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="Page slug" />
      <div className="row-actions">
        <button type="button" onClick={load}>
          Reload
        </button>
        <button type="button" onClick={addRowTemplate}>
          Add Row/Column
        </button>
        <button type="button" onClick={saveDraft}>
          Save Draft
        </button>
        <button type="button" onClick={publish}>
          Publish
        </button>
      </div>

      <h3>Top-level Blocks (Drag & Drop reorder)</h3>
      <div className="stack">
        {schema.blocks.map((block) => (
          <div
            key={block.id}
            draggable
            onDragStart={(e) => onDragStart(e, block.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => onDrop(e, block.id)}
            className={`block-item ${selectedBlockId === block.id ? 'active' : ''}`}
            onClick={() => setSelectedBlockId(block.id)}
          >
            {block.type} - {block.id}
          </div>
        ))}
      </div>

      <h3>Style Per Block</h3>
      <div className="row-actions">
        <button type="button" onClick={() => applyStyleToSelected('padding', 8)}>
          Padding 8
        </button>
        <button type="button" onClick={() => applyStyleToSelected('padding', 16)}>
          Padding 16
        </button>
        <button type="button" onClick={() => applyStyleToSelected('margin', 8)}>
          Margin 8
        </button>
        <button type="button" onClick={() => applyStyleToSelected('margin', 16)}>
          Margin 16
        </button>
      </div>
      <div className="row-actions">
        <button type="button" onClick={() => applyColsToSelected('desktop', 3)}>
          Desktop 3 cols
        </button>
        <button type="button" onClick={() => applyColsToSelected('tablet', 2)}>
          Tablet 2 cols
        </button>
        <button type="button" onClick={() => applyColsToSelected('mobile', 1)}>
          Mobile 1 col
        </button>
      </div>

      <h3>Dynamic Data Binding</h3>
      <div className="row-actions">
        <button type="button" onClick={() => applyBindingPreset('hero-first-product')}>
          Bind hero to first product
        </button>
        <button type="button" onClick={() => applyBindingPreset('text-first-post')}>
          Bind text to first post
        </button>
        <button type="button" onClick={() => applyBindingPreset('grid-posts')}>
          Switch grid to posts
        </button>
      </div>

      <h3>Rule-based Rendering</h3>
      <div className="row-actions">
        <button type="button" onClick={() => applyVisibilityPreset('products-exists')}>
          Show when product exists
        </button>
        <button type="button" onClick={() => applyVisibilityPreset('posts-exists')}>
          Show when post exists
        </button>
        <button type="button" onClick={() => applyVisibilityPreset('clear')}>
          Clear visibility rule
        </button>
      </div>

      <h3>Section Templates</h3>
      <div className="row-actions">
        {templates.map((item, index) => (
          <button key={item.name + index} type="button" onClick={() => applyTemplate(index)}>
            {item.name}
          </button>
        ))}
      </div>

      <h3>Reusable Blocks</h3>
      <input value={reusableName} onChange={(e) => setReusableName(e.target.value)} placeholder="Reusable name" />
      <div className="row-actions">
        <button type="button" onClick={saveReusable}>
          Save Selected as Reusable
        </button>
        {reusableBlocks.map((item, index) => (
          <button key={item.name + index} type="button" onClick={() => insertReusable(index)}>
            Insert: {item.name}
          </button>
        ))}
      </div>

      <h3>Version History + Rollback</h3>
      <div className="stack">
        {versions.map((version) => (
          <div key={version.id} className="row-actions">
            <span>{new Date(version.createdAt).toLocaleString()}</span>
            <button type="button" onClick={() => rollback(version.id)}>
              Rollback
            </button>
          </div>
        ))}
      </div>

      <h3>Raw JSON</h3>
      <textarea
        value={schemaText}
        onChange={(e) => {
          setSchemaText(e.target.value);
          try {
            setSchema(JSON.parse(e.target.value) as BuilderSchema);
          } catch {
            // keep text until valid JSON
          }
        }}
        rows={16}
        style={{ width: '100%' }}
      />

      <h3>Custom CSS (Controlled)</h3>
      <textarea
        value={schema.customCss ?? ''}
        onChange={(e) => {
          const next = { ...schema, customCss: e.target.value };
          syncText(next);
        }}
        rows={8}
        style={{ width: '100%' }}
        placeholder=".builder-preview .hero { border-radius: 24px; }"
      />

      <h3>Responsive Preview</h3>
      <div className="row-actions">
        <button type="button" onClick={() => setMode('desktop')}>
          Desktop
        </button>
        <button type="button" onClick={() => setMode('tablet')}>
          Tablet
        </button>
        <button type="button" onClick={() => setMode('mobile')}>
          Mobile
        </button>
      </div>
      <PageRenderer schema={schema} products={products} posts={posts} mode={mode} />

      {selectedBlock ? <p>Selected block: {selectedBlock.id}</p> : null}
      <p>{message}</p>
    </section>
  );
}
