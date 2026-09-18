import React, { useState } from 'react';
import { Container } from '../types';
import { Trash2, AlertTriangle, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  container: Container | null;
  onClose: () => void;
  onConfirmDelete: (id: string, containerNumber: string, reason: string) => Promise<void>;
}

export const DeleteConfirmModal: React.FC<Props> = ({
  isOpen,
  container,
  onClose,
  onConfirmDelete,
}) => {
  const [confirmInput, setConfirmInput] = useState('');
  const [reason, setReason] = useState('Pembatalan transaksi gate in');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !container) return null;

  const isMatching = confirmInput.trim().toUpperCase() === container.containerNumber.toUpperCase();

  const handleDelete = async () => {
    if (!isMatching) {
      setError('Ketik nomor kontainer dengan tepat untuk mengonfirmasi penghapusan.');
      return;
    }

    setDeleting(true);
    setError(null);
    try {
      await onConfirmDelete(container.id!, container.containerNumber, reason);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal menghapus data dari Firestore.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 text-slate-800 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5 text-rose-600">
            <div className="p-2 rounded-xl bg-rose-50 border border-rose-200">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">
              Konfirmasi Hapus Peti Kemas
            </h3>
          </div>
          <button
            id="btn-close-delete-modal"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 text-sm text-slate-600 space-y-3">
          <p>
            Anda akan menghapus data kontainer berikut secara permanen dari basis data produksi terminal:
          </p>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Nomor Kontainer:</span>
              <span className="font-bold text-slate-900">{container.containerNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Tipe / Ukuran:</span>
              <span className="text-slate-800">{container.isoType} ({container.size})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Pelayaran / Kapal:</span>
              <span className="text-slate-800">{container.shippingLine} - {container.vesselName || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Lokasi Yard:</span>
              <span className="text-slate-800">{container.yardBlock}-{container.yardBay}-{container.yardRow}-{container.yardTier}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Alasan Penghapusan (Audit Trail)
            </label>
            <select
              id="select-delete-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              <option value="Pembatalan transaksi gate in">Pembatalan transaksi gate in</option>
              <option value="Koreksi input duplikat operator">Koreksi input duplikat operator</option>
              <option value="Peti kemas ditolak masuk (karantina/rusak)">Peti kemas ditolak masuk (karantina/rusak)</option>
              <option value="Penghapusan data uji coba">Penghapusan data uji coba</option>
              <option value="Lainnya / Otorisasi Admin">Lainnya / Otorisasi Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Ketik <span className="font-mono text-rose-600 font-bold">{container.containerNumber}</span> untuk validasi keamanan:
            </label>
            <input
              id="input-confirm-delete-number"
              type="text"
              value={confirmInput}
              onChange={(e) => {
                setConfirmInput(e.target.value);
                setError(null);
              }}
              placeholder={`Ketik ${container.containerNumber}`}
              className="w-full px-3 py-2 text-sm font-mono uppercase bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {error && (
            <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200">
              {error}
            </p>
          )}
        </div>

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            id="btn-cancel-delete"
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Batalkan
          </button>
          <button
            id="btn-confirm-delete-action"
            type="button"
            disabled={!isMatching || deleting}
            onClick={handleDelete}
            className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm shadow-rose-200 flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            {deleting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Menghapus...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Data</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
