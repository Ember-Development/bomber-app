import React, { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

export default function ResetSuccess() {
  const [sp] = useSearchParams();
  const email = useMemo(() => sp.get('email') ?? '', [sp]);

  // If you’ve configured Universal Links / App Links for /login,
  // this HTTPS link will open the native app when installed,
  // otherwise it lands on your web /login.
  const appOrWebLogin = `https://bomberadmin.net/login${email ? `?email=${encodeURIComponent(email)}` : ''}`;

  // Optional: your custom scheme for dev/manual open
  const schemeLogin = `myapp://login${email ? `?email=${encodeURIComponent(email)}` : ''}`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0f1c] to-[#1b2440] px-4 py-10">
      <div className="w-full max-w-md rounded-2xl backdrop-blur-xl bg-white/10 border border-white/15 shadow-2xl p-6 text-center">
        <h1 className="text-2xl font-semibold text-white">Password Reset</h1>
        <p className="text-sm text-white/70 mt-2">
          Your password has been updated{' '}
          {email ? (
            <>
              for <span className="text-white/90 font-medium">{email}</span>
            </>
          ) : null}
          .
        </p>

        <div className="mt-6 space-y-3">
          <a
            href={appOrWebLogin}
            className="block w-full rounded-xl bg-emerald-500/90 hover:bg-emerald-500 text-white font-medium py-2 transition"
          >
            Open Bomber App & Sign In
          </a>

          <Link
            to={`/login${email ? `?email=${encodeURIComponent(email)}` : ''}`}
            className="block w-full rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium py-2 transition border border-white/20"
            replace
          >
            Sign In on the Web
          </Link>

          <p className="text-[11px] text-white/50">
            Having trouble on mobile? Try the web button above or use the app
            link:
            <br />
            <span className="break-all text-white/70">{schemeLogin}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
