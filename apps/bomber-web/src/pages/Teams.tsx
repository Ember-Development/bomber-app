import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import MainNav from '@/components/layout/MainNav';
import { fetchTeams } from '@/api/team';
import { formatAgeGroup } from '@/utils/formatAgeGroup';

const TEAMS_PER_PAGE = 12;

export default function Teams() {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string | null>(null);
  const [showAcademyOnly, setShowAcademyOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Check for academy filter in URL params on mount
  useEffect(() => {
    const academyParam = searchParams.get('academy');
    if (academyParam === 'true') {
      setShowAcademyOnly(true);
    }
  }, [searchParams]);

  const { data: teams = [], isLoading } = useQuery({
    queryKey: ['teams'],
    queryFn: fetchTeams,
  });

  // Extract unique states/regions from teams
  const states = Array.from(
    new Set(teams.map((t) => t.state).filter(Boolean) as string[])
  );

  // Extract unique age groups from teams and sort them
  const ageGroups = Array.from(
    new Set(teams.map((t) => t.ageGroup).filter(Boolean) as string[])
  ).sort((a, b) => {
    // Normalize both to compare numbers (handle U8 vs 8U format)
    const normalize = (ag: string) => {
      const match = ag.match(/(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    };
    return normalize(a) - normalize(b);
  });

  // Count academy teams
  const academyCount = teams.filter((t) => t.region === 'ACADEMY').length;

  // Helper function to normalize age groups for comparison
  const normalizeAgeGroup = (ageGroup: string | null | undefined): string => {
    if (!ageGroup) return '';
    // Convert to uppercase and handle both U8 and 8U formats
    const trimmed = ageGroup.trim().toUpperCase();
    const match = trimmed.match(/(\d+)U|U(\d+)/i);
    if (match) {
      const num = match[1] || match[2];
      return `${num}U`;
    }
    return trimmed;
  };

  // Filter teams based on search, region, age group, and academy
  const filteredTeams = teams.filter((team) => {
    const matchesSearch = team.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesRegion = !selectedRegion || team.state === selectedRegion;
    const matchesAgeGroup =
      !selectedAgeGroup ||
      normalizeAgeGroup(team.ageGroup) === normalizeAgeGroup(selectedAgeGroup);
    const matchesAcademy = !showAcademyOnly || team.region === 'ACADEMY';
    return matchesSearch && matchesRegion && matchesAgeGroup && matchesAcademy;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredTeams.length / TEAMS_PER_PAGE);
  const startIndex = (currentPage - 1) * TEAMS_PER_PAGE;
  const endIndex = startIndex + TEAMS_PER_PAGE;
  const paginatedTeams = filteredTeams.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedRegion, selectedAgeGroup, showAcademyOnly]);

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
              src="https://firebasestorage.googleapis.com/v0/b/goatnet-4a76f.firebasestorage.app/o/Software%2FBombers-3-1-e1755562625610_q5dj4i.jpg?alt=media&token=a5e59335-c0e6-471f-b16c-5886cba06b33"
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
              {states.length > 0 && (
                <div className="mb-4">
                  <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
                    Region
                  </div>
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
                          {state} (
                          {teams.filter((t) => t.state === state).length})
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Age Group Filter Buttons - Horizontal Scroll on Mobile */}
              {ageGroups.length > 0 && (
                <div className="mb-4">
                  <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
                    Age Group
                  </div>
                  <div className="overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
                    <div className="flex gap-2 min-w-min md:flex-wrap">
                      {ageGroups.map((ageGroup) => (
                        <button
                          key={ageGroup}
                          onClick={() =>
                            setSelectedAgeGroup(
                              selectedAgeGroup === ageGroup ? null : ageGroup
                            )
                          }
                          className={`px-3 md:px-4 py-1.5 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider transition-all duration-300 whitespace-nowrap ${
                            normalizeAgeGroup(selectedAgeGroup) ===
                            normalizeAgeGroup(ageGroup)
                              ? 'bg-[#57a4ff] text-white'
                              : 'bg-[#57a4ff]/20 text-[#57a4ff] hover:bg-[#57a4ff]/30'
                          }`}
                        >
                          {formatAgeGroup(ageGroup)} (
                          {
                            teams.filter(
                              (t) =>
                                normalizeAgeGroup(t.ageGroup) ===
                                normalizeAgeGroup(ageGroup)
                            ).length
                          }
                          )
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <h3 className="text-3xl font-black text-white uppercase">
                  RESULTS
                </h3>
                {filteredTeams.length > 0 && (
                  <span className="text-sm text-neutral-400">
                    {filteredTeams.length}{' '}
                    {filteredTeams.length === 1 ? 'team' : 'teams'}
                  </span>
                )}
              </div>
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
              <>
                <div className="space-y-3">
                  {paginatedTeams.map((team) => (
                    <div
                      key={team.id}
                      className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 md:gap-6 p-4 sm:p-5 md:p-6 rounded-xl bg-neutral-900/50 backdrop-blur-sm border border-white/10 hover:border-[#57a4ff]/50 transition-all duration-300 group"
                    >
                      {/* Team Logo */}
                      <div className="flex-shrink-0 flex items-center gap-3 sm:gap-4 md:gap-6">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center border border-white/20">
                          <img
                            src={
                              team.logoUrl ||
                              'https://firebasestorage.googleapis.com/v0/b/goatnet-4a76f.firebasestorage.app/o/Software%2Fbomber-black-removebg-preview_tkvf3d.png?alt=media&token=4306b239-298b-4387-9d18-e7deec6845c8'
                            }
                            alt={team.name}
                            className="w-full h-full rounded-full object-contain"
                          />
                        </div>

                        {/* Team Info - Mobile: next to logo */}
                        <div className="flex-1 sm:hidden">
                          <div className="text-[#57a4ff] text-xs font-bold uppercase mb-0.5">
                            {team.state || 'TEXAS'}
                          </div>
                          <div className="text-white font-bold text-base">
                            {team.name}
                          </div>
                          {team.ageGroup && (
                            <div className="text-neutral-400 text-xs mt-0.5">
                              {formatAgeGroup(team.ageGroup)}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Team Info - Desktop: separate column */}
                      <div className="flex-1 hidden sm:block">
                        <div className="text-[#57a4ff] text-xs sm:text-sm font-bold uppercase mb-1">
                          {team.state || 'TEXAS'}
                        </div>
                        <div className="text-white font-bold text-base sm:text-lg">
                          {team.name}
                        </div>
                        {team.ageGroup && (
                          <div className="text-neutral-400 text-xs sm:text-sm mt-1">
                            {formatAgeGroup(team.ageGroup)}
                          </div>
                        )}
                      </div>

                      {/* View Team Button */}
                      <div className="flex-shrink-0 w-full sm:w-auto">
                        <Link
                          to={`/teams/${team.id}`}
                          className="w-full sm:w-auto px-4 sm:px-5 md:px-6 py-2 bg-[#57a4ff]/20 text-[#57a4ff] rounded-lg font-bold uppercase tracking-wider hover:bg-[#57a4ff]/30 transition-all duration-300 group-hover:scale-105 inline-block text-center text-xs sm:text-sm"
                        >
                          VIEW TEAM
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-neutral-400">
                      Showing {startIndex + 1}-
                      {Math.min(endIndex, filteredTeams.length)} of{' '}
                      {filteredTeams.length} teams
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(1, prev - 1))
                        }
                        disabled={currentPage === 1}
                        className="px-4 py-2 rounded-lg bg-neutral-900/50 border border-white/10 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#57a4ff]/50 transition-all duration-300 font-bold text-sm uppercase tracking-wider"
                        aria-label="Previous page"
                      >
                        Previous
                      </button>

                      {/* Page Numbers */}
                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                          .filter((page) => {
                            // Show first page, last page, current page, and pages around current
                            if (totalPages <= 7) return true;
                            if (page === 1 || page === totalPages) return true;
                            if (Math.abs(page - currentPage) <= 1) return true;
                            return false;
                          })
                          .map((page, index, array) => {
                            // Add ellipsis if there's a gap
                            const showEllipsisBefore =
                              index > 0 && array[index - 1] !== page - 1;
                            return (
                              <div
                                key={page}
                                className="flex items-center gap-1"
                              >
                                {showEllipsisBefore && (
                                  <span className="text-neutral-500 px-2">
                                    ...
                                  </span>
                                )}
                                <button
                                  onClick={() => setCurrentPage(page)}
                                  className={`min-w-[40px] px-3 py-2 rounded-lg font-bold text-sm uppercase tracking-wider transition-all duration-300 ${
                                    currentPage === page
                                      ? 'bg-[#57a4ff] text-white'
                                      : 'bg-neutral-900/50 border border-white/10 text-white hover:border-[#57a4ff]/50'
                                  }`}
                                  aria-label={`Go to page ${page}`}
                                  aria-current={
                                    currentPage === page ? 'page' : undefined
                                  }
                                >
                                  {page}
                                </button>
                              </div>
                            );
                          })}
                      </div>

                      <button
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(totalPages, prev + 1)
                          )
                        }
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 rounded-lg bg-neutral-900/50 border border-white/10 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#57a4ff]/50 transition-all duration-300 font-bold text-sm uppercase tracking-wider"
                        aria-label="Next page"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
