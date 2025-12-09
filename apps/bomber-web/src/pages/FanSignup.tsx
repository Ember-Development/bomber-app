import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainNav from '@/components/layout/MainNav';
import SocialSidebar from '@/components/layout/SocialSidebar';
import { api } from '@/api/Client';
import { useAuth } from '@/contexts/AuthContext';

export default function FanSignup() {
  const navigate = useNavigate();
  const { checkAuth } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/signup', {
        email: email.trim(),
        password,
        fname: firstName.trim(),
        lname: lastName.trim(),
        phone: phone.trim(),
        role: 'FAN',
      });

      // If signup successful, check auth and navigate
      if (response.data) {
        // Refresh auth state
        await checkAuth();
        // Navigate to home
        navigate('/');
      }
    } catch (err: any) {
      console.error('Signup error', err);
      setError(
        err.response?.data?.message ||
          'There was a problem signing up. Please try again.'
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
        <div className="w-full max-w-2xl px-4">
          {/* Glow orbs */}
          <div className="absolute top-20 left-20 w-64 h-64 bg-[#57a4ff]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-64 h-64 bg-[#3b8aff]/10 rounded-full blur-3xl" />

          {/* Signup Form */}
          <div className="relative bg-gradient-to-br from-neutral-900/50 to-neutral-950/50 backdrop-blur-sm rounded-2xl border border-[#57a4ff]/20 p-8 shadow-2xl">
            {/* Header */}
            <div className="mb-8">
              <button
                onClick={() => navigate('/signup')}
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
                <span className="text-sm font-semibold">
                  Back to role selection
                </span>
              </button>

              <h2 className="text-2xl md:text-3xl font-black mb-2 text-white">
                Fan Signup
              </h2>
              <p className="text-neutral-400 text-sm">
                Let's create your Bomber Fan account!
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wider"
                  >
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-950/50 border border-[#57a4ff]/30 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-[#57a4ff] focus:ring-1 focus:ring-[#57a4ff] transition-all duration-300"
                    placeholder="John"
                  />
                </div>

                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wider"
                  >
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-950/50 border border-[#57a4ff]/30 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-[#57a4ff] focus:ring-1 focus:ring-[#57a4ff] transition-all duration-300"
                    placeholder="Doe"
                  />
                </div>
              </div>

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
                  autoComplete="email"
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wider"
                >
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-950/50 border border-[#57a4ff]/30 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-[#57a4ff] focus:ring-1 focus:ring-[#57a4ff] transition-all duration-300"
                  placeholder="(555) 555-5555"
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
                  autoComplete="new-password"
                />
                <p className="mt-1 text-xs text-neutral-500">
                  Must be at least 8 characters
                </p>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wider"
                >
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-950/50 border border-[#57a4ff]/30 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-[#57a4ff] focus:ring-1 focus:ring-[#57a4ff] transition-all duration-300"
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-8 py-4 bg-gradient-to-r from-[#57a4ff] via-[#6bb0ff] to-[#57a4ff] text-white font-black uppercase tracking-widest rounded-lg hover:shadow-[0_0_30px_rgba(87,164,255,0.6)] transition-all duration-300 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="relative z-10">
                  {loading ? 'Signing up...' : 'Sign Up'}
                </span>
                {!loading && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-6">
              <p className="text-xs text-neutral-400 text-center">
                By signing up you accept the{' '}
                <a
                  href="/terms"
                  className="text-[#57a4ff] hover:text-[#6bb0ff] underline transition-colors duration-300"
                >
                  Terms of Service
                </a>{' '}
                and{' '}
                <a
                  href="/privacy"
                  className="text-[#57a4ff] hover:text-[#6bb0ff] underline transition-colors duration-300"
                >
                  Privacy Policy
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
