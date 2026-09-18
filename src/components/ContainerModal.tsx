import React, { useState, useEffect } from 'react';
import { 
  Container, 
  ContainerType, 
  ContainerSize, 
  ContainerStatus, 
  CargoCategory, 
  ShippingLine 
} from '../types';
import { 
  validateContainerNumber, 
  normalizeContainerNumber, 
  validateGrossWeight, 
  validateTareWeight 
} from '../utils/validators';
import { X, Save, AlertTriangle, Snowflake, Flame, Check } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  initialData?: Container | null;
  mode: 'create' | 'edit';
}

const SHIPPING_LINES: ShippingLine[] = [
  'Maersk',
  'MSC',
  'CMA CGM',
  'Evergreen',
  'ONE',
  'Cosco',
  'Samudera Indonesia',
  'Meratus',
  'Temas Line',
];

const ISO_TYPES: { code: ContainerType; size: ContainerSize; label: string }[] = [
  { code: '20GP', size: '20ft', label: "20' General Purpose (Standard Dry)" },
  { code: '40GP', size: '40ft', label: "40' General Purpose (Standard Dry)" },
  { code: '40HC', size: '40ft', label: "40' High Cube (Tinggi 9.6 ft)" },
  { code: '20RF', size: '20ft', label: "20' Refrigerated (Reefer Pendingin)" },
  { code: '40RF', size: '40ft', label: "40' Refrigerated (Reefer Pendingin)" },
  { code: 'OPEN TOP', size: '20ft', label: "20'/40' Open Top (Bukaan Atas)" },
  { code: 'FLAT RACK', size: '40ft', label: "40' Flat Rack (Muatan Berat/OOG)" },
  { code: 'TANK', size: '20ft', label: "20' ISO Tank (Cairan/Gas Kimia)" },
];

const STATUSES: ContainerStatus[] = [
  'GATE IN',
  'YARD STACK',
  'LOADING',
  'DISCHARGING',
  'GATE OUT',
  'INSPECTION',
];

const CATEGORIES: CargoCategory[] = [
  'IMPOR',
  'EKSPOR',
  'TRANSSHIPMENT',
  'EMPTY',
];

