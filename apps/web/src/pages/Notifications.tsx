// src/pages/Notifications.tsx
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PaperAirplaneIcon,
  TrashIcon,
  PencilSquareIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { ScrollArea } from '@/components/ui/scroll-area';
import SideDialog from '@/components/SideDialog';
import {
  fetchBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  BannerFE,
} from '@/api/banner';
import {
  createNotification,
  sendNotificationNow,
  fetchNotificationFeed,
  updateNotification,
  fetchDrafts,
  deleteNotification,
  type Audience,
  type FeedItem,
  type NotificationFE,
  type TargetPlatform,
} from '@/api/notification';

// 🔽 bring users & teams + enums for filtering
import { fetchUsers } from '@/api/user';
import { fetchTeams } from '@/api/team';
import type { PublicUserFE, TeamFE } from '@bomber-app/database';

import { useToast } from '@/context/ToastProvider';
import { Regions, UserRole } from '@bomber-app/database/generated/client';

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const ALL_ROLES: UserRole[] = [
  'ADMIN',
  'COACH',
  'REGIONAL_COACH',
  'PLAYER',
  'PARENT',
  'FAN',
];

const REGION_OPTIONS: Regions[] = [
  'ACADEMY',
  'PACIFIC',
  'MOUNTAIN',
  'MIDWEST',
  'NORTHEAST',
  'SOUTHEAST',
  'TEXAS',
  'SOUTHWEST',
];

