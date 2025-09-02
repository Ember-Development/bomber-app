import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { api } from '@/api/api';

function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export default function ResetPassword() {
  const navigate = useNavigate();
  const [sp] = useSearchParams();

  const initialEmail = useMemo(() => sp.get('email') ?? '', [sp]);
  const initialToken = useMemo(() => sp.get('token') ?? '', [sp]);

  const [email, setEmail] = useState(initialEmail);
  const [token, setToken] = useState(initialToken);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Keep inputs in sync if URL changes (e.g., user pastes a link)
  useEffect(() => {
    setEmail(initialEmail);
    setToken(initialToken);
  }, [initialEmail, initialToken]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors(null);
    setSuccess(null);

    const eLower = email.trim().toLowerCase();

    if (!token || token.length < 16) {
      setErrors('Your reset link is invalid or missing the token.');
      return;
    }
    if (!isEmail(eLower)) {
      setErrors('Please enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      setErrors('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setErrors('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', {
        email: eLower,
        token,
        password,
      });

      navigate(`/reset-success?email=${encodeURIComponent(eLower)}`, {
        replace: true,
      });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Invalid or expired link.';
      setErrors(String(msg));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0f1c] to-[#1b2440] px-4 py-10">
      <div className="w-full max-w-md rounded-2xl backdrop-blur-xl bg-white/10 border border-white/15 shadow-2xl p-6">
        <h1 className="text-2xl font-semibold text-white text-center">
          Reset Password
        </h1>
        <p className="text-sm text-white/70 text-center mt-2">
          Choose a new password for your account.
        </p>

        {errors && (
          <div className="mt-4 text-sm rounded-lg border border-red-400/30 bg-red-500/10 text-red-200 px-3 py-2">
            {errors}
          </div>
        )}
        {success && (
          <div className="mt-4 text-sm rounded-lg border border-emerald-400/30 bg-emerald-500/10 text-emerald-200 px-3 py-2">
            {success}
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="block text-xs uppercase tracking-wide text-white/70 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              readOnly={Boolean(initialEmail)}
              className="w-full rounded-xl bg-white/10 border border-white/20 px-3 py-2 text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-indigo-400/60"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wide text-white/70 mb-1">
              Reset Token
            </label>
            <input
              value={token}
              onChange={(e) => setToken(e.target.value)}
              readOnly={Boolean(initialToken)}
              className="w-full rounded-xl bg-white/10 border border-white/20 px-3 py-2 text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-indigo-400/60"
              placeholder="Paste token from link"
            />
            <p className="text-[11px] text-white/50 mt-1">
              Tip: this is auto-filled when you click the email link.
            </p>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wide text-white/70 mb-1">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus={Boolean(initialToken && initialEmail)}
                autoComplete="new-password"
                className="w-full rounded-xl bg-white/10 border border-white/20 px-3 py-2 text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-indigo-400/60 pr-10"
                placeholder="At least 8 characters"
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-white/70 text-xs"
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                {showPw ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wide text-white/70 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
                className="w-full rounded-xl bg-white/10 border border-white/20 px-3 py-2 text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-indigo-400/60 pr-10"
                placeholder="Re-enter new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-white/70 text-xs"
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
              >
                {showConfirm ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-indigo-500/90 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-2 transition"
          >
            {loading ? 'Resetting…' : 'Reset Password'}
          </button>

          <Link
            to="/login"
            className="block text-center text-white/80 hover:text-white text-sm"
            replace
          >
            Back to Login
          </Link>
        </form>
      </div>
    </div>
  );
}
