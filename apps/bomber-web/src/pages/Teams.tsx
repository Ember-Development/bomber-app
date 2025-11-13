import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import MainNav from '@/components/layout/MainNav';
import { fetchTeams } from '@/api/team';

export default function Teams() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [showAcademyOnly, setShowAcademyOnly] = useState(false);

  const { data: teams = [], isLoading } = useQuery({
    queryKey: ['teams'],
    queryFn: fetchTeams,
  });

  // Extract unique states/regions from teams
  const states = Array.from(
    new Set(teams.map((t) => t.state).filter(Boolean) as string[])
  );

  // Count academy teams
  const academyCount = teams.filter((t) => t.region === 'ACADEMY').length;

  // Filter teams based on search, region, and academy
  const filteredTeams = teams.filter((team) => {
    const matchesSearch = team.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesRegion = !selectedRegion || team.state === selectedRegion;
    const matchesAcademy = !showAcademyOnly || team.region === 'ACADEMY';
    return matchesSearch && matchesRegion && matchesAcademy;
  });

  return (
    <div className="relative bg-neutral-950 min-h-screen">
      <MainNav />

      <main className="relative z-20 pt-32 pb-20">
        {/* Find Bombers Team Section */}
        <section className="mb-16 overflow-hidden rounded-br-3xl rounded-tr-3xl mr-4 md:mr-8 relative shadow-2xl">
          {/* Main background */}
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-black to-neutral-900" />

          {/* Image overlay */}
          <div className="absolute inset-0">
            <img
              src="https://bombersfastpitch.net/wp-content/uploads/2022/03/IMG_5804.jpg"
              alt=""
              className="h-full w-full object-cover object-top opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
          </div>

          {/* Animated glow orbs */}
          <div className="absolute top-10 left-4 md:left-20 w-64 md:w-96 h-64 md:h-96 bg-[#57a4ff]/20 rounded-full blur-3xl animate-pulse" />
          <div
            className="absolute bottom-10 right-4 md:right-20 w-64 md:w-96 h-64 md:h-96 bg-[#3b8aff]/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: '1s' }}
          />

          {/* Content */}
          <div className="relative p-4 md:p-6 lg:p-10 xl:p-12">
            <div className="mx-auto max-w-8xl">
              {/* Top Row with Badge and Academy Filter */}
              <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4 gap-3 md:gap-4">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#57a4ff]/20 to-[#3b8aff]/20 px-3 md:px-4 py-1.5 backdrop-blur-sm border border-[#57a4ff]/30 w-fit">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#57a4ff] animate-pulse" />
                  <span className="text-[10px] font-black tracking-widest text-[#57a4ff] uppercase">
                    Find Your Team
                  </span>
                </div>

                {/* Academy Filter - Responsive */}
                {academyCount > 0 && (
                  <button
                    onClick={() => setShowAcademyOnly(!showAcademyOnly)}
                    className={`group relative px-4 md:px-6 py-2 md:py-3 rounded-lg md:rounded-xl font-black text-xs md:text-sm uppercase tracking-widest transition-all duration-500 overflow-hidden shrink-0 w-full md:w-auto ${
                      showAcademyOnly
                        ? 'bg-gradient-to-r from-[#57a4ff] via-[#6bb0ff] to-[#57a4ff] text-white shadow-[0_0_30px_rgba(87,164,255,0.6)]'
                        : 'bg-gradient-to-r from-neutral-800/50 to-neutral-900/50 text-[#57a4ff] hover:from-neutral-800/70 hover:to-neutral-900/70 border border-[#57a4ff]/30'
                    }`}
                  >
                    {/* Animated background glow */}
                    {showAcademyOnly && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                    )}

                    {/* Icon */}
                    <span className="relative flex items-center justify-center md:justify-start gap-2">
                      <svg
                        className={`w-3 md:w-4 h-3 md:h-4 transition-transform duration-300 ${showAcademyOnly ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                        />
                      </svg>
                      <span className="hidden sm:inline">
                        {showAcademyOnly
                          ? 'ACADEMY ONLY'
                          : 'SHOW ONLY ACADEMY TEAMS'}
                      </span>
                      <span className="sm:hidden">
                        {showAcademyOnly ? 'ACADEMY' : 'ACADEMY TEAMS'}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          showAcademyOnly ? 'bg-white/20' : 'bg-[#57a4ff]/20'
                        }`}
                      >
                        {academyCount}
                      </span>
                    </span>
                  </button>
                )}
              </div>

              <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black mb-6 md:mb-8">
                <span className="bg-gradient-to-br from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent drop-shadow-2xl">
                  FIND
                </span>
                <br />
                <span className="bg-gradient-to-r from-[#57a4ff] via-[#6bb0ff] to-[#57a4ff] bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(87,164,255,0.5)]">
                  BOMBERS TEAM
                </span>
              </h2>

              {/* Search Input */}
              <div className="mb-4 md:mb-6">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ENTER TEAM NAME"
                  className="w-full px-4 md:px-6 py-3 md:py-4 rounded-lg bg-neutral-900/80 border border-white/10 text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#57a4ff]/50 transition-all duration-300 text-start text-base md:text-lg font-bold uppercase tracking-wider"
                />
              </div>

              {/* Region Filter Buttons - Horizontal Scroll on Mobile */}
              <div className="mb-4">
                <div className="overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
                  <div className="flex gap-2 min-w-min md:flex-wrap">
                    {states.map((state) => (
                      <button
                        key={state}
                        onClick={() =>
                          setSelectedRegion(
                            selectedRegion === state ? null : state
                          )
                        }
                        className={`px-3 md:px-4 py-1.5 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider transition-all duration-300 whitespace-nowrap ${
                          selectedRegion === state
                            ? 'bg-[#57a4ff] text-white'
                            : 'bg-[#57a4ff]/20 text-[#57a4ff] hover:bg-[#57a4ff]/30'
                        }`}
                      >
                        {state} ({teams.filter((t) => t.state === state).length}
                        )
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Decorative line */}
              <div className="h-1 w-20 bg-gradient-to-r from-[#57a4ff] to-transparent rounded-full" />
            </div>

            {/* Bottom accent line */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#57a4ff] to-transparent opacity-50" />
          </div>
        </section>

        {/* Results Section */}
        <section>
          <div className="mx-auto max-w-8xl px-4 md:px-6">
            <div className="flex items-center gap-4 mb-6">
              <h3 className="text-3xl font-black text-white uppercase">
                RESULTS
              </h3>
              {showAcademyOnly && (
                <Link
                  to="/academy"
                  className="text-sm text-[#57a4ff] hover:text-[#6bb0ff] transition-colors duration-300 flex items-center gap-1 group"
                >
                  Learn more about academy teams
                  <svg
                    className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              )}
            </div>

            {isLoading ? (
              <div className="text-center py-16 text-white">
                Loading teams...
              </div>
            ) : filteredTeams.length === 0 ? (
              <div className="text-center py-16 text-neutral-400">
                No teams found matching your search
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTeams.map((team) => (
                  <div
                    key={team.id}
                    className="flex items-center gap-6 p-6 rounded-xl bg-neutral-900/50 backdrop-blur-sm border border-white/10 hover:border-[#57a4ff]/50 transition-all duration-300 group"
                  >
                    {/* Team Logo */}
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center border border-white/20">
                        <img
                          src={
                            team.logoUrl ||
                            'https://res.cloudinary.com/duwgrvngn/image/upload/v1763068366/bomber-black-removebg-preview_tkvf3d.png'
                          }
                          alt={team.name}
                          className="w-full h-full rounded-full object-contain"
                        />
                      </div>
                    </div>

                    {/* Team Info */}
                    <div className="flex-1">
                      <div className="text-[#57a4ff] text-sm font-bold uppercase mb-1">
                        {team.state || 'TEXAS'}
                      </div>
                      <div className="text-white font-bold text-lg">
                        {team.name}
                      </div>
                      {team.ageGroup && (
                        <div className="text-neutral-400 text-sm mt-1">
                          {team.ageGroup}
                        </div>
                      )}
                    </div>

                    {/* View Team Button */}
                    <div className="flex-shrink-0">
                      <Link
                        to={`/teams/${team.id}`}
                        className="px-6 py-2 bg-[#57a4ff]/20 text-[#57a4ff] rounded-lg font-bold uppercase tracking-wider hover:bg-[#57a4ff]/30 transition-all duration-300 group-hover:scale-105 inline-block"
                      >
                        VIEW TEAM
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
