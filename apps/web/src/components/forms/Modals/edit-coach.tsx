import React, { useMemo, useState, useEffect } from 'react';
import { TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import type { CoachFE, TeamFE } from '@bomber-app/database';
import { US_STATES } from '@/utils/state';
import {
  updateCoach,
  UpdateCoachPayload,
  removeCoachFromTeam,
  fetchCoachById,
} from '@/api/coach';
import { fetchTeams, addCoachToTeam } from '@/api/team';

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

const TabKeys = ['info', 'contact', 'teams'] as const;
type TabKey = (typeof TabKeys)[number];

const EditCoachModal: React.FC<Props> = ({
  coach,
  onCancel,
  onSuccess,
  updateCoachApi,
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>('info');
  const [isPending, setIsPending] = useState(false);

  // Teams management
  const [allTeams, setAllTeams] = useState<TeamFE[]>([]);
  const [teamSearch, setTeamSearch] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [coachTeams, setCoachTeams] = useState<TeamFE[]>([]);
  const [teamActionPending, setTeamActionPending] = useState(false);

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

  // Fetch all teams and coach's teams
  useEffect(() => {
    fetchTeams().then(setAllTeams);
    // Fetch full coach data to get all teams
    fetchCoachById(coach.id).then((fullCoach) => {
      if (fullCoach.teams && Array.isArray(fullCoach.teams)) {
        setCoachTeams(fullCoach.teams as TeamFE[]);
      }
    });
  }, [coach.id]);

  const canSubmit = useMemo(
    () => !!formData.fname && !!formData.lname,
    [formData.fname, formData.lname]
  );

  // Team management handlers
  const handleAddToTeam = async () => {
    if (!selectedTeamId || !user) return;
    setTeamActionPending(true);
    try {
      const updated = await addCoachToTeam(selectedTeamId, { userID: user.id });
      if (updated) {
        const newTeam = allTeams.find((t) => t.id === selectedTeamId);
        if (newTeam) {
          setCoachTeams([...coachTeams, newTeam]);
        }
        setSelectedTeamId(null);
        setTeamSearch('');
      }
    } catch (error) {
      console.error('[EDIT COACH] Failed to add team:', error);
    } finally {
      setTeamActionPending(false);
    }
  };

  const handleRemoveFromTeam = async (teamId: string) => {
    setTeamActionPending(true);
    try {
      await removeCoachFromTeam(coach.id, teamId);
      setCoachTeams(coachTeams.filter((t) => t.id !== teamId));
      onSuccess?.();
    } catch (error) {
      console.error('[EDIT COACH] Failed to remove from team:', error);
    } finally {
      setTeamActionPending(false);
    }
  };

  // Filter teams for search
  const availableTeams = useMemo(() => {
    const currentTeamIds = new Set(coachTeams.map((t) => t.id));
    return allTeams.filter(
      (t) =>
        t.name.toLowerCase().includes(teamSearch.toLowerCase()) &&
        !currentTeamIds.has(t.id)
    );
  }, [allTeams, teamSearch, coachTeams]);

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

  const TeamsTab = (
    <div className="space-y-4">
      {/* Current Teams */}
      <div>
        <label className="block text-sm font-semibold text-white mb-2">
          Current Teams ({coachTeams.length})
        </label>
        {coachTeams.length > 0 ? (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {coachTeams.map((team) => (
              <div
                key={team.id}
                className="flex items-center justify-between rounded-lg bg-white/10 p-3"
              >
                <div>
                  <div className="font-medium text-white">{team.name}</div>
                  <div className="text-sm text-white/70">
                    {team.ageGroup} • {team.region} • {team.state}
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveFromTeam(team.id)}
                  disabled={teamActionPending}
                  className="rounded p-1.5 hover:bg-red-500/50 disabled:opacity-50"
                  title="Remove from team"
                >
                  <TrashIcon className="h-5 w-5 text-white" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg bg-white/5 p-4 text-center text-white/50">
            No teams assigned
          </div>
        )}
      </div>

      {/* Add to Team */}
      <div>
        <label className="block text-sm font-semibold text-white mb-2">
          Add to Team
        </label>
        <input
          type="text"
          placeholder="Search teams..."
          value={teamSearch}
          onChange={(e) => {
            setTeamSearch(e.target.value);
            setSelectedTeamId(null);
          }}
          className="w-full rounded-lg bg-white/10 px-3 py-2 text-white placeholder:text-white/50 outline-none"
        />
        {teamSearch && availableTeams.length > 0 && (
          <ul className="mt-2 max-h-40 overflow-auto rounded-lg bg-black/20">
            {availableTeams.map((team) => (
              <li
                key={team.id}
                className={`cursor-pointer px-3 py-2 text-white transition ${
                  selectedTeamId === team.id
                    ? 'bg-blue-500'
                    : 'hover:bg-white/10'
                }`}
                onClick={() => setSelectedTeamId(team.id)}
              >
                <div className="font-medium">{team.name}</div>
                <div className="text-sm text-white/70">
                  {team.ageGroup} • {team.region} • {team.state}
                </div>
              </li>
            ))}
          </ul>
        )}
        {teamSearch && availableTeams.length === 0 && (
          <div className="mt-2 text-center text-sm text-white/50">
            No teams found
          </div>
        )}
        {selectedTeamId && (
          <button
            onClick={handleAddToTeam}
            disabled={teamActionPending}
            className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-white disabled:opacity-50 hover:bg-blue-600"
          >
            <PlusIcon className="h-5 w-5" />
            {teamActionPending ? 'Adding...' : 'Add to Team'}
          </button>
        )}
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
        {activeTab === 'teams' && TeamsTab}
      </div>

      {/* Actions */}
      {activeTab === 'teams' ? (
        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-lg bg-white/20 px-4 py-2 text-white"
          >
            Close
          </button>
        </div>
      ) : (
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
      )}
    </div>
  );
};

export default EditCoachModal;
