import { useQuery } from '@tanstack/react-query';
import { fetchArticles } from '@/api/article';
import FadeIn from '../animation/FadeIn';
import { Link, useNavigate } from 'react-router-dom';
import { useRef, useEffect, useState } from 'react';

export default function NewsRail() {
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['articles'],
    queryFn: fetchArticles,
  });

  const updateScrollButtons = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
  };

  const scrollLeft = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = container.clientWidth * 0.8;
    container.scrollBy({
      left: -scrollAmount,
      behavior: 'smooth',
    });
    // Update button states after a short delay to account for smooth scrolling
    setTimeout(updateScrollButtons, 300);
  };

  const scrollRight = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = container.clientWidth * 0.8;
    container.scrollBy({
      left: scrollAmount,
      behavior: 'smooth',
    });
    // Update button states after a short delay to account for smooth scrolling
    setTimeout(updateScrollButtons, 300);
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      // Only handle horizontal scrolling
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) {
        return; // Allow vertical scrolling to pass through
      }

      const { scrollLeft, scrollWidth, clientWidth } = container;
      const isAtStart = scrollLeft <= 1;
      const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 1;

      // If at boundaries, don't prevent default - allow page scroll
      if ((isAtStart && e.deltaX < 0) || (isAtEnd && e.deltaX > 0)) {
        return; // Let the event bubble for page-level scrolling
      }

      // Not at boundary, scroll the rail
      e.preventDefault();
      container.scrollLeft += e.deltaX;
    };

    const handleScroll = () => {
      updateScrollButtons();
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('scroll', handleScroll);

    // Initial check
    updateScrollButtons();

    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('scroll', handleScroll);
    };
  }, [articles.length]);

  if (isLoading) {
    return (
      <section className="relative z-[60] pt-20 md:-mt-[32vh] lg:-mt-[34vh] pb-12">
        <div className="mx-auto max-w-8xl px-4">
          <div className="text-white text-center">Loading articles...</div>
        </div>
      </section>
    );
  }

  if (articles.length === 0) {
    return (
      <section className="relative z-[60] pt-20 md:-mt-[32vh] lg:-mt-[34vh] pb-12">
        <div className="mx-auto max-w-8xl px-4">
          <div className="text-white text-center">No articles available</div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative z-[60] pt-20 md:-mt-[10vh] lg:-mt-[10vh] pb-12">
      {/* Main background */}

      {/* Image overlay */}

      {/* Animated glow orb (single, restrained) */}
      <div className="absolute top-8 left-4 md:left-12 w-48 md:w-64 h-48 md:h-64 bg-[#57a4ff]/15 rounded-full blur-2xl animate-pulse" />

      <div className="mx-auto max-w-8xl px-4 relative mt-12">
        {/* Edge fade (mask) */}
        <div
          className="relative"
          style={{
            WebkitMaskImage:
              'linear-gradient(to right, transparent 0, black 28px, black calc(100% - 28px), transparent 100%)',
            maskImage:
              'linear-gradient(to right, transparent 0, black 28px, black calc(100% - 28px), transparent 100%)',
          }}
        >
          <div
            ref={scrollContainerRef}
            className="no-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4"
            style={{ touchAction: 'pan-x pan-y' }}
          >
            {articles.map((a) => (
              <FadeIn key={a.id}>
                <article
                  className="
                    snap-start shrink-0
                    w-[60vw] sm:w-[38vw] md:w-[28vw] lg:w-[22vw] 2xl:w-[18vw]
                    overflow-hidden rounded-[22px]
                    shadow-[0_18px_52px_rgba(0,0,0,0.4)] border border-white/10
                    transition-all duration-300 will-change-transform hover:-translate-y-2 hover:border-[#57a4ff]/50
                    bg-neutral-950/80 group cursor-pointer
                  "
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/articles/${a.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      navigate(`/articles/${a.id}`);
                    }
                  }}
                >
                  <div className="relative aspect-[2/3]">
                    <img
                      src={a.imageUrl || '/news/image.png'}
                      alt={a.title}
                      className="h-full w-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                      loading="lazy"
                    />
                    {/* Title gradient tray */}
                    <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-3 text-white">
                      <h3 className="text-sm md:text-base lg:text-lg font-extrabold uppercase leading-tight drop-shadow-[0_0_8px_rgba(87,164,255,0.5)]">
                        {a.title}
                      </h3>
                      <Link
                        to={`/articles/${a.id}`}
                        className="mt-2 inline-block rounded bg-gradient-to-r from-[#57a4ff] to-[#3b8aff] px-3 py-1.5 text-xs font-black uppercase tracking-widest text-white hover:bg-[#6bb0ff] transition-colors duration-300"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Read Article
                      </Link>
                    </div>
                    {/* Shine effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-600" />
                    </div>
                  </div>
                </article>
              </FadeIn>
            ))}
          </div>
        </div>

        {/* Rail controls */}
        <div className="mt-6 flex gap-4 pl-1">
          <button
            onClick={scrollLeft}
            disabled={!canScrollLeft}
            className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-[#57a4ff]/20 to-[#3b8aff]/20 backdrop-blur-sm border border-[#57a4ff]/30 text-white hover:border-[#57a4ff]/60 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-[#57a4ff]/30"
            aria-label="Scroll left"
          >
            ←
          </button>
          <button
            onClick={scrollRight}
            disabled={!canScrollRight}
            className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-[#57a4ff]/20 to-[#3b8aff]/20 backdrop-blur-sm border border-[#57a4ff]/30 text-white hover:border-[#57a4ff]/60 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-[#57a4ff]/30"
            aria-label="Scroll right"
          >
            →
          </button>
        </div>

        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#57a4ff] to-transparent opacity-60" />
      </div>

      <style>{`
        /* Smooth scroll behavior */
        .no-scrollbar {
          scrollbar-width: none; /* Firefox */
          touch-action: pan-x pan-y;
          overscroll-behavior-x: none;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none; /* Chrome, Safari */
        }

        /* Hover effects for articles */
        article {
          transition: transform 0.3s ease-out, border-color 0.3s ease-out, opacity 0.3s ease-out;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .w-[70vw] {
            width: 65vw;
          }
        }
      `}</style>
    </section>
  );
}
