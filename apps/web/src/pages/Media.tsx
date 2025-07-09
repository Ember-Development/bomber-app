import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PlayCircleIcon,
  PencilSquareIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { ScrollArea } from '@/components/ui/scroll-area';
import SideDialog from '@/components/sideDialog';
import { ARTICLES, VIDEOS } from '@/constants/mediaItems';

type TabType = 'Articles' | 'Videos';

export default function Media() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabType>('Articles');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<
    'create' | 'edit' | 'delete' | null
  >(null);
  const [selectedItem, setSelectedItem] = useState<any>(null); // Article | Video

  const items = tab === 'Articles' ? ARTICLES : VIDEOS;

  // Dialog handlers
  const handleOpenCreate = () => {
    setDialogType('create');
    setSelectedItem(null);
    setDialogOpen(true);
  };
  const handleOpenEdit = (item: any) => {
    setDialogType('edit');
    setSelectedItem(item);
    setDialogOpen(true);
  };
  const handleOpenDelete = (item: any) => {
    setDialogType('delete');
    setSelectedItem(item);
    setDialogOpen(true);
  };
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setDialogType(null);
    setSelectedItem(null);
  };

  return (
    <div className="flex relative min-h-screen">
      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col space-y-6 transition-all text-white duration-300 ${dialogOpen ? 'pr-[50px]' : ''}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 bg-[rgba(255,255,255,0.1)] backdrop-blur-lg rounded-lg hover:bg-[rgba(255,255,255,0.2)] transition"
            >
              <ArrowLeftIcon className="w-5 h-5 text-white" />
            </button>
            <h1 className="text-2xl font-bold">Media</h1>
          </div>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-[rgba(255,255,255,0.15)] backdrop-blur-lg border border-white/30 rounded-full hover:bg-[#5AA5FF] transition"
          >
            Create New Media
          </button>
        </div>
        {/* Tabs */}
        <div className="flex space-x-6 border-b border-white/30 pb-2">
          {(['Articles', 'Videos'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`pb-2 text-lg font-medium rounded-t-lg transition-colors ${
                tab === t
                  ? 'border-b-2 border-[#5AA5FF] text-white'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        {/* Content Panel */}
        <div className="bg-[rgba(255,255,255,0.05)] backdrop-blur-lg rounded-2xl p-4 shadow-inner">
          <ScrollArea className="py-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {items.map((item) => {
                const imgUrl =
                  'imageUrl' in item ? item.imageUrl : item.thumbnailUrl;
                return (
                  <div
                    key={item.id}
                    className="relative overflow-hidden rounded-xl cursor-pointer group"
                    onClick={() => handleOpenEdit(item)}
                  >
                    {/* Cover Image */}
                    <img
                      src={imgUrl}
                      alt={item.title}
                      className="w-full h-48 object-cover"
                    />

                    {/* Black overlay */}
                    <div className="absolute inset-0 bg-black/70" />

                    {/* EDIT & DELETE BUTTONS - top right */}
                    <div className="absolute top-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition">
                      <button
                        className="p-2 bg-[rgba(255,255,255,0.15)] rounded-lg hover:bg-[#5AA5FF] transition"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEdit(item);
                        }}
                        title="Edit"
                      >
                        <PencilSquareIcon className="w-5 h-5 text-white" />
                      </button>
                      <button
                        className="p-2 bg-red-600 bg-opacity-80 rounded-lg hover:bg-red-500 transition"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDelete(item);
                        }}
                        title="Delete"
                      >
                        <TrashIcon className="w-5 h-5 text-white" />
                      </button>
                    </div>

                    {/* Bottom info */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/30 to-transparent">
                      <h3 className="text-lg font-extrabold text-white line-clamp-2">
                        {item.title}
                      </h3>
                      {tab === 'Articles' && (
                        <p className="text-sm font-medium text-white/80 line-clamp-2 mt-1">
                          {item.summary}
                        </p>
                      )}
                    </div>

                    {/* Play icon for videos */}
                    {tab === 'Videos' && 'videoUrl' in item && (
                      <a
                        href={item.videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="absolute inset-0 flex items-center justify-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <PlayCircleIcon className="w-12 h-12 text-white opacity-80" />
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* SideDialog */}
      <SideDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        title={
          dialogType === 'create'
            ? `Create New ${tab.slice(0, -1)}`
            : dialogType === 'edit'
              ? `Edit ${tab.slice(0, -1)}`
              : dialogType === 'delete'
                ? `Delete ${tab.slice(0, -1)}`
                : ''
        }
      >
        {dialogType === 'create' && (
          <div>
            <p className="text-white">[Add {tab.slice(0, -1)} Form]</p>
          </div>
        )}
        {dialogType === 'edit' && selectedItem && (
          <div>
            <p className="text-white">
              [Edit {tab.slice(0, -1)}: <b>{selectedItem.title}</b>]
            </p>
            <div className="flex space-x-4 mt-6">
              <button
                className="px-4 py-2 bg-[#5AA5FF] text-white rounded-lg hover:bg-[#3C8CE7] transition"
                onClick={handleCloseDialog}
              >
                Close
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition"
                onClick={() => setDialogType('delete')}
              >
                Delete
              </button>
            </div>
          </div>
        )}
        {dialogType === 'delete' && selectedItem && (
          <div>
            <p className="text-white">
              Are you sure you want to delete <b>{selectedItem.title}</b>?
            </p>
            <div className="flex space-x-4 mt-6">
              <button
                className="px-4 py-2 bg-[#5AA5FF] text-white rounded-lg hover:bg-[#3C8CE7] transition"
                onClick={handleCloseDialog}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition"
                onClick={handleCloseDialog}
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
