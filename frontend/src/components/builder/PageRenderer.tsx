type Block =
  | { id: string; type: 'hero'; props: { title: string; subtitle?: string } }
  | { id: string; type: 'text'; props: { content: string } }
  | { id: string; type: 'image'; props: { src: string; alt?: string } }
  | { id: string; type: 'button'; props: { label: string; href?: string } }
  | { id: string; type: 'product-grid'; props: { title?: string; limit?: number } };

export type BuilderSchema = {
  blocks: Block[];
};

type Product = {
  id: string;
  name: string;
  price: number;
};

export function PageRenderer(props: { schema: BuilderSchema; products?: Product[] }) {
  const { schema, products = [] } = props;

  return (
    <div className="builder-preview">
      {schema.blocks.map((block) => {
        if (block.type === 'hero') {
          return (
            <section key={block.id} className="block hero">
              <h2>{block.props.title}</h2>
              <p>{block.props.subtitle}</p>
            </section>
          );
        }
        if (block.type === 'text') {
          return (
            <section key={block.id} className="block">
              <p>{block.props.content}</p>
            </section>
          );
        }
        if (block.type === 'image') {
          return (
            <section key={block.id} className="block">
              <img className="block-image" src={block.props.src} alt={block.props.alt ?? 'image'} />
            </section>
          );
        }
        if (block.type === 'button') {
          return (
            <section key={block.id} className="block">
              <a href={block.props.href ?? '#'} className="cta-link">
                {block.props.label}
              </a>
            </section>
          );
        }
        const limit = block.props.limit ?? 6;
        return (
          <section key={block.id} className="block">
            <h3>{block.props.title ?? 'Featured Products'}</h3>
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
      })}
    </div>
  );
}

export const defaultBuilderSchema: BuilderSchema = {
  blocks: [
    { id: 'hero-1', type: 'hero', props: { title: 'Welcome to Moda', subtitle: 'Style that moves with you' } },
    { id: 'text-1', type: 'text', props: { content: 'Edit this page from Admin Builder.' } },
    { id: 'grid-1', type: 'product-grid', props: { title: 'Hot Products', limit: 6 } }
  ]
};

