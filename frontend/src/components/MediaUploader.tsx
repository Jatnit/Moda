import { ChangeEvent, useMemo, useState } from 'react';
import { api } from '../api/client';

type OwnerType = 'product' | 'post' | 'builder' | 'avatar';

type SignedUploadResponse = {
  cloudName: string;
  apiKey: string;
  folder: string;
  timestamp: number;
  signature: string;
  uploadUrl: string;
};

type UploadedMedia = {
  id: string;
  publicId: string;
  secureUrl: string;
};

const ownerOptions: OwnerType[] = ['product', 'post', 'builder', 'avatar'];

export function MediaUploader() {
  const [ownerType, setOwnerType] = useState<OwnerType>('product');
  const [ownerId, setOwnerId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const isValid = useMemo(() => !!file, [file]);

  const onSelectFile = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] ?? null;
    setFile(selected);
  };

  const upload = async () => {
    if (!file) {
      setMessage('Please select a file.');
      return;
    }

    try {
      setUploading(true);
      setMessage('');

      const signed = await api.post<SignedUploadResponse>('/media/signed-upload', {
        ownerType,
        ownerId: ownerId.trim() || undefined,
        mimeType: file.type,
        fileSize: file.size
      });

      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', signed.data.apiKey);
      formData.append('timestamp', String(signed.data.timestamp));
      formData.append('signature', signed.data.signature);
      formData.append('folder', signed.data.folder);

      const cloudinaryResponse = await fetch(signed.data.uploadUrl, {
        method: 'POST',
        body: formData
      });

      if (!cloudinaryResponse.ok) {
        throw new Error('Cloudinary upload failed');
      }

      const payload = await cloudinaryResponse.json();
      await api.post('/media/attach', {
        publicId: payload.public_id,
        secureUrl: payload.secure_url,
        resourceType: payload.resource_type,
        format: payload.format,
        width: payload.width,
        height: payload.height,
        bytes: payload.bytes,
        folder: payload.folder,
        ownerType,
        ownerId: ownerId.trim() || undefined,
        replaceExisting: true
      });

      setMessage('Upload success.');
      setFile(null);
    } catch (error) {
      setMessage('Upload failed. Check backend/cloudinary env.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <section className="stack">
      <h3>Upload Media</h3>
      <select value={ownerType} onChange={(e) => setOwnerType(e.target.value as OwnerType)}>
        {ownerOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <input value={ownerId} onChange={(e) => setOwnerId(e.target.value)} placeholder="Owner ID (optional)" />
      <input type="file" accept="image/*" onChange={onSelectFile} />
      <button type="button" onClick={upload} disabled={!isValid || uploading}>
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
      <p>{message}</p>
    </section>
  );
}

export function MediaPicker(props: { items: UploadedMedia[]; onPick: (item: UploadedMedia) => void }) {
  const { items, onPick } = props;
  return (
    <section>
      <h3>Media Picker</h3>
      <div className="media-grid">
        {items.map((item) => (
          <button key={item.id} type="button" className="media-card" onClick={() => onPick(item)}>
            <img src={item.secureUrl} alt={item.publicId} />
            <small>{item.publicId}</small>
          </button>
        ))}
      </div>
    </section>
  );
}
