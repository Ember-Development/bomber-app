import React from 'react';
import ProfileModal from './profile-role-modal';
import RemovePlayerModal from './remove-player';
import EditCoachModal from './edit-coach-modal';
import RemoveCoachModal from './remove-coach-modal';
import EditTrophyModal from './edit-trophy-modal';
import RemoveTrophyModal from './remove-trophy-modal';
import EditPlayerModal from './update-player';

export default function ModalManager({
  // profile
  selectedProfile,
  setSelectedProfile,

  // players
  editPlayerId,
  setEditPlayerId,
  selectedPlayer,
  removePlayerId,
  setRemovePlayerId,
  selectedPlayerToRemove,
  deletePlayer,

  // coaches
  editCoachId,
  setEditCoachId,
  selectedCoach,
  removeCoachId,
  setRemoveCoachId,
  selectedCoachToRemove,
  removeCoach,

  // trophies
  editTrophy,
  setEditTrophy,
  removeTrophy,
  setRemoveTrophy,
}: any) {
  return (
    <>
      {/* Profile details modal */}
      {selectedProfile && (
        <ProfileModal
          isVisible
          onClose={() => setSelectedProfile(null)}
          player={selectedProfile}
        />
      )}

      {/* Edit player modal */}
      {editPlayerId && selectedPlayer && (
        <EditPlayerModal
          visible
          player={selectedPlayer}
          onClose={() => setEditPlayerId(null)}
        />
      )}

      {/* Remove player modal */}
      {removePlayerId && selectedPlayerToRemove && (
        <RemovePlayerModal
          visible
          playerName={`${selectedPlayerToRemove.user?.fname} ${selectedPlayerToRemove.user?.lname}`}
          onClose={() => setRemovePlayerId(null)}
          onConfirm={() => {
            deletePlayer(removePlayerId);
            setRemovePlayerId(null);
          }}
        />
      )}

      {/* Edit coach modal */}
      {editCoachId && selectedCoach && (
        <EditCoachModal
          visible
          coach={selectedCoach}
          onClose={() => setEditCoachId(null)}
        />
      )}

      {/* Remove coach modal */}
      {removeCoachId && selectedCoachToRemove && (
        <RemoveCoachModal
          visible
          coachName={`${selectedCoachToRemove.user?.fname} ${selectedCoachToRemove.user?.lname}`}
          onClose={() => setRemoveCoachId(null)}
          onConfirm={() => {
            removeCoach({
              coachId: removeCoachId.coachId,
              teamId: removeCoachId.teamId,
            });
            setRemoveCoachId(null);
          }}
        />
      )}

      {/* Edit trophy modal */}
      {editTrophy && (
        <EditTrophyModal
          visible
          teamId={editTrophy.teamId}
          trophy={editTrophy.trophy}
          onClose={() => setEditTrophy(null)}
        />
      )}

      {/* Remove trophy modal */}
      {removeTrophy && (
        <RemoveTrophyModal
          visible
          teamId={removeTrophy.teamId}
          trophyId={removeTrophy.trophy.id}
          trophyTitle={removeTrophy.trophy.title}
          onClose={() => setRemoveTrophy(null)}
        />
      )}
    </>
  );
}