function normalize(str: string) {
  return (str || '').toLowerCase();
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export default function Notifications() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [tab, setTab] = useState<'Notifications' | 'Banners'>('Notifications');

  // --- Create Notification form ---
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [deepLink, setDeepLink] = useState('');
  const [platform, setPlatform] = useState<TargetPlatform>('both');

  // 🔽 Audience UI state (frontend filters)
  const [audAll, setAudAll] = useState(true);

  const [allUsers, setAllUsers] = useState<PublicUserFE[]>([]);
  const [allTeams, setAllTeams] = useState<TeamFE[]>([]);
  const [loadingPeople, setLoadingPeople] = useState(false);

  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<Regions | ''>('');
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([]);
  const [userSearch, setUserSearch] = useState('');

  // the “authoritative” selection that becomes audience.userIds
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  // keep your original textarea too (stays in sync with checkboxes)
  const [audUserIdsRaw, setAudUserIdsRaw] = useState('');

  // Local drafts (what the server returns after create)
  const [drafts, setDrafts] = useState<NotificationFE[]>([]);

  // Feed (recent sent)
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [loadingFeed, setLoadingFeed] = useState(false);

  // --- Banners ---
  const [banners, setBanners] = useState<BannerFE[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newLink, setNewLink] = useState('');
  const [newDuration, setNewDuration] = useState(1);
  const [newExpiresAt, setNewExpiresAt] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'edit' | 'delete' | null>(null);
  const [selectedBanner, setSelectedBanner] = useState<BannerFE | null>(null);
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editDuration, setEditDuration] = useState(1);
  const [editExpiresAt, setEditExpiresAt] = useState('');

  // --- Edit Mode (reuses main form) ---
  const [editingNotifId, setEditingNotifId] = useState<string | null>(null);

  /* ----------------------------- bootstrap ---------------------------- */

  // load banners + feed + drafts
  useEffect(() => {
    fetchBanners()
      .then(setBanners)
      .catch((e) => {
        console.error(e);
        addToast('Failed to load banners', 'error');
      });

    fetchDrafts()
      .then(setDrafts)
      .catch((e) => {
        console.error(e);
        addToast('Failed to load drafts', 'error');
      });

    loadFeed();

    // load people/teams for audience filtering
    (async () => {
      try {
        setLoadingPeople(true);
        const [users, teams] = await Promise.all([fetchUsers(), fetchTeams()]);
        setAllUsers(users ?? []);
        setAllTeams(teams ?? []);
      } catch (e) {
        console.error(e);
        addToast('Failed to load users/teams', 'error');
      } finally {
        setLoadingPeople(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadFeed() {
    try {
      setLoadingFeed(true);
      const items = await fetchNotificationFeed();
      items.sort(
        (a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
      );
      setFeed(items);
    } catch (e: any) {
      console.error(e);
      addToast('Failed to load notification feed', 'error');
    } finally {
      setLoadingFeed(false);
    }
  }

  /* ---------------------- audience derived selections ---------------------- */

  // Build fast lookup of user IDs per team (players + coaches + head coach).
  // TeamFE from your API typically contains arrays with user IDs; if any field is different in your actual type,
  // adjust the accessors below (we avoid schema changes here).
  const teamIdToUserIds = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const t of allTeams) {
      const set = new Set<string>();
      // collect player userIDs
      (t.players || []).forEach((p: any) => {
        if (p?.userID) set.add(p.userID);
      });
      // coaches
      (t.coaches || []).forEach((c: any) => {
        if (c?.userID) set.add(c.userID);
      });
      // headCoach
      const head = (t as any).headCoachUserID || (t as any).headCoach?.userID;
      if (head) set.add(head);
      map.set(t.id, set);
    }
    return map;
  }, [allTeams]);

  // teams filtered by region
  const filteredTeams = useMemo(() => {
    if (!selectedRegion) return allTeams;
    return allTeams.filter((t) => t.region === selectedRegion);
  }, [allTeams, selectedRegion]);

  // users matching role/region/teams + search
  const matchingUsers = useMemo(() => {
    let pool = allUsers;

    // roles
    if (selectedRoles.length) {
      const roleSet = new Set(selectedRoles);
      pool = pool.filter((u) => roleSet.has(u.primaryRole as UserRole));
    }

    // region → via team membership if teams are chosen OR
    // if only region chosen, include anyone on teams in that region.
    if (selectedRegion) {
      const regionTeamIds = new Set(
        allTeams.filter((t) => t.region === selectedRegion).map((t) => t.id)
      );

      // if specific teams are chosen, intersect with those
      const teamIds =
        selectedTeamIds.length > 0
          ? new Set(selectedTeamIds.filter((id) => regionTeamIds.has(id)))
          : regionTeamIds;

      if (teamIds.size > 0) {
        const allowedUserIds = new Set<string>();
        for (const tid of teamIds) {
          const ids = teamIdToUserIds.get(tid);
          if (ids) ids.forEach((v) => allowedUserIds.add(v));
        }
        pool = pool.filter((u) => allowedUserIds.has(u.id));
      }
    } else if (selectedTeamIds.length > 0) {
      // no region, but teams selected
      const teamIds = new Set(selectedTeamIds);
      const allowedUserIds = new Set<string>();
      for (const tid of teamIds) {
        const ids = teamIdToUserIds.get(tid);
        if (ids) ids.forEach((v) => allowedUserIds.add(v));
      }
      pool = pool.filter((u) => allowedUserIds.has(u.id));
    }

    // search on name/email
    const q = normalize(userSearch);
    if (q) {
      pool = pool.filter((u) => {
        const name = normalize(`${u.fname ?? ''} ${u.lname ?? ''}`);
        return name.includes(q) || normalize(u.email).includes(q);
      });
    }

    // sort by role then name
    return pool.slice().sort((a, b) => {
      const r = String(a.primaryRole).localeCompare(String(b.primaryRole));
      if (r !== 0) return r;
      const an = `${a.fname ?? ''} ${a.lname ?? ''}`.trim();
      const bn = `${b.fname ?? ''} ${b.lname ?? ''}`.trim();
      return an.localeCompare(bn);
    });
  }, [
    allUsers,
    allTeams,
    selectedRoles,
    selectedRegion,
    selectedTeamIds,
    teamIdToUserIds,
    userSearch,
  ]);

  // keep textarea <-> checkbox list in sync both ways
  useEffect(() => {
    if (audAll) return; // ignore while "All users" is on
    setAudUserIdsRaw(selectedUserIds.join(', '));
  }, [selectedUserIds, audAll]);

  useEffect(() => {
    if (audAll) return;
    const fromRaw = audUserIdsRaw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    // only update if different to avoid loops
    const a = new Set(fromRaw);
    const b = new Set(selectedUserIds);
    let same = a.size === b.size;
    if (same)
      for (const x of a)
        if (!b.has(x)) {
          same = false;
          break;
        }
    if (!same) setSelectedUserIds(fromRaw);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audUserIdsRaw, audAll]);

  const canCreate = useMemo(() => {
    if (!title.trim() || !body.trim()) return false;
    if (!audAll && selectedUserIds.length === 0) return false;
    return true;
  }, [title, body, audAll, selectedUserIds.length]);

  async function onCreate() {
    if (!canCreate) return;
    const audience: Audience = audAll
      ? { all: true }
      : { userIds: selectedUserIds };

    try {
      if (editingNotifId) {
        // Update existing draft
        const updated = await updateNotification(editingNotifId, {
          title: title.trim(),
          body: body.trim(),
          imageUrl: imageUrl.trim() || undefined,
          deepLink: deepLink.trim() || undefined,
          platform,
          audience,
        });

        if (updated) {
          setDrafts((d) => d.map((x) => (x.id === updated.id ? updated : x)));
          addToast('Draft updated', 'success');
        }
        setEditingNotifId(null);
      } else {
        // Create new draft
        const created = await createNotification({
          title: title.trim(),
          body: body.trim(),
          imageUrl: imageUrl.trim() || undefined,
          deepLink: deepLink.trim() || undefined,
          platform,
          audience,
        });

        if (created) {
          setDrafts((d) => [created, ...d]);
          addToast('Draft created', 'success');
        }
      }

      // Reset form (leave filters as-is so you can keep building)
      setTitle('');
      setBody('');
      setImageUrl('');
      setDeepLink('');
      setPlatform('both');
      // keep audAll and selections to continue composing if desired
    } catch (e: any) {
      console.error(e);
      addToast(
        editingNotifId
          ? 'Failed to update notification'
          : 'Failed to create notification',
        'error'
      );
    }
  }

  async function onSendNow(id: string) {
    try {
      await sendNotificationNow(id);
      addToast('Queued to send', 'success');
      setDrafts((d) => d.filter((x) => x.id !== id));
      await loadFeed();
    } catch (e: any) {
      console.error(e);
      addToast('Failed to send notification', 'error');
    }
  }

  function openEditNotification(notif: NotificationFE) {
    setEditingNotifId(notif.id);
    setTitle(notif.title);
    setBody(notif.body);
    setImageUrl(notif.imageUrl || '');
    setDeepLink(notif.deepLink || '');
    setPlatform(notif.platform);
    setAudAll(!!notif.audience.all);
    setSelectedUserIds(notif.audience.userIds || []);
    // Scroll to top so user sees the form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() {
    setEditingNotifId(null);
    setTitle('');
    setBody('');
    setImageUrl('');
    setDeepLink('');
    setPlatform('both');
    setAudAll(true);
    setSelectedUserIds([]);
  }

  async function onDeleteDraft(id: string) {
    if (!confirm('Are you sure you want to delete this draft?')) return;

    try {
      const success = await deleteNotification(id);
      if (success) {
        setDrafts((d) => d.filter((x) => x.id !== id));
        addToast('Draft deleted', 'success');

        // If we're editing the deleted draft, clear the form
        if (editingNotifId === id) {
          cancelEdit();
        }
      }
    } catch (e: any) {
      console.error(e);
      addToast('Failed to delete draft', 'error');
    }
  }

  function onResendNotification(feedItem: FeedItem) {
    // Clear any editing state
    setEditingNotifId(null);

    // Populate form with the sent notification's content
    setTitle(feedItem.title);
    setBody(feedItem.body);
    setImageUrl(feedItem.imageUrl || '');
    setDeepLink(feedItem.deepLink || '');

    // Reset to defaults for audience/platform (user can reconfigure)
    setPlatform('both');
    setAudAll(true);
    setSelectedUserIds([]);

    // Scroll to top so user sees the form
    window.scrollTo({ top: 0, behavior: 'smooth' });

    addToast(
      'Notification content loaded - configure audience and send',
      'success'
    );
  }

  /* --------------------------- banners (unchanged) -------------------------- */

  const formatLocalDateTime = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleDurationChange = (hrs: number) => {
    setNewDuration(hrs);
    const now = new Date();
    now.setHours(now.getHours() + hrs);
    setNewExpiresAt(formatLocalDateTime(now));
  };

  const handleEditDurationChange = (hrs: number) => {
    setEditDuration(hrs);
    const now = new Date();
    now.setHours(now.getHours() + hrs);
    setEditExpiresAt(formatLocalDateTime(now));
  };

  const addBannerClick = async () => {
    if (!newImageUrl || !newExpiresAt) return;

    const created = await createBanner({
      imageUrl: newImageUrl,
      link: newLink || undefined,
      duration: newDuration,
      expiresAt: newExpiresAt,
    });

    if (created) {
      setBanners((b) => [created, ...b]);
      setNewImageUrl('');
      setNewLink('');
      setNewDuration(1);
      setNewExpiresAt('');
      addToast('Banner created', 'success');
    }
  };

  const openEdit = (b: BannerFE) => {
    setSelectedBanner(b);
    setEditImageUrl(b.imageUrl);
    setEditDuration(b.duration);
    setEditExpiresAt(b.expiresAt.slice(0, 16));
    setDialogType('edit');
    setDialogOpen(true);
  };
  const openDelete = (b: BannerFE) => {
    setSelectedBanner(b);
    setDialogType('delete');
    setDialogOpen(true);
  };
  const closeDialog = () => {
    setDialogOpen(false);
    setDialogType(null);
    setSelectedBanner(null);
  };
  const handleUpdate = async () => {
    if (!selectedBanner) return;
    const updated = await updateBanner(selectedBanner.id, {
      imageUrl: editImageUrl,
      duration: editDuration,
      expiresAt: new Date(editExpiresAt).toISOString(),
    });
    if (updated) {
      setBanners((b) => b.map((x) => (x.id === updated.id ? updated : x)));
      addToast('Banner updated', 'success');
    }
    closeDialog();
  };
  const handleDelete = async () => {
    if (!selectedBanner) return;
    const ok = await deleteBanner(selectedBanner.id);
    if (ok) {
      setBanners((b) => b.filter((x) => x.id !== selectedBanner.id));
      addToast('Banner deleted', 'success');
    }
    closeDialog();
  };

  /* ---------------------------------- UI ---------------------------------- */

  const toggleRole = (role: UserRole) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const toggleTeamId = (id: string) => {
    setSelectedTeamIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleUserId = (id: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectAllShownUsers = () => {
    const ids = matchingUsers.map((u) => u.id);
    setSelectedUserIds(ids);
  };
  const clearShownUsers = () => {
    const shown = new Set(matchingUsers.map((u) => u.id));
    setSelectedUserIds((prev) => prev.filter((id) => !shown.has(id)));
  };

  return (
    <div className="flex flex-col text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 -mx-4 px-4 sm:mx-0 sm:px-0 py-2 sm:py-3 border-b border-white/10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => navigate(-1)}
              className="rounded-lg sm:rounded-xl bg-white/10 hover:bg-white/20 p-1.5 sm:p-2 transition"
            >
              <ArrowLeftIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <div className="text-3xl font-extrabold tracking-tight">
              Notifications
            </div>
          </div>

          {/* Segmented tabs */}
          <div className="inline-flex self-start md:self-auto rounded-full border border-white/15 bg-white/10 p-0.5 sm:p-1">
            {(['Notifications', 'Banners'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-1 text-xs sm:px-4 sm:py-1.5 sm:text-sm rounded-full font-semibold transition
                  ${tab === t ? 'bg-[#5AA5FF] text-white shadow' : 'text-white/75 hover:bg-white/10'}
                `}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6">
        <div className="bg-[rgba(255,255,255,0.07)] backdrop-blur-2xl rounded-2xl p-4 sm:p-6 shadow-inner border border-white/10">
          <ScrollArea className="space-y-8">
            {tab === 'Notifications' ? (
              <>
                {/* Create Notification */}
                <div className="space-y-4 mb-8">
                  {editingNotifId && (
                    <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg px-4 py-2 text-sm">
                      <span className="font-semibold">Editing draft</span> -
                      Make your changes below and click "Update draft" to save.
                    </div>
                  )}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {/* Left: Message */}
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-4 py-2 bg-white/10 placeholder-white/70 rounded-lg focus:outline-none"
                      />
                      <textarea
                        placeholder="Body"
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        className="w-full px-4 py-2 bg-white/10 placeholder-white/70 rounded-lg focus:outline-none h-28 resize-vertical"
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                          type="url"
                          placeholder="Image URL (optional)"
                          value={imageUrl}
                          onChange={(e) => setImageUrl(e.target.value)}
                          className="w-full px-4 py-2 bg-white/10 rounded-lg focus:outline-none"
                        />
                        <input
                          type="text"
                          placeholder="Deep link (bomber:// or https://)"
                          value={deepLink}
                          onChange={(e) => setDeepLink(e.target.value)}
                          className="w-full px-4 py-2 bg-white/10 rounded-lg focus:outline-none"
                        />
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <label className="text-sm text-white/70">
                          Platform:
                        </label>
                        {(['both', 'ios', 'android'] as TargetPlatform[]).map(
                          (p) => (
                            <button
                              key={p}
                              onClick={() => setPlatform(p)}
                              className={`px-3 py-1.5 rounded-full text-sm font-semibold transition
                              ${
                                platform === p
                                  ? 'bg-[#5AA5FF] text-white shadow'
                                  : 'bg-white/10 text-white/80 hover:bg-white/20'
                              }`}
                            >
                              {p}
                            </button>
                          )
                        )}
                      </div>

                      <div className="pt-2 flex items-center gap-3">
                        <button
                          onClick={onCreate}
                          disabled={!canCreate}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-[#5AA5FF] disabled:opacity-60 rounded-lg font-semibold hover:bg-[#3C8CE7] transition"
                        >
                          <PaperAirplaneIcon className="w-4 h-4" />
                          {editingNotifId ? 'Update draft' : 'Create draft'}
                        </button>
                        {editingNotifId && (
                          <button
                            onClick={cancelEdit}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-semibold transition"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Right: Audience */}
                    <div className="space-y-4">
                      <div className="font-semibold">Audience</div>

                      <div className="flex items-center gap-2">
                        <input
                          id="aud-all"
                          type="checkbox"
                          checked={audAll}
                          onChange={(e) => setAudAll(e.target.checked)}
                        />
                        <label htmlFor="aud-all" className="text-sm">
                          All users
                        </label>
                      </div>

                      {/* Filters */}
                      <fieldset
                        className={`space-y-3 ${audAll ? 'opacity-50 pointer-events-none' : ''}`}
                      >
                        {/* Roles */}
                        <div className="space-y-2">
                          <div className="text-sm text-white/70">Roles</div>
                          <div className="flex flex-wrap gap-2">
                            {ALL_ROLES.map((r) => (
                              <button
                                key={r}
                                onClick={() => toggleRole(r)}
                                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                                  selectedRoles.includes(r)
                                    ? 'bg-[#5AA5FF] text-white'
                                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                                }`}
                              >
                                {r}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Region */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-sm text-white/70">
                              Region
                            </label>
                            <select
                              value={selectedRegion || ''}
                              onChange={(e) => {
                                const val = e.target.value as Regions | '';
                                setSelectedRegion(val);
                                // when region changes, also clear teams not in region
                                setSelectedTeamIds((prev) =>
                                  prev.filter((id) =>
                                    allTeams.some(
                                      (t) =>
                                        t.id === id &&
                                        (!val || t.region === val)
                                    )
                                  )
                                );
                              }}
                              className="w-full px-3 py-2 rounded-lg bg-white/10"
                            >
                              <option value="">All regions</option>
                              {REGION_OPTIONS.map((r) => (
                                <option key={r} value={r}>
                                  {r}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Teams (filtered by region) */}
                          <div className="space-y-1">
                            <label className="text-sm text-white/70">
                              Teams{' '}
                              {selectedRegion
                                ? `(Region: ${selectedRegion})`
                                : ''}
                            </label>
                            <div className="max-h-40 overflow-auto rounded-lg border border-white/10">
                              {filteredTeams.length === 0 ? (
                                <div className="p-2 text-xs text-white/60">
                                  No teams
                                </div>
                              ) : (
                                filteredTeams.map((t) => (
                                  <label
                                    key={t.id}
                                    className="flex items-center gap-2 px-3 py-1 hover:bg-white/5 cursor-pointer"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={selectedTeamIds.includes(t.id)}
                                      onChange={() => toggleTeamId(t.id)}
                                    />
                                    <span className="text-sm">
                                      {t.name} • {t.ageGroup} • {t.region}
                                    </span>
                                  </label>
                                ))
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Users list + search */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-white/70">
                              Users matching filters ({matchingUsers.length})
                              {loadingPeople && (
                                <span className="ml-2 opacity-70">
                                  Loading…
                                </span>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={selectAllShownUsers}
                                className="px-2 py-1 rounded bg-white/10 text-xs hover:bg-white/20"
                              >
                                Select all shown
                              </button>
                              <button
                                onClick={clearShownUsers}
                                className="px-2 py-1 rounded bg-white/10 text-xs hover:bg-white/20"
                              >
                                Clear shown
                              </button>
                            </div>
                          </div>

                          <input
                            type="text"
                            placeholder="Search users by name or email…"
                            value={userSearch}
                            onChange={(e) => setUserSearch(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-white/10"
                          />

                          <div className="max-h-56 overflow-auto rounded-lg border border-white/10">
                            {matchingUsers.length === 0 ? (
                              <div className="p-3 text-xs text-white/60">
                                No users match.
                              </div>
                            ) : (
                              matchingUsers.map((u) => {
                                const full =
                                  `${u.fname ?? ''} ${u.lname ?? ''}`.trim() ||
                                  u.email;
                                const checked = selectedUserIds.includes(u.id);
                                return (
                                  <label
                                    key={u.id}
                                    className="flex items-center gap-2 px-3 py-1 hover:bg-white/5 cursor-pointer"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={() => toggleUserId(u.id)}
                                    />
                                    <div className="text-sm">
                                      <div className="font-medium">{full}</div>
                                      <div className="text-xs text-white/60">
                                        {u.email} • {u.primaryRole}
                                      </div>
                                    </div>
                                  </label>
                                );
                              })
                            )}
                          </div>
                        </div>

                        {/* Keep your original textarea for manual paste/edit; stays in sync */}
                        <div className="space-y-1">
                          <label className="text-xs text-white/70">
                            User IDs (comma separated)
                          </label>
                          <textarea
                            placeholder="uuid-1, uuid-2, ..."
                            value={audUserIdsRaw}
                            onChange={(e) => setAudUserIdsRaw(e.target.value)}
                            className="w-full px-4 py-2 bg-white/10 rounded-lg focus:outline-none h-20"
                          />
                        </div>
                      </fieldset>
                    </div>
                  </div>
                </div>

                {/* Drafts (created this session) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Drafts</h3>
                    <button
                      onClick={loadFeed}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20"
                    >
                      <ArrowPathIcon className="w-4 h-4" />
                      Refresh feed
                    </button>
                  </div>

                  {drafts.length === 0 ? (
                    <div className="text-white/70 text-sm">
                      No drafts created yet.
                    </div>
                  ) : (
                    drafts.map((d) => (
                      <div
                        key={d.id}
                        className="rounded-xl border border-white/10 bg-white/5 p-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-base font-semibold truncate">
                              {d.title}
                            </div>
                            <div className="text-xs text-white/60">
                              Status: {d.status}
                            </div>
                            <div className="text-xs text-white/60">
                              Platform: {d.platform}
                            </div>
                            {!d.audience.all && d.audience.userIds?.length ? (
                              <div className="text-xs text-white/60">
                                Users: {d.audience.userIds.length}
                              </div>
                            ) : (
                              <div className="text-xs text-white/60">
                                Audience: all
                              </div>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => openEditNotification(d)}
                              className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-semibold"
                            >
                              <PencilSquareIcon className="w-4 h-4" />
                              Edit
                            </button>
                            <button
                              onClick={() => onDeleteDraft(d.id)}
                              className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-500/90 hover:bg-red-500 rounded-lg text-sm font-semibold"
                            >
                              <TrashIcon className="w-4 h-4" />
                              Delete
                            </button>
                            <button
                              onClick={() => onSendNow(d.id)}
                              className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/90 hover:bg-emerald-500 rounded-lg text-sm font-semibold"
                            >
                              <PaperAirplaneIcon className="w-4 h-4 rotate-90" />
                              Send now
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Recently Sent (feed) */}
                <div className="space-y-3 mt-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Recently sent</h3>
                    <button
                      onClick={loadFeed}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20"
                    >
                      <ArrowPathIcon className="w-4 h-4" />
                      Refresh
                    </button>
                  </div>

                  {loadingFeed ? (
                    <div className="text-white/70 text-sm">Loading…</div>
                  ) : feed.length === 0 ? (
                    <div className="text-white/70 text-sm">
                      No sent notifications yet.
                    </div>
                  ) : (
                    feed.map((n) => (
                      <div
                        key={n.id}
                        className="rounded-xl border border-white/10 bg-white/5 p-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="text-base font-semibold truncate">
                              {n.title}
                            </div>
                            <div className="text-xs text-white/60">
                              {new Date(n.sentAt).toLocaleString()}
                            </div>
                            <p className="mt-2 text-sm text-white/85">
                              {n.body}
                            </p>
                          </div>
                          <div className="flex gap-2 self-end sm:self-start">
                            <button
                              onClick={() => onResendNotification(n)}
                              className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#5AA5FF] hover:bg-[#3C8CE7] rounded-lg text-sm font-semibold transition"
                              title="Resend this notification"
                            >
                              <ArrowPathIcon className="w-4 h-4" />
                              Resend
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : (
              <>
                {/* ---------------------- BANNERS (unchanged) ---------------------- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-white/70 mb-1">
                        Banner Image URL
                      </label>
                      <input
                        type="url"
                        placeholder="https://cdn.example.com/banner.jpg"
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white/10 text-white placeholder-white/70 focus:outline-none text-sm sm:text-base"
                      />
                      <p className="text-xs text-white/50 mt-1">
                        Upload your image to a CDN and paste the URL here
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-white/70 mb-1">
                        Link (Optional)
                      </label>
                      <input
                        type="url"
                        placeholder="https://example.com or bomber://team/123"
                        value={newLink}
                        onChange={(e) => setNewLink(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white/10 text-white placeholder-white/70 focus:outline-none text-sm sm:text-base"
                      />
                      <p className="text-xs text-white/50 mt-1">
                        If provided, banner becomes clickable (deep link or URL)
                      </p>
                    </div>

                    {newImageUrl && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setPreviewUrl(newImageUrl)}
                          className="px-3 py-1.5 sm:px-4 sm:py-2 bg-black/60 hover:bg-black/80 rounded-lg text-sm"
                        >
                          Preview
                        </button>
                      </div>
                    )}

                    <div>
                      <div className="mb-1 text-xs sm:text-sm font-medium text-white/70">
                        Duration
                      </div>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {[1, 6, 12, 24].map((hrs) => (
                          <button
                            key={hrs}
                            onClick={() => handleDurationChange(hrs)}
                            className={`px-2.5 py-1 text-xs sm:px-3 sm:py-1.5 sm:text-sm rounded-full font-semibold transition
                              ${
                                newDuration === hrs
                                  ? 'bg-[#5AA5FF] text-white shadow'
                                  : 'bg-white/10 text-white/75 hover:bg-[#5AA5FF]/30'
                              }`}
                          >
                            {hrs} hr
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-white/70 mb-1">
                        Expires At
                      </label>
                      <input
                        type="datetime-local"
                        value={newExpiresAt}
                        onChange={(e) => setNewExpiresAt(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white/10 text-white focus:outline-none text-sm sm:text-base"
                      />
                    </div>

                    <button
                      onClick={addBannerClick}
                      className="w-full md:w-auto px-3 py-2 sm:px-4 sm:py-2 bg-[#5AA5FF] rounded-lg hover:bg-[#3C8CE7] transition font-semibold text-sm sm:text-base"
                    >
                      Create Banner
                    </button>
                  </div>

                  {/* Live preview card */}
                  <div className="hidden md:block">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-3 sm:p-4">
                      <div className="aspect-video w-full overflow-hidden rounded-xl bg-black/40">
                        {newImageUrl ? (
                          <img
                            src={newImageUrl}
                            alt="Preview"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-white/40 text-sm">
                            Banner preview
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* List Banners */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                  {banners.length === 0 ? (
                    <div className="col-span-full text-center text-white/70 py-10">
                      No banners
                    </div>
                  ) : (
                    banners.map((b) => (
                      <div
                        key={b.id}
                        className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition"
                      >
                        <img
                          src={b.imageUrl}
                          alt=""
                          className="w-full aspect-video object-cover"
                        />
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                          <button
                            onClick={() => openEdit(b)}
                            className="rounded bg-black/60 p-1.5 hover:bg-black/80"
                          >
                            <PencilSquareIcon className="w-4 h-4 text-white" />
                          </button>
                          <button
                            onClick={() => openDelete(b)}
                            className="rounded bg-black/60 p-1.5 hover:bg-black/80"
                          >
                            <TrashIcon className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}

                  {previewUrl && (
                    <div
                      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
                      onClick={() => setPreviewUrl(null)}
                    >
                      <div
                        className="relative bg-white rounded-2xl overflow-hidden max-w-md w-full"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <img
                          src={previewUrl}
                          alt="Banner Preview"
                          className="w-full h-auto object-cover"
                        />
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                          <button
                            onClick={() => {}}
                            className="w-full text-center bg-white text-black py-2 rounded-full"
                          >
                            Read More
                          </button>
                        </div>
                        <button
                          onClick={() => setPreviewUrl(null)}
                          className="absolute top-2 right-2 text-white bg-black/60 hover:bg-black/80 p-1 rounded-full"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </ScrollArea>
        </div>
      </div>

      {/* Edit/Delete SideDialog for Banners */}
      <SideDialog
        open={dialogOpen}
        onClose={closeDialog}
        title={dialogType === 'edit' ? 'Edit Banner' : 'Delete Banner'}
      >
        {dialogType === 'edit' && selectedBanner && (
          <div className="space-y-4">
            <label className="block text-sm text-white font-semibold">
              Image URL
            </label>
            <input
              type="text"
              value={editImageUrl}
              onChange={(e) => setEditImageUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/10 text-white"
            />

            <label className="block text-sm text-white font-semibold">
              Duration
            </label>
            <div className="flex flex-wrap gap-2">
              {[1, 6, 12, 24].map((hrs) => (
                <button
                  key={hrs}
                  onClick={() => handleEditDurationChange(hrs)}
                  className={`px-3 py-1.5 text-sm rounded-full font-semibold transition
                    ${
                      editDuration === hrs
                        ? 'bg-[#5AA5FF] text-white shadow'
                        : 'bg-white/10 text-white/75 hover:bg-[#5AA5FF]/30'
                    }`}
                >
                  {hrs} hr
                </button>
              ))}
            </div>

            <label className="block text-sm text-white font-semibold">
              Expires At
            </label>
            <input
              type="datetime-local"
              value={editExpiresAt}
              onChange={(e) => setEditExpiresAt(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/10 text-white"
            />

            <div className="flex flex-col sm:flex-row sm:space-x-4 mt-6">
              <button
                onClick={handleUpdate}
                className="flex-1 px-3 py-2 sm:px-4 sm:py-2 bg-[#5AA5FF] rounded-lg text-white"
              >
                Save
              </button>
              <button
                onClick={closeDialog}
                className="flex-1 mt-2 sm:mt-0 px-4 py-2 bg-white/10 rounded-lg text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        {dialogType === 'delete' && selectedBanner && (
          <div className="space-y-4">
            <p className="text-white">
              Are you sure you want to delete this banner?
            </p>
            <div className="flex flex-col sm:flex-row sm:space-x-4 mt-6">
              <button
                onClick={closeDialog}
                className="flex-1 px-4 py-2 bg-white/10 rounded-lg text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 mt-2 sm:mt-0 px-3 py-2 sm:px-4 sm:py-2 bg-red-600 rounded-lg text-white"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </SideDialog>
    </div>
  );
}
