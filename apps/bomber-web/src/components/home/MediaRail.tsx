import { useQuery } from '@tanstack/react-query';
import { fetchMedia } from '@/api/media';
import { PlayIcon } from '@/components/ui/icons';
import FadeIn from '../animation/FadeIn';
import { useNavigate } from 'react-router-dom';

// Helper function to extract thumbnail from video URL
function getVideoThumbnail(videoUrl: string): string {
  try {
    // YouTube thumbnails
    if (
      videoUrl.includes('youtube.com/watch') ||
      videoUrl.includes('youtu.be/')
    ) {
      const videoId = videoUrl.match(
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/
      )?.[1];
      if (videoId) {
        return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      }
    }

    // Vimeo thumbnails (requires API call, so we'll use a placeholder)
    if (videoUrl.includes('vimeo.com/')) {
      const videoId = videoUrl.match(/vimeo\.com\/(\d+)/)?.[1];
      if (videoId) {
        return `https://vumbnail.com/${videoId}.jpg`;
      }
    }

    // Default placeholder
    return '/news/image3.jpg';
  } catch {
    return '/news/image3.jpg';
  }
}

export default function MediaRail() {
  const navigate = useNavigate();
  const { data: media = [], isLoading } = useQuery({
    queryKey: ['media'],
    queryFn: fetchMedia,
  });

  if (isLoading) {
    return (
      <section className="mt-[3rem] p-6 md:p-10 ml-8 rounded-bl-3xl rounded-tl-3xl bg-neutral-900/90 shadow-2xl overflow-hidden relative">
        <div className="text-white text-center">Loading media...</div>
      </section>
    );
  }

  if (media.length === 0) {
    return null; // Don't render if no media
  }

  return (
    <section className="mt-[3rem] p-6 md:p-10 ml-8 rounded-bl-3xl rounded-tl-3xl bg-neutral-900/90 shadow-2xl overflow-hidden relative">
      {/* Main background */}
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-black to-neutral-900" />

      {/* Image overlay */}
      <div className="absolute inset-0">
        <img
          src="/news/image.png"
          alt=""
          className="h-full w-full object-cover object-center opacity-15"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70" />
      </div>

      {/* Animated glow orbs */}
      <div className="absolute top-8 left-16 w-64 h-64 bg-[#57a4ff]/15 rounded-full blur-2xl animate-pulse" />
      <div
        className="absolute bottom-8 right-16 w-64 h-64 bg-[#3b8aff]/10 rounded-full blur-2xl animate-pulse"
        style={{ animationDelay: '0.8s' }}
      />

      <div className="relative grid gap-6 md:grid-cols-[1fr_2fr]">
        {/* Title Section */}
        <div className="flex flex-col justify-center">
          <FadeIn>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 w-fit rounded-full bg-gradient-to-r from-[#57a4ff]/20 to-[#3b8aff]/20 px-4 py-1.5 backdrop-blur-sm border border-[#57a4ff]/30 mb-4">
              <div className="h-1.5 w-1.5 rounded-full bg-[#57a4ff] animate-pulse" />
              <span className="text-[10px] font-black tracking-widest text-[#57a4ff] uppercase">
                Media Highlights
              </span>
            </div>

            {/* Title */}
            <h3 className="max-w-xs text-3xl md:text-4xl font-black leading-tight">
              <span className="bg-gradient-to-br from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent drop-shadow-2xl">
                Bomber
              </span>
              <br />
              <span className="bg-gradient-to-r from-[#57a4ff] via-[#6bb0ff] to-[#57a4ff] bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(87,164,255,0.5)]">
                All Access Media
              </span>
            </h3>

            {/* Decorative line */}
            <div className="mt-4 h-1 w-16 bg-gradient-to-r from-[#57a4ff] to-transparent rounded-full" />
          </FadeIn>
        </div>

        {/* Media Cards */}
        <div className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4">
          {media.map((m) => (
            <FadeIn key={m.id}>
              <article
                className="snap-start shrink-0 w-[260px] sm:w-[300px] rounded-xl overflow-hidden bg-neutral-950/80 text-white shadow-md border border-white/10 group hover:border-[#57a4ff]/50 transition-all duration-300 cursor-pointer"
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/videos/${m.id}`)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigate(`/videos/${m.id}`);
                  }
                }}
              >
                <div className="relative aspect-[16/11]">
                  {/* Video thumbnail */}
                  <img
                    src={getVideoThumbnail(m.videoUrl)}
                    alt={m.title}
                    className="absolute inset-0 h-full w-full object-cover opacity-70 group-hover:opacity-90 transition-opacity duration-300"
                    onError={(e) => {
                      // Fallback to gradient if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'block';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 to-neutral-900 opacity-70 group-hover:opacity-90 transition-opacity duration-300 hidden" />
                  {/* Play Button */}
                  <div className="absolute inset-0 grid place-items-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/videos/${m.id}`);
                      }}
                      className="relative h-12 w-12 rounded-full bg-gradient-to-br from-[#57a4ff]/30 to-[#3b8aff]/20 backdrop-blur-sm flex items-center justify-center border border-[#57a4ff]/30 group-hover:scale-110 group-hover:border-[#57a4ff]/70 transition-all duration-300"
                    >
                      <div className="absolute inset-0 bg-[#57a4ff]/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <PlayIcon className="h-6 w-6 text-white group-hover:text-[#6bb0ff] transition-colors duration-300" />
                    </button>
                  </div>
                  {/* Shine effect on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  </div>
                </div>
                {/* Title */}
                <div className="p-4">
                  <h4 className="text-sm font-semibold text-white group-hover:text-[#6bb0ff] transition-colors duration-300">
                    {m.title}
                  </h4>
                </div>
              </article>
            </FadeIn>
          ))}
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#57a4ff] to-transparent opacity-50" />

      <style>{`
        /* Smooth scroll behavior */
        .no-scrollbar {
          scrollbar-width: none; /* Firefox */
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none; /* Chrome, Safari */
        }

        /* Hover effects for cards */
        article {
          transition: transform 0.3s ease-out, border-color 0.3s ease-out;
        }
        article:hover {
          transform: translateY(-4px) rotate(1deg);
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .no-scrollbar {
            gap: 1rem;
          }
          article {
            width: 220px;
          }
          h3 {
            font-size: 2rem;
          }
        }
      `}</style>
    </section>
  );
}
