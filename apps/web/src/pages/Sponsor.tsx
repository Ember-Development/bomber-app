import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PencilSquareIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { ScrollArea } from '@/components/ui/scroll-area';
import SideDialog from '@/components/SideDialog';
import {
  fetchSponsors,
  createSponsor,
  updateSponsor,
  deleteSponsor,
  CreateSponsorDTO,
  UpdateSponsorDTO,
} from '@/api/sponsor';

export interface SponsorItem {
  id: string;
  title: string;
  url: string;
  logoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export default function Sponsors() {
  const navigate = useNavigate();
  const [sponsors, setSponsors] = useState<SponsorItem[]>([]);

  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newLogoUrl, setNewLogoUrl] = useState('');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'edit' | 'delete' | null>(null);
  const [selectedSponsor, setSelectedSponsor] = useState<SponsorItem | null>(
    null
  );

  const [editTitle, setEditTitle] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [editLogoUrl, setEditLogoUrl] = useState('');

  useEffect(() => {
    fetchSponsors().then(setSponsors).catch(console.error);
  }, []);

  const handleAddSponsor = async () => {
    if (!newTitle || !newUrl) return;
    const dto: CreateSponsorDTO = {
      title: newTitle,
      url: newUrl,
      logoUrl: newLogoUrl || undefined,
    };
    const created = await createSponsor(dto);
    if (created) {
      setSponsors((prev) => [created, ...prev]);
      setNewTitle('');
      setNewUrl('');
      setNewLogoUrl('');
    }
  };

  const openEdit = (s: SponsorItem) => {
    setDialogType('edit');
    setSelectedSponsor(s);
    setEditTitle(s.title);
    setEditUrl(s.url);
    setEditLogoUrl(s.logoUrl || '');
    setDialogOpen(true);
  };
  const openDelete = (s: SponsorItem) => {
    setDialogType('delete');
    setSelectedSponsor(s);
    setDialogOpen(true);
  };
  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedSponsor(null);
    setDialogType(null);
  };

  const saveEdit = async () => {
    if (!selectedSponsor) return;
    const dto: UpdateSponsorDTO = {
      title: editTitle,
      url: editUrl,
      logoUrl: editLogoUrl,
    };
    const updated = await updateSponsor(selectedSponsor.id, dto);
    if (updated) {
      setSponsors((prev) =>
        prev.map((s) => (s.id === updated.id ? updated : s))
      );
    }
    closeDialog();
  };

  const confirmDelete = async () => {
    if (!selectedSponsor) return;
    const ok = await deleteSponsor(selectedSponsor.id);
    if (ok) {
      setSponsors((prev) => prev.filter((s) => s.id !== selectedSponsor.id));
    }
    closeDialog();
  };

  return (
    <div className="flex relative text-white p-4">
      <div
        className={`flex-1 flex flex-col space-y-6 ${dialogOpen ? 'pr-[50px]' : ''}`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 bg-[rgba(255,255,255,0.1)] rounded-lg hover:bg-[rgba(255,255,255,0.2)] transition"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold">Sponsors</h1>
          </div>
        </div>

        <div className="bg-[rgba(255,255,255,0.05)] rounded-2xl p-4 shadow-inner space-y-4">
          <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
            <input
              type="text"
              placeholder="Sponsor Name"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="flex-1 px-4 py-2 bg-transparent border border-white/30 rounded-lg placeholder-white/70"
            />
            <input
              type="text"
              placeholder="Website URL"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              className="flex-1 px-4 py-2 bg-transparent border border-white/30 rounded-lg placeholder-white/70"
            />
          </div>
          <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
            <input
              type="text"
              placeholder="Logo Image URL"
              value={newLogoUrl}
              onChange={(e) => setNewLogoUrl(e.target.value)}
              className="flex-1 px-4 py-2 bg-transparent border border-white/30 rounded-lg placeholder-white/70"
            />
            <button
              onClick={handleAddSponsor}
              className="flex-1 px-4 py-2 bg-[#5AA5FF] rounded-lg hover:bg-[#5AA5FF]/90 transition text-center"
            >
              Add Sponsor
            </button>
          </div>
        </div>

        <div className="bg-[rgba(255,255,255,0.05)] rounded-2xl shadow-inner">
          <ScrollArea className="p-4 h-64 sm:h-80 lg:h-96">
            {sponsors.length === 0 ? (
              <div className="text-center text-white/70 py-20">No sponsors</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sponsors.map((s) => (
                  <div
                    key={s.id}
                    className="flex flex-col sm:flex-row items-center sm:justify-between p-4 bg-[rgba(255,255,255,0.1)] rounded-lg hover:bg-[rgba(255,255,255,0.2)] transition space-y-4 sm:space-y-0"
                  >
                    <div className="flex items-center space-x-4">
                      {s.logoUrl && (
                        <img
                          src={s.logoUrl}
                          alt={s.title}
                          className="w-24 h-12 object-contain rounded"
                        />
                      )}
                      <div className="text-center sm:text-left">
                        <div className="font-semibold">{s.title}</div>
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#5AA5FF] hover:underline text-sm block"
                        >
                          {s.url}
                        </a>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openEdit(s)}
                        className="p-2 bg-[rgba(255,255,255,0.1)] rounded-lg hover:bg-[rgba(255,255,255,0.2)] transition"
                      >
                        <PencilSquareIcon className="w-5 h-5 text-white" />
                      </button>
                      <button
                        onClick={() => openDelete(s)}
                        className="p-2 bg-red-600 rounded-lg hover:bg-red-500 transition"
                      >
                        <TrashIcon className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </div>

      <SideDialog
        open={dialogOpen}
        onClose={closeDialog}
        title={dialogType === 'edit' ? 'Edit Sponsor' : 'Remove Sponsor'}
      >
        {dialogType === 'edit' && selectedSponsor && (
          <div className="space-y-4">
            <label className="block text-sm font-semibold">Sponsor Name</label>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full px-4 py-2 bg-[rgba(255,255,255,0.1)] rounded-lg"
            />
            <label className="block text-sm font-semibold">Website URL</label>
            <input
              type="text"
              value={editUrl}
              onChange={(e) => setEditUrl(e.target.value)}
              className="w-full px-4 py-2 bg-[rgba(255,255,255,0.1)] rounded-lg"
            />
            <label className="block text-sm font-semibold">
              Logo Image URL
            </label>
            <input
              type="text"
              value={editLogoUrl}
              onChange={(e) => setEditLogoUrl(e.target.value)}
              className="w-full px-4 py-2 bg-[rgba(255,255,255,0.1)] rounded-lg"
            />
            <div className="flex flex-col sm:flex-row sm:space-x-4 mt-6">
              <button
                onClick={saveEdit}
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
        {dialogType === 'delete' && selectedSponsor && (
          <div className="space-y-4">
            <p>
              Are you sure you want to remove <b>{selectedSponsor.title}</b>?
            </p>
            <div className="flex flex-col sm:flex-row sm:space-x-4 mt-6">
              <button
                onClick={closeDialog}
                className="flex-1 px-4 py-2 bg-[#5AA5FF] rounded-lg text-white"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 mt-2 sm:mt-0 px-4 py-2 bg-red-600 rounded-lg text-white"
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
