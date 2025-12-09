import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainNav from '@/components/layout/MainNav';
import SocialSidebar from '@/components/layout/SocialSidebar';
import { api } from '@/api/Client';
import { useAuth } from '@/contexts/AuthContext';

export default function CoachPlayers() {
  const navigate = useNavigate();
  const { checkAuth } = useAuth();
  const [selection, setSelection] = useState<'yes' | 'no' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const saved = sessionStorage.getItem('coachSignupData');
    if (!saved) {
      navigate('/signup/coach');
    }
  }, [navigate]);

  const handleSubmit = async () => {
    if (!selection) return;

    setLoading(true);
    setError('');

    try {
      const coachData = JSON.parse(
        sessionStorage.getItem('coachSignupData') || '{}'
      );

      // Create address
      let addressID: string | undefined;
      if (
        coachData.address &&
        coachData.city &&
        coachData.state &&
        coachData.zip
      ) {
        const { data: addr } = await api.post('/users/address', {
          address1: coachData.address,
          city: coachData.city,
          state: coachData.state,
          zip: coachData.zip,
        });
        addressID = addr.id;
      }

      if (selection === 'no') {
        // Coach only
        const { data } = await api.post('/auth/signup', {
          email: coachData.email,
          password: coachData.password,
          fname: coachData.firstName,
          lname: coachData.lastName,
          phone: coachData.phone,
          role: 'COACH',
          coach: { addressID, teamCode: coachData.teamCode },
        });

        // Store tokens
        localStorage.setItem('accessToken', data.access);
        localStorage.setItem('refreshToken', data.refresh);

        await checkAuth();
        sessionStorage.removeItem('coachSignupData');
        navigate('/');
      } else {
        // Coach + Parent
        const { data } = await api.post('/auth/signup', {
          email: coachData.email,
          password: coachData.password,
          fname: coachData.firstName,
          lname: coachData.lastName,
          phone: coachData.phone,
          role: 'COACH',
          coach: { addressID, teamCode: coachData.teamCode },
          parent: { addressID },
        });

        // Store tokens
        localStorage.setItem('accessToken', data.access);
        localStorage.setItem('refreshToken', data.refresh);

        await checkAuth(); // Wait for checkAuth to complete
        sessionStorage.removeItem('coachSignupData');
        // Mark that we're in the add-player signup flow
        sessionStorage.setItem('inAddPlayerSignup', 'true');
        // Navigate to add-player flow after auth is complete
        navigate('/signup/add-player');
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(
        err.response?.data?.message ||
          'Failed to create account. Please try again.'
      );
    } finally {
      setLoading(false);
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
          <div className="relative bg-gradient-to-br from-neutral-900/50 to-neutral-950/50 backdrop-blur-sm rounded-2xl border border-[#57a4ff]/20 p-8 shadow-2xl">
            {/* Header */}
            <div className="mb-6">
              <button
                onClick={() => navigate('/signup/coach/team-code')}
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
                Coach Parent-Players?
              </h2>
              <p className="text-neutral-400 text-sm mb-6">
                Do you have any players you also wish to register as their
                parent?
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Options */}
            <div className="space-y-4 mb-6">
              <button
                onClick={() => setSelection('yes')}
                className={`w-full p-6 rounded-lg border-2 transition-all duration-300 text-left ${
                  selection === 'yes'
                    ? 'border-[#57a4ff] bg-[#57a4ff]/20'
                    : 'border-white/30 bg-white/5 hover:border-white/50'
                }`}
              >
                <p className="text-white font-semibold">
                  Yes, I also have players I want to register as a parent
                </p>
              </button>

              <button
                onClick={() => setSelection('no')}
                className={`w-full p-6 rounded-lg border-2 transition-all duration-300 text-left ${
                  selection === 'no'
                    ? 'border-[#57a4ff] bg-[#57a4ff]/20'
                    : 'border-white/30 bg-white/5 hover:border-white/50'
                }`}
              >
                <p className="text-white font-semibold">
                  No, just my coaching account
                </p>
              </button>
            </div>

            {selection && (
              <p className="text-neutral-400 text-sm mb-6 text-center">
                {selection === 'yes'
                  ? "Great! We'll gather information for the players you coach as well."
                  : "No problem—let's finish setting up your coach profile and move on."}
              </p>
            )}

            <button
              onClick={handleSubmit}
              disabled={!selection || loading}
              className="w-full px-8 py-4 bg-gradient-to-r from-[#57a4ff] via-[#6bb0ff] to-[#57a4ff] text-white font-black uppercase tracking-widest rounded-lg hover:shadow-[0_0_30px_rgba(87,164,255,0.6)] transition-all duration-300 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="relative z-10">
                {loading ? 'Creating Account...' : 'Continue'}
              </span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
