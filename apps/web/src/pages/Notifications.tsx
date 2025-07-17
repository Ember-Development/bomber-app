import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PencilSquareIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { ScrollArea } from '@/components/ui/scroll-area';
import SideDialog from '@/components/SideDialog';
import {
  fetchBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  BannerFE,
} from '@/api/banner';

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  createdAt: Date;
}

export default function Notifications() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'Notifications' | 'Banners'>('Notifications');

  // Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');

  // Banners
  const [banners, setBanners] = useState<BannerFE[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newDuration, setNewDuration] = useState(1);
  const [newExpiresAt, setNewExpiresAt] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Edit/Delete dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'edit' | 'delete' | null>(null);
  const [selectedBanner, setSelectedBanner] = useState<BannerFE | null>(null);
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editDuration, setEditDuration] = useState(1);
  const [editExpiresAt, setEditExpiresAt] = useState('');

  useEffect(() => {
    fetchBanners().then(setBanners).catch(console.error);
  }, []);

  const handleDurationChange = (hrs: number) => {
    setNewDuration(hrs);
    const now = new Date();
    now.setHours(now.getHours() + hrs);
    setNewExpiresAt(now.toISOString().slice(0, 16));
  };

  const addNotification = () => {
    if (!newTitle || !newBody) return;
    setNotifications([
      {
        id: Date.now().toString(),
        title: newTitle,
        body: newBody,
        createdAt: new Date(),
      },
      ...notifications,
    ]);
    setNewTitle('');
    setNewBody('');
  };

  const addBanner = async () => {
    if (!newImageUrl || !newExpiresAt) return;
    const created = await createBanner({
      imageUrl: newImageUrl,
      duration: newDuration,
      expiresAt: new Date(newExpiresAt).toISOString(),
    });
    if (created) {
      setBanners([created, ...banners]);
      setNewImageUrl('');
      setNewDuration(1);
      setNewExpiresAt('');
    }
  };

  const openEdit = (b: BannerFE) => {
    setSelectedBanner(b);
    setEditImageUrl(b.imageUrl);
    setEditDuration(b.duration);
    setEditExpiresAt(b.expiresAt.slice(0, 16));
    setDialogType('edit');
    setDialogOpen(true);
  };
  const openDelete = (b: BannerFE) => {
    setSelectedBanner(b);
    setDialogType('delete');
    setDialogOpen(true);
  };
  const closeDialog = () => {
    setDialogOpen(false);
    setDialogType(null);
    setSelectedBanner(null);
  };

  const handleUpdate = async () => {
    if (!selectedBanner) return;
    const updated = await updateBanner(selectedBanner.id, {
      imageUrl: editImageUrl,
      duration: editDuration,
      expiresAt: new Date(editExpiresAt).toISOString(),
    });
    if (updated) {
      setBanners(banners.map((b) => (b.id === updated.id ? updated : b)));
    }
    closeDialog();
  };

  const handleDelete = async () => {
    if (!selectedBanner) return;
    const ok = await deleteBanner(selectedBanner.id);
    if (ok) {
      setBanners(banners.filter((b) => b.id !== selectedBanner.id));
    }
    closeDialog();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setNewImageUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  return (
    <div className="flex flex-col p-4 space-y-6 text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-[rgba(255,255,255,0.1)] rounded-lg hover:bg-[rgba(255,255,255,0.2)] transition"
          >
            <ArrowLeftIcon className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-2xl font-bold">Notifications</h1>
        </div>
        <div className="flex space-x-2">
          {(['Notifications', 'Banners'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg transition ${
                tab === t
                  ? 'bg-[#5AA5FF] text-white'
                  : 'bg-[rgba(255,255,255,0.1)] text-white/70 hover:bg-[rgba(255,255,255,0.2)]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Content Panel */}
      <div className="bg-[rgba(255,255,255,0.07)] backdrop-blur-lg rounded-2xl p-6 shadow-inner">
        <ScrollArea className="space-y-8">
          {tab === 'Notifications' ? (
            <>
              {/* Create Notification */}
              <div className="flex flex-col sm:space-x-4 space-y-4  mb-8">
                <input
                  type="text"
                  placeholder="Title"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="flex-1 px-4 py-2 bg-[rgba(255,255,255,0.11)] placeholder-white/70 rounded-lg focus:outline-none"
                />
                <textarea
                  placeholder="Body"
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                  className="flex-1 px-4 py-2 bg-[rgba(255,255,255,0.11)] placeholder-white/70 rounded-lg focus:outline-none h-24 resize-none"
                />
                <button
                  onClick={addNotification}
                  className="whitespace-nowrap px-4 py-2 bg-[#5AA5FF] rounded-lg hover:bg-[#5AA5FF]/90 transition font-semibold"
                >
                  Create
                </button>
              </div>

              {/* List Notifications */}
              <div className="space-y-4">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="flex flex-col sm:flex-row sm:justify-between bg-[rgba(255,255,255,0.1)] p-4 rounded-lg hover:bg-[rgba(255,255,255,0.18)] transition"
                  >
                    <div>
                      <h3 className="text-lg font-semibold">{n.title}</h3>
                      <span className="text-sm text-white/70">
                        {n.createdAt.toLocaleString()}
                      </span>
                      <p className="mt-2 text-white/80">{n.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              {/* Create Banner */}
              <div className="flex flex-col space-y-4 mb-8">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">
                    Banner Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="file:bg-[#5AA5FF] file:text-white"
                  />
                </div>
                {newImageUrl && (
                  <div className="flex flex-col items-center space-y-2">
                    <img
                      src={newImageUrl}
                      alt="Preview"
                      className="rounded-xl border border-white/10 w-full max-w-lg aspect-video object-cover shadow mt-2"
                    />
                    <button
                      onClick={() => setPreviewUrl(newImageUrl)}
                      className="px-4 py-2 bg-[rgba(0,0,0,0.6)] hover:bg-[rgba(0,0,0,0.8)] text-white rounded-lg transition"
                    >
                      Preview
                    </button>
                  </div>
                )}
                <div>
                  <div className="mb-1 text-sm font-medium text-white/70">
                    Duration
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[1, 6, 12, 24].map((hrs) => (
                      <button
                        key={hrs}
                        onClick={() => handleDurationChange(hrs)}
                        className={`px-3 py-1 rounded-full font-semibold text-sm transition ${
                          newDuration === hrs
                            ? 'bg-[#5AA5FF] text-white shadow'
                            : 'bg-[rgba(255,255,255,0.11)] text-white/70 hover:bg-[#5AA5FF]/30'
                        }`}
                      >
                        {hrs} hr
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">
                    Expires At
                  </label>
                  <input
                    type="datetime-local"
                    value={newExpiresAt}
                    onChange={(e) => setNewExpiresAt(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[rgba(255,255,255,0.13)] text-white focus:outline-none"
                  />
                </div>
                <button
                  onClick={addBanner}
                  className="w-full sm:w-auto px-4 py-2 bg-[#5AA5FF] rounded-lg hover:bg-[#5AA5FF]/90 transition font-semibold"
                >
                  Create Banner
                </button>
              </div>

              {/* List Banners */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {banners.length === 0 ? (
                  <div className="col-span-full text-center text-white/70 py-10">
                    No banners
                  </div>
                ) : (
                  banners.map((b) => (
                    <div
                      key={b.id}
                      className="flex items-center justify-between bg-[rgba(255,255,255,0.1)] p-4 rounded-lg hover:bg-[rgba(255,255,255,0.18)] transition"
                    >
                      <img
                        src={b.imageUrl}
                        alt=""
                        className="w-24 h-12 object-cover rounded"
                      />
                      <div className="flex space-x-2">
                        <button onClick={() => openEdit(b)}>
                          <PencilSquareIcon className="w-5 h-5 text-white" />
                        </button>
                        <button onClick={() => openDelete(b)}>
                          <TrashIcon className="w-5 h-5 text-white" />
                        </button>
                      </div>
                    </div>
                  ))
                )}

                {previewUrl && (
                  <div
                    className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
                    onClick={() => setPreviewUrl(null)}
                  >
                    <div
                      className="relative bg-white rounded-2xl overflow-hidden max-w-md w-full"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <img
                        src={previewUrl}
                        alt="Banner Preview"
                        className="w-full h-auto object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                        <button
                          onClick={() => {
                            /* your CTA logic */
                          }}
                          className="w-full text-center bg-white text-black py-2 rounded-full"
                        >
                          Read More
                        </button>
                      </div>
                      <button
                        onClick={() => setPreviewUrl(null)}
                        className="absolute top-2 right-2 text-white bg-black/50 hover:bg-black/80 p-1 rounded-full"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </ScrollArea>
      </div>

      {/* Edit/Delete SideDialog */}
      <SideDialog
        open={dialogOpen}
        onClose={closeDialog}
        title={dialogType === 'edit' ? 'Edit Banner' : 'Delete Banner'}
      >
        {dialogType === 'edit' && selectedBanner && (
          <div className="space-y-4">
            <label className="block text-sm text-white font-semibold">
              Image URL
            </label>
            <input
              type="text"
              value={editImageUrl}
              onChange={(e) => setEditImageUrl(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-[rgba(255,255,255,0.1)] text-white"
            />

            <label className="block text-sm text-white font-semibold">
              Duration (hrs)
            </label>
            <input
              type="number"
              value={editDuration}
              onChange={(e) => setEditDuration(Number(e.target.value))}
              className="w-full px-4 py-2 rounded-lg bg-[rgba(255,255,255,0.1)] text-white"
            />

            <label className="block text-sm text-white font-semibold">
              Expires At
            </label>
            <input
              type="datetime-local"
              value={editExpiresAt}
              onChange={(e) => setEditExpiresAt(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-[rgba(255,255,255,0.1)] text-white"
            />

            <div className="flex flex-col sm:flex-row sm:space-x-4 mt-6">
              <button
                onClick={handleUpdate}
                className="flex-1 px-4 py-2 bg-[#5AA5FF] rounded-lg text-white"
              >
                Save
              </button>
              <button
                onClick={closeDialog}
                className="flex-1 mt-2 sm:mt-0 px-4 py-2 bg-[rgba(255,255,255,0.14)] rounded-lg text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        {dialogType === 'delete' && selectedBanner && (
          <div className="space-y-4">
            <p className="text-white">
              Are you sure you want to delete this banner?
            </p>
            <div className="flex flex-col sm:flex-row sm:space-x-4 mt-6">
              <button
                onClick={closeDialog}
                className="flex-1 px-4 py-2 bg-[#5AA5FF] rounded-lg text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 mt-2 sm:mt-0 px-4 py-2 bg-red-600 rounded-lg text-white"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </SideDialog>
    </div>
  );
}
