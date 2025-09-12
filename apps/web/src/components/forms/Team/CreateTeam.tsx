// src/components/forms/CreateTeamForm.tsx
import React, { useState } from 'react';
import { CreateTeamDTO, createTeam } from '@/api/team';

interface Props {
  onSuccess: () => void;
}

export default function CreateTeamForm({ onSuccess }: Props) {
  const [form, setForm] = useState<CreateTeamDTO>({
    name: '',
    ageGroup: '',
    region: '',
    state: '',
    headCoachID: '12345',
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
    const result = await createTeam(form);
    setLoading(false);
    if (result) onSuccess();
    else alert('Failed to create team');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-white">Name</label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          className="w-full p-2 rounded bg-white/10 text-white"
          required
        />
      </div>
      <div>
        <label className="block text-white">Age Group</label>
        <input
          name="ageGroup"
          value={form.ageGroup}
          onChange={handleChange}
          className="w-full p-2 rounded bg-white/10 text-white"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-white">Region</label>
          <input
            name="region"
            value={form.region}
            onChange={handleChange}
            className="w-full p-2 rounded bg-white/10 text-white"
            required
          />
        </div>
        <div>
          <label className="block text-white">State</label>
          <input
            name="state"
            value={form.state}
            onChange={handleChange}
            className="w-full p-2 rounded bg-white/10 text-white"
            required
          />
        </div>
      </div>
      <div>
        <label className="block text-white">Head Coach ID</label>
        <input
          name="headCoachID"
          value={form.headCoachID ?? ''}
          onChange={handleChange}
          className="w-full p-2 rounded bg-white/10 text-white"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 bg-[#5AA5FF] rounded text-white disabled:opacity-50"
      >
        {loading ? 'Creating…' : 'Create Team'}
      </button>
    </form>
  );
}
