import React from 'react';
import ProfileModal from './profile-role-modal';
import EditPlayerModal from './update-player';
import RemovePlayerModal from './remove-player';
import EditCoachModal from './edit-coach-modal';
import RemoveCoachModal from './remove-coach-modal';
import EditTrophyModal from './edit-trophy-modal';
import RemoveTrophyModal from './remove-trophy-modal';

export default function ModalManager({
  selectedProfile,
  setSelectedProfile,
  editPlayerId,
  selectedPlayer,
  removePlayerId,
  selectedPlayerToRemove,
  deletePlayer,
  editCoachId,
  selectedCoach,
  removeCoachId,
  selectedCoachToRemove,
  deleteCoach,
  editTrophy,
  removeTrophy,
}: any) {
  return (
    <>
      {selectedProfile && (
        <ProfileModal
          isVisible
          onClose={() => setSelectedProfile(null)}
          player={selectedProfile}
        />
      )}

      {editPlayerId && selectedPlayer && (
        <EditPlayerModal
          visible
          player={selectedPlayer}
          onClose={() => setSelectedProfile(null)}
        />
      )}
      {removePlayerId && selectedPlayerToRemove && (
        <RemovePlayerModal
          visible
          playerName={`${selectedPlayerToRemove.user?.fname} ${selectedPlayerToRemove.user?.lname}`}
          onClose={() => setSelectedProfile(null)}
          onConfirm={() => deletePlayer(removePlayerId)}
        />
      )}

      {editCoachId && selectedCoach && (
        <EditCoachModal
          visible
          coach={selectedCoach}
          onClose={() => setSelectedProfile(null)}
        />
      )}
      {removeCoachId && selectedCoachToRemove && (
        <RemoveCoachModal
          visible
          coachName={`${selectedCoachToRemove.user?.fname} ${selectedCoachToRemove.user?.lname}`}
          onClose={() => setSelectedProfile(null)}
          onConfirm={() => deleteCoach(removeCoachId)}
        />
      )}

      {editTrophy && (
        <EditTrophyModal
          visible
          teamId={editTrophy.teamId}
          trophy={editTrophy.trophy}
          onClose={() => setSelectedProfile(null)}
        />
      )}
      {removeTrophy && (
        <RemoveTrophyModal
          visible
          teamId={removeTrophy.teamId}
          trophyId={removeTrophy.trophy.id}
          trophyTitle={removeTrophy.trophy.title}
          onClose={() => setSelectedProfile(null)}
        />
      )}
    </>
  );
}
