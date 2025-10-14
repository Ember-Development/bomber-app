import FadeIn from '../animation/FadeIn';

export default function AppPromoAndSocial() {
  const socialItems = [1, 2, 3].map((i) => ({
    id: i,
    img: '/images/sample-social.jpg', // Replace with actual social media images
    platform: i % 2 === 0 ? 'Instagram' : 'Facebook',
    url: '#', // Replace with actual social media URLs
  }));

  return (
    <section className="mt-[3rem] mx-8 p-6 md:p-10 rounded-3xl bg-neutral-900/95 shadow-2xl overflow-hidden relative">
      {/* Main background */}
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-black to-neutral-900" />

      {/* Image overlay */}
      <div className="absolute inset-0">
        <img
          src="/news/image3.jpg" // Dynamic sports action shot
          alt=""
          className="h-full w-full object-cover object-center opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
      </div>

      {/* Animated glow orbs */}
      <div className="absolute top-4 left-10 w-72 h-72 bg-[#57a4ff]/20 rounded-full blur-3xl animate-pulse" />
      <div
        className="absolute bottom-4 right-10 w-72 h-72 bg-[#3b8aff]/15 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: '1s' }}
      />

      {/* Content */}
      <div className="relative grid gap-6 md:grid-cols-[2fr_1fr] lg:p-12">
        {/* App Promo */}
        <div className="relative rounded-2xl bg-gradient-to-br from-[#57a4ff]/25 to-[#3b8aff]/15 p-8 text-white border border-[#57a4ff]/30 shadow-xl group hover:border-[#57a4ff]/60 transition-all duration-300">
          <FadeIn>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 w-fit rounded-full bg-gradient-to-r from-[#57a4ff]/30 to-[#3b8aff]/20 px-4 py-1.5 backdrop-blur-sm border border-[#57a4ff]/40 mb-4">
              <div className="h-2 w-2 rounded-full bg-[#57a4ff] animate-pulse" />
              <span className="text-[11px] font-black tracking-widest text-[#57a4ff] uppercase">
                Get the App
              </span>
            </div>

            {/* Title */}
            <h3 className="text-3xl md:text-4xl font-black leading-tight">
              <span className="bg-gradient-to-br from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(87,164,255,0.4)]">
                Bombers Fastpitch
              </span>
              <br />
              <span className="bg-gradient-to-r from-[#57a4ff] via-[#6bb0ff] to-[#57a4ff] bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(87,164,255,0.6)]">
                Official App
              </span>
            </h3>

            {/* Description */}
            <p className="mt-4 text-sm text-neutral-300 group-hover:text-white transition-colors duration-300 max-w-sm">
              Stay in the game with live updates, exclusive content, and team
              news right at your fingertips.
            </p>

            {/* Decorative line */}
            <div className="mt-4 h-1 w-20 bg-gradient-to-r from-[#57a4ff] to-transparent rounded-full" />

            {/* App Badges */}
            <div className="mt-6 flex items-center gap-4">
              <a href="#" className="group/appbadge relative">
                <div className="absolute inset-0 bg-[#57a4ff]/25 rounded-xl blur-md opacity-0 group-hover/appbadge:opacity-100 transition-opacity duration-400" />
                <img
                  src="/images/badges/google-play.svg"
                  className="h-12 w-auto group-hover/appbadge:scale-110 group-hover/appbadge:drop-shadow-[0_0_12px_rgba(87,164,255,0.6)] transition-all duration-400"
                  alt="Google Play"
                />
              </a>
              <a href="#" className="group/appbadge relative">
                <div className="absolute inset-0 bg-[#57a4ff]/25 rounded-xl blur-md opacity-0 group-hover/appbadge:opacity-100 transition-opacity duration-400" />
                <img
                  src="/images/badges/app-store.svg"
                  className="h-12 w-auto group-hover/appbadge:scale-110 group-hover/appbadge:drop-shadow-[0_0_12px_rgba(87,164,255,0.6)] transition-all duration-400"
                  alt="App Store"
                />
              </a>
            </div>

            {/* Shine effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-600">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-800" />
            </div>
          </FadeIn>
        </div>

        {/* Social Media */}
        <div className="relative rounded-2xl bg-neutral-950/80 p-6 border border-white/10 group hover:border-[#57a4ff]/60 transition-all duration-300">
          <FadeIn>
            <h3 className="text-sm font-extrabold tracking-[0.15em] text-white drop-shadow-[0_0_10px_rgba(87,164,255,0.5)] uppercase mb-4">
              Join the Bombers
            </h3>
            <div className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4">
              {socialItems.map((item) => (
                <a
                  key={item.id}
                  href={item.url}
                  className="snap-start shrink-0 w-[120px] md:w-[140px] rounded-xl overflow-hidden group/social relative"
                >
                  <img
                    src={item.img}
                    className="h-full w-full object-cover opacity-80 group-hover/social:opacity-100 group-hover/social:scale-105 transition-all duration-300"
                    alt={`${item.platform} post ${item.id}`}
                  />
                  <div className="absolute inset-0 bg-[#57a4ff]/20 blur-md opacity-0 group-hover/social:opacity-100 transition-opacity duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover/social:translate-x-full transition-transform duration-600" />
                  <div className="absolute bottom-2 left-2 text-xs font-semibold text-white bg-[#57a4ff]/50 rounded px-1.5 py-0.5">
                    {item.platform}
                  </div>
                </a>
              ))}
            </div>
          </FadeIn>
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#57a4ff] to-transparent opacity-60" />

      <style>{`
        /* Smooth scroll behavior for social media */
        .no-scrollbar {
          scrollbar-width: none; /* Firefox */
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none; /* Chrome, Safari */
        }

        /* Hover effects for containers */
        .group {
          transition: transform 0.3s ease-out, border-color 0.3s ease-out;
        }
        .group:hover {
          transform: translateY(-4px);
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          h3 {
            font-size: 2rem;
          }
          .no-scrollbar {
            gap: 0.75rem;
          }
          .snap-start {
            width: 100px;
          }
          .group/appbadge img {
            height: 2.5rem;
          }
        }
      `}</style>
    </section>
  );
}
