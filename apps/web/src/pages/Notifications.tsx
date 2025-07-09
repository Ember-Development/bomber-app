// apps/web/src/pages/Notifications.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { ScrollArea } from '@/components/ui/scroll-area';

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  createdAt: Date;
}
interface BannerItem {
  id: string;
  message: string;
  createdAt: Date;
  expiresAt: string;
  imageUrl?: string;
}

export default function Notifications() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'Notifications' | 'Banners'>('Notifications');

  // Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');

  // Banners
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [newExpiresAt, setNewExpiresAt] = useState('');
  const [newDuration, setNewDuration] = useState<number>(1); // hours
  const [bannerImage, setBannerImage] = useState<File | null>(null);
  const [bannerImageUrl, setBannerImageUrl] = useState<string>('');

  // Banner helpers
  const handleDurationChange = (hrs: number) => {
    setNewDuration(hrs);
    const now = new Date();
    now.setHours(now.getHours() + hrs);
    // Set to ISO string for input[type="datetime-local"]
    setNewExpiresAt(now.toISOString().slice(0, 16));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setBannerImage(e.target.files[0]);
      setBannerImageUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  // Create notification
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

  // Create banner
  const addBanner = () => {
    if (!newMessage || !newExpiresAt) return;
    setBanners([
      {
        id: Date.now().toString(),
        message: newMessage,
        createdAt: new Date(),
        expiresAt: newExpiresAt,
        imageUrl: bannerImageUrl,
      },
      ...banners,
    ]);
    setNewMessage('');
    setNewExpiresAt('');
    setBannerImage(null);
    setBannerImageUrl('');
    setNewDuration(1);
  };

  return (
    <div className="flex flex-col space-y-6 text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-[rgba(255,255,255,0.1)] backdrop-blur-lg rounded-lg hover:bg-[rgba(255,255,255,0.2)] transition"
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

      {/* Glassy Content Panel */}
      <div className="bg-[rgba(255,255,255,0.07)] backdrop-blur-lg rounded-2xl p-6 shadow-inner">
        <ScrollArea className="space-y-8">
          {tab === 'Notifications' ? (
            <>
              {/* Create Notification */}
              <div className="space-y-3 mb-8">
                <input
                  type="text"
                  placeholder="Title"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-2 bg-[rgba(255,255,255,0.11)] placeholder-white/70 text-white rounded-lg focus:outline-none"
                />
                <textarea
                  placeholder="Body"
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                  className="w-full px-4 py-2 bg-[rgba(255,255,255,0.11)] placeholder-white/70 text-white rounded-lg focus:outline-none h-24 resize-none"
                />
                <button
                  onClick={addNotification}
                  className="px-4 py-2 bg-[#5AA5FF] text-white rounded-lg hover:bg-[#5AA5FF]/90 transition font-semibold"
                >
                  Create Notification
                </button>
              </div>

              {/* List Notifications */}
              <div className="space-y-4">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="bg-[rgba(255,255,255,0.1)] backdrop-blur-lg p-4 rounded-lg hover:bg-[rgba(255,255,255,0.18)] transition"
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">{n.title}</h3>
                      <span className="text-sm text-white/70">
                        {n.createdAt.toLocaleDateString()}{' '}
                        {n.createdAt.toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="mt-2 text-white/80">{n.body}</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              {/* Create Banner */}
              <div className="space-y-4 mb-8">
                <input
                  type="text"
                  placeholder="Banner Message"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="w-full px-4 py-2 bg-[rgba(255,255,255,0.11)] placeholder-white/70 text-white rounded-lg focus:outline-none"
                />
                {/* Duration buttons */}
                <div>
                  <div className="mb-1 text-sm font-medium text-white/70">
                    Duration
                  </div>
                  <div className="flex space-x-2">
                    {[1, 6, 12, 24].map((hrs) => (
                      <button
                        key={hrs}
                        type="button"
                        className={`px-3 py-1 rounded-full font-semibold transition text-sm ${
                          newDuration === hrs
                            ? 'bg-[#5AA5FF] text-white shadow'
                            : 'bg-[rgba(255,255,255,0.11)] text-white/70 hover:bg-[#5AA5FF]/30'
                        }`}
                        onClick={() => handleDurationChange(hrs)}
                      >
                        {hrs} hr
                      </button>
                    ))}
                  </div>
                  <div className="mt-3">
                    <label className="text-xs text-white/50 mr-2">
                      Banner expires at:
                    </label>
                    <input
                      type="datetime-local"
                      value={newExpiresAt}
                      onChange={(e) => setNewExpiresAt(e.target.value)}
                      className="px-2 py-1 rounded bg-[rgba(255,255,255,0.13)] text-white border-none focus:outline-none"
                    />
                  </div>
                </div>
                {/* Image upload */}
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">
                    Banner Image (16:9)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full text-white file:bg-[#5AA5FF] file:text-white file:rounded-full file:px-4 file:py-1 file:mr-4"
                  />
                  {bannerImageUrl && (
                    <div className="mt-2">
                      <img
                        src={bannerImageUrl}
                        alt="Banner Preview"
                        className="rounded-xl border border-white/10 w-full max-w-lg aspect-video object-cover shadow"
                      />
                      <div className="text-xs text-white/60 mt-1">
                        (16:9 ratio recommended)
                      </div>
                    </div>
                  )}
                </div>
                <button
                  onClick={addBanner}
                  className="px-4 py-2 bg-[#5AA5FF] text-white rounded-lg hover:bg-[#5AA5FF]/90 transition font-semibold"
                >
                  Create Banner
                </button>
              </div>
              {/* List Banners */}
              <div className="space-y-4">
                {banners.map((b) => (
                  <div
                    key={b.id}
                    className="bg-[rgba(255,255,255,0.1)] backdrop-blur-lg p-4 rounded-lg hover:bg-[rgba(255,255,255,0.18)] transition"
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">{b.message}</h3>
                      <span className="text-sm text-white/70">
                        created {b.createdAt.toLocaleDateString()}
                      </span>
                    </div>
                    {b.imageUrl && (
                      <img
                        src={b.imageUrl}
                        alt="Banner"
                        className="mt-2 rounded-xl border border-white/10 w-full max-w-lg aspect-video object-cover shadow"
                      />
                    )}
                    <p className="mt-2 text-white/80">
                      Expires: {new Date(b.expiresAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
