export default function SponsorsStrip() {
  // Array of logo paths (replace with actual sponsor logos)
  const logos = new Array(8).fill('/images/logo-nb.svg'); // Update with real logos

  return (
    <section className="mt-[3rem] p-6 rounded-2xl overflow-hidden">
      {/* Title with sharp neon glow */}
      <h3 className="mb-[2rem] text-center text-sm font-extrabold text-white tracking-[0.15em] uppercase drop-shadow-[0_0_8px_rgba(147,51,234,0.6)]">
        PROUD SPONSORS
      </h3>

      {/* Carousel container */}
      <div className="relative flex overflow-hidden">
        {/* Minimal fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />

        {/* Scrolling track */}
        <div className="flex animate-scroll will-change-transform">
          {/* First set of logos */}
          {logos.map((src, i) => (
            <div
              key={`first-${i}`}
              className="flex-shrink-0 px-5 transition-transform duration-200 hover:scale-125 hover:rotate-5"
            >
              <img
                src={src}
                className="h-9 w-auto opacity-60 hover:opacity-100 transition-all duration-200 hover:drop-shadow-[0_0_12px_rgba(147,51,234,0.7)]"
                alt={`Sponsor logo ${i + 1}`}
              />
            </div>
          ))}
          {/* Duplicate set for seamless loop */}
          {logos.map((src, i) => (
            <div
              key={`second-${i}`}
              className="flex-shrink-0 px-5 transition-transform duration-200 hover:scale-125 hover:rotate-5"
            >
              <img
                src={src}
                className="h-9 w-auto opacity-60 hover:opacity-100 transition-all duration-200 hover:drop-shadow-[0_0_12px_rgba(147,51,234,0.7)]"
                alt={`Sponsor logo ${i + 1}`}
              />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-scroll {
          animation: scroll 20s linear infinite;
          display: flex;
          will-change: transform;
        }

        .animate-scroll:hover {
          animation-play-state: paused;
        }

        /* Snappy logo hover effects */
        .flex-shrink-0 img {
          transition:
            transform 0.2s ease-out,
            opacity 0.2s ease-out,
            filter 0.2s ease-out;
        }

        .flex-shrink-0:hover img {
          transform: scale(1.25) rotate(5deg);
          filter: brightness(1.3) drop-shadow(0 0 12px rgba(147, 51, 234, 0.7));
        }

        /* Responsive tweaks */
        @media (max-width: 768px) {
          .flex-shrink-0 {
            padding-left: 0.75rem;
            padding-right: 0.75rem;
          }
          .flex-shrink-0 img {
            height: 2rem;
          }
        }
      `}</style>
    </section>
  );
}
