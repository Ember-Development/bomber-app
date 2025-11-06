import { useQuery } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import MainNav from '@/components/layout/MainNav';
import SocialSidebar from '@/components/layout/SocialSidebar';
import { fetchMedia } from '@/api/media';
import { Search, Play } from 'lucide-react';

// Helper function to extract YouTube video ID
function getYouTubeVideoId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

// Helper function to get YouTube thumbnail
function getYouTubeThumbnail(url: string): string {
  const videoId = getYouTubeVideoId(url);
  if (videoId) {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  }
  return '/news/image3.jpg';
}

export default function Videos() {
  const { data: videos = [], isLoading } = useQuery({
    queryKey: ['media'],
    queryFn: fetchMedia,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Get unique categories
  const categories = useMemo(() => {
    return Array.from(new Set(videos.map((v) => v.category))).sort();
  }, [videos]);

  // Filter and sort videos
  const filteredVideos = useMemo(() => {
    return videos.filter((video) => {
      const matchesSearch = video.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory =
        !selectedCategory || video.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [videos, searchQuery, selectedCategory]);

  // Get featured video (most recent)
  const featuredVideo = useMemo(() => {
    if (filteredVideos.length === 0) return null;
    return [...filteredVideos].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
  }, [filteredVideos]);

  // Group videos by category
  const videosByCategory = useMemo(() => {
    const grouped: Record<string, typeof videos> = {};
    filteredVideos.forEach((video) => {
      if (!grouped[video.category]) {
        grouped[video.category] = [];
      }
      grouped[video.category].push(video);
    });
    return grouped;
  }, [filteredVideos]);

  if (isLoading) {
    return (
      <div className="relative bg-neutral-950 min-h-screen">
        <MainNav />
        <SocialSidebar />
        <main className="relative z-20 pt-32 pb-20">
          <div className="mx-auto max-w-8xl px-4 md:px-6">
            <div className="text-center text-white">Loading videos...</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="relative bg-neutral-950 min-h-screen">
      <MainNav />
      <SocialSidebar />

      <main className="relative z-20 pt-32 pb-20">
        <div className="mx-auto max-w-8xl px-4 md:px-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-6xl font-black text-white mb-4 uppercase tracking-tight">
              Explore Videos
            </h1>
            <p className="text-xl text-neutral-400">
              Watch highlights, game coverage, and exclusive content
            </p>
          </div>

          {/* Search and Category Filter */}
          <div className="mb-12 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
              <input
                type="text"
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl bg-neutral-900/80 backdrop-blur-sm border border-white/10 text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#57a4ff] transition-all duration-300"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition-all duration-300 ${
                  !selectedCategory
                    ? 'bg-[#57a4ff] text-white'
                    : 'bg-neutral-900/50 text-neutral-400 hover:bg-neutral-900/70 border border-white/10'
                }`}
              >
                All Categories
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition-all duration-300 ${
                    selectedCategory === category
                      ? 'bg-[#57a4ff] text-white'
                      : 'bg-neutral-900/50 text-neutral-400 hover:bg-neutral-900/70 border border-white/10'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Featured Video */}
          {featuredVideo && (
            <div className="mb-12 max-w-4xl">
              <h2 className="text-2xl font-black text-white mb-4 uppercase">
                Featured Video
              </h2>
              <Link
                to={`/videos/${featuredVideo.id}`}
                className="group relative block bg-neutral-900/50 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:border-[#57a4ff] transition-all duration-500"
              >
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={getYouTubeThumbnail(featuredVideo.videoUrl)}
                    alt={featuredVideo.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-[#57a4ff]/80 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="w-8 h-8 text-white ml-1" fill="white" />
                    </div>
                  </div>
                  <h3 className="absolute bottom-0 left-0 right-0 p-6 text-white text-xl font-black uppercase">
                    {featuredVideo.title}
                  </h3>
                </div>
              </Link>
            </div>
          )}

          {/* Videos by Category */}
          {Object.keys(videosByCategory).length === 0 ? (
            <div className="text-center text-neutral-500 py-16">
              <p className="text-lg">No videos found matching your criteria.</p>
            </div>
          ) : (
            <div className="space-y-12">
              {Object.entries(videosByCategory).map(
                ([category, categoryVideos]) => (
                  <section key={category}>
                    <h2 className="text-3xl font-black text-white mb-6 uppercase tracking-tight">
                      {category}
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {categoryVideos.map((video) => (
                        <Link
                          key={video.id}
                          to={`/videos/${video.id}`}
                          className="group relative bg-neutral-900/50 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:border-[#57a4ff] transition-all duration-500 transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#57a4ff]/20"
                        >
                          <div className="relative aspect-video overflow-hidden">
                            <img
                              src={getYouTubeThumbnail(video.videoUrl)}
                              alt={video.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-16 h-16 bg-[#57a4ff]/80 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Play
                                  className="w-8 h-8 text-white ml-1"
                                  fill="white"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="p-6">
                            <h3 className="text-xl font-black text-white mb-2 group-hover:text-[#57a4ff] transition-colors">
                              {video.title}
                            </h3>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-neutral-500 uppercase tracking-wider">
                                {video.category}
                              </span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </section>
                )
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
