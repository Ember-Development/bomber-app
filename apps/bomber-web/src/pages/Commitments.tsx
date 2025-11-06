import { useQuery } from '@tanstack/react-query';
import { useMemo, useState, useEffect } from 'react';
import MainNav from '@/components/layout/MainNav';
import SocialSidebar from '@/components/layout/SocialSidebar';
import { fetchCommits } from '@/api/commit';
import {
  MapPin,
  Calendar,
  Users,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const ITEMS_PER_PAGE = 12;

export default function Commitments() {
  const { data: commits = [], isLoading } = useQuery({
    queryKey: ['commits'],
    queryFn: fetchCommits,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [stateDropdownOpen, setStateDropdownOpen] = useState(false);
  const [classDropdownOpen, setClassDropdownOpen] = useState(false);

  // Get unique states for filtering
  const states = useMemo(() => {
    return Array.from(new Set(commits.map((c) => c.state))).sort();
  }, [commits]);

  // Get unique graduation years for filtering
  const graduationYears = useMemo(() => {
    const years = new Set<number>();
    commits.forEach((commit) => {
      commit.players.forEach((player) => {
        if (player.gradYear) {
          years.add(parseInt(player.gradYear as string, 10));
        }
      });
    });
    return Array.from(years).sort((a, b) => a - b); // Descending order
  }, [commits]);

  // Filter and sort commits
  const filteredAndSortedCommits = useMemo(() => {
    let filtered = [...commits];

    // Filter by class (graduation year)
    if (selectedClass) {
      filtered = filtered.filter((commit) =>
        commit.players.some(
          (player) => player.gradYear === selectedClass.toString()
        )
      );
    }

    // Filter by state
    if (selectedState) {
      filtered = filtered.filter((commit) => commit.state === selectedState);
    }

    // Sort by player graduation year buckets:
    // 1) 2025 first
    // 2) Years < 2025 (newest to oldest)
    // 3) Years > 2025 (soonest to farthest)
    // 4) Missing year last
    return filtered.sort((a, b) => {
      const aYears = a.players
        .map((p) => (p.gradYear ? parseInt(p.gradYear as string, 10) : NaN))
        .filter((n) => !Number.isNaN(n));
      const bYears = b.players
        .map((p) => (p.gradYear ? parseInt(p.gradYear as string, 10) : NaN))
        .filter((n) => !Number.isNaN(n));

      const aYear = aYears.length ? Math.max(...aYears) : NaN;
      const bYear = bYears.length ? Math.max(...bYears) : NaN;

      const bucket = (y: number) =>
        Number.isNaN(y) ? 3 : y === 2025 ? 0 : y < 2025 ? 1 : 2;

      const aBucket = bucket(aYear);
      const bBucket = bucket(bYear);
      if (aBucket !== bBucket) return aBucket - bBucket;

      // Same bucket tie-breakers
      if (aBucket === 0) return 0; // both 2025
      if (aBucket === 1) return (bYear || 0) - (aYear || 0); // below 2025: newer first
      if (aBucket === 2) return (aYear || 0) - (bYear || 0); // above 2025: nearer first
      return 0; // both missing
    });
  }, [commits, selectedClass, selectedState]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedClass, selectedState]);

  // Pagination calculations
  const totalPages = Math.ceil(
    filteredAndSortedCommits.length / ITEMS_PER_PAGE
  );
  const paginatedCommits = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredAndSortedCommits.slice(startIndex, endIndex);
  }, [filteredAndSortedCommits, currentPage]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="relative bg-neutral-950 min-h-screen">
        <MainNav />
        <SocialSidebar />
        <main className="relative z-20 pt-32 pb-20">
          <div className="mx-auto max-w-8xl px-4 md:px-6">
            <div className="text-center text-white">Loading commitments...</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="relative bg-neutral-950 min-h-screen">
      <MainNav />
      <SocialSidebar />

      <main className="relative z-20 pt-32 pb-20">
        <div className="mx-auto max-w-8xl px-4 md:px-6">
          {/* Header */}
          <div className="mb-8 md:mb-12">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-3 md:mb-4 uppercase tracking-tight">
              College Commitments
            </h1>
            <p className="text-base md:text-lg lg:text-xl text-neutral-400">
              Celebrating our Bombers who have committed to play at the next
              level
            </p>
          </div>

          {/* Filter Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
            {/* Total Commits - Not clickable, shows filtered count */}
            <div className="bg-neutral-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-4 md:p-6">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-[#57a4ff]/20 rounded-full flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 md:w-6 md:h-6 text-[#57a4ff]" />
                </div>
                <div>
                  <div className="text-2xl md:text-3xl font-black text-white">
                    {filteredAndSortedCommits.length}
                  </div>
                  <div className="text-xs md:text-sm text-neutral-400">
                    Total Commits
                  </div>
                </div>
              </div>
            </div>

            {/* State Filter */}
            <div className="relative">
              <button
                onClick={() => setStateDropdownOpen(!stateDropdownOpen)}
                className={`bg-neutral-900/50 backdrop-blur-sm border rounded-2xl p-4 md:p-6 transition-all duration-300 text-left w-full ${
                  selectedState
                    ? 'border-[#57a4ff] bg-[#57a4ff]/10'
                    : 'border-white/10 hover:border-[#57a4ff]/50'
                }`}
              >
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-[#57a4ff]/20 rounded-full flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 md:w-6 md:h-6 text-[#57a4ff]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-2xl md:text-3xl font-black text-white truncate">
                      {selectedState || states.length}
                    </div>
                    <div className="text-xs md:text-sm text-neutral-400 truncate">
                      {selectedState ? `${selectedState}` : 'Click to filter'}
                    </div>
                  </div>
                  {stateDropdownOpen ? (
                    <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-white rotate-90 shrink-0" />
                  ) : (
                    <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-white/50 -rotate-90 shrink-0" />
                  )}
                </div>
              </button>

              {/* Dropdown */}
              {stateDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-neutral-900 border border-white/10 rounded-xl overflow-hidden max-h-64 overflow-y-auto z-10 shadow-2xl">
                  {/* Clear Option */}
                  <button
                    onClick={() => {
                      setSelectedState(null);
                      setStateDropdownOpen(false);
                    }}
                    className={`w-full px-4 py-3 text-left hover:bg-[#57a4ff]/10 text-white transition-colors ${
                      !selectedState ? 'bg-[#57a4ff]/10' : ''
                    }`}
                  >
                    All States ({states.length})
                  </button>
                  {states.map((state) => (
                    <button
                      key={state}
                      onClick={() => {
                        setSelectedState(state);
                        setStateDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-3 text-left hover:bg-[#57a4ff]/10 text-white transition-colors ${
                        selectedState === state ? 'bg-[#57a4ff]/10' : ''
                      }`}
                    >
                      {state}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Class Filter */}
            <div className="relative">
              <button
                onClick={() => setClassDropdownOpen(!classDropdownOpen)}
                className={`bg-neutral-900/50 backdrop-blur-sm border rounded-2xl p-4 md:p-6 transition-all duration-300 text-left w-full ${
                  selectedClass
                    ? 'border-[#57a4ff] bg-[#57a4ff]/10'
                    : 'border-white/10 hover:border-[#57a4ff]/50'
                }`}
              >
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-[#57a4ff]/20 rounded-full flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5 md:w-6 md:h-6 text-[#57a4ff]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-2xl md:text-3xl font-black text-white truncate">
                      {selectedClass || 'All'}
                    </div>
                    <div className="text-xs md:text-sm text-neutral-400 truncate">
                      {selectedClass ? `Class of ${selectedClass}` : 'Classes'}
                    </div>
                  </div>
                  {classDropdownOpen ? (
                    <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-white rotate-90 shrink-0" />
                  ) : (
                    <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-white/50 -rotate-90 shrink-0" />
                  )}
                </div>
              </button>

              {/* Dropdown */}
              {classDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-neutral-900 border border-white/10 rounded-xl overflow-hidden max-h-64 overflow-y-auto z-10 shadow-2xl">
                  {/* Clear Option */}
                  <button
                    onClick={() => {
                      setSelectedClass(null);
                      setClassDropdownOpen(false);
                    }}
                    className={`w-full px-4 py-3 text-left hover:bg-[#57a4ff]/10 text-white transition-colors ${
                      !selectedClass ? 'bg-[#57a4ff]/10' : ''
                    }`}
                  >
                    All Classes ({graduationYears.length})
                  </button>
                  {graduationYears.map((year) => (
                    <button
                      key={year}
                      onClick={() => {
                        setSelectedClass(year.toString());
                        setClassDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-3 text-left hover:bg-[#57a4ff]/10 text-white transition-colors ${
                        selectedClass === year.toString()
                          ? 'bg-[#57a4ff]/10'
                          : ''
                      }`}
                    >
                      Class of {year}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Commits Grid */}
          {filteredAndSortedCommits.length === 0 ? (
            <div className="text-center text-neutral-500 py-16">
              <p className="text-lg">No commitments available at the moment.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {paginatedCommits.map((commit) => (
                  <div
                    key={commit.id}
                    className="group relative bg-neutral-900/50 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:border-[#57a4ff] transition-all duration-500 transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#57a4ff]/20"
                  >
                    {/* College Logo */}
                    <div className="relative h-64 overflow-hidden bg-gradient-to-br from-neutral-800 to-neutral-900">
                      <img
                        src={
                          commit.imageUrl || '/src/assets/bomber-icon-blue.png'
                        }
                        alt={commit.name}
                        className="w-full h-full object-contain p-8 group-hover:scale-110 transition-transform duration-700"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/src/assets/bomber-icon-blue.png';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="text-2xl font-black text-white mb-2 group-hover:text-[#57a4ff] transition-colors">
                        {commit.name}
                      </h3>
                      <div className="flex items-center gap-2 text-neutral-500 mb-4">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">
                          {commit.city}, {commit.state}
                        </span>
                      </div>

                      {/* Players */}
                      {commit.players && commit.players.length > 0 && (
                        <div className="border-t border-white/10 pt-4">
                          <div className="text-xs text-neutral-500 uppercase tracking-wider mb-2">
                            Commitments
                          </div>
                          <div className="space-y-2">
                            {commit.players.slice(0, 3).map((player) => (
                              <div
                                key={player.id}
                                className="text-sm text-white"
                              >
                                {player.user?.fname && player.user?.lname
                                  ? `${player.user.fname} ${player.user.lname}`
                                  : 'Bomber Player'}
                                {player.gradYear && (
                                  <span className="text-neutral-500 ml-2">
                                    • Class of {player.gradYear}
                                  </span>
                                )}
                              </div>
                            ))}
                            {commit.players.length > 3 && (
                              <div className="text-sm text-[#57a4ff]">
                                +{commit.players.length - 3} more
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Date */}
                      {/* <div className="mt-4 pt-4 border-t border-white/10">
                        <div className="flex items-center gap-2 text-xs text-neutral-500">
                          <Calendar className="w-3 h-3" />
                          <span>
                            Committed{' '}
                            {new Date(commit.committedDate).toLocaleDateString(
                              'en-US',
                              {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              }
                            )}
                          </span>
                        </div>
                      </div> */}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-2">
                  {/* Previous Button */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-lg transition-all duration-300 ${
                      currentPage === 1
                        ? 'opacity-30 cursor-not-allowed'
                        : 'hover:bg-[#57a4ff]/20 hover:border-[#57a4ff]/50'
                    } border border-white/10`}
                  >
                    <ChevronLeft className="w-6 h-6 text-white" />
                  </button>

                  {/* Page Numbers */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (pageNum) => {
                        // Show first page, last page, current page, and pages around current
                        const showPage =
                          pageNum === 1 ||
                          pageNum === totalPages ||
                          (pageNum >= currentPage - 1 &&
                            pageNum <= currentPage + 1);

                        if (
                          !showPage &&
                          pageNum !== currentPage - 2 &&
                          pageNum !== currentPage + 2
                        ) {
                          return null;
                        }

                        if (
                          pageNum === currentPage - 2 ||
                          pageNum === currentPage + 2
                        ) {
                          return (
                            <span key={pageNum} className="text-white">
                              ...
                            </span>
                          );
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`w-10 h-10 rounded-lg font-bold transition-all duration-300 ${
                              pageNum === currentPage
                                ? 'bg-[#57a4ff] text-white'
                                : 'bg-neutral-900/50 text-white/70 hover:bg-[#57a4ff]/20 hover:text-white border border-white/10'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      }
                    )}
                  </div>

                  {/* Next Button */}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-lg transition-all duration-300 ${
                      currentPage === totalPages
                        ? 'opacity-30 cursor-not-allowed'
                        : 'hover:bg-[#57a4ff]/20 hover:border-[#57a4ff]/50'
                    } border border-white/10`}
                  >
                    <ChevronRight className="w-6 h-6 text-white" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