export const ContainerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  mode,
}) => {
  const [containerNumber, setContainerNumber] = useState('');
  const [isoType, setIsoType] = useState<ContainerType>('40HC');
  const [size, setSize] = useState<ContainerSize>('40ft');
  const [status, setStatus] = useState<ContainerStatus>('GATE IN');
  const [category, setCategory] = useState<CargoCategory>('IMPOR');
  const [shippingLine, setShippingLine] = useState<string>('Maersk');
  const [grossWeight, setGrossWeight] = useState<number>(24000);
  const [tareWeight, setTareWeight] = useState<number>(3900);
  const [sealNumber, setSealNumber] = useState('');
  const [vesselName, setVesselName] = useState('');
  const [voyageNumber, setVoyageNumber] = useState('');
  const [consignee, setConsignee] = useState('');
  const [yardBlock, setYardBlock] = useState('A');
  const [yardBay, setYardBay] = useState('04');
  const [yardRow, setYardRow] = useState('02');
  const [yardTier, setYardTier] = useState('1');
  const [isReefer, setIsReefer] = useState(false);
  const [reeferTemp, setReeferTemp] = useState<number>(-18);
  const [isHazardous, setIsHazardous] = useState(false);
  const [imoClass, setImoClass] = useState('Class 3 - Flammable Liquids');
  const [truckPlate, setTruckPlate] = useState('');
  const [notes, setNotes] = useState('');

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData && mode === 'edit') {
      setContainerNumber(initialData.containerNumber);
      setIsoType(initialData.isoType);
      setSize(initialData.size);
      setStatus(initialData.status);
      setCategory(initialData.category);
      setShippingLine(initialData.shippingLine);
      setGrossWeight(initialData.grossWeight);
      setTareWeight(initialData.tareWeight);
      setSealNumber(initialData.sealNumber || '');
      setVesselName(initialData.vesselName || '');
      setVoyageNumber(initialData.voyageNumber || '');
      setConsignee(initialData.consignee || '');
      setYardBlock(initialData.yardBlock || 'A');
      setYardBay(initialData.yardBay || '01');
      setYardRow(initialData.yardRow || '01');
      setYardTier(initialData.yardTier || '1');
      setIsReefer(initialData.isReefer || false);
      setReeferTemp(initialData.reeferTemp ?? -18);
      setIsHazardous(initialData.isHazardous || false);
      setImoClass(initialData.imoClass || 'Class 3 - Flammable Liquids');
      setTruckPlate(initialData.truckPlate || '');
      setNotes(initialData.notes || '');
    } else {
      // Reset defaults for Create
      setContainerNumber('');
      setIsoType('40HC');
      setSize('40ft');
      setStatus('GATE IN');
      setCategory('IMPOR');
      setShippingLine('Maersk');
      setGrossWeight(24500);
      setTareWeight(3900);
      setSealNumber('');
      setVesselName('');
      setVoyageNumber('');
      setConsignee('');
      setYardBlock('A');
      setYardBay('04');
      setYardRow('02');
      setYardTier('1');
      setIsReefer(false);
      setReeferTemp(-18);
      setIsHazardous(false);
      setImoClass('Class 3 - Flammable Liquids');
      setTruckPlate('');
      setNotes('');
    }
    setErrors({});
  }, [initialData, mode, isOpen]);

  // Handle ISO Type change to auto-adjust Size and Reefer flag
  const handleIsoTypeChange = (type: ContainerType) => {
    setIsoType(type);
    const match = ISO_TYPES.find((i) => i.code === type);
    if (match) {
      setSize(match.size);
      if (match.code.includes('RF')) {
        setIsReefer(true);
        if (yardBlock !== 'R') setYardBlock('R'); // Auto suggest reefer yard
      }
    }
  };

  const payloadCalculated = Math.max(0, grossWeight - tareWeight);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validasi Nomor Peti Kemas ISO 6346
    const numValidation = validateContainerNumber(containerNumber);
    if (!numValidation.valid) {
      newErrors.containerNumber = numValidation.error || 'Nomor peti kemas tidak valid.';
    }

    // Validasi Bobot
    const grossVal = validateGrossWeight(grossWeight, tareWeight);
    if (!grossVal.valid) {
      newErrors.grossWeight = grossVal.error || 'Bobot kotor tidak valid.';
    }

    const tareVal = validateTareWeight(tareWeight);
    if (!tareVal.valid) {
      newErrors.tareWeight = tareVal.error || 'Bobot tare tidak valid.';
    }

    // Validasi Pelayaran & Kategori
    if (!shippingLine.trim()) {
      newErrors.shippingLine = 'Nama perusahaan pelayaran wajib dipilih.';
    }

    // Validasi Reefer
    if (isReefer && (reeferTemp === undefined || reeferTemp === null || isNaN(reeferTemp))) {
      newErrors.reeferTemp = 'Suhu kontainer reefer harus dicantumkan (°C).';
    }

    // Validasi DG/Hazardous
    if (isHazardous && !imoClass.trim()) {
      newErrors.imoClass = 'Kelas IMO untuk barang berbahaya wajib ditentukan.';
    }

    // Validasi Posisi Yard
    if (!yardBlock || !yardBay || !yardRow || !yardTier) {
      newErrors.yard = 'Koordinat lokasi penumpukan lapangan (Yard Slot) harus lengkap.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    try {
      await onSave({
        containerNumber: normalizeContainerNumber(containerNumber),
        isoType,
        size,
        status,
        category,
        shippingLine,
        grossWeight: Number(grossWeight),
        tareWeight: Number(tareWeight),
        payloadWeight: payloadCalculated,
        sealNumber: sealNumber.trim(),
        vesselName: vesselName.trim(),
        voyageNumber: voyageNumber.trim(),
        consignee: consignee.trim(),
        yardBlock,
        yardBay: yardBay.padStart(2, '0'),
        yardRow: yardRow.padStart(2, '0'),
        yardTier,
        isReefer,
        reeferTemp: isReefer ? Number(reeferTemp) : null,
        isHazardous,
        imoClass: isHazardous ? imoClass : '',
        truckPlate: truckPlate.trim().toUpperCase(),
        notes: notes.trim(),
      });
      onClose();
    } catch (err: any) {
      setErrors({ form: err.message || 'Gagal menyimpan data ke Firestore.' });
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0 bg-slate-50/70 rounded-t-2xl">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {mode === 'create' ? 'Registrasi Peti Kemas Baru (Gate In)' : `Perbarui Data Peti Kemas: ${initialData?.containerNumber}`}
            </h3>
            <p className="text-xs text-slate-500">
              {mode === 'create' 
                ? 'Input penerimaan kontainer ke dalam sistem terminal dan penentuan lokasi yard'
                : 'Pembaruan status operasional, koordinat penumpukan, atau perubahan kargo'}
            </p>
          </div>
          <button
            id="btn-close-container-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 flex-1 text-slate-800">
          {errors.form && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errors.form}</span>
            </div>
          )}

          {/* Section 1: Identifikasi Kontainer */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              1. Identifikasi & Spesifikasi Peti Kemas (ISO 6346)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor Peti Kemas <span className="text-rose-500">*</span>
                </label>
                <input
                  id="input-container-number"
                  type="text"
                  required
                  value={containerNumber}
                  onChange={(e) => setContainerNumber(e.target.value.toUpperCase())}
                  placeholder="MSKU1234567"
                  className={`w-full px-3 py-2 text-sm font-mono tracking-wider uppercase bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.containerNumber ? 'border-rose-400 bg-rose-50/50' : 'border-slate-300'
                  }`}
                />
                {errors.containerNumber ? (
                  <p className="text-[11px] text-rose-600 mt-1 leading-tight">{errors.containerNumber}</p>
                ) : (
                  <p className="text-[11px] text-slate-400 mt-1">Format: 4 Huruf + 7 Angka (Contoh: MSKU8941203)</p>
                )}
              </div>

              <div className="sm:col-span-1">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tipe ISO Kontainer <span className="text-rose-500">*</span>
                </label>
                <select
                  id="select-iso-type"
                  value={isoType}
                  onChange={(e) => handleIsoTypeChange(e.target.value as ContainerType)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {ISO_TYPES.map((t) => (
                    <option key={t.code} value={t.code}>
                      {t.code} - {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-1">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ukuran Fisik
                </label>
                <div className="flex gap-2">
                  {(['20ft', '40ft', '45ft'] as ContainerSize[]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSize(s)}
                      className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition-all ${
                        size === s
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-slate-50 text-slate-600 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Operasional Terminal & Pelayaran */}
          <div className="pt-4 border-t border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              2. Status Operasional & Pelayaran
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Status Lapangan <span className="text-rose-500">*</span>
                </label>
                <select
                  id="select-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ContainerStatus)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                >
                  {STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kategori Muatan <span className="text-rose-500">*</span>
                </label>
                <select
                  id="select-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as CargoCategory)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Perusahaan Pelayaran (Carrier) <span className="text-rose-500">*</span>
                </label>
                <select
                  id="select-shipping-line"
                  value={shippingLine}
                  onChange={(e) => setShippingLine(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {SHIPPING_LINES.map((line) => (
                    <option key={line} value={line}>
                      {line}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor Segel (Seal No.)
                </label>
                <input
                  id="input-seal-number"
                  type="text"
                  value={sealNumber}
                  onChange={(e) => setSealNumber(e.target.value)}
                  placeholder="Contoh: MSK-89210"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Kapal (Vessel)
                </label>
                <input
                  id="input-vessel-name"
                  type="text"
                  value={vesselName}
                  onChange={(e) => setVesselName(e.target.value)}
                  placeholder="Contoh: MV EVER GIVEN"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor Voyage
                </label>
                <input
                  id="input-voyage-number"
                  type="text"
                  value={voyageNumber}
                  onChange={(e) => setVoyageNumber(e.target.value)}
                  placeholder="Contoh: V.2503W"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Berat & Muatan (Otomatis hitung payload) */}
          <div className="pt-4 border-t border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              3. Manajemen Bobot Kontainer (Kilogram)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Berat Kosong / Tare (kg) <span className="text-rose-500">*</span>
                </label>
                <input
                  id="input-tare-weight"
                  type="number"
                  required
                  min="1500"
                  max="6000"
                  value={tareWeight}
                  onChange={(e) => setTareWeight(Number(e.target.value))}
                  className={`w-full px-3 py-2 text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.tareWeight ? 'border-rose-400 bg-rose-50/50' : 'border-slate-300'
                  }`}
                />
                {errors.tareWeight && (
                  <p className="text-[11px] text-rose-600 mt-1">{errors.tareWeight}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Berat Kotor / Gross (kg) <span className="text-rose-500">*</span>
                </label>
                <input
                  id="input-gross-weight"
                  type="number"
                  required
                  min={tareWeight}
                  max="36000"
                  value={grossWeight}
                  onChange={(e) => setGrossWeight(Number(e.target.value))}
                  className={`w-full px-3 py-2 text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.grossWeight ? 'border-rose-400 bg-rose-50/50' : 'border-slate-300'
                  }`}
                />
                {errors.grossWeight && (
                  <p className="text-[11px] text-rose-600 mt-1">{errors.grossWeight}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Muatan Bersih / Payload (Kargo)
                </label>
                <div className="px-3 py-2 text-sm font-semibold bg-slate-100 border border-slate-200 rounded-xl text-slate-700">
                  {payloadCalculated.toLocaleString('id-ID')} kg
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Dihitung otomatis: Gross - Tare</p>
              </div>
            </div>
          </div>

          {/* Section 4: Alokasi Lokasi Yard Stacking */}
          <div className="pt-4 border-t border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-600" />
              4. Alokasi Koordinat Lapangan Penumpukan (Yard Slot)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Blok Yard <span className="text-rose-500">*</span>
                </label>
                <select
                  id="select-yard-block"
                  value={yardBlock}
                  onChange={(e) => setYardBlock(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-blue-700"
                >
                  <option value="A">Blok A (Ekspor Umum)</option>
                  <option value="B">Blok B (Impor Umum)</option>
                  <option value="C">Blok C (Depo Empty)</option>
                  <option value="D">Blok D (Transshipment)</option>
                  <option value="R">Blok R (Reefer Stacking)</option>
                  <option value="H">Blok H (Hazardous / DG)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bay (Kolom)
                </label>
                <input
                  id="input-yard-bay"
                  type="text"
                  maxLength={2}
                  value={yardBay}
                  onChange={(e) => setYardBay(e.target.value)}
                  placeholder="04"
                  className="w-full px-3 py-2 text-sm font-mono text-center bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Row (Lajur)
                </label>
                <input
                  id="input-yard-row"
                  type="text"
                  maxLength={2}
                  value={yardRow}
                  onChange={(e) => setYardRow(e.target.value)}
                  placeholder="02"
                  className="w-full px-3 py-2 text-sm font-mono text-center bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tier (Tingkat)
                </label>
                <select
                  id="select-yard-tier"
                  value={yardTier}
                  onChange={(e) => setYardTier(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono text-center bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                >
                  <option value="1">Tier 1 (Bawah)</option>
                  <option value="2">Tier 2</option>
                  <option value="3">Tier 3</option>
                  <option value="4">Tier 4</option>
                  <option value="5">Tier 5 (Atas)</option>
                </select>
              </div>
            </div>
            <div className="mt-2 text-xs text-slate-500 font-mono bg-slate-100 px-3 py-1.5 rounded-lg inline-block">
              Lokasi Stacking: Blok <span className="font-bold text-slate-800">{yardBlock}</span> - Bay <span className="font-bold text-slate-800">{yardBay.padStart(2, '0')}</span> - Row <span className="font-bold text-slate-800">{yardRow.padStart(2, '0')}</span> - Tier <span className="font-bold text-slate-800">{yardTier}</span>
            </div>
          </div>

          {/* Section 5: Karakteristik Khusus (Reefer & DG) */}
          <div className="pt-4 border-t border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-600" />
              5. Penanganan Khusus Kargo
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Reefer Switch */}
              <div className={`p-3.5 rounded-xl border transition-colors ${isReefer ? 'bg-cyan-50/70 border-cyan-300' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex items-center justify-between">
                  <label htmlFor="chk-reefer" className="flex items-center gap-2 cursor-pointer">
                    <input
                      id="chk-reefer"
                      type="checkbox"
                      checked={isReefer}
                      onChange={(e) => {
                        setIsReefer(e.target.checked);
                        if (e.target.checked && yardBlock !== 'R') setYardBlock('R');
                      }}
                      className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500 border-slate-300"
                    />
                    <Snowflake className="w-4 h-4 text-cyan-600" />
                    <span className="text-xs font-bold text-slate-800">Kontainer Reefer (Pendingin)</span>
                  </label>
                </div>

                {isReefer && (
                  <div className="mt-3">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Set Suhu Operasional (°C)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        id="input-reefer-temp"
                        type="number"
                        step="0.5"
                        min="-35"
                        max="25"
                        value={reeferTemp}
                        onChange={(e) => setReeferTemp(Number(e.target.value))}
                        className="w-24 px-3 py-1.5 text-sm bg-white border border-cyan-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                      <span className="text-xs text-slate-600">°Celsius (Standar cold chain)</span>
                    </div>
                  </div>
                )}
              </div>

              {/* DG Switch */}
              <div className={`p-3.5 rounded-xl border transition-colors ${isHazardous ? 'bg-amber-50/70 border-amber-300' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex items-center justify-between">
                  <label htmlFor="chk-hazardous" className="flex items-center gap-2 cursor-pointer">
                    <input
                      id="chk-hazardous"
                      type="checkbox"
                      checked={isHazardous}
                      onChange={(e) => {
                        setIsHazardous(e.target.checked);
                        if (e.target.checked && yardBlock !== 'H') setYardBlock('H');
                      }}
                      className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300"
                    />
                    <Flame className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-bold text-slate-800">Barang Berbahaya (DG / IMO)</span>
                  </label>
                </div>

                {isHazardous && (
                  <div className="mt-3">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Klasifikasi Bahaya IMO
                    </label>
                    <select
                      id="select-imo-class"
                      value={imoClass}
                      onChange={(e) => setImoClass(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="Class 1 - Explosives">Class 1 - Explosives</option>
                      <option value="Class 2.1 - Flammable Gases">Class 2.1 - Flammable Gases</option>
                      <option value="Class 3 - Flammable Liquids">Class 3 - Flammable Liquids</option>
                      <option value="Class 4.1 - Flammable Solids">Class 4.1 - Flammable Solids</option>
                      <option value="Class 5.1 - Oxidizing Agents">Class 5.1 - Oxidizing Agents</option>
                      <option value="Class 6.1 - Toxic Substances">Class 6.1 - Toxic Substances</option>
                      <option value="Class 8 - Corrosives">Class 8 - Corrosives</option>
                      <option value="Class 9 - Miscellaneous Dangerous Goods">Class 9 - Miscellaneous Dangerous Goods</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 6: Truk, Consignee, dan Catatan */}
          <div className="pt-4 border-t border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-500" />
              6. Logistik & Catatan Tambahan
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Plat Truk Pengangkut (Head Trailer)
                </label>
                <input
                  id="input-truck-plate"
                  type="text"
                  value={truckPlate}
                  onChange={(e) => setTruckPlate(e.target.value.toUpperCase())}
                  placeholder="Contoh: B 9283 TEI"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pemilik Barang (Consignee / Shipper)
                </label>
                <input
                  id="input-consignee"
                  type="text"
                  value={consignee}
                  onChange={(e) => setConsignee(e.target.value)}
                  placeholder="Contoh: PT Indofood CBP Sukses Makmur"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Catatan Kondisi Fisik Kontainer / Instruksi Khusus
              </label>
              <textarea
                id="input-notes"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Misal: Kondisi pintu baik, ada baret minor di panel kanan, perlu survey bea cukai..."
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Modal Footer Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              id="btn-cancel-modal"
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>

            <button
              id="btn-save-container"
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm shadow-blue-200 flex items-center gap-2 disabled:opacity-50 transition-all cursor-pointer"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Menyimpan ke Firestore...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{mode === 'create' ? 'Simpan & Registrasi' : 'Simpan Pembaruan'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
