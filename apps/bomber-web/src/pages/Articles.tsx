import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import MainNav from '@/components/layout/MainNav';
import SocialSidebar from '@/components/layout/SocialSidebar';
import { fetchArticles } from '@/api/article';
import { Calendar } from 'lucide-react';

export default function Articles() {
  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['articles'],
    queryFn: fetchArticles,
  });

  // Sort articles by date (newest first)
  const sortedArticles = useMemo(() => {
    return [...articles].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });
  }, [articles]);

  if (isLoading) {
    return (
      <div className="relative bg-neutral-950 min-h-screen">
        <MainNav />
        <SocialSidebar />
        <main className="relative z-20 pt-32 pb-20">
          <div className="mx-auto max-w-8xl px-4 md:px-6">
            <div className="text-center text-white">Loading articles...</div>
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
          <div className="mb-12">
            <h1 className="text-6xl font-black text-white mb-4 uppercase tracking-tight">
              Latest News
            </h1>
            <p className="text-xl text-neutral-400">
              Stay updated with the latest from Bombers Fastpitch
            </p>
          </div>

          {/* Articles Grid */}
          {sortedArticles.length === 0 ? (
            <div className="text-center text-neutral-500 py-16">
              <p className="text-lg">No articles available at the moment.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sortedArticles.map((article) => (
                <Link
                  key={article.id}
                  to={`/articles/${article.id}`}
                  className="group relative bg-neutral-900/50 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:border-[#57a4ff] transition-all duration-500 transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#57a4ff]/20"
                >
                  {/* Image */}
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={article.imageUrl || '/news/image.png'}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-neutral-500 mb-3">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">
                        {new Date(article.createdAt).toLocaleDateString(
                          'en-US',
                          {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          }
                        )}
                      </span>
                    </div>
                    <h2 className="text-xl font-black text-white mb-2 group-hover:text-[#57a4ff] transition-colors line-clamp-2">
                      {article.title}
                    </h2>
                    <p className="text-neutral-400 text-sm line-clamp-3">
                      {article.body}
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-[#57a4ff] text-sm font-bold uppercase tracking-wider">
                      <span>Read More</span>
                      <span className="group-hover:translate-x-1 transition-transform">
                        →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
