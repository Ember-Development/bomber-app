import React, { useEffect, useState, useMemo } from 'react';
import {
  ArrowLeftIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import SideDialog from '@/components/SideDialog';
import { fetchPlayers, updatePlayer, deletePlayer } from '@/api/player';
import {
  Positions,
  AgeGroups,
  JerseySizes,
  PantsSizes,
  StirrupSizes,
  ShortsSizes,
  Position,
  AgeGroup,
  JerseySize,
  PantsSize,
  StirrupSize,
  ShortsSize,
} from '@/utils/enum';
import { Prisma } from '@bomber-app/database';
import { US_STATES } from '@/utils/state';

type Player = {
  id: string;
  name: string;
  email: string;
  team: string;
  pos1: Position;
  pos2: Position;
  ageGroup: AgeGroup;
  jerseyNum: string;
  gradYear: string;
  jerseySize: JerseySize;
  pantSize: PantsSize;
  stirrupSize: StirrupSize;
  shortSize: ShortsSize[number];
  practiceShortSize: (typeof ShortsSizes)[number];
  college?: string;
  isTrusted: boolean;
  addressID?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  zip?: string;
};

type TabKey = 'General' | 'Gear' | 'Contact';

const PAGE_SIZE = 15;

export default function Players() {
  const navigate = useNavigate();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [teamFilter, setTeamFilter] = useState('all');
  const [ageGroupFilter, setAgeGroupFilter] = useState('all');
  const [posFilter, setPosFilter] = useState('all');
  const [trustedFilter, setTrustedFilter] = useState<'all' | 'yes' | 'no'>(
    'all'
  );
  const [geradYearFilter, setGradYearFilter] = useState<'all' | string>('all');
  const [stateFilter, setStateFilter] = useState<'all' | string>('all');
  const [collegeFilter, setCollegeFilter] = useState<'all' | 'yes' | 'no'>(
    'all'
  );
  const [jerseySizeFilter, setJerseySizeFilter] = useState('all');
  const [pantSizeFilter, setPantSizeFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'edit' | 'delete' | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [tab, setTab] = useState<TabKey>('General');

  useEffect(() => {
    setLoading(true);
    fetchPlayers()
      .then((data) => {
        setPlayers(
          data.map((p: any) => ({
            id: p.id,
            name: p.name,
            email: p.email,
            team: p.team,
            pos1: p.pos1,
            pos2: p.pos2,
            ageGroup: p.ageGroup,
            jerseyNum: p.jerseyNum,
            gradYear: p.gradYear,
            jerseySize: p.jerseySize,
            pantSize: p.pantSize,
            stirrupSize: p.stirrupSize,
            shortSize: p.shortSize,
            practiceShortSize: p.practiceShortSize,
            college: p.college,
            isTrusted: p.isTrusted,
            addressID: p.addressID, // <— use the flat field
            address1: p.address1, // <— not p.address?.address1
            address2: p.address2,
            city: p.city,
            state: p.state,
            zip: p.zip,
          }))
        );
      })
      .catch(() => setPlayers([]))
      .finally(() => setLoading(false));
  }, []);

  const teams = useMemo(
    () => Array.from(new Set(players.map((p) => p.team).filter(Boolean))),
    [players]
  );
  const ageGroups = useMemo(
    () => Array.from(new Set(players.map((p) => p.ageGroup).filter(Boolean))),
    [players]
  );

  const gradYears = useMemo(
    () => Array.from(new Set(players.map((p) => p.gradYear))).sort(),
    [players]
  );
  const states = useMemo(
    () =>
      Array.from(new Set(players.map((p) => p.state).filter(Boolean))).sort(),
    [players]
  );

  const filtered = useMemo(
    () =>
      players.filter((p) => {
        if (teamFilter !== 'all' && p.team !== teamFilter) return false;
        if (ageGroupFilter !== 'all' && p.ageGroup !== ageGroupFilter)
          return false;
        if (posFilter !== 'all' && p.pos1 !== posFilter) return false;
        if (trustedFilter === 'yes' && !p.isTrusted) return false;
        if (trustedFilter === 'no' && p.isTrusted) return false;
        if (collegeFilter === 'yes' && !p.college) return false;
        if (collegeFilter === 'no' && p.college) return false;

        if (stateFilter !== 'all' && p.state !== stateFilter) return false;
        if (geradYearFilter !== 'all' && p.gradYear !== geradYearFilter)
          return false;
        if (jerseySizeFilter !== 'all' && p.jerseySize !== jerseySizeFilter)
          return false;
        if (pantSizeFilter !== 'all' && p.pantSize !== pantSizeFilter)
          return false;
        if (search) {
          const q = search.toLowerCase();
          if (
            !(
              p.name.toLowerCase().includes(q) ||
              p.team.toLowerCase().includes(q)
            )
          )
            return false;
        }
        return true;
      }),
    [
      players,
      teamFilter,
      ageGroupFilter,
      posFilter,
      jerseySizeFilter,
      pantSizeFilter,
      trustedFilter,
      search,
      collegeFilter,
      stateFilter,
      geradYearFilter,
    ]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [
    search,
    teamFilter,
    ageGroupFilter,
    posFilter,
    trustedFilter,
    jerseySizeFilter,
    pantSizeFilter,
  ]);

  const openEdit = (p: Player) => {
    setDialogType('edit');
    setSelectedPlayer(p);
    setTab('General');
    setDialogOpen(true);
  };
  const openDelete = (p: Player) => {
    setDialogType('delete');
    setSelectedPlayer(p);
    setDialogOpen(true);
  };
  const closeDialog = () => {
    setDialogOpen(false);
    setDialogType(null);
    setSelectedPlayer(null);
  };

  function EditForm({ player }: { player: Player }) {
    const [form, setForm] = useState<Partial<Player>>(player);
    const commonClass = 'w-full px-4 py-2 bg-white/10 text-white rounded-lg';

    const onSave = async () => {
      const payload: Omit<Prisma.PlayerUpdateInput, 'address'> & {
        address1?: string;
        address2?: string;
        city?: string;
        state?: string;
        zip?: string;
        addressID?: string;
      } = {
        pos1: form.pos1,
        pos2: form.pos2,
        ageGroup: form.ageGroup,
        jerseyNum: form.jerseyNum,
        gradYear: form.gradYear,
        jerseySize: form.jerseySize,
        pantSize: form.pantSize,
        stirrupSize: form.stirrupSize,
        shortSize: form.shortSize as any,
        practiceShortSize: form.practiceShortSize as any,
        isTrusted: form.isTrusted,
        college: form.college,
        addressID: form.addressID,
        address1: form.address1,
        address2: form.address2,
        city: form.city,
        state: form.state,
        zip: form.zip,
      };
      const updated = await updatePlayer(player.id, payload);
      if (updated) {
        setPlayers((ps) =>
          ps.map((p) =>
            p.id === updated.id
              ? {
                  ...p,
                  pos1: updated.pos1!,
                  pos2: updated.pos2!,
                  ageGroup: updated.ageGroup!,
                  jerseyNum: updated.jerseyNum!,
                  gradYear: updated.gradYear!,
                  jerseySize: updated.jerseySize!,
                  pantSize: updated.pantSize!,
                  stirrupSize: updated.stirrupSize!,
                  shortSize: updated.shortSize as any,
                  practiceShortSize: updated.practiceShortSize as any,
                  isTrusted: updated.isTrusted ?? false,
                  college: updated.college ?? '',
                  team: updated.team.name,
                  addressID: updated.address?.id,
                  address1: updated.address?.address1 ?? '',
                  address2: updated.address?.address2 ?? '',
                  city: updated.address?.city ?? '',
                  state: updated.address?.state ?? '',
                  zip: updated.address?.zip ?? '',
                }
              : p
          )
        );
        closeDialog();
      }
    };

    const Field = <K extends keyof Player>(
      label: string,
      key: K,
      input: React.ReactNode
    ) => (
      <div key={String(key)} className="mb-4">
        <label className="block text-sm text-white font-semibold mb-1">
          {label}
        </label>
        {input}
      </div>
    );

    return (
      <div>
        {tab === 'General' && (
          <>
            {Field(
              'Primary Position',
              'pos1',
              <select
                value={form.pos1 || ''}
                onChange={(e) =>
                  setForm((f) => ({ ...f, pos1: e.target.value as Position }))
                }
                className={commonClass}
              >
                <option value="">— select —</option>
                {Positions.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            )}
            {Field(
              'Secondary Position',
              'pos2',
              <select
                value={form.pos2 || ''}
                onChange={(e) =>
                  setForm((f) => ({ ...f, pos2: e.target.value as Position }))
                }
                className={commonClass}
              >
                <option value="">— select —</option>
                {Positions.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            )}
            {Field(
              'Age Group',
              'ageGroup',
              <select
                value={form.ageGroup || ''}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    ageGroup: e.target.value as AgeGroup,
                  }))
                }
                className={commonClass}
              >
                <option value="">— select —</option>
                {AgeGroups.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            )}
            {Field(
              'Graduation Year',
              'gradYear',
              <input
                value={form.gradYear || ''}
                onChange={(e) =>
                  setForm((f) => ({ ...f, gradYear: e.target.value }))
                }
                className={commonClass}
              />
            )}
            <label className="inline-flex items-center mt-2">
              <input
                type="checkbox"
                checked={form.isTrusted || false}
                onChange={(e) =>
                  setForm((f) => ({ ...f, isTrusted: e.target.checked }))
                }
                className="mr-2"
              />
              <span className="text-white">Trusted</span>
            </label>
          </>
        )}
        {tab === 'Gear' && (
          <>
            {Field(
              'Jersey Size',
              'jerseySize',
              <select
                value={form.jerseySize || ''}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    jerseySize: e.target.value as JerseySize,
                  }))
                }
                className={commonClass}
              >
                <option value="">— select —</option>
                {JerseySizes.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            )}
            {Field(
              'Pant Size',
              'pantSize',
              <select
                value={form.pantSize || ''}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    pantSize: e.target.value as PantsSize,
                  }))
                }
                className={commonClass}
              >
                <option value="">— select —</option>
                {PantsSizes.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            )}
            {Field(
              'Stirrup Size',
              'stirrupSize',
              <select
                value={form.stirrupSize || ''}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    stirrupSize: e.target.value as StirrupSize,
                  }))
                }
                className={commonClass}
              >
                <option value="">— select —</option>
                {StirrupSizes.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            )}
            {Field(
              'Shorts Size',
              'shortSize',
              <select
                value={form.shortSize || ''}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    shortSize: e.target.value as (typeof ShortsSizes)[number],
                  }))
                }
                className={commonClass}
              >
                <option value="">— select —</option>
                {ShortsSizes.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            )}
            {Field(
              'Practice Shorts',
              'practiceShortSize',
              <select
                value={form.practiceShortSize || ''}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    practiceShortSize: e.target
                      .value as (typeof ShortsSizes)[number],
                  }))
                }
                className={commonClass}
              >
                <option value="">— select —</option>
                {ShortsSizes.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            )}
          </>
        )}
        {tab === 'Contact' && (
          <>
            {Field(
              'Address1',
              'address1',
              <input
                value={form.address1 || ''}
                onChange={(e) =>
                  setForm((f) => ({ ...f, address1: e.target.value }))
                }
                className={commonClass}
              />
            )}
            {Field(
              'Address2',
              'address2',
              <input
                value={form.address2 || ''}
                onChange={(e) =>
                  setForm((f) => ({ ...f, address2: e.target.value }))
                }
                className={commonClass}
              />
            )}
            {Field(
              'City',
              'city',
              <input
                value={form.city || ''}
                onChange={(e) =>
                  setForm((f) => ({ ...f, city: e.target.value }))
                }
                className={commonClass}
              />
            )}
            {Field(
              'State',
              'state',
              <select
                value={form.state || ''}
                onChange={(e) =>
                  setForm((f) => ({ ...f, state: e.target.value as string }))
                }
                className={commonClass}
              >
                {US_STATES.map(({ value, label }) => (
                  <option key={value} value={value} className="text-black">
                    {label}
                  </option>
                ))}
              </select>
            )}
            {Field(
              'Zip',
              'zip',
              <input
                value={form.zip || ''}
                onChange={(e) =>
                  setForm((f) => ({ ...f, zip: e.target.value }))
                }
                className={commonClass}
              />
            )}
            {Field(
              'College',
              'college',
              <input
                value={form.college || ''}
                onChange={(e) =>
                  setForm((f) => ({ ...f, college: e.target.value }))
                }
                className={commonClass}
              />
            )}
          </>
        )}
        <div className="mt-6 flex space-x-4">
          <button
            onClick={onSave}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            Save
          </button>
          <button
            onClick={closeDialog}
            className="flex-1 px-4 py-2 bg-white/20 text-white rounded-lg"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex relative">
      <div
        className={`flex-1 flex flex-col space-y-6 ${dialogOpen ? 'pr-[50px]' : ''}`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 bg-[rgba(255,255,255,0.1)] rounded-lg text-white hover:bg-[rgba(255,255,255,0.2)]"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-white">Manage Players</h1>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            placeholder="Search players…"
            className="w-full sm:w-64 px-4 py-2 bg-[rgba(255,255,255,0.05)] placeholder-white/70 text-white rounded-lg focus:outline-none"
          />
          <select
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 bg-white/10 text-white rounded-lg"
          >
            <option value="all">All Teams</option>
            {teams.map((t) => (
              <option key={t} value={t} className="text-black">
                {t}
              </option>
            ))}
          </select>
          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 bg-white/10 text-white rounded-lg"
          >
            <option value="all">All States</option>
            {states.map((s) => (
              <option key={s} value={s} className="text-black">
                {s}
              </option>
            ))}
          </select>

          <select
            value={geradYearFilter}
            onChange={(e) => setGradYearFilter(e.target.value as any)}
            className="w-full sm:w-auto px-4 py-2 bg-white/10 text-white rounded-lg"
          >
            <option value="all">All Grad Years</option>
            {gradYears.map((y) => (
              <option key={y} value={y} className="text-black">
                {y}
              </option>
            ))}
          </select>
          <select
            value={ageGroupFilter}
            onChange={(e) => setAgeGroupFilter(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 bg-white/10 text-white rounded-lg"
          >
            <option value="all">All Age Groups</option>
            {ageGroups.map((a) => (
              <option key={a} value={a} className="text-black">
                {a}
              </option>
            ))}
          </select>
          <select
            value={posFilter}
            onChange={(e) => setPosFilter(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 bg-white/10 text-white rounded-lg"
          >
            <option value="all">All Positions</option>
            {Positions.map((p) => (
              <option key={p} value={p} className="text-black">
                {p}
              </option>
            ))}
          </select>
          {/* <select
            value={jerseySizeFilter}
            onChange={(e) => setJerseySizeFilter(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 bg-white/10 text-white rounded-lg"
          >
            <option value="all">All Jersey Sizes</option>
            {JerseySizes.map((j) => (
              <option key={j} value={j}>
                {j}
              </option>
            ))}
          </select>
          <select
            value={pantSizeFilter}
            onChange={(e) => setPantSizeFilter(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 bg-white/10 text-white rounded-lg"
          >
            <option value="all">All Pant Sizes</option>
            {PantsSizes.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select> */}
          <select
            value={collegeFilter}
            onChange={(e) => setCollegeFilter(e.target.value as any)}
            className="w-full sm:w-auto px-4 py-2 bg-white/10 text-white rounded-lg"
          >
            <option value="all" className="text-black">
              All College
            </option>
            <option value="yes" className="text-black">
              Committed
            </option>
            <option value="no" className="text-black">
              Not Committed
            </option>
          </select>
          <select
            value={trustedFilter}
            onChange={(e) => setTrustedFilter(e.target.value as any)}
            className="w-full sm:w-auto px-4 py-2 bg-white/10 text-white rounded-lg"
          >
            <option value="all" className="text-black">
              Trusted?
            </option>
            <option value="yes" className="text-black">
              Yes
            </option>
            <option value="no" className="text-black">
              No
            </option>
          </select>
        </div>
        <div className="bg-[rgba(255,255,255,0.05)] backdrop-blur-lg rounded-2xl overflow-hidden shadow-inner">
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto text-white">
              <thead className="sticky top-0 bg-[rgba(90,165,255,0.18)] border-b border-white/15">
                <tr>
                  <th className="px-4 py-4 text-left">Name</th>
                  <th className="px-4 py-4 text-left">Team</th>
                  <th className="px-4 py-4 text-left">Age Group</th>
                  <th className="px-4 py-4 text-left">Positions</th>
                  <th className="px-4 py-4 text-left">College</th>
                  <th className="px-4 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-10 text-center text-white/60"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : paginated.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-10 text-center text-white/60"
                    >
                      No players found.
                    </td>
                  </tr>
                ) : (
                  paginated.map((p) => (
                    <React.Fragment key={p.id}>
                      <tr
                        onClick={() =>
                          setExpanded(expanded === p.id ? null : p.id)
                        }
                        className="hover:bg-[rgba(255,255,255,0.07)] cursor-pointer"
                      >
                        <td className="px-4 py-3">{p.name}</td>
                        <td className="px-4 py-3">{p.team}</td>
                        <td className="px-4 py-3">{p.ageGroup}</td>
                        <td className="px-4 py-3">
                          {p.pos1} / {p.pos2}
                        </td>
                        <td className="px-4 py-3">{p.college}</td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEdit(p);
                            }}
                            className="p-2 bg-white/10 rounded-lg hover:bg-[#5AA5FF]"
                          >
                            <PencilSquareIcon className="w-5 h-5 text-white" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openDelete(p);
                            }}
                            className="p-2 bg-white/10 rounded-lg hover:bg-red-600"
                          >
                            <TrashIcon className="w-5 h-5 text-white" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpanded(expanded === p.id ? null : p.id);
                            }}
                            className={`p-2 rounded-lg transition ${expanded === p.id ? 'bg-[#5AA5FF] text-white' : 'bg-white/10 hover:bg-[#5AA5FF]/70 text-white'}`}
                          >
                            <EyeIcon className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                      {expanded === p.id && (
                        <tr>
                          <td colSpan={6} className="p-0 bg-transparent">
                            <div className="bg-[rgba(90,165,255,0.10)] rounded-b-xl m-2 p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-sm text-white">
                              <div>
                                <div>
                                  <span className="font-semibold">
                                    Jersey #:
                                  </span>{' '}
                                  {p.jerseyNum}
                                </div>
                                <div>
                                  <span className="font-semibold">
                                    Jersey Size:
                                  </span>{' '}
                                  {p.jerseySize}
                                </div>
                                <div>
                                  <span className="font-semibold">
                                    Pant Size:
                                  </span>{' '}
                                  {p.pantSize}
                                </div>
                                <div>
                                  <span className="font-semibold">
                                    Stirrup Size:
                                  </span>{' '}
                                  {p.stirrupSize}
                                </div>
                              </div>
                              <div>
                                <div>
                                  <span className="font-semibold">
                                    Shorts Size:
                                  </span>{' '}
                                  {p.shortSize}
                                </div>
                                <div>
                                  <span className="font-semibold">
                                    Practice Shorts:
                                  </span>{' '}
                                  {p.practiceShortSize}
                                </div>
                                <div>
                                  <span className="font-semibold">
                                    Graduation:
                                  </span>{' '}
                                  {p.gradYear}
                                </div>
                                <div>
                                  <span className="font-semibold">
                                    Address:
                                  </span>{' '}
                                  {p.address1}, {p.city}, {p.state} {p.zip}
                                </div>
                              </div>
                              <div>
                                <div>
                                  <span className="font-semibold">
                                    Trusted:
                                  </span>{' '}
                                  <span
                                    className={`ml-1 inline-block px-2 py-0.5 rounded-full text-xs ${p.isTrusted ? 'bg-green-200 text-green-700' : 'bg-red-200 text-red-700'}`}
                                  >
                                    {p.isTrusted ? 'YES' : 'NO'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="flex justify-center items-center mt-4 mb-2 space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 rounded bg-[#5AA5FF] text-white disabled:bg-[#5AA5FF]/40"
            >
              Prev
            </button>
            <span className="text-white/80">
              Page {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => (p < totalPages ? p + 1 : p))}
              disabled={page === totalPages}
              className="px-3 py-1 rounded bg-[#5AA5FF] text-white disabled:bg-[#5AA5FF]/40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
      <SideDialog
        open={dialogOpen}
        onClose={closeDialog}
        title={dialogType === 'edit' ? 'Edit Player' : 'Remove Player'}
      >
        {dialogType === 'edit' && selectedPlayer && (
          <>
            <div className="flex space-x-4 mb-6">
              {(['General', 'Gear', 'Contact'] as TabKey[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={
                    tab === t
                      ? 'border-b-2 border-blue-400 text-blue-400 font-semibold px-4 py-2'
                      : 'text-white hover:text-gray-200 px-4 py-2'
                  }
                >
                  {t}
                </button>
              ))}
            </div>
            <EditForm player={selectedPlayer} />
          </>
        )}
        {dialogType === 'delete' && selectedPlayer && (
          <div className="space-y-4">
            <p className="text-white">
              Are you sure you want to remove <b>{selectedPlayer.name}</b>?
            </p>
            <div className="flex space-x-4 mt-6">
              <button
                onClick={closeDialog}
                className="flex-1 px-4 py-2 bg-[#5AA5FF] text-white rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const ok = await deletePlayer(selectedPlayer.id);
                  if (ok) {
                    setPlayers((ps) =>
                      ps.filter((p) => p.id !== selectedPlayer.id)
                    );
                    closeDialog();
                  }
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg"
              >
                Confirm
              </button>
            </div>
          </div>
        )}
      </SideDialog>
    </div>
  );
}
