// src/components/forms/CreateNotificationForm.tsx
import React, { useState } from 'react';
// TODO: import your notification API once available
// import { CreateNotificationDTO, createNotification } from '@/api/notification';

interface Props {
  onSuccess: () => void;
}

export default function CreateNotificationForm({ onSuccess }: Props) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // await createNotification({ title, body });
      onSuccess();
    } catch {
      alert('Failed to create notification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-white">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 rounded bg-white/10 text-white"
          required
        />
      </div>
      <div>
        <label className="block text-white">Body</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="w-full p-2 rounded bg-white/10 text-white"
          rows={3}
          required
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 bg-[#5AA5FF] rounded text-white disabled:opacity-50"
      >
        {loading ? 'Sending…' : 'Send Notification'}
      </button>
    </form>
  );
}
