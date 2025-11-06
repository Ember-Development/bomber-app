import FadeIn from '../animation/FadeIn';
import { useQuery } from '@tanstack/react-query';
import { fetchAllSocialPosts } from '@/api/social';
import { Link } from 'react-router-dom';

export default function AppPromoAndSocial() {
  // Fetch all social media posts (Instagram + Facebook)
  const { data: posts = [] } = useQuery({
    queryKey: ['social-posts'],
    queryFn: fetchAllSocialPosts,
  });

  // Use social posts or fallback to placeholder images
  const socialItems =
    posts.length > 0
      ? posts.slice(0, 4).map((post) => ({
          id: post.id,
          img: post.mediaUrl,
          platform: post.platform,
          url: post.permalink,
        }))
      : [
          { id: 1, img: '/news/image.png', platform: 'Instagram', url: '#' },
          { id: 2, img: '/news/image2.jpg', platform: 'Facebook', url: '#' },
          { id: 3, img: '/news/image3.jpg', platform: 'Instagram', url: '#' },
          { id: 4, img: '/news/image2.jpg', platform: 'Twitter', url: '#' },
        ];

  return (
    <section className="mt-[3rem] mx-4 md:mx-8 p-6 md:p-10 rounded-3xl bg-neutral-900/95 shadow-2xl overflow-hidden relative">
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
      <div className="relative grid gap-6 md:grid-cols-[2fr_1fr] lg:p-12 md:items-stretch">
        {/* Left Column - App Promo and Become a Bomber */}
        <div className="flex flex-col gap-4 justify-between">
          {/* App Promo */}
          <div className="relative rounded-2xl bg-gradient-to-br from-[#57a4ff]/25 to-[#3b8aff]/15 p-8 text-white border border-[#57a4ff]/30 shadow-xl group hover:border-[#57a4ff]/60 transition-all duration-300 h-fit">
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
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <a
                  href="https://play.google.com/store/apps"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/appbadge relative inline-flex items-center bg-black/40 hover:bg-black/60 border border-white/20 hover:border-[#57a4ff]/50 rounded-xl px-4 py-3 transition-all duration-300 hover:scale-105"
                >
                  <div className="absolute inset-0 bg-[#57a4ff]/25 rounded-xl blur-md opacity-0 group-hover/appbadge:opacity-100 transition-opacity duration-400" />
                  <svg
                    className="w-6 h-6 mr-2"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L14.56,17.15L12.26,14.85L14.56,12.85L16.81,15.12L20.16,10.81M17.72,8.12L13.69,12L17.72,15.88L13.54,12.85L17.72,8.12M6.05,2.66L16.81,8.88L14.54,11.15L13.69,10.31L6.05,2.66Z" />
                  </svg>
                  <span className="text-white font-semibold text-sm">
                    Google Play
                  </span>
                </a>
                <a
                  href="https://www.apple.com/app-store/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/appbadge relative inline-flex items-center bg-black/40 hover:bg-black/60 border border-white/20 hover:border-[#57a4ff]/50 rounded-xl px-4 py-3 transition-all duration-300 hover:scale-105"
                >
                  <div className="absolute inset-0 bg-[#57a4ff]/25 rounded-xl blur-md opacity-0 group-hover/appbadge:opacity-100 transition-opacity duration-400" />
                  <svg
                    className="w-6 h-6 mr-2"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.09,16.67C20.06,16.74 19.67,18.11 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.46 12.36,4.26 13,3.5Z" />
                  </svg>
                  <span className="text-white font-semibold text-sm">
                    App Store
                  </span>
                </a>
              </div>

              {/* Shine effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-600">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-800" />
              </div>
            </FadeIn>
          </div>

          {/* Become a Bomber */}
          <div className="relative rounded-2xl bg-gradient-to-br from-neutral-800/40 to-neutral-900/60 p-6 text-white border border-white/10 shadow-lg group hover:border-[#57a4ff]/50 transition-all duration-300 flex-1 flex flex-col justify-between">
            <FadeIn>
              <div className="flex flex-col justify-between h-full">
                <div>
                  <h3 className="text-lg font-extrabold tracking-wide mb-2">
                    <span className="bg-gradient-to-r from-white to-neutral-300 bg-clip-text text-transparent">
                      Become a Bomber
                    </span>
                  </h3>
                  <p className="text-sm text-neutral-300 mb-4">
                    Join our team and be part of the Bombers legacy
                  </p>
                </div>
                <Link
                  to="/become-bomber"
                  className="inline-flex items-center gap-2 text-sm font-bold text-[#57a4ff] hover:text-[#6bb0ff] transition-colors duration-300 group/link w-fit"
                >
                  <span>Learn More</span>
                  <svg
                    className="w-4 h-4 transition-transform group-hover/link:translate-x-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </Link>
              </div>
            </FadeIn>
          </div>
        </div>

        {/* Social Media */}
        <div className="relative rounded-2xl bg-neutral-950/80 p-4 border border-white/10 group hover:border-[#57a4ff]/60 transition-all duration-300 flex flex-col">
          <FadeIn>
            <h3 className="text-xs font-extrabold tracking-[0.15em] text-white drop-shadow-[0_0_10px_rgba(87,164,255,0.5)] uppercase mb-3">
              Join the Bombers
            </h3>
            <div className="grid grid-cols-2 gap-2 flex-grow">
              {socialItems.slice(0, 4).map((item) => (
                <a
                  key={item.id}
                  href={item.url}
                  className="relative aspect-square rounded-xl overflow-hidden group/social"
                >
                  <img
                    src={item.img}
                    className="h-full w-full object-cover opacity-80 group-hover/social:opacity-100 group-hover/social:scale-110 transition-all duration-300"
                    alt={`${item.platform} post ${item.id}`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/social:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-1 left-1 text-[9px] font-semibold text-white bg-[#57a4ff]/70 rounded px-1.5 py-0.5 opacity-0 group-hover/social:opacity-100 transition-opacity duration-300">
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
        }
      `}</style>
    </section>
  );
}
