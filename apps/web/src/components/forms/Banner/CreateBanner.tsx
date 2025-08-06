// src/components/forms/CreateBannerForm.tsx
import React, { useState } from 'react';
import { CreateBannerDTO, createBanner } from '@/api/banner';

interface Props {
  onSuccess: () => void;
}

export default function CreateBannerForm({ onSuccess }: Props) {
  const [form, setForm] = useState<CreateBannerDTO>({
    imageUrl: '',
    duration: 24,
    expiresAt: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await createBanner(form);
    setLoading(false);
    if (result) onSuccess();
    else alert('Failed to create banner');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-white">Image URL</label>
        <input
          name="imageUrl"
          value={form.imageUrl}
          onChange={handleChange}
          className="w-full p-2 rounded bg-white/10 text-white"
          required
        />
      </div>
      <div>
        <label className="block text-white">Duration (hrs)</label>
        <input
          name="duration"
          type="number"
          value={form.duration}
          onChange={handleChange}
          className="w-full p-2 rounded bg-white/10 text-white"
          min={1}
        />
      </div>
      <div>
        <label className="block text-white">Expires At</label>
        <input
          name="expiresAt"
          type="datetime-local"
          value={form.expiresAt}
          onChange={handleChange}
          className="w-full p-2 rounded bg-white/10 text-white"
          required
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 bg-[#5AA5FF] rounded text-white disabled:opacity-50"
      >
        {loading ? 'Creating…' : 'Create Banner'}
      </button>
    </form>
  );
}
