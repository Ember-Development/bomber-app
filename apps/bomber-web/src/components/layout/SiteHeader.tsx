import { useScrollHeader } from '@/hooks/useScrollHeader';

export default function SiteHeader() {
  const isSolid = useScrollHeader(64); // solid after 64px
  return (
    <header
      className={`fixed top-0 left-0 right-0 z-20 transition-colors duration-300 ${
        isSolid
          ? 'bg-black/80 backdrop-blur supports-[backdrop-filter]:bg-black/65'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mt-4 rounded-2xl text-white shadow-lg ring-1 ring-white/10">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-white/10 grid place-items-center ring-1 ring-white/15">
                <span className="text-sm font-semibold">B</span>
              </div>
              <nav className="hidden md:flex items-center gap-6 text-sm">
                {['About Us', 'Shop', 'Teams', 'News'].map((item) => (
                  <a
                    key={item}
                    href="#"
                    className="opacity-90 hover:opacity-100 uppercase tracking-wide"
                  >
                    {item}
                  </a>
                ))}
              </nav>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <a className="opacity-90 hover:opacity-100" href="#">
                ?
              </a>
              <a className="opacity-90 hover:opacity-100" href="#">
                Login
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
