import React, { useMemo, useState } from 'react';
import type { CoachFE } from '@bomber-app/database';
import { US_STATES } from '@/utils/state';
import { updateCoach, UpdateCoachPayload } from '@/api/coach';

type Props = {
  coach: CoachFE;
  onCancel: () => void;
  onSuccess?: () => void;
  // optional override if you decide to use a hook later
  updateCoachApi?: (
    coachId: string,
    payload: UpdateCoachPayload
  ) => Promise<any>;
};

const TabKeys = ['info', 'contact'] as const;
type TabKey = (typeof TabKeys)[number];

const EditCoachModal: React.FC<Props> = ({
  coach,
  onCancel,
  onSuccess,
  updateCoachApi,
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>('info');
  const [isPending, setIsPending] = useState(false);

  const user = coach.user;
  if (!user) return <div className="text-white">Missing coach user data</div>;

  const [formData, setFormData] = useState({
    // user
    fname: user.fname,
    lname: user.lname,
    email: user.email,
    phone: user.phone || '',
    // address (flattened)
    address1: coach.address?.address1 || '',
    address2: coach.address?.address2 || '',
    city: coach.address?.city || '',
    zip: coach.address?.zip || '',
    state: coach.address?.state || '',
  });

  const canSubmit = useMemo(
    () => !!formData.fname && !!formData.lname,
    [formData.fname, formData.lname]
  );

  const handleSubmit = async () => {
    if (!canSubmit) return;
    try {
      setIsPending(true);

      const payload: UpdateCoachPayload = {
        user: {
          update: {
            fname: formData.fname,
            lname: formData.lname,
            email: formData.email,
            phone: formData.phone,
          },
        },
        // address upsert behavior is handled server-side (same pattern as players)
        address1: formData.address1,
        address2: formData.address2,
        city: formData.city,
        state: formData.state,
        zip: formData.zip,
      };

      if (updateCoachApi) {
        await updateCoach(String(coach.id), payload);
      } else {
        await updateCoach(String(coach.id), payload);
      }

      onSuccess?.();
    } catch (e) {
      console.error('[EDIT COACH WEB] Submit ERROR:', e);
    } finally {
      setIsPending(false);
    }
  };

  const InfoTab = (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-semibold text-white">
            First Name
          </label>
          <input
            className="mt-1 w-full rounded-lg bg-white/10 px-3 py-2 text-white outline-none"
            value={formData.fname}
            onChange={(e) =>
              setFormData((p) => ({ ...p, fname: e.target.value }))
            }
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-white">
            Last Name
          </label>
          <input
            className="mt-1 w-full rounded-lg bg-white/10 px-3 py-2 text-white outline-none"
            value={formData.lname}
            onChange={(e) =>
              setFormData((p) => ({ ...p, lname: e.target.value }))
            }
          />
        </div>
      </div>
    </div>
  );

  const ContactTab = (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-semibold text-white">Email</label>
        <input
          className="mt-1 w-full rounded-lg bg-white/10 px-3 py-2 text-white outline-none"
          value={formData.email}
          onChange={(e) =>
            setFormData((p) => ({ ...p, email: e.target.value }))
          }
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-white">Phone</label>
        <input
          className="mt-1 w-full rounded-lg bg-white/10 px-3 py-2 text-white outline-none"
          value={formData.phone}
          onChange={(e) =>
            setFormData((p) => ({ ...p, phone: e.target.value }))
          }
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-white">
          Address 1
        </label>
        <input
          className="mt-1 w-full rounded-lg bg-white/10 px-3 py-2 text-white outline-none"
          value={formData.address1}
          onChange={(e) =>
            setFormData((p) => ({ ...p, address1: e.target.value }))
          }
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-white">
          Address 2
        </label>
        <input
          className="mt-1 w-full rounded-lg bg-white/10 px-3 py-2 text-white outline-none"
          value={formData.address2}
          onChange={(e) =>
            setFormData((p) => ({ ...p, address2: e.target.value }))
          }
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-semibold text-white">City</label>
          <input
            className="mt-1 w-full rounded-lg bg-white/10 px-3 py-2 text-white outline-none"
            value={formData.city}
            onChange={(e) =>
              setFormData((p) => ({ ...p, city: e.target.value }))
            }
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-white">
            Zipcode
          </label>
          <input
            className="mt-1 w-full rounded-lg bg-white/10 px-3 py-2 text-white outline-none"
            value={formData.zip}
            onChange={(e) =>
              setFormData((p) => ({ ...p, zip: e.target.value }))
            }
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-white">State</label>
        <select
          className="mt-1 w-full rounded-lg bg-white/10 px-3 py-2 text-white outline-none"
          value={formData.state}
          onChange={(e) =>
            setFormData((p) => ({ ...p, state: e.target.value }))
          }
        >
          {US_STATES.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  return (
    <div className="px-3 pb-6 sm:px-4 sm:pb-6">
      {/* Tabs */}
      <div className="mb-4 flex gap-2 overflow-x-auto">
        {TabKeys.map((k) => (
          <button
            key={k}
            onClick={() => setActiveTab(k)}
            className={`rounded-2xl border px-4 py-2 text-sm transition
              ${activeTab === k ? 'bg-white/30 border-white/40 text-white font-semibold' : 'bg-white/10 border-white/30 text-white/90 hover:bg-white/20'}`}
          >
            {k.charAt(0).toUpperCase() + k.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="rounded-2xl border border-white/20 bg-white/5 p-4 shadow-inner">
        {activeTab === 'info' && InfoTab}
        {activeTab === 'contact' && ContactTab}
      </div>

      {/* Actions */}
      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          onClick={onCancel}
          className="rounded-lg bg-white/20 px-4 py-2 text-white"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!canSubmit || isPending}
          className="rounded-lg bg-blue-500 px-4 py-2 text-white disabled:opacity-60"
        >
          {isPending ? 'Updating…' : 'Update Coach'}
        </button>
      </div>
    </div>
  );
};

export default EditCoachModal;
