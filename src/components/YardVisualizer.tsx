import React, { useState } from 'react';
import { Container } from '../types';
import { Boxes, MapPin, Snowflake, Flame, Layers } from 'lucide-react';
import { formatContainerNumberDisplay } from '../utils/validators';

interface Props {
  containers: Container[];
  onSelectContainer: (container: Container) => void;
  onAddNewToSlot?: (block: string, bay: string, row: string, tier: string) => void;
}

export const YardVisualizer: React.FC<Props> = ({
  containers,
  onSelectContainer,
}) => {
  const [selectedBlock, setSelectedBlock] = useState('A');

  // Filter containers in current block
  const blockContainers = containers.filter(
    (c) => c.yardBlock.toUpperCase() === selectedBlock.toUpperCase()
  );

  const blockDescriptions: Record<string, { title: string; subtitle: string; color: string }> = {
    A: { title: 'Blok A - Lapangan Ekspor', subtitle: 'Penumpukan kontainer outbound sebelum pemuatan kapal', color: 'blue' },
    B: { title: 'Blok B - Lapangan Impor', subtitle: 'Penumpukan kargo inbound menunggu pengambilan consignee', color: 'emerald' },
    C: { title: 'Blok C - Depo Kontainer Kosong (Empty)', subtitle: 'Peti kemas kosong siap reposisi dan stripping', color: 'slate' },
    D: { title: 'Blok D - Transshipment Yard', subtitle: 'Peti kemas transit antar kapal samudra dan feeder', color: 'purple' },
    R: { title: 'Blok R - Reefer Yard Stacking', subtitle: 'Dilengkapi colokan reefer plug & pemantau suhu 24/7', color: 'cyan' },
    H: { title: 'Blok H - Hazardous & DG Yard', subtitle: 'Kawasan khusus barang berbahaya dengan pengamanan IMO', color: 'amber' },
  };

  // Preset bays to render (01 through 08 for visual clarity)
  const bays = ['01', '02', '03', '04', '05', '06', '07', '08'];
  const tiers = ['4', '3', '2', '1']; // Tier 4 on top, Tier 1 on ground

  // Map containers by bay and tier
  const gridMap: Record<string, Container> = {};
  blockContainers.forEach((c) => {
    const bayKey = c.yardBay.padStart(2, '0');
    const key = `${bayKey}-${c.yardTier}`;
    if (!gridMap[key]) {
      gridMap[key] = c;
    }
  });

  const getShippingLineColor = (line: string): string => {
    switch (line) {
      case 'Maersk': return 'bg-sky-600 text-white border-sky-700';
      case 'MSC': return 'bg-amber-600 text-white border-amber-700';
      case 'CMA CGM': return 'bg-blue-700 text-white border-blue-800';
      case 'Evergreen': return 'bg-emerald-700 text-white border-emerald-800';
      case 'ONE': return 'bg-pink-600 text-white border-pink-700';
      case 'Cosco': return 'bg-blue-900 text-white border-slate-800';
      default: return 'bg-slate-700 text-white border-slate-800';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 text-slate-800 shadow-xs">
      {/* Header & Block Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Visualisasi Lapangan Penumpukan (Yard Stacking)
              </h3>
              <p className="text-xs text-slate-500">
                Monitoring elevasi tier dan persebaran slot kontainer per blok
              </p>
            </div>
          </div>
        </div>

        {/* Block Pills */}
        <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1.5 rounded-xl">
          {Object.keys(blockDescriptions).map((blk) => (
            <button
              key={blk}
              type="button"
              onClick={() => setSelectedBlock(blk)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                selectedBlock === blk
                  ? 'bg-white text-blue-600 shadow-xs ring-1 ring-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              Blok {blk}
            </button>
          ))}
        </div>
      </div>

      {/* Block Information Banner */}
      <div className="mt-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold text-slate-900">
            {blockDescriptions[selectedBlock]?.title}
          </h4>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {blockDescriptions[selectedBlock]?.subtitle}
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs font-semibold text-slate-700">
            {blockContainers.length} Peti Kemas
          </span>
          <span className="block text-[10px] text-slate-400">Terparkir di blok ini</span>
        </div>
      </div>

      {/* 2D Stacking Elevation Grid */}
      <div className="mt-6 overflow-x-auto pb-4">
        <div className="min-w-[650px]">
          <div className="space-y-2">
            {tiers.map((tierNum) => (
              <div key={tierNum} className="flex items-center gap-2">
                {/* Tier Label */}
                <div className="w-16 shrink-0 text-right pr-2">
                  <span className="text-xs font-mono font-bold text-slate-500">
                    Tier {tierNum}
                  </span>
                </div>

                {/* Bays Slots */}
                <div className="flex-1 grid grid-cols-8 gap-2">
                  {bays.map((bayNum) => {
                    const key = `${bayNum}-${tierNum}`;
                    const container = gridMap[key];

                    return (
                      <div key={bayNum} className="h-20">
                        {container ? (
                          <div
                            onClick={() => onSelectContainer(container)}
                            className={`w-full h-full rounded-xl border p-2 cursor-pointer transition-all hover:scale-[1.02] shadow-xs flex flex-col justify-between ${getShippingLineColor(
                              container.shippingLine
                            )}`}
                            title={`Klik untuk detail ${container.containerNumber}`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-[10px] font-bold tracking-tight truncate">
                                {container.containerNumber}
                              </span>
                              {container.isReefer && (
                                <Snowflake className="w-3 h-3 text-cyan-200 shrink-0" />
                              )}
                              {container.isHazardous && (
                                <Flame className="w-3 h-3 text-amber-300 shrink-0" />
                              )}
                            </div>

                            <div className="flex items-end justify-between text-[9px] opacity-90 font-medium">
                              <span>{container.isoType}</span>
                              <span className="truncate max-w-[50px]">{container.shippingLine}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-full rounded-xl border border-dashed border-slate-200 bg-slate-50/70 hover:bg-slate-100 flex flex-col items-center justify-center text-slate-300 transition-colors">
                            <span className="text-[10px] font-mono text-slate-400">Kosong</span>
                            <span className="text-[9px] text-slate-300 font-mono">B{bayNum}-T{tierNum}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Ground Baseline & Bay Columns Label */}
          <div className="mt-3 pt-3 border-t-2 border-slate-300 flex items-center gap-2">
            <div className="w-16 shrink-0 text-right pr-2">
              <span className="text-[11px] font-bold uppercase text-slate-400">Kolom:</span>
            </div>
            <div className="flex-1 grid grid-cols-8 gap-2 text-center">
              {bays.map((b) => (
                <div key={b} className="text-xs font-mono font-bold text-slate-600">
                  Bay {b}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-slate-200 flex flex-wrap items-center gap-4 text-xs text-slate-600">
        <span className="font-bold text-slate-700">Warna Pelayaran:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-xs bg-sky-600" />
          <span>Maersk</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-xs bg-amber-600" />
          <span>MSC</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-xs bg-blue-700" />
          <span>CMA CGM</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-xs bg-emerald-700" />
          <span>Evergreen</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-xs bg-pink-600" />
          <span>ONE</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-xs bg-slate-700" />
          <span>Lainnya / Domestik</span>
        </div>
      </div>
    </div>
  );
};
