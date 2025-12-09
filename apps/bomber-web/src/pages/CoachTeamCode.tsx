import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainNav from '@/components/layout/MainNav';
import SocialSidebar from '@/components/layout/SocialSidebar';
import { api } from '@/api/Client';

interface TeamData {
  id: string;
  name: string;
  ageGroup?: string | null;
  teamCode?: string | null;
}

export default function CoachTeamCode() {
  const navigate = useNavigate();
  const [teamCode, setTeamCode] = useState('');
  const [teamData, setTeamData] = useState<TeamData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const saved = sessionStorage.getItem('coachSignupData');
    if (!saved) {
      navigate('/signup/coach');
    }
  }, [navigate]);

  useEffect(() => {
    if (teamCode.length === 5) {
      fetchTeam();
    } else {
      setTeamData(null);
      setError('');
    }
  }, [teamCode]);

  const fetchTeam = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await api.get(`/teams/code/${teamCode.toUpperCase()}`);
      setTeamData(response.data);
      // Update sessionStorage
      const saved = JSON.parse(
        sessionStorage.getItem('coachSignupData') || '{}'
      );
      sessionStorage.setItem(
        'coachSignupData',
        JSON.stringify({
          ...saved,
          teamCode: teamCode.toUpperCase(),
          teamName: response.data.name,
        })
      );
    } catch (err: any) {
      setTeamData(null);
      if (err.response?.status === 404) {
        setError('Team not found. Please check your team code.');
      } else {
        setError('Failed to fetch team. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    if (teamData) {
      navigate('/signup/coach/players');
    }
  };

  return (
    <div className="relative bg-neutral-950 min-h-screen overflow-x-hidden">
      {/* Background Image Layer */}
      <div className="fixed inset-0 z-0">
        <img
          src="https://linedrivemedia.com/wp-content/uploads/2024/07/Texas_Bombers_Gold_Smith_18U_AFCS_champs_2024.jpg"
          alt="Texas Bombers Team"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/85" />
        <div className="absolute inset-0 bg-neutral-950/60" />
      </div>

      <MainNav />
      <SocialSidebar />

      <main className="relative z-20 pt-32 pb-20 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-2xl px-4">
          {/* Glow orbs */}
          <div className="absolute top-20 left-20 w-64 h-64 bg-[#57a4ff]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-64 h-64 bg-[#3b8aff]/10 rounded-full blur-3xl" />

          <div className="relative bg-gradient-to-br from-neutral-900/50 to-neutral-950/50 backdrop-blur-sm rounded-2xl border border-[#57a4ff]/20 p-8 shadow-2xl">
            {/* Header */}
            <div className="mb-8">
              <button
                onClick={() => navigate('/signup/coach/address')}
                className="mb-4 flex items-center gap-2 text-[#57a4ff] hover:text-[#6bb0ff] transition-colors duration-300"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                <span className="text-sm font-semibold">Back</span>
              </button>

              <h2 className="text-2xl md:text-3xl font-black mb-2 text-white">
                Bomber Team Code
              </h2>
              <p className="text-neutral-400 text-sm mb-2">
                Enter the team code for the team you coach.
              </p>
              <p className="text-neutral-500 text-xs">
                Check your welcome email for the code.
              </p>
            </div>

            {/* Team Code Input - Same as PlayerTeamCode */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wider">
                Team Code
              </label>
              <div className="flex gap-2 justify-center">
                {[0, 1, 2, 3, 4].map((index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength={1}
                    value={teamCode[index] || ''}
                    onChange={(e) => {
                      const value = e.target.value
                        .toUpperCase()
                        .replace(/[^A-Z0-9]/g, '');
                      if (value) {
                        const newCode =
                          teamCode.slice(0, index) +
                          value +
                          teamCode.slice(index + 1);
                        setTeamCode(newCode.slice(0, 5));
                        // Auto-focus next input
                        if (index < 4 && value) {
                          const nextInput = document.getElementById(
                            `code-${index + 1}`
                          );
                          nextInput?.focus();
                        }
                      } else {
                        setTeamCode(
                          teamCode.slice(0, index) + teamCode.slice(index + 1)
                        );
                      }
                    }}
                    onKeyDown={(e) => {
                      if (
                        e.key === 'Backspace' &&
                        !teamCode[index] &&
                        index > 0
                      ) {
                        const prevInput = document.getElementById(
                          `code-${index - 1}`
                        );
                        prevInput?.focus();
                      }
                    }}
                    id={`code-${index}`}
                    className="w-14 h-14 text-center text-2xl font-bold bg-neutral-950/50 border-2 border-[#57a4ff]/30 rounded-lg text-white focus:outline-none focus:border-[#57a4ff] focus:ring-1 focus:ring-[#57a4ff] transition-all duration-300"
                    placeholder=""
                  />
                ))}
              </div>
            </div>

            {/* Loading/Error/Team Info */}
            {isLoading && (
              <div className="mb-6 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#57a4ff]"></div>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-sm text-center">{error}</p>
              </div>
            )}

            {teamData && !error && (
              <div className="mb-6 p-4 bg-[#57a4ff]/20 border border-[#57a4ff]/30 rounded-lg text-center">
                <p className="text-xs text-white/60 uppercase mb-2">
                  Selected Team
                </p>
                <p className="text-xl font-bold text-white">{teamData.name}</p>
                {teamData.ageGroup && (
                  <p className="text-sm text-white/70 mt-1">
                    Age Group: {teamData.ageGroup}
                  </p>
                )}
              </div>
            )}

            {/* Continue Button */}
            {teamCode.length === 5 && teamData && !error && (
              <button
                onClick={handleContinue}
                className="w-full px-8 py-4 bg-gradient-to-r from-[#57a4ff] via-[#6bb0ff] to-[#57a4ff] text-white font-black uppercase tracking-widest rounded-lg hover:shadow-[0_0_30px_rgba(87,164,255,0.6)] transition-all duration-300 relative overflow-hidden group"
              >
                <span className="relative z-10">Continue</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
