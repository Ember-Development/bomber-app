import React, { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

export default function ResetSuccess() {
  const [sp] = useSearchParams();
  const email = useMemo(() => sp.get('email') ?? '', [sp]);

  const appOrWebLogin = `https://bomberadmin.net/login${
    email ? `?email=${encodeURIComponent(email)}` : ''
  }`;

  const schemeLogin = `myapp://login${
    email ? `?email=${encodeURIComponent(email)}` : ''
  }`;

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-gradient-to-br from-[#0a0f1c] to-[#1b2440] px-4 py-10">
      <div className="w-full max-w-md rounded-2xl backdrop-blur-xl bg-white/10 border border-white/15 shadow-2xl p-6 text-center">
        <h1 className="text-2xl font-semibold text-white">
          Password Reset Successful.
        </h1>

        <p className="text-sm text-white/70 mt-2">
          Your password has been updated
          {email && (
            <>
              {' '}
              for <span className="text-white/90 font-medium">{email}</span>
            </>
          )}
          . You can now sign in with your new credentials.
        </p>
      </div>
    </div>
  );
}
