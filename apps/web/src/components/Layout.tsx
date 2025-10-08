// src/components/Layout.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { MENU, FOOTER_MENU } from '@/constants/menu';
import {
  BellIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  EllipsisHorizontalIcon,
} from '@heroicons/react/24/outline';
import logoSrc from '@/assets/images/Bomber Script-White-ADMIN.png';
import { useAuth } from '@/context/AuthContext';
import type { UserFE } from '@bomber-app/database';

export default function Layout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { pathname } = useLocation();

  // ---- Derive names/initials safely ----
  const fullName = useMemo(() => {
    const fromParts = [user?.fname, user?.lname].filter(Boolean).join(' ');
    if (fromParts) return fromParts;
    if ((user as any)?.name) return (user as any).name as string;
    if (user?.email) return user.email.split('@')[0] as string;
    return 'User';
  }, [user]);

  const initials = useMemo(() => {
    const fromParts = [user?.fname?.[0] ?? '', user?.lname?.[0] ?? '']
      .join('')
      .trim();
    if (fromParts) return fromParts.toUpperCase();
    return (
      fullName
        .split(' ')
        .filter(Boolean)
        .map((p: string) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase() || 'U'
    );
  }, [user, fullName]);

  // ---- Lock scroll when drawer open (mobile) ----
  useEffect(() => {
    if (drawerOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [drawerOpen]);

  // ---- Mobile tabs: take the first few primary items ----
  const MOBILE_TABS = useMemo(() => {
    // Prefer explicit flags if you later add them; for now take 4 primary items.
    return MENU.slice(0, 4);
  }, []);

  const Sidebar = (
    <aside
      aria-label="Sidebar"
      className={`hidden md:fixed md:inset-y-0 md:left-0 md:z-30 md:flex group bg-[rgba(255,255,255,0.1)] backdrop-blur-xl border border-white/20 shadow-xl overflow-hidden transition-[width] duration-300 ${
        pinned ? 'md:w-52' : 'md:w-20 md:hover:w-52'
      }`}
    >
      <div className="flex flex-col h-full">
        <div className="px-2 border-b border-white/20 h-20 flex items-center justify-between gap-2">
          <img
            src={logoSrc}
            alt="Bombers Fastpitch"
            className="h-10 object-contain"
          />
          <button
            onClick={() => setPinned((v) => !v)}
            className="hidden md:flex p-2 rounded-lg hover:bg-white/10"
            aria-label={pinned ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {pinned ? (
              <ChevronDoubleLeftIcon className="w-5 h-5 text-white" />
            ) : (
              <ChevronDoubleRightIcon className="w-5 h-5 text-white" />
            )}
          </button>
        </div>

        <nav className="flex-1 px-2 py-6 space-y-1 overflow-y-auto custom-scrollbar">
          {MENU.map(({ name, path, Icon }) => (
            <NavLink
              key={name}
              to={path}
              end
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg transition-colors duration-200 px-3 py-2 ${
                  isActive
                    ? 'bg-[rgba(255,255,255,0.2)] text-white'
                    : 'text-white/70 hover:bg-[rgba(255,255,255,0.15)] hover:text-white'
                } ${pinned ? '' : 'justify-center md:group-hover:justify-start'}`
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span
                className={`${pinned ? 'inline' : 'hidden md:group-hover:inline'} font-medium truncate`}
              >
                {name}
              </span>
            </NavLink>
          ))}
        </nav>

        <div className="px-2 py-4 border-t border-white/20 space-y-1">
          {FOOTER_MENU.map(({ name, path, Icon }) => (
            <NavLink
              key={name}
              to={path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-white/60 hover:bg-[rgba(255,255,255,0.15)] hover:text-white ${
                pinned ? '' : 'justify-center md:group-hover:justify-start'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span
                className={`${pinned ? 'inline' : 'hidden md:group-hover:inline'} font-medium truncate`}
              >
                {name}
              </span>
            </NavLink>
          ))}
        </div>
      </div>
    </aside>
  );

  const MobileDrawer = (
    <div
      className={`md:hidden fixed inset-0 z-40 ${drawerOpen ? '' : 'pointer-events-none'}`}
    >
      <div
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity ${
          drawerOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={() => setDrawerOpen(false)}
      />
      <div
        className={`absolute inset-y-0 left-0 w-80 max-w-[85vw] bg-[rgba(255,255,255,0.08)] backdrop-blur-xl border-r border-white/20 shadow-2xl transform transition-transform duration-300 ${
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between h-20 px-4 border-b border-white/20">
          <img
            src={logoSrc}
            alt="Bombers Fastpitch"
            className="h-12 object-contain"
          />
          <button
            onClick={() => setDrawerOpen(false)}
            className="p-2 rounded-lg hover:bg-white/10"
          >
            <XMarkIcon className="w-6 h-6 text-white" />
          </button>
        </div>
        <nav className="px-3 py-4 space-y-2 overflow-y-auto h-[calc(100%-5rem)]">
          {MENU.map(({ name, path, Icon }) => (
            <NavLink
              key={name}
              to={path}
              end
              onClick={() => setDrawerOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ` +
                (isActive
                  ? 'bg-[rgba(255,255,255,0.2)] text-white'
                  : 'text-white/70 hover:bg-[rgba(255,255,255,0.15)] hover:text-white')
              }
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{name}</span>
            </NavLink>
          ))}
          <div className="border-t border-white/20 pt-3 mt-3 space-y-2">
            {FOOTER_MENU.map(({ name, path, Icon }) => (
              <NavLink
                key={name}
                to={path}
                onClick={() => setDrawerOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/60 hover:bg-[rgba(255,255,255,0.15)] hover:text-white"
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{name}</span>
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );

  // ---- Mobile bottom nav ----
  const MobileBottomNav = (
    <nav
      className={`md:hidden fixed bottom-0 inset-x-0 z-30 h-16 border-t border-white/15 bg-[rgba(20,20,28,0.75)] backdrop-blur-xl ${
        drawerOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      aria-label="Primary"
    >
      <ul className="grid grid-cols-5 h-full">
        {MOBILE_TABS.map(({ name, path, Icon }) => {
          const active = pathname === path;
          return (
            <li key={name} className="flex items-stretch">
              <NavLink
                to={path}
                end
                className={`flex-1 flex flex-col items-center justify-center text-[11px] transition ${
                  active ? 'text-white' : 'text-white/60 hover:text-white'
                }`}
              >
                <Icon
                  className={`h-5 w-5 ${active ? 'opacity-100' : 'opacity-80'}`}
                />
                <span className="mt-0.5 leading-none">{name}</span>
              </NavLink>
            </li>
          );
        })}
        {/* More opens drawer */}
        <li className="flex items-stretch">
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex-1 flex flex-col items-center justify-center text-[11px] text-white/60 hover:text-white"
            aria-label="More"
          >
            <EllipsisHorizontalIcon className="h-6 w-6" />
            <span className="mt-0.5 leading-none">More</span>
          </button>
        </li>
      </ul>
    </nav>
  );

  return (
    <div className="relative min-h-screen w-screen overflow-hidden bg-[#0b0b11] text-white">
      {/* Background glows to match Login */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(1200px_800px_at_20%_10%,rgba(135,180,255,0.6),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(900px_700px_at_80%_30%,rgba(100,200,255,0.45),transparent_65%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(65%_75%_at_50%_50%,transparent,rgba(0,0,0,0.12))]" />
      </div>

      <div className="relative z-10">
        {Sidebar}
        {MobileDrawer}
        {MobileBottomNav}

        <header
          className={`fixed top-0 left-0 z-20 w-full h-20 border-b border-white/20 bg-[rgba(255,255,255,0.05)] backdrop-blur-lg flex items-center justify-between ${
            pinned ? 'md:pl-52' : 'md:pl-20'
          }`}
        >
          {/* Left: logo (always visible) */}
          <div className=" hidden md:block">{''}</div>
          <div className="flex md:hidden items-center h-full pl-4">
            <img
              src={logoSrc}
              alt="Bomber Admin"
              className="h-10 object-contain md:h-12"
            />
          </div>

          {/* Right: cluster (mobile + desktop) */}
          <div className="flex items-center gap-2 pr-4 md:pr-10">
            {/* Mobile: hamburger */}

            {/* <button
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              aria-label="Notifications"
            >
              <BellIcon className="w-6 h-6 text-white" />
            </button> */}

            {/* User menu */}
            <div
              className="relative"
              tabIndex={0}
              onBlur={() => setTimeout(() => setUserMenuOpen(false), 120)}
            >
              <button
                onClick={() => setUserMenuOpen((v) => !v)}
                className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-semibold text-white hover:bg-white/30 transition"
                aria-haspopup="menu"
                aria-expanded={userMenuOpen}
                aria-label={`${fullName} menu`}
              >
                {initials}
              </button>

              {userMenuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-56 rounded-xl border border-white/15 bg-[rgba(15,15,25,0.9)] backdrop-blur-xl shadow-2xl overflow-hidden z-30"
                >
                  <div className="px-4 py-3 border-b border-white/10">
                    <div className="text-sm text-white/60">Signed in as</div>
                    <div className="mt-0.5 font-semibold truncate">
                      {fullName}
                    </div>
                  </div>
                  <button
                    role="menuitem"
                    onClick={() => {
                      setUserMenuOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-4 py-3 text-white/90 hover:bg-white/10 transition flex items-center gap-2"
                  >
                    <svg
                      className="w-5 h-5 opacity-80"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6A2.25 2.25 0 0 0 5.25 5.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"
                      />
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={() => setDrawerOpen(true)}
              className="p-2 m-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors md:hidden"
              aria-label="Open menu"
            >
              <Bars3Icon className="w-6 h-6 text-white" />
            </button>
          </div>
        </header>
        <main
          className={`relative pt-20 min-h-screen md:ml-20 ${pinned ? 'md:ml-52' : ''} pb-16 md:pb-0`}
        >
          {/* pb-16 ensures content is not hidden behind bottom nav on mobile */}
          <div className="min-h-[calc(100vh-80px)] overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="backdrop-blur-xl rounded-3xl p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-80px-2rem)]">
              <Outlet />
            </div>
          </div>
        </main>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 4px; }
      `}</style>
    </div>
  );
}
