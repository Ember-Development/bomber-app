import MainNav from '@/components/layout/MainNav';
import SocialSidebar from '@/components/layout/SocialSidebar';
import { useQuery } from '@tanstack/react-query';
import { fetchAlumniPlayers } from '@/api/player';
import type { AlumniPlayer } from '@/api/player';

function PlayerCard({ p }: { p: AlumniPlayer }) {
  const fullName = [p.user?.fname, p.user?.lname].filter(Boolean).join(' ');
  return (
    <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-4 hover:border-[#57a4ff]/50 transition-colors">
      <div className="flex items-center gap-4">
        <img
          src={
            p.commit?.imageUrl ||
            'https://res.cloudinary.com/duwgrvngn/image/upload/v1763068366/bomber-black-removebg-preview_tkvf3d.png'
          }
          alt={fullName}
          className="w-16 h-16 rounded-xl object-cover border border-white/10"
        />
        <div className="min-w-0">
          <div className="text-white font-bold truncate">
            {fullName || 'Unknown'}
          </div>
          {p.commit?.name && (
            <div className="text-xs text-neutral-300 mt-1 truncate">
              College:{' '}
              <span className="font-semibold text-white">{p.commit.name}</span>
            </div>
          )}
          <div className="text-xs text-neutral-400 mt-1">
            {p.pos1 || '-'} {p.pos2 ? `/${p.pos2}` : ''}
          </div>
          {p.gradYear && (
            <div className="text-xs text-neutral-400 mt-1">
              Grad Year: {p.gradYear}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Alumni() {
  const {
    data: players = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['players', 'alumni'],
    queryFn: fetchAlumniPlayers,
  });

  return (
    <div className="relative bg-neutral-950 min-h-screen">
      <MainNav />
      <SocialSidebar />
      <main className="relative z-20 pt-28 pb-16">
        <div className="mx-auto max-w-8xl px-4 md:px-6">
          <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight mb-8">
            Bombers Alumni
          </h1>

          {isLoading && (
            <div className="text-neutral-300">Loading alumni...</div>
          )}
          {isError && (
            <div className="text-red-500">Failed to load alumni.</div>
          )}

          {!isLoading && !isError && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {players.map((p) => (
                <PlayerCard key={p.id} p={p} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
