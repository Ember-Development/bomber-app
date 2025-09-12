// src/pages/Media.tsx
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PlayCircleIcon,
  PencilSquareIcon,
  TrashIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { ScrollArea } from '@/components/ui/scroll-area';
import SideDialog from '@/components/SideDialog';
import {
  fetchArticles,
  createArticle,
  updateArticle,
  deleteArticle,
  ArticleFE,
} from '@/api/article';
import {
  fetchMedia,
  createMedia,
  updateMedia,
  deleteMedia,
  MediaFE,
} from '@/api/media';

type TabType = 'Articles' | 'Videos';

export default function Media() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabType>('Articles');
  const [previewTab, setPreviewTab] = useState<'Web' | 'Mobile'>('Web');

  const [articles, setArticles] = useState<ArticleFE[]>([]);
  const [editingArticle, setEditingArticle] = useState<ArticleFE | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newLink, setNewLink] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');

  const [videos, setVideos] = useState<MediaFE[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<
    'create' | 'edit' | 'delete' | null
  >(null);
  const [selectedMedia, setSelectedMedia] = useState<MediaFE | null>(null);
  const [newVideoCategory, setNewVideoCategory] = useState<
    'TRAINING' | 'PODCAST' | 'HIGHLIGHTS' | 'INTERVIEWS' | 'MERCH'
  >('TRAINING');
  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');

  function TextLike({
    className = '',
    children,
  }: {
    className?: string;
    children: React.ReactNode;
  }) {
    return <div className={className}>{children}</div>;
  }

  useEffect(() => {
    fetchArticles().then(setArticles);
    fetchMedia().then(setVideos);
  }, []);

  const openArticleCreate = () => {
    setEditingArticle({
      id: '',
      title: '',
      body: '',
      link: '',
      imageUrl: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setNewTitle('');
    setNewBody('');
    setNewLink('');
    setNewImageUrl('');
  };
  const openArticleEdit = (a: ArticleFE) => {
    setEditingArticle(a);
    setNewTitle(a.title);
    setNewBody(a.body);
    setNewLink(a.link || '');
    setNewImageUrl(a.imageUrl || '');
  };
  const closeArticleEditor = () => setEditingArticle(null);

  const saveArticle = async () => {
    if (!editingArticle) return;
    if (editingArticle.id === '') {
      const art = await createArticle({
        title: newTitle,
        body: newBody,
        link: newLink || undefined,
        imageUrl: newImageUrl || undefined,
      });
      if (art) setArticles([art, ...articles]);
    } else {
      const update = await updateArticle(editingArticle.id, {
        title: newTitle,
        body: newBody,
        link: newLink || undefined,
        imageUrl: newImageUrl || undefined,
      });
      if (update)
        setArticles(articles.map((a) => (a.id === update.id ? update : a)));
    }
    closeArticleEditor();
  };

  const deleteArticleById = async (id: string) => {
    await deleteArticle(id);
    setArticles(articles.filter((a) => a.id !== id));
    if (editingArticle?.id === id) closeArticleEditor();
  };

  const openVideoCreate = () => {
    setDialogType('create');
    setSelectedMedia(null);
    setNewVideoTitle('');
    setNewVideoUrl('');
    setDialogOpen(true);
  };
  const openVideoEdit = (v: MediaFE) => {
    setDialogType('edit');
    setSelectedMedia(v);
    setNewVideoTitle(v.title);
    setNewVideoUrl(v.videoUrl);
    setDialogOpen(true);
  };
  const openVideoDelete = (v: MediaFE) => {
    setDialogType('delete');
    setSelectedMedia(v);
    setDialogOpen(true);
  };
  const closeVideoDialog = () => {
    setDialogOpen(false);
    setDialogType(null);
    setSelectedMedia(null);
  };

  const saveVideo = async () => {
    if (dialogType === 'create') {
      const vid = await createMedia({
        title: newVideoTitle,
        videoUrl: newVideoUrl,
        category: newVideoCategory,
      });
      if (vid) setVideos([vid, ...videos]);
    } else if (dialogType === 'edit' && selectedMedia) {
      const update = await updateMedia(selectedMedia.id, {
        title: newVideoTitle,
        videoUrl: newVideoUrl,
        category: newVideoCategory,
      });
      if (update)
        setVideos(videos.map((v) => (v.id === update.id ? update : v)));
    }
    closeVideoDialog();
  };

  const deleteVideoById = async () => {
    if (!selectedMedia) return;
    await deleteMedia(selectedMedia.id);
    setVideos(videos.filter((v) => v.id !== selectedMedia.id));
    closeVideoDialog();
  };

  function isYouTubeUrl(url: string) {
    return /youtu\.be\/|youtube\.com\/watch/.test(url);
  }

  function toEmbedUrl(url: string) {
    const m = url.match(
      /(?:youtu\.be\/([^?]+))|(?:youtube\.com\/watch\?v=([^&]+))/
    );
    const id = m ? m[1] || m[2] : null;
    return id ? `https://www.youtube.com/embed/${id}` : url;
  }

  return (
    <div className="relative min-h-screen text-white">
      {/* Page container */}
      <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8 py-4">
        {/* Header */}
        <div className="sticky top-0 z-10 -mx-4 sm:mx-0 px-4 sm:px-0 py-2 sm:py-3 border-b border-white/10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 sm:gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => navigate(-1)}
                className="rounded-lg sm:rounded-xl bg-white/10 hover:bg-white/20 p-1.5 sm:p-2 transition"
              >
                <ArrowLeftIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <div className="text-3xl lg:text-3xl font-bold text-white">
                Media
              </div>
            </div>

            <div className="flex items-stretch justify-between gap-1.5 sm:gap-2">
              {/* Segmented tabs */}
              <div className="inline-flex rounded-full border border-white/15 bg-white/10 p-0.5 sm:p-1">
                <button
                  onClick={() => setTab('Articles')}
                  className={`px-3 py-1 text-xs sm:px-4 sm:py-1.5 sm:text-sm rounded-full font-semibold transition
            ${tab === 'Articles' ? 'bg-[#5AA5FF] text-white shadow' : 'text-white/75 hover:bg-white/10'}
          `}
                >
                  Articles
                </button>
                <button
                  onClick={() => setTab('Videos')}
                  className={`px-3 py-1 text-xs sm:px-4 sm:py-1.5 sm:text-sm rounded-full font-semibold transition
            ${tab === 'Videos' ? 'bg-[#5AA5FF] text-white shadow' : 'text-white/75 hover:bg-white/10'}
          `}
                >
                  Videos
                </button>
              </div>

              {/* Contextual action */}
              {tab === 'Articles' && !editingArticle ? (
                <button
                  onClick={openArticleCreate}
                  className="inline-flex items-center gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl bg-[#5AA5FF] hover:bg-[#3C8CE7] px-3 py-1 text-xs sm:px-4 sm:py-2 sm:text-sm font-semibold transition"
                >
                  <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  New Article
                </button>
              ) : null}

              {tab === 'Videos' ? (
                <button
                  onClick={openVideoCreate}
                  className="inline-flex items-center gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl bg-[#5AA5FF] hover:bg-[#3C8CE7] px-3 py-1 text-xs sm:px-4 sm:py-2 sm:text-sm font-semibold transition"
                >
                  <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  New Video
                </button>
              ) : null}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mt-6">
          {tab === 'Articles' && (
            <>
              {/* List or Editor */}
              {!editingArticle && (
                <div className="rounded-2xl bg-white/5 border border-white/10 shadow-inner">
                  <div className="p-4 sm:p-6">
                    <ScrollArea className="h-[55vh] sm:h-[60vh]">
                      <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {articles.map((a) => (
                          <li
                            key={a.id}
                            className="group relative rounded-xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-4 hover:from-white/15 hover:to-white/10 transition overflow-hidden"
                            onClick={() => openArticleEdit(a)}
                          >
                            {/* subtle glow */}
                            <div
                              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition pointer-events-none"
                              style={{
                                background:
                                  'radial-gradient(600px circle at var(--x,50%) var(--y,50%), rgba(90,165,255,0.08), transparent 40%)',
                              }}
                            />
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="font-bold tracking-tight text-lg line-clamp-1">
                                  {a.title}
                                </div>
                                <div className="mt-1 text-sm text-white/70 line-clamp-3">
                                  {a.body}
                                </div>
                              </div>
                              <button
                                className="shrink-0 rounded-lg p-2 hover:bg-red-600/20 transition"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteArticleById(a.id);
                                }}
                                aria-label="Delete article"
                                title="Delete"
                              >
                                <TrashIcon className="w-5 h-5 text-red-400" />
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </ScrollArea>
                  </div>
                </div>
              )}

              {editingArticle && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Editor card */}
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6 shadow-inner">
                    <div className="space-y-4">
                      <div className="flex flex-row items-center justify-between">
                        <h2 className="font-extrabold text-xl">
                          {editingArticle.id ? 'Edit Article' : 'New Article'}
                        </h2>
                        <div className="lg:col-span-1 flex items-center justify-end">
                          <div className="inline-flex rounded-full border border-white/15 bg-white/10 p-0.5">
                            <button
                              onClick={() => setPreviewTab('Web')}
                              className={`px-3 py-1 text-xs sm:px-4 sm:py-1.5 sm:text-sm rounded-full font-semibold transition
        ${previewTab === 'Web' ? 'bg-[#5AA5FF] text-white shadow' : 'text-white/75 hover:bg-white/10'}`}
                              aria-pressed={previewTab === 'Web'}
                            >
                              Web
                            </button>
                            <button
                              onClick={() => setPreviewTab('Mobile')}
                              className={`px-3 py-1 text-xs sm:px-4 sm:py-1.5 sm:text-sm rounded-full font-semibold transition
        ${previewTab === 'Mobile' ? 'bg-[#5AA5FF] text-white shadow' : 'text-white/75 hover:bg-white/10'}`}
                              aria-pressed={previewTab === 'Mobile'}
                            >
                              Mobile
                            </button>
                          </div>
                        </div>
                      </div>

                      <input
                        type="text"
                        placeholder="Title"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl bg-white/10 border border-white/15 focus:outline-none focus:ring-2 focus:ring-[#5AA5FF]"
                      />
                      <textarea
                        placeholder="Body"
                        value={newBody}
                        onChange={(e) => setNewBody(e.target.value)}
                        className="w-full h-40 px-4 py-3 rounded-xl bg-white/10 border border-white/15 focus:outline-none focus:ring-2 focus:ring-[#5AA5FF]"
                      />
                      <input
                        type="text"
                        placeholder="Link (optional)"
                        value={newLink}
                        onChange={(e) => setNewLink(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl bg-white/10 border border-white/15 focus:outline-none focus:ring-2 focus:ring-[#5AA5FF]"
                      />
                      <input
                        type="text"
                        placeholder="Image URL (optional)"
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl bg-white/10 border border-white/15 focus:outline-none focus:ring-2 focus:ring-[#5AA5FF]"
                      />

                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 pt-2">
                        <button
                          onClick={saveArticle}
                          className="flex-1 rounded-xl bg-[#5AA5FF] hover:bg-[#3C8CE7] px-4 py-2 font-semibold"
                        >
                          Save
                        </button>
                        <button
                          onClick={closeArticleEditor}
                          className="flex-1 rounded-xl bg-white/10 hover:bg-white/15 px-4 py-2"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Live preview card */}
                  <div
                    className={`relative rounded-2xl overflow-hidden border border-white/10 shadow-inner ${previewTab === 'Web' ? '' : 'hidden'}`}
                  >
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${newImageUrl})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/60" />
                    <div className="relative p-6 sm:p-10 h-[55vh] sm:h-[70vh] flex flex-col justify-end">
                      <small className="text-white/70 tracking-wide mb-2">
                        {new Date(editingArticle!.createdAt).toLocaleDateString(
                          undefined,
                          { day: '2-digit', month: 'long', year: 'numeric' }
                        )}
                      </small>
                      <h3 className="text-3xl sm:text-5xl font-extrabold leading-tight drop-shadow">
                        {newTitle || 'Your Headline Goes Here'}
                      </h3>
                      <p className="mt-3 text-white/90 text-base sm:text-lg max-w-2xl">
                        {newBody.split('\n')[0] ||
                          'A killer opening paragraph to hook your reader.'}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`flex items-center justify-center ${previewTab === 'Mobile' ? '' : 'hidden'}`}
                  >
                    <div className="relative mx-auto">
                      {/* Phone shell */}
                      <div className="relative rounded-[3rem] border border-white/15 bg-black/40 shadow-2xl backdrop-blur-lg w-[330px] aspect-[9/19.5]">
                        {/* Notch */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 mt-2 h-6 w-40 bg-black/80 rounded-b-2xl" />
                        {/* Screen */}
                        <div className="absolute inset-[10px] rounded-[2.2rem] overflow-hidden bg-black">
                          {/* Hero image with gradient like the app */}
                          <div className="relative h-[42%]">
                            <div
                              className="absolute inset-0 bg-cover bg-center"
                              style={{
                                backgroundImage: `url(${newImageUrl || ''})`,
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/90" />
                            {/* Title overlay (mirrors mobile style) */}
                            <div className="absolute bottom-0 p-4">
                              <TextLike className="text-white font-extrabold text-[18px] leading-snug drop-shadow">
                                {newTitle || 'Your Headline Goes Here'}
                              </TextLike>
                              <TextLike className="text-white/70 text-[12px] mt-1">
                                {new Date(
                                  editingArticle!.createdAt
                                ).toLocaleDateString()}
                              </TextLike>
                              <TextLike className="text-white/90 text-[13px] mt-2">
                                {(() => {
                                  const body = newBody || '';
                                  const idx = body.indexOf('.');
                                  return idx > 0
                                    ? body.slice(0, idx + 1)
                                    : body || 'Tap to read more…';
                                })()}
                              </TextLike>
                            </div>
                          </div>

                          {/* Bottom sheet preview card mimic */}
                          <div className="relative h-[58%] bg-white rounded-t-3xl shadow-inner">
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 h-1.5 w-14 rounded-full bg-black/20" />
                            <div className="h-full overflow-hidden p-4">
                              <div className="space-y-2">
                                <div className="h-4 bg-black/10 rounded" />
                                <div className="h-4 bg-black/10 rounded w-5/6" />
                                <div className="h-4 bg-black/10 rounded w-4/6" />
                              </div>
                              <div className="mt-4 text-[13px] text-black/80 line-clamp-6">
                                {newBody ||
                                  'Body text will appear here. This area mimics the scrollable bottom sheet in the app.'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Side buttons (purely decorative) */}
                      <div className="absolute -left-1 top-20 h-14 w-1.5 rounded-full bg-white/20" />
                      <div className="absolute -right-1 top-28 h-10 w-1.5 rounded-full bg-white/20" />
                      <div className="absolute -right-1 top-40 h-10 w-1.5 rounded-full bg-white/20" />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {tab === 'Videos' && (
            <>
              <div className="rounded-2xl bg-white/5 border border-white/10 shadow-inner p-4 sm:p-6">
                <ScrollArea className="max-h-[70vh]">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                    {videos.map((v) => (
                      <div
                        key={v.id}
                        className="group relative rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br from-white/10 to-white/5 hover:from-white/15 hover:to-white/10 transition cursor-pointer"
                        onClick={() => openVideoEdit(v)}
                      >
                        {/* Video tile */}
                        <div className="aspect-video relative">
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/60 transition">
                            <PlayCircleIcon className="w-14 h-14 sm:w-16 sm:h-16 text-white drop-shadow-xl" />
                          </div>

                          {/* Actions on hover (top-right) */}
                          <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                            <span className="rounded-full flex items-center bg-white/15 border border-white/20 px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase">
                              {v.category}
                            </span>
                            <button
                              className="rounded-lg p-1.5 bg-white/10 hover:bg-white/20"
                              onClick={(e) => {
                                e.stopPropagation();
                                openVideoEdit(v);
                              }}
                              aria-label="Edit video"
                              title="Edit"
                            >
                              <PencilSquareIcon className="w-5 h-5 text-white" />
                            </button>
                            <button
                              className="rounded-lg p-1.5 bg-white/10 hover:bg-red-600/40"
                              onClick={(e) => {
                                e.stopPropagation();
                                openVideoDelete(v);
                              }}
                              aria-label="Delete video"
                              title="Delete"
                            >
                              <TrashIcon className="w-5 h-5 text-white" />
                            </button>
                          </div>

                          {/* Title overlay */}
                          <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                            <h3 className="font-bold leading-snug line-clamp-2">
                              {v.title}
                            </h3>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Video Dialog */}
      <SideDialog
        open={dialogOpen}
        onClose={closeVideoDialog}
        title={
          dialogType === 'create'
            ? 'New Video'
            : dialogType === 'edit'
              ? 'Edit Video'
              : 'Delete Video'
        }
      >
        {(dialogType === 'create' || dialogType === 'edit') && (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Title"
              value={newVideoTitle}
              onChange={(e) => setNewVideoTitle(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-white/10 border border-white/15 focus:outline-none focus:ring-2 focus:ring-[#5AA5FF] text-white"
            />
            <input
              type="text"
              placeholder="Video URL"
              value={newVideoUrl}
              onChange={(e) => setNewVideoUrl(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-white/10 border border-white/15 focus:outline-none focus:ring-2 focus:ring-[#5AA5FF] text-white"
            />
            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-1 sm:col-span-1">
                <label className="text-sm text-white/80">Category</label>
                <select
                  value={newVideoCategory}
                  onChange={(e) => setNewVideoCategory(e.target.value as any)}
                  className="w-full px-4 py-2 rounded-xl bg-white/10 border  border-white/15 focus:outline-none focus:ring-2 focus:ring-[#5AA5FF] text-white"
                >
                  <option value="TRAINING" className="text-black">
                    Training
                  </option>
                  <option value="PODCAST" className="text-black">
                    Podcast
                  </option>
                  <option value="HIGHLIGHTS" className="text-black">
                    Highlights
                  </option>
                  <option value="INTERVIEWS" className="text-black">
                    Interviews
                  </option>
                  <option value="MERCH" className="text-black">
                    Merch
                  </option>
                </select>
              </div>
            </div>
            {newVideoUrl && (
              <div className="mt-4">
                {isYouTubeUrl(newVideoUrl) ? (
                  <div className="w-full aspect-video rounded-xl overflow-hidden border border-white/10">
                    <iframe
                      src={toEmbedUrl(newVideoUrl)}
                      title="YouTube preview"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </div>
                ) : (
                  <video
                    src={newVideoUrl}
                    controls
                    className="w-full rounded-xl bg-black border border-white/10"
                  >
                    Your browser does not support the video element.
                  </video>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 pt-2">
              <button
                onClick={saveVideo}
                className="flex-1 rounded-xl bg-[#5AA5FF] hover:bg-[#3C8CE7] px-4 py-2 font-semibold text-white"
              >
                Save
              </button>
              <button
                onClick={closeVideoDialog}
                className="flex-1 rounded-xl bg-white/10 hover:bg-white/15 px-4 py-2 text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {dialogType === 'delete' && selectedMedia && (
          <div className="space-y-4">
            <p className="text-white">
              Delete <b>{selectedMedia.title}</b>?
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 pt-2">
              <button
                onClick={closeVideoDialog}
                className="flex-1 rounded-xl bg-white/10 hover:bg-white/15 px-4 py-2 text-white"
              >
                Cancel
              </button>
              <button
                onClick={deleteVideoById}
                className="flex-1 rounded-xl bg-red-600 hover:bg-red-500 px-4 py-2 text-white"
              >
                Confirm
              </button>
            </div>
          </div>
        )}
      </SideDialog>
    </div>
  );
}
