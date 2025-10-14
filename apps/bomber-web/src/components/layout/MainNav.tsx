import { useScrollHeader } from '@/hooks/useScrollHeader';

/**
 * Left vertical navbar that morphs into a compact top bar on scroll,
 * matching the Texas Bombers' neon-charged, sporty aesthetic.
 */
export default function MainNav() {
  const compact = useScrollHeader(200);

  return compact ? <TopBar /> : <SideBar />;
}

function SideBar() {
  return (
    <aside className="fixed left-0 top-0 z-[70] flex h-screen w-20 flex-col items-center justify-between bg-gradient-to-b from-neutral-900/95 to-black/95 text-white backdrop-blur-sm border-r border-[#57a4ff]/20">
      {/* Subtle glow orb */}
      <div className="absolute top-12 left-0 w-48 h-48 bg-[#57a4ff]/15 rounded-full blur-2xl animate-pulse" />

      <div className="mt-6 relative">
        {/* Logo */}
        <div className="relative group/logo">
          <div className="absolute inset-0 bg-[#57a4ff]/20 rounded-full blur-md opacity-0 group-hover/logo:opacity-100 transition-opacity duration-300" />
          <img
            src="/bomber-icon.png"
            alt="Bombers"
            className="h-10 w-auto group-hover/logo:scale-110 group-hover/logo:drop-shadow-[0_0_12px_rgba(87,164,255,0.6)] transition-all duration-300"
          />
        </div>

        {/* Nav Buttons */}
        <nav className="flex flex-col items-center gap-6 mt-12">
          {[
            { title: 'Tickets', icon: '🎟️' },
            { title: 'Shop', icon: '🛍️' },
            { title: 'Teams', icon: '👥' },
            { title: 'Media', icon: '▶️' },
          ].map((item) => (
            <button
              key={item.title}
              title={item.title}
              className="relative text-xl group/button"
            >
              <div className="absolute inset-0 bg-[#57a4ff]/20 rounded-full blur-md opacity-0 group-hover/button:opacity-100 transition-opacity duration-300" />
              <span className="group-hover/button:scale-125 group-hover/button:drop-shadow-[0_0_8px_rgba(87,164,255,0.5)] transition-all duration-300">
                {item.icon}
              </span>
            </button>
          ))}
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

function TopBar() {
  return (
    <header className="fixed left-0 right-0 top-0 z-[70] bg-gradient-to-r from-neutral-900/95 to-black/95 text-white backdrop-blur-sm border-b border-[#57a4ff]/20 shadow-lg">
      <div className="mx-auto flex h-16 max-w-8xl items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-6">
          {/* Logo */}
          <div className="relative group/logo">
            <div className="absolute inset-0 bg-[#57a4ff]/20 rounded-full blur-md opacity-0 group-hover/logo:opacity-100 transition-opacity duration-300" />
            <img
              src="/bomber-icon.png"
              className="h-8 w-auto group-hover/logo:scale-110 group-hover/logo:drop-shadow-[0_0_10px_rgba(87,164,255,0.5)] transition-all duration-300"
              alt="Bombers"
            />
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-extrabold uppercase tracking-wider">
            {['Tickets', 'Shop', 'Teams', 'Video'].map((item) => (
              <a
                key={item}
                href="#"
                className="relative group/link text-white/85"
              >
                <span className="group-hover/link:text-[#6bb0ff] group-hover/link:drop-shadow-[0_0_6px_rgba(87,164,255,0.4)] transition-all duration-300">
                  {item}
                </span>
                <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-[#57a4ff] to-[#3b8aff] opacity-0 group-hover/link:opacity-100 transition-opacity duration-300" />
              </a>
            ))}
          </nav>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <a href="#" className="relative group/sponsor">
              <div className="absolute inset-0 bg-[#57a4ff]/20 blur-md opacity-0 group-hover/sponsor:opacity-100 transition-opacity duration-300" />
              <img
                src="/images/sponsor-adidas.svg"
                className="h-6 w-auto group-hover/sponsor:scale-105 group-hover/sponsor:drop-shadow-[0_0_8px_rgba(87,164,255,0.5)] transition-all duration-300"
                alt="Adidas"
              />
            </a>
            <a href="#" className="relative group/sponsor">
              <div className="absolute inset-0 bg-[#57a4ff]/20 blur-md opacity-0 group-hover/sponsor:opacity-100 transition-opacity duration-300" />
              <img
                src="/images/sponsor-jeep.svg"
                className="h-6 w-auto group-hover/sponsor:scale-105 group-hover/sponsor:drop-shadow-[0_0_8px_rgba(87,164,255,0.5)] transition-all duration-300"
                alt="Jeep"
              />
            </a>
          </div>
          <button
            aria-label="Search"
            className="relative group/button text-white/85"
          >
            <div className="absolute inset-0 bg-[#57a4ff]/20 rounded-full blur-md opacity-0 group-hover/button:opacity-100 transition-opacity duration-300" />
            <span className="group-hover/button:scale-125 group-hover/button:drop-shadow-[0_0_6px_rgba(87,164,255,0.5)] transition-all duration-300">
              🔍
            </span>
          </button>
          <button
            aria-label="Help"
            className="relative group/button text-white/85"
          >
            <div className="absolute inset-0 bg-[#57a4ff]/20 rounded-full blur-md opacity-0 group-hover/button:opacity-100 transition-opacity duration-300" />
            <span className="group-hover/button:scale-125 group-hover/button:drop-shadow-[0_0_6px_rgba(87,164,255,0.5)] transition-all duration-300">
              ❓
            </span>
          </button>
          <button
            aria-label="Account"
            className="relative group/button text-white/85"
          >
            <div className="absolute inset-0 bg-[#57a4ff]/20 rounded-full blur-md opacity-0 group-hover/button:opacity-100 transition-opacity duration-300" />
            <span className="group-hover/button:scale-125 group-hover/button:drop-shadow-[0_0_6px_rgba(87,164,255,0.5)] transition-all duration-300">
              👤
            </span>
          </button>
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#57a4ff] to-transparent opacity-60" />
    </header>
  );
}
