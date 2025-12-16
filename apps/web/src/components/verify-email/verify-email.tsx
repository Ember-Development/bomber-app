import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '@/api/api';

export default function VerifyEmail() {
  const [sp] = useSearchParams();

  const token = useMemo(() => sp.get('token') ?? '', [sp]);
  const email = useMemo(() => sp.get('email') ?? '', [sp]);

  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>(
    'verifying'
  );
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (token && email) {
      verifyEmail();
    } else {
      setStatus('error');
      setErrorMessage('Missing verification token or email.');
    }
  }, [token, email]);

  async function verifyEmail() {
    try {
      const response = await api.get('/api/email-verification/verify', {
        params: { token, email },
      });

      if (response.data.success) {
        setStatus('success');
        // Try to open the app after a brief delay
        setTimeout(() => {
          tryOpenApp();
        }, 1500);
      }
    } catch (err: any) {
      setStatus('error');
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        'Failed to verify email. The link may be invalid or expired.';
      setErrorMessage(String(msg));
    }
  }

  function tryOpenApp() {
    // Try to open the mobile app
    const deepLink = 'bomber://home';
    window.location.href = deepLink;
  }

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-gradient-to-br from-[#0a0f1c] to-[#1b2440] px-4 py-10">
      <div className="w-full max-w-md rounded-2xl backdrop-blur-xl bg-white/10 border border-white/15 shadow-2xl p-8 text-center">
        {status === 'verifying' && (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-12 h-12 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin" />
            </div>
            <h1 className="text-2xl font-semibold text-white">
              Verifying your email...
            </h1>
            <p className="text-sm text-white/70 mt-2">
              Please wait while we confirm your email address.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-emerald-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-semibold text-white">
              Email Verified! ✅
            </h1>
            <p className="text-sm text-white/70 mt-2">
              Your email has been successfully verified.
              {email && (
                <>
                  <br />
                  <span className="text-white/90 font-medium">{email}</span>
                </>
              )}
            </p>
            <p className="text-sm text-white/50 mt-4">
              You can now close this window and return to the app.
            </p>
            <button
              onClick={tryOpenApp}
              className="mt-6 w-full rounded-xl bg-indigo-500/90 hover:bg-indigo-500 text-white font-medium py-3 transition"
            >
              Open Bomber App
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-semibold text-white">
              Verification Failed
            </h1>
            <p className="text-sm text-red-300 mt-2">{errorMessage}</p>
            <p className="text-sm text-white/50 mt-4">
              Please try requesting a new verification email from the app.
            </p>
            <button
              onClick={tryOpenApp}
              className="mt-6 w-full rounded-xl bg-indigo-500/90 hover:bg-indigo-500 text-white font-medium py-3 transition"
            >
              Open Bomber App
            </button>
          </>
        )}
      </div>
    </div>
  );
}
