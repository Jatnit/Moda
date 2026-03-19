import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { MediaPicker, MediaUploader } from '../../components/MediaUploader';

type MediaItem = {
  id: string;
  publicId: string;
  secureUrl: string;
};

export function MediaManagerPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [selected, setSelected] = useState<MediaItem | null>(null);

  const load = () => {
    api
      .get<MediaItem[]>('/media')
      .then((response) => setItems(response.data))
      .catch(() => setItems([]));
  };

  const remove = async () => {
    if (!selected) {
      return;
    }
    await api.delete('/media', { data: { publicId: selected.publicId } });
    setSelected(null);
    load();
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <section>
      <h2>Media Manager</h2>
      <MediaUploader />
      <button type="button" className="ghost" onClick={load}>
        Refresh media
      </button>
      <MediaPicker items={items} onPick={setSelected} />
      {selected ? (
        <div className="stack">
          <p>Selected: {selected.publicId}</p>
          <img className="preview" src={selected.secureUrl} alt={selected.publicId} />
          <button type="button" onClick={remove}>
            Delete selected
          </button>
        </div>
      ) : null}
    </section>
  );
}
