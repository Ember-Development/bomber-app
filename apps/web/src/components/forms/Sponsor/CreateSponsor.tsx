// src/components/forms/CreateSponsorForm.tsx
import React, { useState } from 'react';
import { CreateSponsorDTO, createSponsor } from '@/api/sponsor';

interface Props {
  onSuccess: () => void;
}

export default function CreateSponsorForm({ onSuccess }: Props) {
  const [form, setForm] = useState<CreateSponsorDTO>({
    title: '',
    url: '',
    logoUrl: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await createSponsor(form);
    setLoading(false);
    if (result) onSuccess();
    else alert('Failed to create sponsor');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-white">Title</label>
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          className="w-full p-2 rounded bg-white/10 text-white"
          required
        />
      </div>
      <div>
        <label className="block text-white">URL</label>
        <input
          name="url"
          value={form.url}
          onChange={handleChange}
          className="w-full p-2 rounded bg-white/10 text-white"
          required
        />
      </div>
      <div>
        <label className="block text-white">Logo URL</label>
        <input
          name="logoUrl"
          value={form.logoUrl}
          onChange={handleChange}
          className="w-full p-2 rounded bg-white/10 text-white"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 bg-[#5AA5FF] rounded text-white disabled:opacity-50"
      >
        {loading ? 'Creating…' : 'Create Sponsor'}
      </button>
    </form>
  );
}
