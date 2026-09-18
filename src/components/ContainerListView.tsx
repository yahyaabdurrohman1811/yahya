import React, { useState, useMemo } from 'react';
import { Container, ContainerStatus, CargoCategory } from '../types';
import { 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit3, 
  Trash2, 
  Snowflake, 
  Flame, 
  ArrowUpDown, 
  Download, 
  RefreshCw,
  Layers,
  CheckCircle2,
  AlertCircle,
  Truck,
  Ship,
  Sparkles
} from 'lucide-react';
import { formatContainerNumberDisplay } from '../utils/validators';

interface Props {
  containers: Container[];
  loading: boolean;
  onOpenCreate: () => void;
  onViewDetail: (container: Container) => void;
  onEdit: (container: Container) => void;
  onDelete: (container: Container) => void;
  onQuickStatusChange: (container: Container, nextStatus: ContainerStatus) => void;
  onSeedInitialData: () => void;
  seeding: boolean;
}

export const ContainerListView: React.FC<Props> = ({
  containers,
  loading,
  onOpenCreate,
  onViewDetail,
  onEdit,
  onDelete,
  onQuickStatusChange,
  onSeedInitialData,
  seeding,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [shippingFilter, setShippingFilter] = useState<string>('ALL');
  const [specialFilter, setSpecialFilter] = useState<'ALL' | 'REEFER' | 'HAZARDOUS'>('ALL');
  const [sortBy, setSortBy] = useState<'createdAt' | 'containerNumber' | 'grossWeight'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Compute Metrics & Total TEU
  const metrics = useMemo(() => {
    let totalTEU = 0;
    let reeferCount = 0;
    let dgCount = 0;
    let gateInCount = 0;
    let yardStackCount = 0;

    containers.forEach((c) => {
      if (c.size === '20ft') totalTEU += 1;
      else if (c.size === '40ft') totalTEU += 2;
      else if (c.size === '45ft') totalTEU += 2.25;

      if (c.isReefer) reeferCount += 1;
      if (c.isHazardous) dgCount += 1;
      if (c.status === 'GATE IN') gateInCount += 1;
      if (c.status === 'YARD STACK') yardStackCount += 1;
    });

    return {
      total: containers.length,
      totalTEU: Math.round(totalTEU * 10) / 10,
      reeferCount,
      dgCount,
      gateInCount,
      yardStackCount,
    };
  }, [containers]);

  // Filter and sort
  const filteredContainers = useMemo(() => {
    return containers.filter((c) => {
      // Search matching
      const query = searchTerm.toLowerCase().trim();
      const matchesSearch = 
        !query ||
        c.containerNumber.toLowerCase().includes(query) ||
        (c.sealNumber && c.sealNumber.toLowerCase().includes(query)) ||
        (c.vesselName && c.vesselName.toLowerCase().includes(query)) ||
        (c.consignee && c.consignee.toLowerCase().includes(query)) ||
        (c.truckPlate && c.truckPlate.toLowerCase().includes(query)) ||
        c.shippingLine.toLowerCase().includes(query);

      // Filters
      const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
      const matchesCategory = categoryFilter === 'ALL' || c.category === categoryFilter;
      const matchesShipping = shippingFilter === 'ALL' || c.shippingLine === shippingFilter;
      const matchesSpecial = 
        specialFilter === 'ALL' ||
        (specialFilter === 'REEFER' && c.isReefer) ||
        (specialFilter === 'HAZARDOUS' && c.isHazardous);

      return matchesSearch && matchesStatus && matchesCategory && matchesShipping && matchesSpecial;
    }).sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'createdAt') {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortBy === 'containerNumber') {
        comparison = a.containerNumber.localeCompare(b.containerNumber);
      } else if (sortBy === 'grossWeight') {
        comparison = a.grossWeight - b.grossWeight;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [containers, searchTerm, statusFilter, categoryFilter, shippingFilter, specialFilter, sortBy, sortOrder]);

  const statusBadges: Record<string, string> = {
    'GATE IN': 'bg-blue-50 text-blue-700 border-blue-200',
    'YARD STACK': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'LOADING': 'bg-purple-50 text-purple-700 border-purple-200',
    'DISCHARGING': 'bg-sky-50 text-sky-700 border-sky-200',
    'GATE OUT': 'bg-slate-100 text-slate-700 border-slate-300',
    'INSPECTION': 'bg-amber-50 text-amber-700 border-amber-200',
  };

  const getNextStatusAction = (current: ContainerStatus): { label: string; next: ContainerStatus } | null => {
    switch (current) {
      case 'GATE IN':
        return { label: 'Stack ke Yard', next: 'YARD STACK' };
      case 'YARD STACK':
        return { label: 'Muat ke Kapal', next: 'LOADING' };
      case 'LOADING':
        return { label: 'Selesai Muat', next: 'GATE OUT' };
      case 'INSPECTION':
        return { label: 'Lolos Inspeksi', next: 'YARD STACK' };
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Operational Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Box</span>
            <Layers className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{metrics.total}</span>
            <span className="text-xs font-bold text-slate-500">Unit Box</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Persisten di real Firestore</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Kapasitas TEU</span>
            <Ship className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-indigo-600">{metrics.totalTEU}</span>
            <span className="text-xs font-bold text-slate-500">TEU</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Standar 20ft & 40ft equivalent</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Reefer Cold Chain</span>
            <Snowflake className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-cyan-600">{metrics.reeferCount}</span>
            <span className="text-xs font-bold text-slate-500">Unit Pendingin</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Monitoring suhu aktif</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Hazardous (DG)</span>
            <Flame className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-600">{metrics.dgCount}</span>
            <span className="text-xs font-bold text-slate-500">Unit IMO Regulated</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Penanganan khusus safety</p>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Controls Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="search-containers-input"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari nomor kontainer, segel, kapal, consignee, plat truk..."
                className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {containers.length === 0 && (
                <button
                  id="btn-seed-containers"
                  type="button"
                  disabled={seeding}
                  onClick={onSeedInitialData}
                  className="px-3.5 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{seeding ? 'Memuat Data...' : 'Muat Data Percontohan Pelabuhan'}</span>
                </button>
              )}

              <button
                id="btn-create-container-main"
                type="button"
                onClick={onOpenCreate}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Registrasi Peti Kemas</span>
              </button>
            </div>
          </div>

          {/* Filter Pills Bar */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
            <span className="font-semibold text-slate-700 flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5" />
              Filter:
            </span>

            {/* Status Filter */}
            <select
              id="filter-status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Semua Status Operasi</option>
              <option value="GATE IN">GATE IN (Penerimaan)</option>
              <option value="YARD STACK">YARD STACK (Penumpukan)</option>
              <option value="LOADING">LOADING (Muat Kapal)</option>
              <option value="DISCHARGING">DISCHARGING (Bongkar)</option>
              <option value="GATE OUT">GATE OUT (Keluar)</option>
              <option value="INSPECTION">INSPECTION (Pemeriksaan)</option>
            </select>

            {/* Category Filter */}
            <select
              id="filter-category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Semua Kategori Kargo</option>
              <option value="IMPOR">IMPOR</option>
              <option value="EKSPOR">EKSPOR</option>
              <option value="TRANSSHIPMENT">TRANSSHIPMENT</option>
              <option value="EMPTY">EMPTY (Kosong)</option>
            </select>

            {/* Special Filters */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setSpecialFilter('ALL')}
                className={`px-2 py-0.5 text-[11px] font-semibold rounded-md transition-colors ${
                  specialFilter === 'ALL' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Semua Tipe
              </button>
              <button
                type="button"
                onClick={() => setSpecialFilter('REEFER')}
                className={`px-2 py-0.5 text-[11px] font-semibold rounded-md transition-colors flex items-center gap-1 ${
                  specialFilter === 'REEFER' ? 'bg-cyan-600 text-white shadow-2xs' : 'text-slate-500 hover:text-cyan-700'
                }`}
              >
                <Snowflake className="w-3 h-3" />
                Reefer Only
              </button>
              <button
                type="button"
                onClick={() => setSpecialFilter('HAZARDOUS')}
                className={`px-2 py-0.5 text-[11px] font-semibold rounded-md transition-colors flex items-center gap-1 ${
                  specialFilter === 'HAZARDOUS' ? 'bg-amber-600 text-white shadow-2xs' : 'text-slate-500 hover:text-amber-700'
                }`}
              >
                <Flame className="w-3 h-3" />
                DG / IMO Only
              </button>
            </div>

            {/* Reset Filters */}
            {(searchTerm || statusFilter !== 'ALL' || categoryFilter !== 'ALL' || specialFilter !== 'ALL') && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('ALL');
                  setCategoryFilter('ALL');
                  setSpecialFilter('ALL');
                }}
                className="text-[11px] text-blue-600 hover:underline font-semibold ml-auto"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>

        {/* Data Table */}
        {loading && containers.length === 0 ? (
          <div className="py-20 text-center text-slate-400">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-600">Menghubungkan ke Real Database Firestore...</p>
            <p className="text-xs text-slate-400 mt-1">Mengambil data peti kemas real-time</p>
          </div>
        ) : filteredContainers.length === 0 ? (
          <div className="py-16 text-center text-slate-500 px-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Layers className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-base text-slate-800">
              {containers.length === 0 ? 'Belum Ada Peti Kemas di Database' : 'Tidak Ada Data Sesuai Filter'}
            </h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-5">
              {containers.length === 0
                ? 'Database Firestore siap produksi telah terhubung. Anda dapat mendaftarkan kontainer pertama atau memuat data percontohan.'
                : 'Coba sesuaikan kata kunci pencarian atau reset filter untuk menampilkan data kontainer.'}
            </p>
            {containers.length === 0 && (
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={onSeedInitialData}
                  disabled={seeding}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{seeding ? 'Mengisi Database...' : 'Muat 6 Kontainer Demo'}</span>
                </button>
                <button
                  type="button"
                  onClick={onOpenCreate}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Registrasi Manual</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Nomor Peti Kemas</th>
                  <th className="py-3 px-3">Tipe / Ukuran</th>
                  <th className="py-3 px-3">Pelayaran</th>
                  <th className="py-3 px-3">Status Lapangan</th>
                  <th className="py-3 px-3">Lokasi Yard</th>
                  <th className="py-3 px-3">Bobot (Gross / Payload)</th>
                  <th className="py-3 px-3">Kapal / Voyage</th>
                  <th className="py-3 px-4 text-right">Aksi Operasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredContainers.map((c) => {
                  const quickAction = getNextStatusAction(c.status);

                  return (
                    <tr 
                      key={c.id} 
                      className="hover:bg-blue-50/40 transition-colors group"
                    >
                      {/* Container Number & Category */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onViewDetail(c)}
                            className="font-mono font-bold text-sm tracking-wide text-blue-700 hover:underline text-left cursor-pointer"
                          >
                            {formatContainerNumberDisplay(c.containerNumber)}
                          </button>
                          {c.isReefer && (
                            <span title={`Reefer Temp: ${c.reeferTemp}°C`}>
                              <Snowflake className="w-3.5 h-3.5 text-cyan-600" />
                            </span>
                          )}
                          {c.isHazardous && (
                            <span title={`Hazardous: ${c.imoClass}`}>
                              <Flame className="w-3.5 h-3.5 text-amber-600" />
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                          <span className="font-semibold text-slate-600">{c.category}</span>
                          {c.sealNumber && <span>&bull; Seal: {c.sealNumber}</span>}
                        </div>
                      </td>

                      {/* ISO Type */}
                      <td className="py-3.5 px-3">
                        <span className="font-bold text-slate-800">{c.isoType}</span>
                        <span className="block text-[11px] text-slate-400">{c.size}</span>
                      </td>

                      {/* Shipping Line */}
                      <td className="py-3.5 px-3">
                        <span className="font-semibold text-slate-800">{c.shippingLine}</span>
                        {c.consignee && (
                          <span className="block text-[11px] text-slate-400 truncate max-w-[120px]" title={c.consignee}>
                            {c.consignee}
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3">
                        <span className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-bold border ${statusBadges[c.status] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                          {c.status}
                        </span>
                      </td>

                      {/* Yard Location */}
                      <td className="py-3.5 px-3">
                        <div className="font-mono font-bold text-slate-900">
                          Blok {c.yardBlock}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500">
                          B{c.yardBay}-R{c.yardRow}-T{c.yardTier}
                        </div>
                      </td>

                      {/* Gross & Payload Weight */}
                      <td className="py-3.5 px-3">
                        <div className="font-mono font-bold text-slate-800">
                          {c.grossWeight.toLocaleString('id-ID')} kg
                        </div>
                        <div className="text-[11px] text-emerald-600 font-medium">
                          Net: {c.payloadWeight.toLocaleString('id-ID')} kg
                        </div>
                      </td>

                      {/* Vessel & Voyage */}
                      <td className="py-3.5 px-3">
                        <div className="text-slate-800 font-medium truncate max-w-[130px]" title={c.vesselName}>
                          {c.vesselName || '-'}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400">
                          {c.voyageNumber || '-'}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Quick Workflow Transition Button */}
                          {quickAction && (
                            <button
                              id={`quick-status-${c.id}`}
                              type="button"
                              onClick={() => onQuickStatusChange(c, quickAction.next)}
                              title={`Ubah status menjadi ${quickAction.next}`}
                              className="px-2 py-1 text-[11px] font-bold text-blue-700 hover:bg-blue-100 bg-blue-50 border border-blue-200 rounded-lg transition-colors cursor-pointer"
                            >
                              {quickAction.label}
                            </button>
                          )}

                          {/* View Detail Button */}
                          <button
                            id={`view-detail-${c.id}`}
                            type="button"
                            onClick={() => onViewDetail(c)}
                            title="Rincian Lengkap / Tally Sheet"
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit Button */}
                          <button
                            id={`edit-container-${c.id}`}
                            type="button"
                            onClick={() => onEdit(c)}
                            title="Edit Data Peti Kemas"
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Delete Button */}
                          <button
                            id={`delete-container-${c.id}`}
                            type="button"
                            onClick={() => onDelete(c)}
                            title="Hapus Peti Kemas"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer info */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <span>
            Menampilkan <strong className="text-slate-800">{filteredContainers.length}</strong> dari{' '}
            <strong className="text-slate-800">{containers.length}</strong> total kontainer aktif
          </span>
          <span className="text-[11px] text-slate-400">
            Realtime sync didukung oleh Firebase Firestore &bull; Tidak menggunakan localStorage
          </span>
        </div>
      </div>
    </div>
  );
};
