import React, { useEffect, useMemo, useState } from 'react';
import type {
  PlayerFE,
  JerseySize,
  PantsSize,
  ShortsSize,
  StirrupSize,
  Position,
} from '@bomber-app/database';
import { US_STATES } from '@/utils/state';
import {
  JERSEY_SIZES,
  PANT_SIZES,
  POSITIONS_DROPDOWN,
  SHORTS_SIZES,
  STIRRUP_SIZES,
} from '@/utils/enum';
import { api } from '@/api/api';
import SchoolInputWeb from '@/components/ui/schoolInput';
import type { FlatSchool } from '@/utils/school';
import { updatePlayer } from '@/api/player';

type Props = {
  player: PlayerFE;
  onCancel: () => void;
  /** Called after successful update so parent can refresh */
  onSuccess?: () => void;
  /** Optional override if you already have a hook to update a player (e.g., react-query). */
  updatePlayerApi?: (
    playerId: string,
    payload: Record<string, any>
  ) => Promise<any>;
};

const TabKeys = ['info', 'contact', 'gear'] as const;
type TabKey = (typeof TabKeys)[number];

const EditPlayerModal: React.FC<Props> = ({
  player,
  onCancel,
  onSuccess,
  updatePlayerApi,
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>('info');
  const [isPending, setIsPending] = useState(false);
  const [school, setSchool] = useState<FlatSchool | undefined>(undefined);

  const user = player.user;
  if (!user) {
    return <div className="text-white">Missing player user data</div>;
  }

  // ----- base form -----
  const [formData, setFormData] = useState({
    // user fields
    fname: user.fname,
    lname: user.lname,
    email: user.email,
    phone: user.phone || '',

    // player fields
    pos1: player.pos1 as Position,
    pos2: player.pos2 as Position,
    jerseyNum: player.jerseyNum,
    gradYear: player.gradYear,

    // commit/college
    college: player.college || '',
    // prefer id from FE if present
    commitId:
      (player as any).commitId ?? (player as any).commit?.id ?? undefined,

    // address
    address1: player.address?.address1 || '',
    address2: player.address?.address2 || '',
    city: player.address?.city || '',
    zip: player.address?.zip || '',
    state: player.address?.state || '',

    // gear
    jerseySize: player.jerseySize as JerseySize,
    pantSize: player.pantSize as PantsSize,
    stirrupSize: player.stirrupSize as StirrupSize,
    shortSize: player.shortSize as ShortsSize,
    practiceShortSize: player.practiceShortSize as ShortsSize,
  });

  // ----- commit UX -----
  const [committed, setCommitted] = useState<boolean>(
    !!(player.college && player.college.trim())
  );
  const [college, setCollege] = useState<string>(player.college || '');
  const [collegeSchool, setCollegeSchool] = useState<FlatSchool | undefined>(
    undefined
  );
  const [commitDate, setCommitDate] = useState<string>(''); // ISO yyyy-mm-dd (optional)
  const commitDisabled = useMemo(() => !committed, [committed]);

  useEffect(() => {
    if (!committed) {
      setCollege('');
      setCollegeSchool(undefined);
      setCommitDate('');
      setFormData((prev) => ({ ...prev, college: '', commitId: undefined }));
    }
  }, [committed]);

  // ----- submit -----
  const handleSubmit = async () => {
    try {
      setIsPending(true);
      let payload: Record<string, any> = { ...formData, college };

      if (committed && collegeSchool?.name) {
        const body = {
          name: collegeSchool.name,
          state: collegeSchool.state ?? '',
          city: collegeSchool.city ?? '',
          imageUrl: collegeSchool.imageUrl ?? '',
          committedDate: commitDate ? new Date(commitDate) : new Date(),
        };

        try {
          const { data: created } = await api.post('/commits', body);
          payload = {
            ...payload,
            college: collegeSchool.name,
            commitId: created.id,
          };
        } catch (e) {
          console.error('[EDIT PLAYER WEB] Commit create ERROR:', e);
          payload = { ...payload, commitId: undefined };
        }
      } else if (!committed) {
        payload = { ...payload, college: '', commitId: undefined };
      }

      if (updatePlayerApi) {
        await updatePlayer(player.id, payload);
      } else {
        // default to our shared web API wrapper (PUT)
        const updated = await updatePlayer(player.id, payload);
        if (!updated) throw new Error('Update failed');
      }

      onSuccess?.();
    } catch (e) {
      console.error('[EDIT PLAYER WEB] Submit ERROR:', e);
    } finally {
      setIsPending(false);
    }
  };

  // ----- render tabs -----
  const InfoTab = (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-semibold text-white">
            First Name
          </label>
          <input
            className="mt-1 w-full rounded-lg bg-white/10 px-3 py-2 text-white outline-none"
            defaultValue={formData.fname}
            onChange={(e) =>
              setFormData({ ...formData, fname: e.target.value })
            }
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-white">
            Last Name
          </label>
          <input
            className="mt-1 w-full rounded-lg bg-white/10 px-3 py-2 text-white outline-none"
            defaultValue={formData.lname}
            onChange={(e) =>
              setFormData({ ...formData, lname: e.target.value })
            }
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-semibold text-white">
            Position 1
          </label>
          <select
            className="mt-1 w-full rounded-lg bg-white/10 px-3 py-2 text-white outline-none"
            value={formData.pos1}
            onChange={(e) =>
              setFormData({ ...formData, pos1: e.target.value as Position })
            }
          >
            {POSITIONS_DROPDOWN.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-white">
            Position 2
          </label>
          <select
            className="mt-1 w-full rounded-lg bg-white/10 px-3 py-2 text-white outline-none"
            value={formData.pos2}
            onChange={(e) =>
              setFormData({ ...formData, pos2: e.target.value as Position })
            }
          >
            {POSITIONS_DROPDOWN.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-semibold text-white">
            Jersey #
          </label>
          <input
            className="mt-1 w-full rounded-lg bg-white/10 px-3 py-2 text-white outline-none"
            defaultValue={formData.jerseyNum}
            onChange={(e) =>
              setFormData({ ...formData, jerseyNum: e.target.value })
            }
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-white">
            Graduation Year
          </label>
          <input
            className="mt-1 w-full rounded-lg bg-white/10 px-3 py-2 text-white outline-none"
            defaultValue={formData.gradYear}
            onChange={(e) =>
              setFormData({ ...formData, gradYear: e.target.value })
            }
          />
        </div>
      </div>

      {/* Commit Block */}
      <div className="mt-2 space-y-2 rounded-2xl border border-white/20 bg-white/5 p-3">
        <label className="flex items-center gap-2 text-sm text-white">
          <input
            type="checkbox"
            className="h-4 w-4 accent-blue-500"
            checked={committed}
            onChange={(e) => setCommitted(e.target.checked)}
          />
          Committed to College?
        </label>

        {committed && (
          <>
            <div>
              <SchoolInputWeb
                label="School"
                value={collegeSchool}
                onChange={(s) => {
                  setCollegeSchool(s);
                  setCollege(s.name);
                  setFormData((prev) => ({ ...prev, college: s.name }));
                }}
                fullWidth
              />
            </div>

            <div className="grid">
              <div>
                <label className="block text-sm font-semibold text-white">
                  College Committed
                </label>
                <input
                  className="mt-1 w-full rounded-lg bg-white/10 px-3 py-2 text-white outline-none"
                  value={college}
                  onChange={(e) => {
                    const v = e.target.value;
                    setCollege(v);
                    setFormData((prev) => ({ ...prev, college: v }));
                    // If the user starts free-typing, clear the structured selection
                    if (!v || (collegeSchool && collegeSchool.name !== v)) {
                      setCollegeSchool(undefined);
                    }
                  }}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );

  const ContactTab = (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-semibold text-white">Email</label>
        <input
          className="mt-1 w-full rounded-lg bg-white/10 px-3 py-2 text-white outline-none"
          defaultValue={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-white">Phone</label>
        <input
          className="mt-1 w-full rounded-lg bg-white/10 px-3 py-2 text-white outline-none"
          defaultValue={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-white">
          Address
        </label>
        <input
          className="mt-1 w-full rounded-lg bg-white/10 px-3 py-2 text-white outline-none"
          defaultValue={formData.address1}
          onChange={(e) =>
            setFormData({ ...formData, address1: e.target.value })
          }
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-semibold text-white">City</label>
          <input
            className="mt-1 w-full rounded-lg bg-white/10 px-3 py-2 text-white outline-none"
            defaultValue={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-white">
            Zipcode
          </label>
          <input
            className="mt-1 w-full rounded-lg bg-white/10 px-3 py-2 text-white outline-none"
            defaultValue={formData.zip}
            onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-white">State</label>
        <select
          className="mt-1 w-full rounded-lg bg-white/10 px-3 py-2 text-white outline-none"
          value={formData.state}
          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
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

  const GearTab = (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-semibold text-white">
            Jersey Size
          </label>
          <select
            className="mt-1 w-full rounded-lg bg-white/10 px-3 py-2 text-white outline-none"
            value={formData.jerseySize}
            onChange={(e) =>
              setFormData({
                ...formData,
                jerseySize: e.target.value as JerseySize,
              })
            }
          >
            {JERSEY_SIZES.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-white">
            Pant Size
          </label>
          <select
            className="mt-1 w-full rounded-lg bg-white/10 px-3 py-2 text-white outline-none"
            value={formData.pantSize}
            onChange={(e) =>
              setFormData({
                ...formData,
                pantSize: e.target.value as PantsSize,
              })
            }
          >
            {PANT_SIZES.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-semibold text-white">
            Stirrup Size
          </label>
          <select
            className="mt-1 w-full rounded-lg bg-white/10 px-3 py-2 text-white outline-none"
            value={formData.stirrupSize}
            onChange={(e) =>
              setFormData({
                ...formData,
                stirrupSize: e.target.value as StirrupSize,
              })
            }
          >
            {STIRRUP_SIZES.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-white">
            Short Size
          </label>
          <select
            className="mt-1 w-full rounded-lg bg-white/10 px-3 py-2 text-white outline-none"
            value={formData.shortSize}
            onChange={(e) =>
              setFormData({
                ...formData,
                shortSize: e.target.value as ShortsSize,
              })
            }
          >
            {SHORTS_SIZES.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-white">
          Practice Short Size
        </label>
        <select
          className="mt-1 w-full rounded-lg bg-white/10 px-3 py-2 text-white outline-none"
          value={formData.practiceShortSize}
          onChange={(e) =>
            setFormData({
              ...formData,
              practiceShortSize: e.target.value as ShortsSize,
            })
          }
        >
          {SHORTS_SIZES.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
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
        {activeTab === 'gear' && GearTab}
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
          disabled={isPending || (committed && !college && !collegeSchool)}
          className="rounded-lg bg-blue-500 px-4 py-2 text-white disabled:opacity-60"
        >
          {isPending ? 'Updating…' : 'Update Player'}
        </button>
      </div>
    </div>
  );
};

export default EditPlayerModal;
