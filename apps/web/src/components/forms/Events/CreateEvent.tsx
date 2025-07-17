// src/components/forms/CreateEventForm.tsx
import React, { useState } from 'react';
import { CreateEventDTO, createEvent } from '@/api/event';

interface Props {
  onSuccess: () => void;
}

export default function CreateEventForm({ onSuccess }: Props) {
  const [form, setForm] = useState<CreateEventDTO>({
    eventType: 'GLOBAL',
    start: '',
    end: '',
    tournamentID: undefined,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createEvent(form);
      onSuccess();
    } catch {
      alert('Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-white">Type</label>
        <select
          name="eventType"
          value={form.eventType}
          onChange={handleChange}
          className="w-full p-2 rounded bg-white/10 text-white"
        >
          <option value="GLOBAL">GLOBAL</option>
          <option value="TOURNAMENT">TOURNAMENT</option>
          <option value="PRACTICE">PRACTICE</option>
        </select>
      </div>
      <div>
        <label className="block text-white">Start</label>
        <input
          name="start"
          type="datetime-local"
          value={form.start}
          onChange={handleChange}
          className="w-full p-2 rounded bg-white/10 text-white"
          required
        />
      </div>
      <div>
        <label className="block text-white">End</label>
        <input
          name="end"
          type="datetime-local"
          value={form.end}
          onChange={handleChange}
          className="w-full p-2 rounded bg-white/10 text-white"
          required
        />
      </div>
      <div>
        <label className="block text-white">Tournament ID (opt.)</label>
        <input
          name="tournamentID"
          value={form.tournamentID || ''}
          onChange={handleChange}
          className="w-full p-2 rounded bg-white/10 text-white"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 bg-[#5AA5FF] rounded text-white disabled:opacity-50"
      >
        {loading ? 'Creating…' : 'Create Event'}
      </button>
    </form>
  );
}
