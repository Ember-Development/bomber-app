import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import MainNav from '@/components/layout/MainNav';
import SocialSidebar from '@/components/layout/SocialSidebar';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Login failed. Please try again.'
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
        {/* Dark overlay with gradient to blend with UI */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/85" />
        <div className="absolute inset-0 bg-neutral-950/60" />
      </div>

      <MainNav />
      <SocialSidebar />

      <main className="relative z-20 pt-32 pb-20 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-5xl px-4">
          {/* Glow orbs */}
          <div className="absolute top-20 left-20 w-64 h-64 bg-[#57a4ff]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-64 h-64 bg-[#3b8aff]/10 rounded-full blur-3xl" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Side - Benefits */}
            <div className="relative">
              <div className="sticky top-32">
                <div className="mb-6">
                  <div className="inline-flex items-center gap-2 mb-4 rounded-full bg-gradient-to-r from-[#57a4ff]/20 to-[#3b8aff]/20 px-4 py-1.5 backdrop-blur-sm border border-[#57a4ff]/30">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#57a4ff] animate-pulse" />
                    <span className="text-[10px] font-black tracking-widest text-[#57a4ff] uppercase">
                      Member Portal
                    </span>
                  </div>
                  <h1 className="text-4xl md:text-5xl font-black mb-4">
                    <span className="bg-gradient-to-r from-[#57a4ff] via-[#6bb0ff] to-[#57a4ff] bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(87,164,255,0.5)]">
                      WELCOME BACK
                    </span>
                  </h1>
                  <p className="text-neutral-400 text-lg">
                    Sign in to access your member benefits and streamline your
                    Bombers experience.
                  </p>
                </div>

                {/* Benefits */}
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-neutral-900/50 to-neutral-950/50 border border-[#57a4ff]/20">
                    <div className="w-10 h-10 rounded-full bg-[#57a4ff]/20 flex items-center justify-center shrink-0">
                      <svg
                        className="w-5 h-5 text-[#57a4ff]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-white mb-1">
                        Quick Checkout on Shop
                      </h3>
                      <p className="text-sm text-neutral-400">
                        Save your information for faster purchases at our team
                        store.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-neutral-900/50 to-neutral-950/50 border border-[#57a4ff]/20">
                    <div className="w-10 h-10 rounded-full bg-[#57a4ff]/20 flex items-center justify-center shrink-0">
                      <svg
                        className="w-5 h-5 text-[#57a4ff]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-white mb-1">
                        Quick Payment Options
                      </h3>
                      <p className="text-sm text-neutral-400">
                        Manage team fees, tournament payments, and more with
                        ease.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-neutral-900/50 to-neutral-950/50 border border-[#57a4ff]/20">
                    <div className="w-10 h-10 rounded-full bg-[#57a4ff]/20 flex items-center justify-center shrink-0">
                      <svg
                        className="w-5 h-5 text-[#57a4ff]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-white mb-1">
                        Access Team Information
                      </h3>
                      <p className="text-sm text-neutral-400">
                        View schedules, rosters, and important team updates.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="relative bg-gradient-to-br from-neutral-900/50 to-neutral-950/50 backdrop-blur-sm rounded-2xl border border-[#57a4ff]/20 p-8 shadow-2xl">
              {/* Header */}
              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-black mb-2 text-white">
                  Sign In
                </h2>
                <p className="text-neutral-400 text-sm">
                  Enter your credentials to continue
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wider"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-950/50 border border-[#57a4ff]/30 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-[#57a4ff] focus:ring-1 focus:ring-[#57a4ff] transition-all duration-300"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wider"
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-950/50 border border-[#57a4ff]/30 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-[#57a4ff] focus:ring-1 focus:ring-[#57a4ff] transition-all duration-300"
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-8 py-4 bg-gradient-to-r from-[#57a4ff] via-[#6bb0ff] to-[#57a4ff] text-white font-black uppercase tracking-widest rounded-lg hover:shadow-[0_0_30px_rgba(87,164,255,0.6)] transition-all duration-300 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="relative z-10">
                    {loading ? 'Logging in...' : 'Login'}
                  </span>
                  {!loading && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  )}
                </button>
              </form>

              {/* Footer */}
              <div className="mt-6 text-center">
                <a
                  href="#"
                  className="text-sm text-[#57a4ff] hover:text-[#6bb0ff] transition-colors duration-300"
                >
                  Forgot password?
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
