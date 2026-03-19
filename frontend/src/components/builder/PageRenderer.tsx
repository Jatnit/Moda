export type BlockStyle = {
  margin?: number;
  padding?: number;
  border?: string;
  shadow?: string;
  bg?: string;
  responsive?: {
    desktop?: { cols?: number };
    tablet?: { cols?: number };
    mobile?: { cols?: number };
  };
};

export type BuilderBlock = {
  id: string;
  type: 'hero' | 'text' | 'image' | 'button' | 'product-grid' | 'row' | 'column';
  props?: Record<string, unknown>;
  style?: BlockStyle;
  children?: BuilderBlock[];
};

export type BuilderSchema = {
  blocks: BuilderBlock[];
  customCss?: string;
};

type Product = { id: string; name: string; price: number };
type Post = { id: string; title: string; excerpt?: string };
type PreviewMode = 'desktop' | 'tablet' | 'mobile';
type BindingContext = { products: Product[]; posts: Post[] };
type VisibilityRule = {
  path: string;
  operator?: 'exists' | 'equals' | 'not_equals';
  value?: string | number | boolean;
};

function getValueByPath(context: BindingContext, path: string): unknown {
  const parts = path.split('.');
  let current: unknown = context;
  for (const part of parts) {
    if (current == null) return '';
    if (Array.isArray(current)) {
      const index = Number(part);
      if (!Number.isInteger(index)) return '';
      current = current[index];
      continue;
    }
    if (typeof current === 'object') {
      current = (current as Record<string, unknown>)[part];
      continue;
    }
    return '';
  }
  return current ?? '';
}

function resolveBinding(value: unknown, context: BindingContext): string {
  const text = String(value ?? '');
  return text.replace(/\{\{\s*([^}]+)\s*\}\}/g, (_, token: string) => {
    const resolved = getValueByPath(context, token.trim());
    if (resolved === null || resolved === undefined) return '';
    return String(resolved);
  });
}

function sanitizeCustomCss(input: string | undefined): string {
  const raw = String(input ?? '').trim();
  if (!raw) return '';
  if (raw.length > 4000) return '';
  const lowered = raw.toLowerCase();
  const blocked = ['<', '</', 'javascript:', '@import', 'expression('];
  if (blocked.some((token) => lowered.includes(token))) return '';
  return raw;
}

function passesVisibility(rule: VisibilityRule | undefined, context: BindingContext): boolean {
  if (!rule?.path) return true;
  const current = getValueByPath(context, rule.path);
  const operator = rule.operator ?? 'exists';

  if (operator === 'exists') {
    if (Array.isArray(current)) return current.length > 0;
    return current !== undefined && current !== null && String(current) !== '';
  }

  if (operator === 'equals') {
    return String(current ?? '') === String(rule.value ?? '');
  }

  return String(current ?? '') !== String(rule.value ?? '');
}

function applyStyle(style?: BlockStyle): CSSProperties {
  return {
    margin: style?.margin ?? 0,
    padding: style?.padding ?? 0,
    border: style?.border,
    boxShadow: style?.shadow,
    background: style?.bg
  };
}

function renderBlock(block: BuilderBlock, context: BindingContext, mode: PreviewMode): JSX.Element | null {
  const visibility = block.props?.visibility as VisibilityRule | undefined;
  if (!passesVisibility(visibility, context)) {
    return null;
  }

  if (block.type === 'row') {
    const cols = block.style?.responsive?.[mode]?.cols ?? block.children?.length ?? 1;
    return (
      <section key={block.id} className="block" style={applyStyle(block.style)}>
        <div className="row-grid" style={{ gridTemplateColumns: `repeat(${Math.max(cols, 1)}, minmax(0, 1fr))` }}>
          {(block.children ?? []).map((child) => renderBlock(child, context, mode))}
        </div>
      </section>
    );
  }

  if (block.type === 'column') {
    return (
      <section key={block.id} className="block" style={applyStyle(block.style)}>
        {(block.children ?? []).map((child) => renderBlock(child, context, mode))}
      </section>
    );
  }

  if (block.type === 'hero') {
    return (
      <section key={block.id} className="block hero" style={applyStyle(block.style)}>
        <h2>{resolveBinding(block.props?.title, context)}</h2>
        <p>{resolveBinding(block.props?.subtitle, context)}</p>
      </section>
    );
  }

  if (block.type === 'text') {
    return (
      <section key={block.id} className="block" style={applyStyle(block.style)}>
        <p>{resolveBinding(block.props?.content, context)}</p>
      </section>
    );
  }

  if (block.type === 'image') {
    const src = resolveBinding(block.props?.src, context);
    const alt = resolveBinding(block.props?.alt, context) || 'image';
    return (
      <section key={block.id} className="block" style={applyStyle(block.style)}>
        <img className="block-image" src={src} alt={alt} loading="lazy" decoding="async" />
      </section>
    );
  }

  if (block.type === 'button') {
    const href = resolveBinding(block.props?.href, context) || '#';
    const label = resolveBinding(block.props?.label, context) || 'Button';
    return (
      <section key={block.id} className="block" style={applyStyle(block.style)}>
        <a href={href} className="cta-link">
          {label}
        </a>
      </section>
    );
  }

  const limit = Number(resolveBinding(block.props?.limit ?? 6, context) || 6);
  const source = String(block.props?.source ?? 'products');
  const gridTitle = resolveBinding(block.props?.title ?? 'Featured Products', context);

  if (source === 'posts') {
    return (
      <section key={block.id} className="block" style={applyStyle(block.style)}>
        <h3>{gridTitle || 'Featured Posts'}</h3>
        <div className="cards">
          {context.posts.slice(0, limit).map((item) => (
            <article key={item.id}>
              <h4>{item.title}</h4>
              <p>{item.excerpt ?? ''}</p>
            </article>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section key={block.id} className="block" style={applyStyle(block.style)}>
      <h3>{gridTitle}</h3>
      <div className="cards">
        {context.products.slice(0, limit).map((item) => (
          <article key={item.id}>
            <h4>{item.name}</h4>
            <p>${item.price}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function PageRenderer(props: { schema: BuilderSchema; products?: Product[]; posts?: Post[]; mode?: PreviewMode }) {
  const { schema, products = [], posts = [], mode = 'desktop' } = props;
  const context: BindingContext = { products, posts };
  const safeCustomCss = sanitizeCustomCss(schema.customCss);
  return (
    <div className={`builder-preview mode-${mode}`}>
      {safeCustomCss ? <style>{safeCustomCss}</style> : null}
      {schema.blocks.map((block) => renderBlock(block, context, mode))}
    </div>
  );
}

export const defaultBuilderSchema: BuilderSchema = {
  blocks: [
    {
      id: 'row-1',
      type: 'row',
      style: { padding: 8, responsive: { desktop: { cols: 2 }, tablet: { cols: 1 }, mobile: { cols: 1 } } },
      children: [
        {
          id: 'hero-1',
          type: 'hero',
          props: { title: 'Moda Atelier', subtitle: 'New season favorite: {{products.0.name}}' },
          style: { padding: 16 }
        },
        {
          id: 'column-1',
          type: 'column',
          children: [
            { id: 'text-1', type: 'text', props: { content: 'Tailored essentials for modern women and men.' } },
            { id: 'button-1', type: 'button', props: { label: 'Explore Collection', href: '/products' } }
          ]
        }
      ]
    },
    { id: 'grid-1', type: 'product-grid', props: { title: 'Signature Picks', limit: 6 } }
  ]
};
import type { CSSProperties, JSX } from 'react';
