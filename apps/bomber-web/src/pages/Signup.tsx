import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainNav from '@/components/layout/MainNav';
import SocialSidebar from '@/components/layout/SocialSidebar';

interface Role {
  key: string;
  label: string;
  description: string;
  icon: string; // SVG path or icon name
}

const roles: Role[] = [
  {
    key: 'PLAYER',
    label: 'Player',
    description: 'Join as a player and access your team information',
    icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  },
  {
    key: 'PARENT',
    label: 'Parent/Guardian',
    description: "Manage your child's team information and payments",
    icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
  },
  {
    key: 'COACH',
    label: 'Coach',
    description: 'Access coaching tools and team management',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  },
  {
    key: 'FAN',
    label: 'Fan',
    description: 'Stay connected with team news and updates',
    icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
  },
];

export default function Signup() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const handleRoleSelect = (roleKey: string) => {
    setSelectedRole(roleKey);
    // Navigate to appropriate signup form based on role
    if (roleKey === 'PLAYER') {
      navigate('/signup/player/team-code');
    } else if (roleKey === 'FAN') {
      navigate('/signup/fan');
    } else if (roleKey === 'COACH') {
      navigate('/signup/coach');
    } else if (roleKey === 'PARENT') {
      navigate('/signup/parent');
    } else {
      // For other roles, you can add later
      navigate(`/signup/${roleKey.toLowerCase()}`, {
        state: { role: roleKey },
      });
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

          <div className="flex flex-col gap-8">
            {/* Header Section */}
            <div className="relative text-center">
              <div className="mb-6">
                <div className="inline-flex items-center gap-2 mb-4 rounded-full bg-gradient-to-r from-[#57a4ff]/20 to-[#3b8aff]/20 px-4 py-1.5 backdrop-blur-sm border border-[#57a4ff]/30">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#57a4ff] animate-pulse" />
                  <span className="text-[10px] font-black tracking-widest text-[#57a4ff] uppercase">
                    Member Portal
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black mb-4">
                  <span className="bg-gradient-to-r from-[#57a4ff] via-[#6bb0ff] to-[#57a4ff] bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(87,164,255,0.5)]">
                    JOIN THE TEAM
                  </span>
                </h1>
                <p className="text-neutral-400 text-lg">
                  Create your account and become part of the Bombers community.
                  Choose your role to get started.
                </p>
              </div>
            </div>

            {/* Create Account Box */}
            <div className="relative bg-gradient-to-br from-neutral-900/50 to-neutral-950/50 backdrop-blur-sm rounded-2xl border border-[#57a4ff]/20 p-8 shadow-2xl max-w-2xl mx-auto w-full">
              {/* Header */}
              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-black mb-2 text-white">
                  Create Account
                </h2>
                <p className="text-neutral-400 text-sm">
                  Choose your role to get started
                </p>
              </div>

              {/* Role Selection Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {roles.map((role) => (
                  <button
                    key={role.key}
                    onClick={() => handleRoleSelect(role.key)}
                    className={`relative p-6 rounded-xl border-2 transition-all duration-300 text-left group ${
                      selectedRole === role.key
                        ? 'border-[#57a4ff] bg-[#57a4ff]/10 shadow-[0_0_20px_rgba(87,164,255,0.3)]'
                        : 'border-[#57a4ff]/30 bg-neutral-900/30 hover:border-[#57a4ff]/50 hover:bg-neutral-900/50'
                    }`}
                  >
                    <div className="flex flex-col items-start gap-3">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-300 ${
                          selectedRole === role.key
                            ? 'bg-[#57a4ff]/20'
                            : 'bg-[#57a4ff]/10 group-hover:bg-[#57a4ff]/20'
                        }`}
                      >
                        <svg
                          className={`w-6 h-6 transition-colors duration-300 ${
                            selectedRole === role.key
                              ? 'text-[#57a4ff]'
                              : 'text-[#57a4ff]/70 group-hover:text-[#57a4ff]'
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={role.icon}
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-bold text-white mb-1 text-lg">
                          {role.label}
                        </h3>
                        <p className="text-xs text-neutral-400">
                          {role.description}
                        </p>
                      </div>
                    </div>
                    {selectedRole === role.key && (
                      <div className="absolute top-2 right-2">
                        <div className="w-6 h-6 rounded-full bg-[#57a4ff] flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Footer */}
              <div className="mt-6 space-y-3">
                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-gradient-to-br from-neutral-900/50 to-neutral-950/50 px-2 text-neutral-400">
                      Already have an account?
                    </span>
                  </div>
                </div>

                {/* Login Button */}
                <button
                  onClick={() => navigate('/login')}
                  className="w-full px-8 py-3 bg-transparent border-2 border-[#57a4ff]/50 text-[#57a4ff] font-bold uppercase tracking-widest rounded-lg hover:bg-[#57a4ff]/10 hover:border-[#57a4ff] transition-all duration-300"
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
