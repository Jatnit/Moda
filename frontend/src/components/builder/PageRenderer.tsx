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
};

type Product = { id: string; name: string; price: number };
type PreviewMode = 'desktop' | 'tablet' | 'mobile';

function applyStyle(style?: BlockStyle): CSSProperties {
  return {
    margin: style?.margin ?? 0,
    padding: style?.padding ?? 0,
    border: style?.border,
    boxShadow: style?.shadow,
    background: style?.bg
  };
}

function renderBlock(block: BuilderBlock, products: Product[], mode: PreviewMode): JSX.Element {
  if (block.type === 'row') {
    const cols = block.style?.responsive?.[mode]?.cols ?? block.children?.length ?? 1;
    return (
      <section key={block.id} className="block" style={applyStyle(block.style)}>
        <div className="row-grid" style={{ gridTemplateColumns: `repeat(${Math.max(cols, 1)}, minmax(0, 1fr))` }}>
          {(block.children ?? []).map((child) => renderBlock(child, products, mode))}
        </div>
      </section>
    );
  }

  if (block.type === 'column') {
    return (
      <section key={block.id} className="block" style={applyStyle(block.style)}>
        {(block.children ?? []).map((child) => renderBlock(child, products, mode))}
      </section>
    );
  }

  if (block.type === 'hero') {
    return (
      <section key={block.id} className="block hero" style={applyStyle(block.style)}>
        <h2>{String(block.props?.title ?? '')}</h2>
        <p>{String(block.props?.subtitle ?? '')}</p>
      </section>
    );
  }

  if (block.type === 'text') {
    return (
      <section key={block.id} className="block" style={applyStyle(block.style)}>
        <p>{String(block.props?.content ?? '')}</p>
      </section>
    );
  }

  if (block.type === 'image') {
    return (
      <section key={block.id} className="block" style={applyStyle(block.style)}>
        <img className="block-image" src={String(block.props?.src ?? '')} alt={String(block.props?.alt ?? 'image')} />
      </section>
    );
  }

  if (block.type === 'button') {
    return (
      <section key={block.id} className="block" style={applyStyle(block.style)}>
        <a href={String(block.props?.href ?? '#')} className="cta-link">
          {String(block.props?.label ?? 'Button')}
        </a>
      </section>
    );
  }

  const limit = Number(block.props?.limit ?? 6);
  return (
    <section key={block.id} className="block" style={applyStyle(block.style)}>
      <h3>{String(block.props?.title ?? 'Featured Products')}</h3>
      <div className="cards">
        {products.slice(0, limit).map((item) => (
          <article key={item.id}>
            <h4>{item.name}</h4>
            <p>${item.price}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function PageRenderer(props: { schema: BuilderSchema; products?: Product[]; mode?: PreviewMode }) {
  const { schema, products = [], mode = 'desktop' } = props;
  return (
    <div className={`builder-preview mode-${mode}`}>
      {schema.blocks.map((block) => renderBlock(block, products, mode))}
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
          props: { title: 'Welcome to Moda', subtitle: 'Style that moves with you' },
          style: { padding: 16 }
        },
        {
          id: 'column-1',
          type: 'column',
          children: [
            { id: 'text-1', type: 'text', props: { content: 'Edit this page from Admin Builder Pro.' } },
            { id: 'button-1', type: 'button', props: { label: 'Shop Now', href: '/products' } }
          ]
        }
      ]
    },
    { id: 'grid-1', type: 'product-grid', props: { title: 'Hot Products', limit: 6 } }
  ]
};
import type { CSSProperties, JSX } from 'react';

