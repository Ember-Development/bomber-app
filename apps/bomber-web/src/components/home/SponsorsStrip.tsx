import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchSponsors, type SponsorFE } from '@/api/sponsor';

type Sponsor = {
  id?: string;
  title: string;
  logoUrl?: string | null;
  url?: string | null;
};

const SPEED_PX_PER_SEC = 140; // smooth on most devices; tweak if you like
const MIN_FOR_MARQUEE = 6; // fall back to grid if fewer than this

export default function SponsorsStrip() {
  const { data, isLoading, isError } = useQuery<SponsorFE[]>({
    queryKey: ['sponsors'],
    queryFn: fetchSponsors,
  });

  const sponsors: Sponsor[] = useMemo(
    () =>
      (data ?? []).filter(Boolean).map((s) => ({
        id: s.id,
        title: s.title,
        logoUrl: s.logoUrl,
        url: s.url,
      })),
    [data]
  );

  // Loading / empty / error states
  if (isLoading) return <LoadingSkeleton />;
  if (isError || sponsors.length === 0) return null;

  // If we don’t have many, just show a clean grid (no marquee)
  if (sponsors.length < MIN_FOR_MARQUEE) {
    return (
      <Section>
        <Title>PROUD SPONSORS</Title>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8 place-items-center">
          {sponsors.map((s: Sponsor, i: number) => (
            <LogoItem key={s.id ?? `s-${i}`} sponsor={s} />
          ))}
        </div>
      </Section>
    );
  }

  // Marquee
  return <Marquee sponsors={sponsors} />;
}

/* ------------------------ Pieces ------------------------ */

function Section({ children }: { children: React.ReactNode }) {
  return (
    <section className="mt-12 mx-4 md:mx-8 p-6 rounded-2xl bg-white/5 ring-1 ring-white/10 backdrop-blur-xl overflow-hidden relative">
      {children}
    </section>
  );
}

function Title({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-8 text-center text-[0.8rem] font-extrabold text-white/90 tracking-[0.18em] uppercase">
      <span className="drop-shadow-[0_0_10px_rgba(87,164,255,0.65)]">
        {children}
      </span>
    </h3>
  );
}

function LogoItem({ sponsor }: { sponsor: Sponsor }) {
  const img = (
    <img
      src={sponsor.logoUrl || '/images/logo-nb.svg'}
      alt={sponsor.title}
      className="h-10 w-auto opacity-70 hover:opacity-100 transition-transform duration-200 will-change-transform
                 hover:scale-[1.15] hover:rotate-[2deg] hover:drop-shadow-[0_0_12px_rgba(87,164,255,0.7)]"
      loading="lazy"
      draggable={false}
    />
  );

  return (
    <div className="px-6 flex items-center justify-center">
      {sponsor.url ? (
        <a
          href={sponsor.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Visit ${sponsor.title}`}
          className="focus:outline-none focus:ring-2 focus:ring-[#57a4ff]/70 rounded-lg"
        >
          {img}
        </a>
      ) : (
        img
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <Section>
      <Title>PROUD SPONSORS</Title>
      <div className="flex gap-8 justify-center">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-10 w-28 rounded-md bg-white/10 overflow-hidden relative"
          >
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </div>
        ))}
      </div>
      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </Section>
  );
}

function Marquee({ sponsors }: { sponsors: Sponsor[] }) {
  // duplicate enough times to cover seamless loop
  const trackRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [duration, setDuration] = useState(20); // set after measure
  const [paused, setPaused] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const list = useMemo(() => {
    // triple duplication gives ample coverage for wide screens
    return [...sponsors, ...sponsors, ...sponsors];
  }, [sponsors]);

  useEffect(() => {
    const measure = () => {
      if (!trackRef.current || !containerRef.current) return;
      const track = trackRef.current;
      // sum width of first third (one original set)
      const children = Array.from(track.children).slice(
        0,
        sponsors.length
      ) as HTMLElement[];
      const totalWidth = children.reduce((sum, el) => sum + el.offsetWidth, 0);
      // duration scales with width -> constant speed
      const seconds = Math.max(8, totalWidth / SPEED_PX_PER_SEC);
      setDuration(seconds);
    };

    // re-measure after images load and on resize
    const imgs = trackRef.current?.querySelectorAll('img') ?? [];
    let loaded = 0;
    imgs.forEach((img) => {
      if ((img as HTMLImageElement).complete) {
        loaded++;
      } else {
        img.addEventListener('load', () => {
          loaded++;
          if (loaded === imgs.length) measure();
        });
      }
    });
    // initial & resize
    measure();
    const ro = new ResizeObserver(measure);
    if (trackRef.current) ro.observe(trackRef.current);
    return () => ro.disconnect();
  }, [sponsors.length]);

  // Pause when off-screen
  useEffect(() => {
    if (!containerRef.current) return;
    const io = new IntersectionObserver(
      (entries) => setIsVisible(entries[0]?.isIntersecting ?? true),
      { threshold: 0.1 }
    );
    io.observe(containerRef.current);
    return () => io.disconnect();
  }, []);

  const shouldRun = isVisible && !paused;

  return (
    <Section>
      <Title>PROUD SPONSORS</Title>

      <div
        ref={containerRef}
        className="relative overflow-hidden"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        {/* edge fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 z-10 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 z-10 bg-gradient-to-l from-black/80 via-black/40 to-transparent" />

        {/* track */}
        <div
          ref={trackRef}
          className="flex items-center"
          style={
            {
              // CSS var for dynamic duration
              '--marquee-duration': `${duration}s`,
              animationPlayState: shouldRun ? 'running' : 'paused',
            } as React.CSSProperties
          }
        >
          <div className="marquee flex">
            {list.map((s, i) => (
              <LogoItem key={s.id ?? `s-${i}`} sponsor={s} />
            ))}
          </div>
        </div>
      </div>

      <style>{`
        /* marquee animation; we only translate by 33.333% (one set) for perfect loop */
        .marquee {
          animation: marquee var(--marquee-duration, 20s) linear infinite;
        }
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        /* Reduced motion: disable animation, center content */
        @media (prefers-reduced-motion: reduce) {
          .marquee { animation: none !important; }
        }
      `}</style>
    </Section>
  );
}
