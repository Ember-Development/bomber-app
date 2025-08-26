import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowDownTrayIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  ArrowsUpDownIcon,
} from '@heroicons/react/24/outline';

import { useToast } from '@/context/ToastProvider';
import SideDialog from '@/components/SideDialog';
import { exportCSV, exportXLS } from '@/utils/exporter';

import {
  fetchPortalLeads,
  createPortalLead,
  type PortalLeadFE,
  type CreateLeadInput,
  type LeadKind,
  type AgeGroup,
  type Position,
} from '@/api/portal';

const AGE_GROUPS: AgeGroup[] = [
  'U8',
  'U10',
  'U12',
  'U14',
  'U16',
  'U18',
  'ALUMNI',
];
const KINDS: LeadKind[] = ['PLAYER', 'PARENT'];

type SortKey =
  | 'createdAt'
  | 'kind'
  | 'player'
  | 'ageGroup'
  | 'pos'
  | 'gradYear'
  | 'parent'
  | 'contact'
  | 'converted';

export default function Portal() {
  const { pushToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState<PortalLeadFE[]>([]);

  // filters
  const [search, setSearch] = useState('');
  const [kind, setKind] = useState<LeadKind | ''>('');
  const [ageGroup, setAgeGroup] = useState<AgeGroup | ''>('');

  // sorting
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // create modal
  const [openCreate, setOpenCreate] = useState(false);
  const [createForm, setCreateForm] = useState<Partial<CreateLeadInput>>({
    kind: 'PLAYER',
    ageGroup: 'U14',
  });

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await fetchPortalLeads();
        setLeads(data);
      } catch (e: any) {
        pushToast({
          title: 'Failed to load leads',
          description: e?.message ?? 'Unknown error',
          variant: 'error',
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [pushToast]);

  // filter
  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return leads.filter((l) => {
      if (kind && l.kind !== kind) return false;
      if (ageGroup && l.ageGroup !== ageGroup) return false;
      if (!s) return true;
      const hay = [
        l.playerFirstName,
        l.playerLastName,
        l.parentFirstName,
        l.parentLastName,
        l.email,
        l.phone,
        l.parentEmail,
        l.parentPhone,
        l.gradYear,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(s);
    });
  }, [leads, search, kind, ageGroup]);

  // sort
  const sorted = useMemo(() => {
    const copy = [...filtered];
    const get = (r: PortalLeadFE): string => {
      switch (sortKey) {
        case 'createdAt':
          return r.createdAt;
        case 'kind':
          return r.kind;
        case 'player':
          return `${r.playerFirstName} ${r.playerLastName}`;
        case 'ageGroup':
          return r.ageGroup;
        case 'pos':
          return [r.pos1, r.pos2].filter(Boolean).join(', ');
        case 'gradYear':
          return r.gradYear ?? '';
        case 'parent':
          return [r.parentFirstName, r.parentLastName]
            .filter(Boolean)
            .join(' ');
        case 'contact':
          return [r.email, r.phone].filter(Boolean).join(' ');
        case 'converted':
          return r.convertedPlayerId ? 'Y' : 'N';
      }
    };
    copy.sort((a, b) => {
      const A = get(a) || '';
      const B = get(b) || '';
      if (sortKey === 'createdAt') {
        const dA = new Date(A).getTime();
        const dB = new Date(B).getTime();
        return sortDir === 'asc' ? dA - dB : dB - dA;
      }
      if (A < B) return sortDir === 'asc' ? -1 : 1;
      if (A > B) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return copy;
  }, [filtered, sortKey, sortDir]);

  const setSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const onExportCSV = () => {
    exportCSV(
      'bomber-portal-leads',
      [
        'Created',
        'Kind',
        'Player',
        'Age Group',
        'Pos',
        'Grad Year',
        'Parent',
        'Contact',
        'Converted',
      ],
      sorted.map((r) => [
        new Date(r.createdAt).toISOString(),
        r.kind,
        `${r.playerFirstName} ${r.playerLastName}`,
        r.ageGroup,
        [r.pos1, r.pos2].filter(Boolean).join(', '),
        r.gradYear ?? '',
        [r.parentFirstName, r.parentLastName].filter(Boolean).join(' '),
        [r.email, r.phone].filter(Boolean).join(' / '),
        r.convertedPlayerId ? 'Yes' : 'No',
      ])
    );
  };

  const onExportXLS = () => {
    exportXLS(
      'bomber-portal-leads',
      [
        'Created',
        'Kind',
        'Player',
        'Age Group',
        'Pos',
        'Grad Year',
        'Parent',
        'Contact',
        'Converted',
      ],
      sorted.map((r) => ({
        Created: new Date(r.createdAt).toISOString(),
        Kind: r.kind,
        Player: `${r.playerFirstName} ${r.playerLastName}`,
        'Age Group': r.ageGroup,
        Pos: [r.pos1, r.pos2].filter(Boolean).join(', '),
        'Grad Year': r.gradYear ?? '',
        Parent: [r.parentFirstName, r.parentLastName].filter(Boolean).join(' '),
        Contact: [r.email, r.phone].filter(Boolean).join(' / '),
        Converted: r.convertedPlayerId ? 'Yes' : 'No',
      }))
    );
  };

  const handleCreate = async () => {
    try {
      const under14 = ['U8', 'U10', 'U12', 'U14'].includes(
        (createForm.ageGroup ?? 'U14') as string
      );
      const kindVal = (createForm.kind ?? 'PLAYER') as LeadKind;

      if (kindVal === 'PLAYER' && under14) {
        pushToast({
          title: 'Players 14U and under must apply via a parent/guardian.',
          variant: 'warning',
        });
        return;
      }
      if (!createForm.playerFirstName || !createForm.playerLastName) {
        pushToast({
          title: 'Player first & last name required.',
          variant: 'warning',
        });
        return;
      }
      if (
        kindVal === 'PARENT' &&
        !createForm.parentEmail &&
        !createForm.parentPhone
      ) {
        pushToast({
          title: 'Parent email or phone required.',
          variant: 'warning',
        });
        return;
      }
      if (kindVal === 'PLAYER' && !createForm.email && !createForm.phone) {
        pushToast({
          title: 'Contact email or phone required.',
          variant: 'warning',
        });
        return;
      }

      const payload: CreateLeadInput = {
        kind: kindVal,
        playerFirstName: createForm.playerFirstName!.trim(),
        playerLastName: createForm.playerLastName!.trim(),
        ageGroup: (createForm.ageGroup ?? 'U14') as AgeGroup,
        pos1: (createForm.pos1 as Position) || undefined,
        pos2: (createForm.pos2 as Position) || undefined,
        gradYear: createForm.gradYear?.trim() || undefined,
        email:
          kindVal === 'PLAYER'
            ? createForm.email?.trim() || undefined
            : undefined,
        phone:
          kindVal === 'PLAYER'
            ? createForm.phone?.trim() || undefined
            : undefined,
        parentFirstName:
          kindVal === 'PARENT'
            ? createForm.parentFirstName?.trim() || undefined
            : undefined,
        parentLastName:
          kindVal === 'PARENT'
            ? createForm.parentLastName?.trim() || undefined
            : undefined,
        parentEmail:
          kindVal === 'PARENT'
            ? createForm.parentEmail?.trim() || undefined
            : undefined,
        parentPhone:
          kindVal === 'PARENT'
            ? createForm.parentPhone?.trim() || undefined
            : undefined,
      };

      const created = await createPortalLead(payload);
      setLeads((prev) => [created, ...prev]); // optimistic refresh
      pushToast({ title: 'Lead created', variant: 'success' });
      setOpenCreate(false);
      setCreateForm({ kind: 'PLAYER', ageGroup: 'U14' });
    } catch (e: any) {
      pushToast({
        title: 'Failed to create lead',
        description: e?.message ?? 'Unknown error',
        variant: 'error',
      });
    }
  };

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl md:text-2xl font-semibold">Bomber Portal</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setOpenCreate(true)}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition"
          >
            <PlusIcon className="w-4 h-4" />
            New Lead
          </button>

          <div className="relative group">
            <button className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition">
              <ArrowDownTrayIcon className="w-4 h-4" />
              Export
              <ChevronDownIcon className="w-4 h-4" />
            </button>
            <div className="hidden group-hover:block absolute right-0 mt-2 w-40 rounded-lg bg-white/10 backdrop-blur p-1 shadow-lg">
              <button
                onClick={onExportCSV}
                className="w-full text-left px-3 py-2 rounded hover:bg-white/20"
              >
                CSV
              </button>
              <button
                onClick={onExportXLS}
                className="w-full text-left px-3 py-2 rounded hover:bg-white/20"
              >
                Excel
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10">
          <MagnifyingGlassIcon className="w-4 h-4" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name/email/phone…"
            className="bg-transparent outline-none flex-1"
          />
        </div>
        <select
          value={kind}
          onChange={(e) => setKind((e.target.value || '') as LeadKind | '')}
          className="px-3 py-2 rounded-lg bg-white/10"
        >
          <option value="">All Lead Kinds</option>
          {KINDS.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
        <select
          value={ageGroup}
          onChange={(e) => setAgeGroup((e.target.value || '') as AgeGroup | '')}
          className="px-3 py-2 rounded-lg bg-white/10"
        >
          <option value="">All Age Groups</option>
          {AGE_GROUPS.map((ag) => (
            <option key={ag} value={ag}>
              {ag}
            </option>
          ))}
        </select>
        <div />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="min-w-[1000px] w-full text-sm">
          <thead className="bg-white/10">
            <tr>
              {[
                ['Created', 'createdAt'],
                ['Kind', 'kind'],
                ['Player', 'player'],
                ['Age Group', 'ageGroup'],
                ['Pos', 'pos'],
                ['Grad', 'gradYear'],
                ['Parent', 'parent'],
                ['Contact', 'contact'],
                ['Converted', 'converted'],
              ].map(([label, key]) => (
                <th key={key} className="text-left px-3 py-2 font-medium">
                  <button
                    onClick={() => setSort(key as SortKey)}
                    className="inline-flex items-center gap-1 hover:opacity-80"
                    title="Sort"
                  >
                    {label}
                    <ArrowsUpDownIcon className="w-3.5 h-3.5 opacity-60" />
                    {sortKey === key && (
                      <span className="text-xs opacity-60">
                        {sortDir === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={9} className="px-3 py-6 text-center">
                  Loading…
                </td>
              </tr>
            )}
            {!loading && sorted.length === 0 && (
              <tr>
                <td colSpan={9} className="px-3 py-6 text-center opacity-70">
                  No leads found.
                </td>
              </tr>
            )}
            {sorted.map((r) => (
              <tr
                key={r.id}
                className="border-t border-white/5 hover:bg-white/5"
              >
                <td className="px-3 py-2">
                  {new Date(r.createdAt).toLocaleString()}
                </td>
                <td className="px-3 py-2">{r.kind}</td>
                <td className="px-3 py-2">
                  {r.playerFirstName} {r.playerLastName}
                </td>
                <td className="px-3 py-2">{r.ageGroup}</td>
                <td className="px-3 py-2">
                  {[r.pos1, r.pos2].filter(Boolean).join(', ')}
                </td>
                <td className="px-3 py-2">{r.gradYear ?? ''}</td>
                <td className="px-3 py-2">
                  {[r.parentFirstName, r.parentLastName]
                    .filter(Boolean)
                    .join(' ')}
                </td>
                <td className="px-3 py-2">
                  {[r.email, r.phone].filter(Boolean).join(' · ') ||
                    [r.parentEmail, r.parentPhone].filter(Boolean).join(' · ')}
                </td>
                <td className="px-3 py-2">
                  {r.convertedPlayerId ? 'Yes' : 'No'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Lead Modal */}
      <SideDialog
        title="Create Portal Lead"
        open={openCreate}
        onClose={() => setOpenCreate(false)}
      >
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <label className="text-sm opacity-80">Lead Kind</label>
            <select
              className="px-2 py-1 rounded bg-white/10"
              value={createForm.kind ?? 'PLAYER'}
              onChange={(e) =>
                setCreateForm((s) => ({
                  ...s,
                  kind: e.target.value as LeadKind,
                }))
              }
            >
              {KINDS.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>

            <label className="text-sm opacity-80">Age Group</label>
            <select
              className="px-2 py-1 rounded bg-white/10"
              value={createForm.ageGroup ?? 'U14'}
              onChange={(e) =>
                setCreateForm((s) => ({
                  ...s,
                  ageGroup: e.target.value as AgeGroup,
                }))
              }
            >
              {AGE_GROUPS.map((ag) => (
                <option key={ag} value={ag}>
                  {ag}
                </option>
              ))}
            </select>

            <label className="text-sm opacity-80">Player First Name</label>
            <input
              className="px-2 py-1 rounded bg-white/10"
              value={createForm.playerFirstName ?? ''}
              onChange={(e) =>
                setCreateForm((s) => ({
                  ...s,
                  playerFirstName: e.target.value,
                }))
              }
            />

            <label className="text-sm opacity-80">Player Last Name</label>
            <input
              className="px-2 py-1 rounded bg-white/10"
              value={createForm.playerLastName ?? ''}
              onChange={(e) =>
                setCreateForm((s) => ({ ...s, playerLastName: e.target.value }))
              }
            />

            <label className="text-sm opacity-80">Pos 1</label>
            <input
              className="px-2 py-1 rounded bg-white/10"
              value={createForm.pos1 ?? ''}
              onChange={(e) =>
                setCreateForm((s) => ({
                  ...s,
                  pos1: e.target.value as Position,
                }))
              }
              placeholder="e.g., PITCHER"
            />

            <label className="text-sm opacity-80">Pos 2</label>
            <input
              className="px-2 py-1 rounded bg-white/10"
              value={createForm.pos2 ?? ''}
              onChange={(e) =>
                setCreateForm((s) => ({
                  ...s,
                  pos2: e.target.value as Position,
                }))
              }
              placeholder="optional"
            />

            <label className="text-sm opacity-80">Grad Year</label>
            <input
              className="px-2 py-1 rounded bg-white/10"
              value={createForm.gradYear ?? ''}
              onChange={(e) =>
                setCreateForm((s) => ({ ...s, gradYear: e.target.value }))
              }
              placeholder="20xx"
            />

            {(createForm.kind ?? 'PLAYER') === 'PLAYER' ? (
              <>
                <label className="text-sm opacity-80">Email</label>
                <input
                  className="px-2 py-1 rounded bg-white/10"
                  value={createForm.email ?? ''}
                  onChange={(e) =>
                    setCreateForm((s) => ({ ...s, email: e.target.value }))
                  }
                />
                <label className="text-sm opacity-80">Phone</label>
                <input
                  className="px-2 py-1 rounded bg-white/10"
                  value={createForm.phone ?? ''}
                  onChange={(e) =>
                    setCreateForm((s) => ({ ...s, phone: e.target.value }))
                  }
                />
              </>
            ) : (
              <>
                <label className="text-sm opacity-80">Parent First Name</label>
                <input
                  className="px-2 py-1 rounded bg-white/10"
                  value={createForm.parentFirstName ?? ''}
                  onChange={(e) =>
                    setCreateForm((s) => ({
                      ...s,
                      parentFirstName: e.target.value,
                    }))
                  }
                />
                <label className="text-sm opacity-80">Parent Last Name</label>
                <input
                  className="px-2 py-1 rounded bg-white/10"
                  value={createForm.parentLastName ?? ''}
                  onChange={(e) =>
                    setCreateForm((s) => ({
                      ...s,
                      parentLastName: e.target.value,
                    }))
                  }
                />
                <label className="text-sm opacity-80">Parent Email</label>
                <input
                  className="px-2 py-1 rounded bg-white/10"
                  value={createForm.parentEmail ?? ''}
                  onChange={(e) =>
                    setCreateForm((s) => ({
                      ...s,
                      parentEmail: e.target.value,
                    }))
                  }
                />
                <label className="text-sm opacity-80">Parent Phone</label>
                <input
                  className="px-2 py-1 rounded bg-white/10"
                  value={createForm.parentPhone ?? ''}
                  onChange={(e) =>
                    setCreateForm((s) => ({
                      ...s,
                      parentPhone: e.target.value,
                    }))
                  }
                />
              </>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setOpenCreate(false)}
              className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              className="px-3 py-2 rounded-lg bg-white/20 hover:bg-white/30"
            >
              Create
            </button>
          </div>
        </div>
      </SideDialog>
    </div>
  );
}
