import { Link } from 'react-router-dom';

interface FooterItem {
  label: string;
  path: string;
  external?: boolean;
}

function FooterCol({ title, items }: { title: string; items: FooterItem[] }) {
  return (
    <div>
      <h4 className="text-sm font-extrabold tracking-widest text-blue-400 mb-4">
        {title}
      </h4>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.label}>
            {item.external ? (
              <a
                href={item.path}
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-300 hover:text-blue-400 transition-colors duration-200 text-sm font-medium"
              >
                {item.label}
              </a>
            ) : (
              <Link
                to={item.path}
                className="text-neutral-300 hover:text-blue-400 transition-colors duration-200 text-sm font-medium"
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function SiteFooter() {
  return (
    <footer className="relative mt-16 overflow-hidden bg-gradient-to-b from-neutral-950 via-neutral-900 to-black border-t border-blue-500/20">
      {/* Animated background effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-grid-white/[0.02]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        {/* Main content grid */}
        <div className="grid gap-12 md:grid-cols-4">
          {/* Brand section with logo */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <img
                src="https://firebasestorage.googleapis.com/v0/b/goatnet-4a76f.firebasestorage.app/o/Software%2Fbomber-black-removebg-preview_tkvf3d.png?alt=media&token=4306b239-298b-4387-9d18-e7deec6845c8"
                alt="Bombers Logo"
                className="h-14 w-14 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]"
              />
              <div>
                <h3 className="text-xl font-black text-white tracking-tight">
                  BOMBERS
                </h3>
                <p className="text-xs text-blue-400 font-semibold tracking-wider">
                  FASTPITCH
                </p>
              </div>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed max-w-xs">
              <span className="text-blue-400 font-semibold">
                TRAINING FACILITY
              </span>
              <br />
              6700 I-35
              <br />
              New Braunfels, TX 78130
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="h-10 w-10 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 hover:text-blue-300 transition-all hover:scale-110"
                aria-label="Instagram"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href="#"
                className="h-10 w-10 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 hover:text-blue-300 transition-all hover:scale-110"
                aria-label="Facebook"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Navigation columns */}
          <FooterCol
            title="Bombers"
            items={[
              { label: 'About Us', path: '/about' },
              { label: 'Teams', path: '/teams' },
              { label: 'News', path: '/articles' },
            ]}
          />
          <FooterCol
            title="Resources"
            items={[
              {
                label: 'Shop',
                path: 'https://www.bomberswebstore.com',
                external: true,
              },
              { label: 'Events', path: '/' },
              { label: 'Media', path: '/videos' },
            ]}
          />
          <FooterCol
            title="Connect"
            items={[
              { label: 'Contact', path: '/contact' },
              { label: 'Sponsors', path: '/' },
              { label: 'Commits', path: '/commitments' },
            ]}
          />
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-blue-500/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-white font-bold tracking-wider">
                BOMBERS FASTPITCH
              </span>
              <span className="text-neutral-600">•</span>
              <span className="text-neutral-500">
                Building Champions Since 2001
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <span>BUILT BY</span>
              <span className="font-bold text-blue-400 tracking-wider">
                EMBER DEVELOPMENT
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Subtle grid pattern - add to your global CSS if needed */}
      <style>{`
        .bg-grid-white\\/\\[0\\.02\\] {
          background-image: linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 64px 64px;
        }
      `}</style>
    </footer>
  );
}
