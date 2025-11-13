import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import MainNav from '@/components/layout/MainNav';
import SocialSidebar from '@/components/layout/SocialSidebar';
import { fetchTeamById } from '@/api/team';
import { formatPositions } from '@/utils/formatPosition';

export default function TeamDetail() {
  const { id } = useParams<{ id: string }>();
  const {
    data: team,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['team', id],
    queryFn: () => fetchTeamById(id!),
    enabled: !!id,
  });

  // Sort all players by jersey number
  const sortedPlayers = [...(team?.players || [])].sort((a, b) => {
    const numA = parseInt(a.jerseyNum || '999', 10);
    const numB = parseInt(b.jerseyNum || '999', 10);
    return numA - numB;
  });

  const getPlayerName = (player: any) => {
    if (player.user?.fname && player.user?.lname) {
      return `${player.user.fname} ${player.user.lname}`.toUpperCase();
    }
    return 'NO NAME AVAILABLE';
  };

  const getCoachName = (coach: any) => {
    if (coach.user?.fname && coach.user?.lname) {
      return `${coach.user.fname} ${coach.user.lname}`.toUpperCase();
    }
    return 'COACH NAME';
  };

  if (isLoading) {
    return (
      <div className="relative bg-neutral-950 min-h-screen">
        <MainNav />
        <SocialSidebar />
        <main className="relative z-20 pt-32 pb-20 text-white text-center">
          Loading team details...
        </main>
      </div>
    );
  }

  if (isError || !team) {
    return (
      <div className="relative bg-neutral-950 min-h-screen">
        <MainNav />
        <SocialSidebar />
        <main className="relative z-20 pt-32 pb-20 text-red-500 text-center">
          Team not found
        </main>
      </div>
    );
  }

  return (
    <div className="relative bg-neutral-950 min-h-screen">
      <MainNav />
      <SocialSidebar />

      {/* Header with Team Image */}
      <div className="relative h-[30vh] md:h-[40vh] overflow-hidden">
        <img
          src={
            team.logoUrl ||
            'https://bombersfastpitch.net/wp-content/uploads/2022/04/Bombers-fastpitch-social-card-logo.jpg'
          }
          alt={team.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/90" />

        {/* Breadcrumbs */}
        <div className="absolute top-20 md:top-20 left-4 md:left-8 text-white/70 text-xs md:text-sm">
          <Link to="/" className="hover:text-[#57a4ff]">
            HOME
          </Link>
          {' / '}
          <Link to="/teams" className="hover:text-[#57a4ff]">
            TEAMS
          </Link>
          {' / '}
          <span className="text-white">{team.name?.toUpperCase()}</span>
        </div>

        {/* Team Name */}
        <div className="absolute bottom-6 md:bottom-12 left-4 md:left-8 right-4">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white uppercase drop-shadow-2xl">
            {team.name}
          </h1>
        </div>
      </div>

      <main className="relative z-20 mt-10">
        <div className="mx-auto max-w-8xl px-4 md:px-6 pb-20">
          {/* ROSTER Section */}
          {sortedPlayers.length > 0 && (
            <section className="mb-12">
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-black mb-6 md:mb-8 text-neutral-700 uppercase tracking-wider">
                ROSTER
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0">
                {sortedPlayers.map((player) => (
                  <div
                    key={player.id}
                    className="relative backdrop-blur-sm border-b md:border-r border-white/10 md:last:border-r-0 hover:border-[#57a4ff]/50 transition-all duration-300 overflow-hidden group"
                  >
                    <div className="p-4 md:p-6 h-full flex flex-col">
                      {/* Top: Player Name */}
                      <div className="mb-3 md:mb-4">
                        <div className="text-white font-extrabold tracking-wide text-xl md:text-2xl uppercase">
                          {player.user?.fname && player.user?.lname ? (
                            <div className="flex flex-col">
                              <span>{player.user.fname}</span>
                              <span>{player.user.lname}</span>
                            </div>
                          ) : (
                            getPlayerName(player)
                          )}
                        </div>
                      </div>

                      {/* Center: College Logo / Commit Logo */}
                      <div className="flex justify-center items-center mb-3 md:mb-4 mt-3 md:mt-4 flex-1">
                        <img
                          src={
                            player.commit?.imageUrl ||
                            'https://res.cloudinary.com/duwgrvngn/image/upload/v1763068366/bomber-black-removebg-preview_tkvf3d.png'
                          }
                          alt={player.commit?.name || 'Bombers'}
                          className="w-32 h-32 md:w-40 md:h-40 object-contain"
                        />
                      </div>

                      {/* Bottom: Jersey Number and Position/Grad Year */}
                      <div className="mt-auto flex items-center gap-2 md:gap-3">
                        <div className="text-[#57a4ff] text-5xl md:text-6xl font-black">
                          {player.jerseyNum || '00'}
                        </div>
                        <div className="flex flex-col">
                          <div className="text-white font-bold text-xl md:text-2xl">
                            {formatPositions(player.pos1, player.pos2)}
                          </div>
                          <div className="text-gray-400 font-normal text-lg md:text-xl">
                            {player.gradYear || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* COACHES Section */}
          {(team.headCoach || team.coaches.length > 0) && (
            <section>
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-black mb-6 md:mb-8 text-neutral-700 uppercase tracking-wider">
                COACHES
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0">
                {/* Head Coach */}
                {team.headCoach && (
                  <div className="relative backdrop-blur-sm border-b md:border-r border-white/10 hover:border-[#57a4ff]/50 transition-all duration-300 overflow-hidden">
                    <div className="p-4 md:p-6 text-center">
                      <div className="w-20 h-20 md:w-24 md:h-24 rounded-full mx-auto mb-3 md:mb-4 flex items-center justify-center overflow-hidden">
                        <img
                          src="/src/assets/bomber-icon-blue.png"
                          alt="Bombers"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="text-white font-bold text-base md:text-lg uppercase mb-1">
                        {getCoachName(team.headCoach)}
                      </div>
                      <div className="text-[#57a4ff] text-xs md:text-sm uppercase mb-2">
                        HEAD COACH
                      </div>
                      {team.headCoach.user?.email && (
                        <div className="text-neutral-400 text-xs break-all">
                          {team.headCoach.user.email}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Assistant Coaches */}
                {team.coaches.map((coach) => (
                  <div
                    key={coach.id}
                    className="relative backdrop-blur-sm border-b md:border-r border-white/10 md:last:border-r-0 hover:border-[#57a4ff]/50 transition-all duration-300 overflow-hidden"
                  >
                    <div className="p-4 md:p-6 text-center">
                      <div className="w-20 h-20 md:w-24 md:h-24 rounded-full mx-auto mb-3 md:mb-4 flex items-center justify-center overflow-hidden">
                        <img
                          src="/src/assets/bomber-icon-blue.png"
                          alt="Bombers"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="text-white font-bold text-base md:text-lg uppercase mb-1">
                        {getCoachName(coach)}
                      </div>
                      <div className="text-[#57a4ff] text-xs md:text-sm uppercase mb-2">
                        ASSISTANT COACH
                      </div>
                      {coach.user?.email && (
                        <div className="text-neutral-400 text-xs break-all">
                          {coach.user.email}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
