// src/pages/Layout.tsx
import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { MENU, FOOTER_MENU } from '@/constants/menu';
import { BellIcon } from '@heroicons/react/24/outline';
import logoSrc from '@/assets/images/Bomber Script-White-ADMIN.png';

const SIDEBAR_WIDTH = 288; // px
const HEADER_HEIGHT = 80; // px

export default function Layout() {
  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-[#5AA5FF] to-[#000000]">
      {/* Sidebar */}
      <aside
        className="fixed top-0 left-0 z-30 h-screen bg-[rgba(255,255,255,0.1)] backdrop-blur-xl border border-white/20 flex flex-col shadow-xl overflow-hidden"
        style={{ width: SIDEBAR_WIDTH }}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="px-6 py-4 border-b border-white/20 flex items-center justify-center shrink-0">
            <img
              src={logoSrc}
              alt="Bombers Fastpitch"
              className="h-10 w-auto object-contain"
            />
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-3 overflow-y-auto custom-scrollbar">
            {MENU.map(({ name, path, Icon }) => (
              <NavLink
                key={name}
                to={path}
                end
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ` +
                  (isActive
                    ? 'bg-[rgba(255,255,255,0.2)] text-white'
                    : 'text-white/70 hover:bg-[rgba(255,255,255,0.15)] hover:text-white')
                }
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{name}</span>
              </NavLink>
            ))}
          </nav>

          {/* Footer Menu */}
          <div className="px-4 py-6 border-t border-white/20 space-y-2 shrink-0">
            {FOOTER_MENU.map(({ name, path, Icon }) => (
              <NavLink
                key={name}
                to={path}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-white/50 hover:bg-[rgba(255,255,255,0.15)] hover:text-white transition-colors duration-200"
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{name}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </aside>

      {/* Header */}
      <header
        className="fixed top-0 left-0 z-20 w-full border-b border-white/20 bg-[rgba(255,255,255,0.05)] backdrop-blur-lg flex items-center justify-between"
        style={{ paddingLeft: SIDEBAR_WIDTH + 16, height: HEADER_HEIGHT }}
      >
        <div /> {/* spacer */}
        <div className="flex items-center space-x-4 mr-10">
          <button className="p-2 rounded-lg bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.2)] transition-colors">
            <BellIcon className="w-6 h-6 text-white" />
          </button>
          <div className="w-10 h-10 bg-[rgba(255,255,255,0.2)] rounded-full flex items-center justify-center font-medium text-white">
            JS
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main
        className="relative flex flex-col"
        style={{
          marginLeft: SIDEBAR_WIDTH + 16,
          paddingTop: HEADER_HEIGHT,
          height: `calc(100vh - ${HEADER_HEIGHT}px)`,
        }}
      >
        <div className="flex-1 overflow-y-auto p-8">
          <div className="backdrop-blur-xl rounded-3xl h-full p-6">
            <Outlet />
          </div>
        </div>
      </main>

      {/* Custom scrollbar */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.12);
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}
