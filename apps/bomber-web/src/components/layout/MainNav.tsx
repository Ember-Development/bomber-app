import { useScrollHeader } from '@/hooks/useScrollHeader';
import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

// SVG Icon Components
const PaymentIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
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
);

const InfoIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const TrophyIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
    />
  </svg>
);

const MediaIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
    />
  </svg>
);

const ResourcesIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
    />
  </svg>
);

const StoreIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
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
);

const ContactIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
    />
  </svg>
);

const TeamsIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
    />
  </svg>
);

// const RecruitIcon = ({ className }: { className?: string }) => (
//   <svg
//     className={className}
//     fill="none"
//     viewBox="0 0 24 24"
//     stroke="currentColor"
//   >
//     <path
//       strokeLinecap="round"
//       strokeLinejoin="round"
//       strokeWidth={2}
//       d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
//     />
//   </svg>
// );

const AcademyIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
    />
  </svg>
);

const HamburgerIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 6h16M4 12h16M4 18h16"
    />
  </svg>
);

const CloseIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

const LoginIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
    />
  </svg>
);

const LogoutIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
    />
  </svg>
);

const navItems = [
  {
    title: 'Payments',
    Icon: PaymentIcon,
    link: 'https://ryzer.com',
    external: true,
  },
  { title: 'About Us', Icon: InfoIcon, link: '/about' },
  { title: 'Teams', Icon: TeamsIcon, link: '/teams' },
  { title: 'Academy Teams', Icon: AcademyIcon, link: '/academy' },
  {
    title: 'Legacy',
    Icon: TrophyIcon,
    link: '#',
    hasDropdown: true,
    subItems: ['Commitments', 'Alumnis', 'History'],
  },
  {
    title: 'Media',
    Icon: MediaIcon,
    link: '#',
    hasDropdown: true,
    subItems: ['Articles', 'Videos'],
  },
  { title: 'Resources', Icon: ResourcesIcon, link: '#' },
  {
    title: 'Store',
    Icon: StoreIcon,
    link: 'https://www.bomberswebstore.com',
    external: true,
  },
  { title: 'Contact', Icon: ContactIcon, link: '/contact' },
];

export default function MainNav() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const compact = useScrollHeader(200);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // On mobile: always show TopBar
  // On desktop home page: show MinimalSideBar initially, then TopBar after scroll
  // On all other pages: always show TopBar
  const shouldShowTopBar = isMobile || !isHomePage || compact;

  return (
    <>
      {shouldShowTopBar ? (
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
      ) : (
        <MinimalSideBar />
      )}
      {sidebarOpen && <FullSideBar onClose={() => setSidebarOpen(false)} />}
    </>
  );
}

function MinimalSideBar() {
  return (
    <aside className="fixed left-0 top-0 z-[70] flex h-screen w-20 flex-col items-center justify-between bg-gradient-to-b from-neutral-900/95 to-black/95 text-white backdrop-blur-sm border-r border-[#57a4ff]/20">
      {/* Subtle glow orb */}
      <div className="absolute top-12 left-0 w-48 h-48 bg-[#57a4ff]/15 rounded-full blur-2xl animate-pulse" />

      <div className="mt-6 relative">
        {/* Logo */}
        <div className="relative group/logo">
          <div className="absolute inset-0 bg-[#57a4ff]/20 rounded-full blur-md opacity-0 group-hover/logo:opacity-100 transition-opacity duration-300" />
          <img
            src="https://res.cloudinary.com/duwgrvngn/image/upload/v1763068366/bomber-black-removebg-preview_tkvf3d.png"
            alt="Bombers"
            className="h-10 w-auto group-hover/logo:scale-110 group-hover/logo:drop-shadow-[0_0_12px_rgba(87,164,255,0.6)] transition-all duration-300"
          />
        </div>

        {/* Nav Buttons - just icons, no text */}
        <nav className="flex flex-col items-center gap-6 mt-12">
          {navItems
            .filter((item) => item.title !== 'Legacy' && item.title !== 'Media')
            .map((item) => {
              const IconComponent = item.Icon;
              return (
                <a
                  key={item.title}
                  href={item.link}
                  target={item.external ? '_blank' : undefined}
                  rel={item.external ? 'noopener noreferrer' : undefined}
                  title={item.title}
                  className="relative group/button"
                >
                  <div className="absolute inset-0 bg-[#57a4ff]/20 rounded-full blur-md opacity-0 group-hover/button:opacity-100 transition-opacity duration-300" />
                  <IconComponent className="w-6 h-6 text-white/70 group-hover/button:text-[#57a4ff] group-hover/button:scale-125 group-hover/button:drop-shadow-[0_0_8px_rgba(87,164,255,0.5)] transition-all duration-300" />
                </a>
              );
            })}
        </nav>
      </div>

      {/* Vertical Text */}
      <div
        className="mb-6 text-[10px] font-black tracking-widest text-[#57a4ff] drop-shadow-[0_0_8px_rgba(87,164,255,0.4)]"
        style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
      >
        <span className="bg-gradient-to-b from-[#57a4ff] to-[#6bb0ff] bg-clip-text text-transparent">
          BOMBERS
        </span>
      </div>
    </aside>
  );
}

