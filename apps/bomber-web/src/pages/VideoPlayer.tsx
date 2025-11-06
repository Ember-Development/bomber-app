import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import MainNav from '@/components/layout/MainNav';
import SocialSidebar from '@/components/layout/SocialSidebar';
import { fetchMediaById } from '@/api/media';
import { ArrowLeft } from 'lucide-react';

// Helper function to extract YouTube video ID
function getYouTubeVideoId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export default function VideoPlayer() {
  const { id } = useParams<{ id: string }>();

  const {
    data: video,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['video', id],
    queryFn: () => fetchMediaById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="relative bg-neutral-950 min-h-screen">
        <MainNav />
        <SocialSidebar />
        <main className="relative z-20 pt-32 pb-20">
          <div className="mx-auto max-w-8xl px-4 md:px-6 text-center text-white">
            Loading video...
          </div>
        </main>
      </div>
    );
  }

  if (isError || !video) {
    return (
      <div className="relative bg-neutral-950 min-h-screen">
        <MainNav />
        <SocialSidebar />
        <main className="relative z-20 pt-32 pb-20">
          <div className="mx-auto max-w-8xl px-4 md:px-6 text-center text-red-500">
            Video not found
          </div>
        </main>
      </div>
    );
  }

  const videoId = getYouTubeVideoId(video.videoUrl);

  return (
    <div className="relative bg-neutral-950 min-h-screen">
      <MainNav />
      <SocialSidebar />

      <main className="relative z-20 pt-32 pb-20">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          {/* Back Button */}
          <Link
            to="/videos"
            className="inline-flex items-center gap-2 text-neutral-400 hover:text-[#57a4ff] transition-colors mb-8 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-semibold">Back to Videos</span>
          </Link>

          {/* Video Title */}
          <div className="mb-8">
            <div className="inline-block px-4 py-2 bg-[#57a4ff]/20 border border-[#57a4ff]/50 rounded-full mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#57a4ff]">
                {video.category}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight">
              {video.title}
            </h1>
          </div>

          {/* Video Player */}
          <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 mb-8">
            {videoId ? (
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
                title={video.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-900">
                <div className="text-center text-white">
                  <p className="text-lg mb-4">Unable to load video</p>
                  <a
                    href={video.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#57a4ff] hover:bg-[#6bb0ff] px-6 py-3 rounded-xl text-white font-bold uppercase tracking-wider transition-colors"
                  >
                    Watch on YouTube
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Additional Info */}
          <div className="bg-neutral-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <p className="text-neutral-400">
              Watch this video and more in our video library. Subscribe to our
              channel for the latest updates and highlights.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
