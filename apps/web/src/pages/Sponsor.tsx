import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PencilSquareIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { ScrollArea } from '@/components/ui/scroll-area';
import SideDialog from '@/components/sideDialog';

interface SponsorItem {
  id: string;
  name: string;
  website: string;
  logoUrl: string;
  createdAt: Date;
}

export default function Sponsors() {
  const navigate = useNavigate();
  const [sponsors, setSponsors] = useState<SponsorItem[]>([]);
  const [newName, setNewName] = useState('');
  const [newWebsite, setNewWebsite] = useState('');
  const [newLogoUrl, setNewLogoUrl] = useState('');

  // Side dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'edit' | 'delete' | null>(null);
  const [selectedSponsor, setSelectedSponsor] = useState<SponsorItem | null>(
    null
  );

  // Edit form fields
  const [editName, setEditName] = useState('');
  const [editWebsite, setEditWebsite] = useState('');
  const [editLogoUrl, setEditLogoUrl] = useState('');

  // Add Sponsor
  const addSponsor = () => {
    if (!newName || !newWebsite) return;
    setSponsors([
      {
        id: Date.now().toString(),
        name: newName,
        website: newWebsite,
        logoUrl: newLogoUrl,
        createdAt: new Date(),
      },
      ...sponsors,
    ]);
    setNewName('');
    setNewWebsite('');
    setNewLogoUrl('');
  };

  // Dialog Openers
  const handleOpenEdit = (s: SponsorItem) => {
    setDialogType('edit');
    setSelectedSponsor(s);
    setEditName(s.name);
    setEditWebsite(s.website);
    setEditLogoUrl(s.logoUrl);
    setDialogOpen(true);
  };
  const handleOpenDelete = (s: SponsorItem) => {
    setDialogType('delete');
    setSelectedSponsor(s);
    setDialogOpen(true);
  };
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setDialogType(null);
    setSelectedSponsor(null);
  };

  // Save Edit
  const saveEdit = () => {
    if (!selectedSponsor) return;
    setSponsors((prev) =>
      prev.map((s) =>
        s.id === selectedSponsor.id
          ? { ...s, name: editName, website: editWebsite, logoUrl: editLogoUrl }
          : s
      )
    );
    handleCloseDialog();
  };

  // Delete
  const confirmDelete = () => {
    if (!selectedSponsor) return;
    setSponsors((prev) => prev.filter((s) => s.id !== selectedSponsor.id));
    handleCloseDialog();
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
            <h1 className="text-2xl font-bold">Sponsors</h1>
          </div>
        </div>

        {/* Create Sponsor */}
        <div className="bg-[rgba(255,255,255,0.05)] backdrop-blur-lg rounded-2xl p-4 shadow-inner space-y-4">
          <input
            type="text"
            placeholder="Sponsor Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full px-4 py-2 bg-transparent border border-white/30 rounded-lg placeholder-white/70 text-white focus:outline-none"
          />
          <input
            type="text"
            placeholder="Website URL"
            value={newWebsite}
            onChange={(e) => setNewWebsite(e.target.value)}
            className="w-full px-4 py-2 bg-transparent border border-white/30 rounded-lg placeholder-white/70 text-white focus:outline-none"
          />
          <input
            type="text"
            placeholder="Logo Image URL"
            value={newLogoUrl}
            onChange={(e) => setNewLogoUrl(e.target.value)}
            className="w-full px-4 py-2 bg-transparent border border-white/30 rounded-lg placeholder-white/70 text-white focus:outline-none"
          />
          <button
            onClick={addSponsor}
            className="px-4 py-2 bg-[#5AA5FF] text-white rounded-lg hover:bg-[#5AA5FF]/90 transition"
          >
            Add Sponsor
          </button>
        </div>

        {/* Sponsor List */}
        <div className="flex-1 bg-[rgba(255,255,255,0.05)] backdrop-blur-lg rounded-2xl shadow-inner">
          <ScrollArea className="h-[400px] p-4">
            {sponsors.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between p-4 mb-3 bg-[rgba(255,255,255,0.1)] backdrop-blur-lg rounded-lg transition hover:bg-[rgba(255,255,255,0.2)]"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={s.logoUrl}
                    alt={s.name}
                    className="w-16 h-8 object-contain rounded"
                  />
                  <div>
                    <div className="font-semibold text-white text-lg">
                      {s.name}
                    </div>
                    <a
                      href={s.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#5AA5FF] hover:underline"
                    >
                      {s.website}
                    </a>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleOpenEdit(s)}
                    className="p-2 bg-[rgba(255,255,255,0.1)] text-white rounded-lg hover:bg-[rgba(255,255,255,0.2)] transition"
                  >
                    <PencilSquareIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleOpenDelete(s)}
                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-500/90 transition"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </ScrollArea>
        </div>
      </div>

      {/* SideDialog */}
      <SideDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        title={
          dialogType === 'edit'
            ? 'Edit Sponsor'
            : dialogType === 'delete'
              ? 'Remove Sponsor'
              : ''
        }
      >
        {/* Edit Sponsor */}
        {dialogType === 'edit' && selectedSponsor && (
          <div className="space-y-4">
            <label className="block text-sm text-white font-semibold">
              Sponsor Name
            </label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-4 py-2 bg-[rgba(255,255,255,0.1)] border border-white/30 rounded-lg placeholder-white/70 text-white focus:outline-none"
            />
            <label className="block text-sm text-white font-semibold">
              Website URL
            </label>
            <input
              type="text"
              value={editWebsite}
              onChange={(e) => setEditWebsite(e.target.value)}
              className="w-full px-4 py-2 bg-[rgba(255,255,255,0.1)] border border-white/30 rounded-lg placeholder-white/70 text-white focus:outline-none"
            />
            <label className="block text-sm text-white font-semibold">
              Logo Image URL
            </label>
            <input
              type="text"
              value={editLogoUrl}
              onChange={(e) => setEditLogoUrl(e.target.value)}
              className="w-full px-4 py-2 bg-[rgba(255,255,255,0.1)] border border-white/30 rounded-lg placeholder-white/70 text-white focus:outline-none"
            />
            <div className="flex space-x-4 mt-6">
              <button
                className="px-4 py-2 bg-[#5AA5FF] text-white rounded-lg hover:bg-[#3C8CE7] transition"
                onClick={saveEdit}
              >
                Save
              </button>
              <button
                className="px-4 py-2 bg-[rgba(255,255,255,0.14)] text-white rounded-lg hover:bg-[#5AA5FF] transition"
                onClick={handleCloseDialog}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        {/* Remove Sponsor */}
        {dialogType === 'delete' && selectedSponsor && (
          <div>
            <p className="text-white">
              Are you sure you want to remove <b>{selectedSponsor.name}</b>?
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
                onClick={confirmDelete}
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
