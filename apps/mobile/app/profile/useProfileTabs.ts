import { useMemo, useState } from 'react';
import { useNormalizedUser } from '@/utils/user';
import { usePlayerById, useDeletePlayer } from '@/hooks/teams/usePlayerById';
import { useCoachById, useDeleteCoach } from '@/hooks/teams/useCoach';
import { useTeams } from '@/hooks/teams/useTeams';

export type ProfileTab = 'info' | 'contact' | 'gear' | 'region' | 'players';
export type ProfileView = 'roster' | 'staff' | 'trophies';

export function useProfileTabs() {
  const { user, primaryRole } = useNormalizedUser();
  const isCoach = primaryRole === 'COACH';
  const isFan = primaryRole === 'FAN';
  const isRegionalCoach = primaryRole === 'REGIONAL_COACH';
  const hasParentRecord = !!user?.parent && user.parent.children.length > 0;
  const isParentView = primaryRole === 'PARENT' || hasParentRecord;
  const isAlsoCoach = !!user?.coach?.teams?.length;

  const [activeTab, setActiveTab] = useState<ProfileTab>(
    isFan ? 'contact' : isCoach ? 'contact' : 'info'
  );
  const [view, setView] = useState<ProfileView>('roster');
  const [editPlayerId, setEditPlayerId] = useState<string | null>(null);
  const [removePlayerId, setRemovePlayerId] = useState<string | null>(null);
  const [editCoachId, setEditCoachId] = useState<string | null>(null);
  const [removeCoachId, setRemoveCoachId] = useState<string | null>(null);
  const [editTrophy, setEditTrophy] = useState<{
    teamId: string;
    trophy: any;
  } | null>(null);
  const [removeTrophy, setRemoveTrophy] = useState<{
    teamId: string;
    trophy: any;
  } | null>(null);
  const [selectedRegionTeamId, setSelectedRegionTeamId] = useState<
    string | null
  >(null);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);

  const { data: selectedPlayer } = usePlayerById(editPlayerId ?? '');
  const { data: selectedPlayerToRemove } = usePlayerById(removePlayerId ?? '');
  const { data: selectedCoach } = useCoachById(editCoachId ?? '');
  const { data: selectedCoachToRemove } = useCoachById(removeCoachId ?? '');
  const { data: allTeams = [] } = useTeams();

  const regionTeams = useMemo(() => {
    if (!user?.regCoach?.region) return [];
    return allTeams.filter((t) => t.region === user?.regCoach?.region);
  }, [allTeams, user?.regCoach?.region]);

  const { mutate: deletePlayer } = useDeletePlayer({
    onSuccess: () => setRemovePlayerId(null),
  });
  const { mutate: deleteCoach } = useDeleteCoach({
    onSuccess: () => setRemoveCoachId(null),
  });

  return {
    user,
    primaryRole,
    isCoach,
    isFan,
    isRegionalCoach,
    hasParentRecord,
    isParentView,
    isAlsoCoach,

    activeTab,
    setActiveTab,
    view,
    setView,

    editPlayerId,
    setEditPlayerId,
    removePlayerId,
    setRemovePlayerId,

    editCoachId,
    setEditCoachId,
    removeCoachId,
    setRemoveCoachId,

    editTrophy,
    setEditTrophy,
    removeTrophy,
    setRemoveTrophy,

    selectedRegionTeamId,
    setSelectedRegionTeamId,

    selectedProfile,
    setSelectedProfile,

    selectedPlayer,
    selectedPlayerToRemove,
    selectedCoach,
    selectedCoachToRemove,
    regionTeams,

    deletePlayer,
    deleteCoach,
  };
}
