import FadeIn from '../animation/FadeIn';

export default function NewsRail() {
  const articles = [
    { id: 1, title: 'Medical Update | Player Name', img: '/news/image.png' },
    { id: 2, title: 'International Recap', img: '/news/image2.jpg' },
    { id: 3, title: 'Press Room | Comments', img: '/news/image3.jpg' },
    { id: 4, title: 'Match Result | Headline', img: '/news/image2.jpg' },
    { id: 5, title: 'Stories of Strength', img: '/news/image.png' },
  ];

  return (
    <section className="relative z-[60] -mt-[20vh] sm:-mt-[22vh] md:-mt-[24vh] lg:-mt-[26vh] pb-12">
      {/* Main background */}

      {/* Image overlay */}

      {/* Animated glow orb (single, restrained) */}
      <div className="absolute top-8 left-12 w-64 h-64 bg-[#57a4ff]/15 rounded-full blur-2xl animate-pulse" />

      <div className="mx-auto max-w-8xl px-4 relative">
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
          <div className="no-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4">
            {articles.map((a) => (
              <FadeIn key={a.id}>
                <article
                  className="
                    snap-start shrink-0
                    w-[78vw] sm:w-[54vw] md:w-[38vw] lg:w-[28vw] 2xl:w-[24vw]
                    overflow-hidden rounded-[22px]
                    shadow-[0_18px_52px_rgba(0,0,0,0.4)] border border-white/10
                    transition-all duration-300 will-change-transform hover:-translate-y-2 hover:border-[#57a4ff]/50
                    bg-neutral-950/80 group
                  "
                >
                  <div className="relative aspect-[2/3]">
                    <img
                      src={a.img}
                      alt={a.title}
                      className="h-full w-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                      loading="lazy"
                    />
                    {/* Title gradient tray */}
                    <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                      <h3 className="text-xl font-extrabold uppercase leading-tight drop-shadow-[0_0_8px_rgba(87,164,255,0.5)]">
                        {a.title}
                      </h3>
                      <a
                        href="#"
                        className="mt-3 inline-block rounded bg-gradient-to-r from-[#57a4ff] to-[#3b8aff] px-4 py-2 text-xs font-black uppercase tracking-widest text-white hover:bg-[#6bb0ff] transition-colors duration-300"
                      >
                        Read Article
                      </a>
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
          <button className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-[#57a4ff]/20 to-[#3b8aff]/20 backdrop-blur-sm border border-[#57a4ff]/30 text-white hover:border-[#57a4ff]/60 transition-all duration-300">
            ←
          </button>
          <button className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-[#57a4ff]/20 to-[#3b8aff]/20 backdrop-blur-sm border border-[#57a4ff]/30 text-white hover:border-[#57a4ff]/60 transition-all duration-300">
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
          h3 {
            font-size: 1.5rem;
          }
          .w-[78vw] {
            width: 70vw;
          }
        }
      `}</style>
    </section>
  );
}