function TopBar({ onMenuClick }: { onMenuClick: () => void }) {
  const [showSponsors, setShowSponsors] = useState(false);

  return (
    <header className="fixed left-0 right-0 top-0 z-[70] bg-gradient-to-r from-neutral-900/95 to-black/95 text-white backdrop-blur-sm border-b border-[#57a4ff]/20 shadow-lg">
      <div className="mx-auto flex h-16 max-w-8xl items-center justify-between px-4 md:px-6">
        {/* Left: Hamburger and Nav Links */}
        <div className="flex items-center gap-6">
          <button
            onClick={onMenuClick}
            className="relative group/button"
            aria-label="Menu"
          >
            <div className="absolute inset-0 bg-[#57a4ff]/20 rounded-lg blur-md opacity-0 group-hover/button:opacity-100 transition-opacity duration-300" />
            <HamburgerIcon className="w-6 h-6 text-white/85 group-hover/button:text-[#57a4ff] group-hover/button:scale-110 transition-all duration-300" />
          </button>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-extrabold uppercase tracking-wider">
            {[
              { text: 'About Us', link: '/about' },
              { text: 'Teams', link: '/teams' },
              { text: 'Academy Teams', link: '/academy' },
              {
                text: 'Store',
                link: 'https://www.bomberswebstore.com',
                external: true,
              },
              { text: 'Payments', link: 'https://ryzer.com', external: true },
            ].map((item) => (
              <a
                key={item.text}
                href={item.link}
                target={item.external ? '_blank' : undefined}
                rel={item.external ? 'noopener noreferrer' : undefined}
                className="relative group/link text-white/85"
              >
                <span className="group-hover/link:text-[#6bb0ff] group-hover/link:drop-shadow-[0_0_6px_rgba(87,164,255,0.4)] transition-all duration-300">
                  {item.text}
                </span>
                <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-[#57a4ff] to-[#3b8aff] opacity-0 group-hover/link:opacity-100 transition-opacity duration-300" />
              </a>
            ))}
          </nav>
        </div>

        {/* Center: Logo */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center">
          <Link to="/" className="relative group/logo">
            <div className="absolute inset-0 bg-[#57a4ff]/20 rounded-full blur-md opacity-0 group-hover/logo:opacity-100 transition-opacity duration-300 -inset-2" />
            <img
              src="https://res.cloudinary.com/duwgrvngn/image/upload/v1763068366/bomber-black-removebg-preview_tkvf3d.png"
              className="h-8 w-8 object-contain group-hover/logo:scale-110 group-hover/logo:drop-shadow-[0_0_10px_rgba(87,164,255,0.5)] transition-all duration-300"
              alt="Bombers"
            />
          </Link>
        </div>

        {/* Right Side */}
        {/* <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-3">
            <a
              href="https://www.newbalanceteam.com/login?startURL=%2F%3FteamStore%3Da4iVy000003XkDdIAK%26action%3Dadd%26display%3Dstore"
              target="_blank"
              rel="noopener noreferrer"
              className="relative group/sponsor"
            >
              <div className="absolute inset-0 bg-[#57a4ff]/20 blur-md opacity-0 group-hover/sponsor:opacity-100 transition-opacity duration-300" />
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/New_Balance_logo.svg/1200px-New_Balance_logo.svg.png"
                className="h-6 w-auto group-hover/sponsor:scale-105 group-hover/sponsor:drop-shadow-[0_0_8px_rgba(87,164,255,0.5)] transition-all duration-300"
                alt="New Balance"
              />
            </a>
          </div>

          <button
            onClick={() => setShowSponsors(!showSponsors)}
            aria-label="Sponsors"
            className="md:hidden relative group/button"
          >
            <div className="absolute inset-0 bg-[#57a4ff]/20 rounded-full blur-md opacity-0 group-hover/button:opacity-100 transition-opacity duration-300" />
            <div className="w-8 h-8 rounded-full bg-[#57a4ff]/20 flex items-center justify-center group-hover/button:bg-[#57a4ff]/30 transition-all duration-300">
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
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                />
              </svg>
            </div>
          </button>
        </div> */}

        {/* Mobile Sponsors Dropdown */}
        {showSponsors && (
          <div className="md:hidden absolute top-full mt-2 right-2 bg-neutral-900/95 backdrop-blur-sm border border-[#57a4ff]/20 rounded-lg p-4 shadow-2xl z-[100] min-w-[100px]">
            <div className="flex flex-col gap-4">
              <a
                href="https://www.newbalanceteam.com/login?startURL=%2F%3FteamStore%3Da4iVy000003XkDdIAK%26action%3Dadd%26display%3Dstore"
                target="_blank"
                rel="noopener noreferrer"
                className="relative group/sponsor flex justify-center"
                onClick={() => setShowSponsors(false)}
              >
                <div className="absolute inset-0 bg-[#57a4ff]/20 blur-md opacity-0 group-hover/sponsor:opacity-100 transition-opacity duration-300" />
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/New_Balance_logo.svg/1200px-New_Balance_logo.svg.png"
                  className="h-8 w-auto max-w-full group-hover/sponsor:scale-105 group-hover/sponsor:drop-shadow-[0_0_8px_rgba(87,164,255,0.5)] transition-all duration-300"
                  alt="New Balance"
                />
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#57a4ff] to-transparent opacity-60" />
    </header>
  );
}

function FullSideBar({ onClose }: { onClose: () => void }) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[80]"
        onClick={onClose}
      />

      {/* Full Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 z-[81] w-80 bg-gradient-to-b from-neutral-900/95 to-black/95 text-white backdrop-blur-sm border-r border-[#57a4ff]/20 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#57a4ff]/20">
          <Link to="/" onClick={onClose} className="flex items-center gap-4">
            <div className="relative group/logo">
              <div className="absolute inset-0 bg-[#57a4ff]/20 rounded-full blur-md opacity-0 group-hover/logo:opacity-100 transition-opacity duration-300" />
              <img
                src="https://res.cloudinary.com/duwgrvngn/image/upload/v1763068366/bomber-black-removebg-preview_tkvf3d.png"
                alt="Bombers"
                className="h-8 w-auto group-hover/logo:scale-110 group-hover/logo:drop-shadow-[0_0_12px_rgba(87,164,255,0.6)] transition-all duration-300"
              />
            </div>
            <span className="text-xl font-black tracking-widest text-[#57a4ff]">
              MENU
            </span>
          </Link>
          <button
            onClick={onClose}
            className="relative group/button"
            aria-label="Close"
          >
            <div className="absolute inset-0 bg-[#57a4ff]/20 rounded-lg blur-md opacity-0 group-hover/button:opacity-100 transition-opacity duration-300" />
            <CloseIcon className="w-6 h-6 text-white/85 group-hover/button:text-[#57a4ff] transition-all duration-300" />
          </button>
        </div>

        {/* Nav Items with Dropdowns */}
        <nav className="flex-1 flex flex-col p-4 gap-2 overflow-y-auto">
          {navItems.map((item) => {
            const IconComponent = item.Icon;
            const isOpen = openDropdown === item.title;

            return (
              <div key={item.title}>
                <a
                  href={item.link}
                  target={item.external ? '_blank' : undefined}
                  rel={item.external ? 'noopener noreferrer' : undefined}
                  onClick={(e) => {
                    if (item.hasDropdown) {
                      e.preventDefault();
                      setOpenDropdown(isOpen ? null : item.title);
                    }
                  }}
                  className="relative flex items-center gap-4 p-3 rounded-lg group/button hover:bg-[#57a4ff]/10 transition-all duration-300"
                >
                  <IconComponent className="w-6 h-6 text-white/70 group-hover/button:text-[#57a4ff] transition-colors duration-300" />
                  <span className="font-extrabold uppercase tracking-wider text-white/85 group-hover/button:text-[#57a4ff] transition-colors duration-300">
                    {item.title}
                  </span>
                  {item.hasDropdown && (
                    <span
                      className={`ml-auto text-[#57a4ff]/50 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                    >
                      ▼
                    </span>
                  )}
                  {item.external && (
                    <span className="ml-2 text-[#57a4ff]/50 text-xs">↗</span>
                  )}
                </a>

                {/* Dropdown Items */}
                {item.hasDropdown && isOpen && item.subItems && (
                  <div className="ml-4 space-y-1">
                    {item.subItems.map((subItem) => {
                      // Map Media subItems to correct routes
                      let href = `${item.link}/${subItem.toLowerCase()}`;
                      if (item.title === 'Media') {
                        if (subItem === 'Articles') href = '/articles';
                        else if (subItem === 'Videos') href = '/videos';
                      }
                      // Map Legacy subItems to correct routes
                      if (item.title === 'Legacy') {
                        if (subItem === 'Commitments') href = '/commitments';
                        else if (subItem === 'Alumnis') href = '/alumnis';
                        else if (subItem === 'History') href = '/history';
                      }

                      return (
                        <a
                          key={subItem}
                          href={href}
                          className="block p-2 pl-12 text-sm text-white/70 hover:text-[#57a4ff] hover:bg-[#57a4ff]/5 rounded transition-all duration-300"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          {subItem}
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Auth Section - Bottom */}
        <div className="p-4 border-t border-[#57a4ff]/20">
          {user ? (
            <div className="space-y-3">
              {/* User Info */}
              <div className="p-4 rounded-lg bg-gradient-to-r from-[#57a4ff]/10 to-[#3b8aff]/10 border border-[#57a4ff]/20">
                <div className="text-xs font-bold text-[#57a4ff]/70 uppercase tracking-wider mb-1">
                  Logged in as
                </div>
                <div className="font-black text-white uppercase tracking-wide">
                  {user.fname} {user.lname}
                </div>
                <div className="text-xs text-neutral-400 mt-1">
                  {user.email}
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="w-full relative flex items-center gap-4 p-4 rounded-lg bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/30 group/button hover:from-red-500/30 hover:to-red-600/30 transition-all duration-300"
              >
                <LogoutIcon className="w-6 h-6 text-red-400 group-hover/button:scale-110 transition-transform duration-300" />
                <span className="font-black uppercase tracking-widest text-red-400 group-hover/button:drop-shadow-[0_0_8px_rgba(239,68,68,0.5)] transition-all duration-300">
                  Logout
                </span>
                <span className="ml-auto text-red-400/50 text-xs">→</span>
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              onClick={onClose}
              className="relative flex items-center gap-4 p-4 rounded-lg bg-gradient-to-r from-[#57a4ff]/20 to-[#3b8aff]/20 border border-[#57a4ff]/30 group/button hover:from-[#57a4ff]/30 hover:to-[#3b8aff]/30 transition-all duration-300"
            >
              <LoginIcon className="w-6 h-6 text-[#57a4ff] group-hover/button:scale-110 transition-transform duration-300" />
              <span className="font-black uppercase tracking-widest text-[#57a4ff] group-hover/button:drop-shadow-[0_0_8px_rgba(87,164,255,0.5)] transition-all duration-300">
                Login
              </span>
              <span className="ml-auto text-[#57a4ff]/50 text-xs">→</span>
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
