import React from 'react';
import { Container } from '../types';
import { 
  X, 
  Edit3, 
  Trash2, 
  MapPin, 
  Anchor, 
  Weight, 
  Truck, 
  Calendar, 
  FileText, 
  Snowflake, 
  Flame, 
  QrCode,
  CheckCircle2
} from 'lucide-react';
import { formatContainerNumberDisplay } from '../utils/validators';

interface Props {
  isOpen: boolean;
  container: Container | null;
  onClose: () => void;
  onEdit: (container: Container) => void;
  onDelete: (container: Container) => void;
}

export const ContainerDetailModal: React.FC<Props> = ({
  isOpen,
  container,
  onClose,
  onEdit,
  onDelete,
}) => {
  if (!isOpen || !container) return null;

  const statusColors: Record<string, string> = {
    'GATE IN': 'bg-blue-50 text-blue-700 border-blue-200',
    'YARD STACK': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'LOADING': 'bg-purple-50 text-purple-700 border-purple-200',
    'DISCHARGING': 'bg-sky-50 text-sky-700 border-sky-200',
    'GATE OUT': 'bg-slate-100 text-slate-700 border-slate-300',
    'INSPECTION': 'bg-amber-50 text-amber-700 border-amber-200',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header with Container ID */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-mono font-bold text-base shadow-sm">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xl font-bold tracking-wider">
                  {formatContainerNumberDisplay(container.containerNumber)}
                </span>
                <span className={`px-2 py-0.5 text-[11px] font-bold rounded-md border ${statusColors[container.status] || 'bg-slate-800 text-slate-200'}`}>
                  {container.status}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {container.shippingLine} &bull; {container.isoType} ({container.size}) &bull; Kategori: {container.category}
              </p>
            </div>
          </div>
          <button
            id="btn-close-detail-modal"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-800 text-sm">
          {/* Reefer / DG Alerts if any */}
          {(container.isReefer || container.isHazardous) && (
            <div className="flex flex-wrap gap-2">
              {container.isReefer && (
                <div className="px-3 py-1.5 bg-cyan-50 border border-cyan-200 rounded-xl flex items-center gap-2 text-xs font-semibold text-cyan-800">
                  <Snowflake className="w-4 h-4 text-cyan-600" />
                  <span>Reefer Aktif: Suhu {container.reeferTemp ?? '-18'}°C</span>
                </div>
              )}
              {container.isHazardous && (
                <div className="px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-xs font-semibold text-amber-800">
                  <Flame className="w-4 h-4 text-amber-600" />
                  <span>Muatan Berbahaya (DG): {container.imoClass || 'IMO Regulated'}</span>
                </div>
              )}
            </div>
          )}

          {/* Yard Location Spotlight */}
          <div className="p-4 bg-blue-50/60 border border-blue-200/80 rounded-xl">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-800 mb-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>Lokasi Penumpukan Lapangan (Yard Slot)</span>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-white p-2.5 rounded-lg border border-blue-100 shadow-2xs">
                <span className="block text-[10px] uppercase font-bold text-slate-400">Blok</span>
                <span className="text-lg font-black text-blue-700">{container.yardBlock}</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-blue-100 shadow-2xs">
                <span className="block text-[10px] uppercase font-bold text-slate-400">Bay (Kolom)</span>
                <span className="text-lg font-mono font-bold text-slate-800">{container.yardBay}</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-blue-100 shadow-2xs">
                <span className="block text-[10px] uppercase font-bold text-slate-400">Row (Lajur)</span>
                <span className="text-lg font-mono font-bold text-slate-800">{container.yardRow}</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-blue-100 shadow-2xs">
                <span className="block text-[10px] uppercase font-bold text-slate-400">Tier (Tingkat)</span>
                <span className="text-lg font-mono font-bold text-slate-800">{container.yardTier}</span>
              </div>
            </div>
          </div>

          {/* Weight Matrix */}
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              <Weight className="w-4 h-4 text-amber-600" />
              <span>Rincian Bobot (VGM Standar Maritim)</span>
            </div>
            <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div>
                <span className="text-xs text-slate-500 block">Berat Kotor (Gross)</span>
                <span className="font-mono font-bold text-base text-slate-900">
                  {container.grossWeight.toLocaleString('id-ID')} kg
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Berat Kosong (Tare)</span>
                <span className="font-mono font-bold text-base text-slate-700">
                  {container.tareWeight.toLocaleString('id-ID')} kg
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Muatan Bersih (Payload)</span>
                <span className="font-mono font-bold text-base text-emerald-600">
                  {container.payloadWeight.toLocaleString('id-ID')} kg
                </span>
              </div>
            </div>
          </div>

          {/* Logistics, Vessel & Consignee */}
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              <Anchor className="w-4 h-4 text-slate-600" />
              <span>Informasi Kapal & Pemilik Kargo</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block">Nama Kapal:</span>
                <span className="font-semibold text-slate-800">{container.vesselName || 'Belum Ditugaskan'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Nomor Voyage:</span>
                <span className="font-mono font-semibold text-slate-800">{container.voyageNumber || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Nomor Segel (Seal):</span>
                <span className="font-mono font-semibold text-slate-800">{container.sealNumber || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Plat Truk Penarik:</span>
                <span className="font-mono font-semibold text-slate-800">{container.truckPlate || 'N/A'}</span>
              </div>
              <div className="col-span-2 pt-2 border-t border-slate-200">
                <span className="text-slate-400 block">Pemilik Kargo (Consignee):</span>
                <span className="font-semibold text-slate-900">{container.consignee || 'Tidak dicantumkan'}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {container.notes && (
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                <FileText className="w-4 h-4 text-slate-600" />
                <span>Catatan Lapangan & Kondisi Fisik</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
                {container.notes}
              </div>
            </div>
          )}

          {/* Timestamps & Operator */}
          <div className="pt-3 border-t border-slate-200 flex flex-wrap justify-between text-[11px] text-slate-400">
            <div>
              Didaftarkan: {new Date(container.createdAt).toLocaleString('id-ID')}
            </div>
            <div>
              Operator Terakhir: <span className="text-slate-600 font-medium">{container.updatedBy}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            id="btn-delete-from-detail"
            type="button"
            onClick={() => {
              onClose();
              onDelete(container);
            }}
            className="px-3.5 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Hapus Peti Kemas</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              id="btn-edit-from-detail"
              type="button"
              onClick={() => {
                onClose();
                onEdit(container);
              }}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
