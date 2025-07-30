// src/components/forms/CreateArticleForm.tsx
import React, { useState } from 'react';
import { createArticle, ArticleFE } from '@/api/article';

interface Props {
  onSuccess: (newArticle: ArticleFE) => void;
}

export default function CreateArticleForm({ onSuccess }: Props) {
  // Local editor state
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [link, setLink] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const formattedDate = new Date().toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const save = async () => {
    setLoading(true);
    try {
      const art = await createArticle({
        title,
        body,
        link: link || undefined,
        imageUrl: imageUrl || undefined,
      });
      if (art) {
        onSuccess(art);
      } else {
        alert('Failed to create article.');
      }
    } catch (e) {
      console.error(e);
      alert('Error saving article.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Editor */}
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Headline"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2 bg-white/10 text-white rounded-lg"
        />

        <textarea
          placeholder="Body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="w-full h-32 px-4 py-2 bg-white/10 text-white rounded-lg"
        />

        <input
          type="text"
          placeholder="Link (optional)"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          className="w-full px-4 py-2 bg-white/10 text-white rounded-lg"
        />

        <input
          type="text"
          placeholder="Image URL (optional)"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className="w-full px-4 py-2 bg-white/10 text-white rounded-lg"
        />

        <div className="flex space-x-4 mt-4">
          <button
            onClick={save}
            disabled={loading || !title || !body}
            className="flex-1 px-4 py-2 bg-[#5AA5FF] text-white rounded-lg disabled:opacity-50"
          >
            {loading ? 'Saving…' : 'Save Article'}
          </button>
        </div>
      </div>

      {/* Preview */}
      <div className="relative h-[60vh] overflow-hidden rounded-2xl bg-black/20">
        {/* Background Image */}
        {imageUrl && (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${imageUrl})` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-transparent" />

        <div className="relative z-10 h-full flex flex-col justify-center px-6">
          <small className="text-white/60 uppercase tracking-wide mb-2">
            {formattedDate}
          </small>
          <h1 className="text-3xl lg:text-5xl font-extrabold text-white mb-4 drop-shadow-lg">
            {title || 'Your Headline Goes Here'}
          </h1>
          <p className="text-white/90 text-base lg:text-lg max-w-xl">
            {body.split('\n')[0] ||
              'A strong opening sentence to hook your reader—that’s what this preview is for.'}
          </p>
        </div>
      </div>
    </div>
  );
}
