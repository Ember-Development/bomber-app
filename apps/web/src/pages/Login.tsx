import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import logoSrc from '@/assets/images/Bomber Script-White-ADMIN.png';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = useMemo(
    () => email.trim().length > 3 && password.trim().length >= 8 && !submitting,
    [email, password, submitting]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    try {
      setError('');
      setSubmitting(true);
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative grid min-h-screen w-screen place-items-center overflow-hidden bg-[#0b0b11] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(1200px_800px_at_20%_10%,rgba(135,180,255,0.6),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(900px_700px_at_80%_30%,rgba(100,200,255,0.45),transparent_65%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(65%_75%_at_50%_50%,transparent,rgba(0,0,0,0.12))]" />
      </div>

      {/* Card */}
      <form
        onSubmit={handleSubmit}
        aria-labelledby="login-title"
        className="relative w-[92vw] max-w-[420px] rounded-2xl border border-white/20 bg-white/10 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl"
      >
        {/* Header */}
        <div className="mb-3 grid place-items-center gap-2">
          <div className="grid h-12 w-12 place-items-center rounded-xl border border-white/20 bg-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]">
            <span className="text-2xl font-extrabold tracking-wide">B</span>
          </div>
          <img
            src={logoSrc}
            alt="Bombers Fastpitch"
            className="h-20 object-contain"
          />
          <p className="m-0 text-xs text-white/70">
            Secure access for administrators
          </p>
        </div>

        {/* Fields */}
        <div className="mt-4 grid gap-3">
          <label className="grid gap-2">
            <span className="text-xs text-white/80">Email</span>
            <input
              type="email"
              autoComplete="email"
              inputMode="email"
              required
              placeholder="you@bombers.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-3 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] outline-none placeholder:text-white/50 focus:border-white/40"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-xs text-white/80">Password</span>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                autoComplete="current-password"
                required
                minLength={8}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-3 pr-12 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] outline-none placeholder:text-white/50 focus:border-white/40"
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                aria-label={showPw ? 'Hide password' : 'Show password'}
                className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg border border-white/20 bg-white/10 hover:bg-white/20"
              >
                {showPw ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </label>

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-400/60 bg-red-500/15 px-3 py-2 text-xs text-red-200"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className="mt-1 w-full cursor-pointer rounded-xl border border-white/30 bg-white/20 px-4 py-3 font-semibold shadow-[0_6px_16px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.25)] transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Signing in…' : 'Sign In'}
          </button>

          <div className="mt-2 flex justify-center">
            <span className="text-[11px] text-white/60">
              Authorized users only.
            </span>
          </div>
        </div>
      </form>
    </div>
  );
}

/** Icons (no deps) */
function EyeIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}
function EyeOffIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M3 3l18 18" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M10.6 5.1A10.7 10.7 0 0 1 12 5c7 0 11 7 11 7a18.2 18.2 0 0 1-4.02 4.93M6.57 6.57C3.45 8.65 1 12 1 12s4 7 11 7c1.2 0 2.33-.19 3.37-.53"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}
