import { useEffect } from 'react';

function ensureMetaDescription() {
  let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = 'description';
    document.head.appendChild(meta);
  }
  return meta;
}

export function useSeo(input: { title: string; description?: string }) {
  useEffect(() => {
    const previousTitle = document.title;
    const meta = ensureMetaDescription();
    const previousDescription = meta.content;

    document.title = input.title;
    if (input.description) {
      meta.content = input.description;
    }

    return () => {
      document.title = previousTitle;
      meta.content = previousDescription;
    };
  }, [input.title, input.description]);
}
