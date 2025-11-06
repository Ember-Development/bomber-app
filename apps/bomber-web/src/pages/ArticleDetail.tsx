import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import MainNav from '@/components/layout/MainNav';
import SocialSidebar from '@/components/layout/SocialSidebar';
import { fetchArticleById } from '@/api/article';
import { Calendar, ArrowLeft } from 'lucide-react';

export default function ArticleDetail() {
  const { id } = useParams<{ id: string }>();

  const {
    data: article,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['article', id],
    queryFn: () => fetchArticleById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="relative bg-neutral-950 min-h-screen">
        <MainNav />
        <SocialSidebar />
        <main className="relative z-20 pt-32 pb-20">
          <div className="mx-auto max-w-8xl px-4 md:px-6 text-center text-white">
            Loading article...
          </div>
        </main>
      </div>
    );
  }

  if (isError || !article) {
    return (
      <div className="relative bg-neutral-950 min-h-screen">
        <MainNav />
        <SocialSidebar />
        <main className="relative z-20 pt-32 pb-20">
          <div className="mx-auto max-w-8xl px-4 md:px-6 text-center text-red-500">
            Article not found
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
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          {/* Back Button */}
          <Link
            to="/articles"
            className="inline-flex items-center gap-2 text-neutral-400 hover:text-[#57a4ff] transition-colors mb-8 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-semibold">Back to Articles</span>
          </Link>

          {/* Article Image */}
          {article.imageUrl && (
            <div className="relative h-[500px] rounded-2xl overflow-hidden mb-8 border border-white/10">
              <img
                src={article.imageUrl}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Date */}
          <div className="flex items-center gap-2 text-neutral-500 mb-4">
            <Calendar className="w-5 h-5" />
            <span>
              {new Date(article.createdAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-black text-white mb-8 uppercase tracking-tight">
            {article.title}
          </h1>

          {/* Body Content */}
          <article
            className="text-neutral-300 leading-relaxed text-lg max-w-none prose prose-invert prose-lg 
                       [&_h2]:text-2xl [&_h2]:font-black [&_h2]:text-white [&_h2]:mb-6 [&_h2]:mt-12
                       [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-white [&_h3]:mb-4 [&_h3]:mt-8
                       [&_p]:mb-6 [&_p]:text-base
                       [&_ul]:mb-6 [&_ul]:ml-6 [&_ul]:list-disc [&_ul]:space-y-2
                       [&_ol]:mb-6 [&_ol]:ml-6 [&_ol]:list-decimal [&_ol]:space-y-2
                       [&_li]:text-base
                       [&_strong]:font-bold [&_strong]:text-white
                       [&_em]:italic
                       [&_a]:text-[#57a4ff] [&_a]:hover:text-[#6bb0ff] [&_a]:underline
                       [&_blockquote]:border-l-4 [&_blockquote]:border-[#57a4ff] [&_blockquote]:pl-6 [&_blockquote]:py-2 [&_blockquote]:italic [&_blockquote]:text-neutral-400
                       [&_hr]:my-12 [&_hr]:border-t [&_hr]:border-white/20
                       [&_img]:rounded-xl [&_img]:my-8 [&_img]:shadow-xl"
            dangerouslySetInnerHTML={{ __html: article.body }}
          />

          {/* Link to external article */}
          {article.link && (
            <div className="mt-12 pt-8 border-t border-white/10">
              <a
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#57a4ff]/20 hover:bg-[#57a4ff]/30 border border-[#57a4ff]/50 hover:border-[#57a4ff] px-6 py-3 rounded-xl text-[#57a4ff] font-bold uppercase tracking-wider transition-all duration-300 group"
              >
                <span>Read Full Article</span>
                <span className="group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </a>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
