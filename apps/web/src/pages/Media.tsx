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

  // --- Articles state ---
  const [articles, setArticles] = useState<ArticleFE[]>([]);
  const [editingArticle, setEditingArticle] = useState<ArticleFE | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newLink, setNewLink] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');

  // --- Videos state & dialog for Videos ---
  const [videos, setVideos] = useState<MediaFE[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<
    'create' | 'edit' | 'delete' | null
  >(null);
  const [selectedMedia, setSelectedMedia] = useState<MediaFE | null>(null);
  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');

  useEffect(() => {
    fetchArticles().then(setArticles);
    fetchMedia().then(setVideos);
  }, []);

  /*** ARTICLE HANDLERS ***/
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
      if (art) {
        setArticles([art, ...articles]);
      }
    } else {
      const update = await updateArticle(editingArticle.id, {
        title: newTitle,
        body: newBody,
        link: newLink || undefined,
        imageUrl: newImageUrl || undefined,
      });
      if (update) {
        setArticles(articles.map((a) => (a.id === update.id ? update : a)));
      }
    }
    closeArticleEditor();
  };

  const deleteArticleById = async (id: string) => {
    await deleteArticle(id);
    setArticles(articles.filter((a) => a.id !== id));
    if (editingArticle?.id === id) closeArticleEditor();
  };

  /*** VIDEO DIALOG HANDLERS ***/
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
      });
      if (vid) {
        setVideos([vid, ...videos]);
      }
    } else if (dialogType === 'edit' && selectedMedia) {
      const update = await updateMedia(selectedMedia.id, {
        title: newVideoTitle,
        videoUrl: newVideoUrl,
      });
      if (update) {
        setVideos(videos.map((v) => (v.id === update.id ? update : v)));
      }
    }
    closeVideoDialog();
  };

  const deleteVideoById = async () => {
    if (!selectedMedia) return;
    await deleteMedia(selectedMedia.id);
    setVideos(videos.filter((v) => v.id !== selectedMedia.id));
    closeVideoDialog();
  };

  return (
    <div className="flex relative p-4 text-white">
      <div
        className={`flex-1 flex flex-col space-y-6 ${dialogOpen ? 'pr-[50px]' : ''}`}
      >
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 bg-[rgba(255,255,255,0.1)] rounded-lg"
            >
              <ArrowLeftIcon className="w-5 h-5 text-white" />
            </button>
            <h1 className="text-2xl font-bold">Media</h1>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => setTab('Articles')}
              className={`px-4 py-2 rounded-lg transition ${
                tab === 'Articles'
                  ? 'bg-[#5AA5FF] text-white'
                  : 'bg-[rgba(255,255,255,0.1)] text-white/70 hover:bg-[rgba(255,255,255,0.2)]'
              }`}
            >
              Articles
            </button>
            <button
              onClick={() => setTab('Videos')}
              className={`px-4 py-2 rounded-lg transition ${
                tab === 'Videos'
                  ? 'bg-[#5AA5FF] text-white'
                  : 'bg-[rgba(255,255,255,0.1)] text-white/70 hover:bg-[rgba(255,255,255,0.2)]'
              }`}
            >
              Videos
            </button>
          </div>
        </div>

        {/* ARTICLES MODE */}
        {tab === 'Articles' && (
          <>
            {!editingArticle ? (
              <div className="flex justify-end">
                <button
                  onClick={openArticleCreate}
                  className="inline-flex items-center px-4 py-2 bg-[#5AA5FF] rounded-lg hover:bg-[#3C8CE7]"
                >
                  <PlusIcon className="w-5 h-5 mr-2" /> New Article
                </button>
              </div>
            ) : null}

            {/* SHOW LIST only when NOT editing */}
            {!editingArticle && (
              <div className="bg-[rgba(255,255,255,0.05)] backdrop-blur-lg rounded-2xl p-4">
                <ScrollArea className="h-64">
                  <ul className="space-y-4">
                    {articles.map((a) => (
                      <li
                        key={a.id}
                        className="flex justify-between bg-[rgba(255,255,255,0.1)] rounded-lg p-3 cursor-pointer hover:bg-[rgba(255,255,255,0.2)]"
                        onClick={() => openArticleEdit(a)}
                      >
                        <div>
                          <div className="font-medium">{a.title}</div>
                          <div className="text-sm text-white/70 line-clamp-2">
                            {a.body}
                          </div>
                        </div>
                        <TrashIcon
                          className="w-5 h-5 text-red-500"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteArticleById(a.id);
                          }}
                        />
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              </div>
            )}

            {/* INLINE EDITOR + PREVIEW (full width) */}
            {editingArticle && (
              <div className="bg-[rgba(255,255,255,0.05)] backdrop-blur-lg rounded-2xl grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
                {/* Editor */}
                <div className="space-y-4">
                  <h2 className="font-semibold">
                    {editingArticle.id ? 'Edit Article' : 'New Article'}
                  </h2>
                  <input
                    type="text"
                    placeholder="Title"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-4 py-2 bg-[rgba(255,255,255,0.1)] text-white rounded-lg"
                  />
                  <textarea
                    placeholder="Body"
                    value={newBody}
                    onChange={(e) => setNewBody(e.target.value)}
                    className="w-full h-32 px-4 py-2 bg-[rgba(255,255,255,0.1)] text-white rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Link (optional)"
                    value={newLink}
                    onChange={(e) => setNewLink(e.target.value)}
                    className="w-full px-4 py-2 bg-[rgba(255,255,255,0.1)] text-white rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Image URL (optional)"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    className="w-full px-4 py-2 bg-[rgba(255,255,255,0.1)] text-white rounded-lg"
                  />
                  <div className="flex flex-col sm:flex-row sm:space-x-4 mt-4">
                    <button
                      onClick={saveArticle}
                      className="flex-1 px-4 py-2 bg-[#5AA5FF] rounded-lg hover:bg-[#3C8CE7] whitespace-nowrap"
                    >
                      Save
                    </button>
                    <button
                      onClick={closeArticleEditor}
                      className="flex-1 mt-2 sm:mt-0 px-4 py-2 bg-[rgba(255,255,255,0.14)] rounded-lg hover:bg-[#5AA5FF] whitespace-nowrap"
                    >
                      Cancel
                    </button>
                  </div>
                </div>

                {/* Preview */}
                <div className="relative h-[60vh] sm:h-[75vh] overflow-hidden">
                  {/* Background Image */}
                  <div
                    className="absolute inset-0 bg-cover bg-center will-change-transform"
                    style={{ backgroundImage: `url(${newImageUrl})` }}
                  />
                  {/* Parallax overlay (via simple translateY on scroll) */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/10 pointer-events-none" />

                  {/* Content Container */}
                  <div className="relative z-10 max-w-3xl mx-auto ml-4 h-full flex flex-col justify-center px-6 sm:px-0">
                    <small className="text-white/60 uppercase tracking-wide mb-2">
                      {new Date(editingArticle!.createdAt).toLocaleDateString(
                        undefined,
                        {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        }
                      )}
                    </small>
                    <h1 className="text-4xl sm:text-6xl font-extrabold text-white leading-tight mb-4 drop-shadow-lg">
                      {newTitle || 'Your Headline Goes Here'}
                    </h1>
                    <p className="text-lg sm:text-xl text-white/90 max-w-2xl">
                      {newBody.split('\n')[0] ||
                        'A killer opening paragraph to hook your reader.'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* VIDEOS MODE (unchanged, still uses dialog + grid) */}
        {tab === 'Videos' && (
          <>
            <div className="flex justify-end">
              <button
                onClick={openVideoCreate}
                className="inline-flex items-center px-4 py-2 bg-[#5AA5FF] rounded-lg hover:bg-[#3C8CE7]"
              >
                <PlusIcon className="w-5 h-5 mr-2" /> New Video
              </button>
            </div>
            <div className="bg-[rgba(255,255,255,0.05)] backdrop-blur-lg rounded-2xl p-4">
              <ScrollArea className="py-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                  {videos.map((v) => (
                    <div
                      key={v.id}
                      className="relative overflow-hidden rounded-xl group cursor-pointer"
                      onClick={() => openVideoEdit(v)}
                    >
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/60 transition">
                        <PlayCircleIcon className="w-12 h-12 text-white opacity-80" />
                      </div>
                      <div className="absolute top-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100">
                        <PencilSquareIcon
                          className="w-5 h-5 text-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            openVideoEdit(v);
                          }}
                        />
                        <TrashIcon
                          className="w-5 h-5 text-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            openVideoDelete(v);
                          }}
                        />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/30 to-transparent">
                        <h3 className="text-lg font-extrabold text-white line-clamp-2">
                          {v.title}
                        </h3>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </>
        )}
      </div>

      {/* VIDEO DIALOG */}
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
              className="w-full px-4 py-2 bg-[rgba(255,255,255,0.1)] rounded-lg text-white"
            />
            <input
              type="text"
              placeholder="Video URL"
              value={newVideoUrl}
              onChange={(e) => setNewVideoUrl(e.target.value)}
              className="w-full px-4 py-2 bg-[rgba(255,255,255,0.1)] rounded-lg text-white"
            />
            <div className="flex space-x-4 mt-6">
              <button
                onClick={saveVideo}
                className="px-4 py-2 bg-[#5AA5FF] rounded-lg text-white"
              >
                Save
              </button>
              <button
                onClick={closeVideoDialog}
                className="px-4 py-2 bg-[rgba(255,255,255,0.14)] rounded-lg text-white"
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
            <div className="flex space-x-4 mt-6">
              <button
                onClick={closeVideoDialog}
                className="px-4 py-2 bg-[#5AA5FF] rounded-lg text-white"
              >
                Cancel
              </button>
              <button
                onClick={deleteVideoById}
                className="px-4 py-2 bg-red-600 rounded-lg text-white"
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
