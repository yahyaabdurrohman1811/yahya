import React from 'react';
import { ActivityLog } from '../types';
import { History, Shield, Clock, ArrowRightCircle, PlusCircle, Edit3, Trash2, RefreshCw } from 'lucide-react';

interface Props {
  logs: ActivityLog[];
  loading: boolean;
}

export const ActivityLogView: React.FC<Props> = ({ logs, loading }) => {
  const getActionBadge = (action: string) => {
    switch (action) {
      case 'CREATE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <PlusCircle className="w-3 h-3" />
            REGISTRASI
          </span>
        );
      case 'UPDATE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Edit3 className="w-3 h-3" />
            PEMBARUAN
          </span>
        );
      case 'DELETE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <Trash2 className="w-3 h-3" />
            HAPUS
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <RefreshCw className="w-3 h-3" />
            {action}
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 text-slate-800 shadow-xs">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900">
              Audit Trail & Riwayat Operasi Terminal
            </h3>
            <p className="text-xs text-slate-500">
              Pencatatan riwayat CRUD persisten dari database Firestore
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg">
          {logs.length} Log Tercatat
        </span>
      </div>

      {loading && logs.length === 0 ? (
        <div className="py-12 text-center text-slate-400">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs">Mengambil log audit dari Firestore...</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="py-12 text-center text-slate-400">
          <History className="w-8 h-8 mx-auto mb-2 text-slate-300" />
          <p className="text-sm font-medium">Belum ada aktivitas tercatat.</p>
          <p className="text-xs text-slate-400 mt-1">
            Setiap aksi Create, Update, atau Delete akan tercatat di sini secara otomatis.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="pb-3 pl-2">Waktu</th>
                <th className="pb-3">Tindakan</th>
                <th className="pb-3">Peti Kemas</th>
                <th className="pb-3">Operator Petugas</th>
                <th className="pb-3 pr-2">Rincian Operasional</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log.id || log.timestamp} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 pl-2 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                    {new Date(log.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    <span className="block text-[10px] text-slate-400">
                      {new Date(log.timestamp).toLocaleDateString('id-ID')}
                    </span>
                  </td>
                  <td className="py-3 whitespace-nowrap">
                    {getActionBadge(log.action)}
                  </td>
                  <td className="py-3 whitespace-nowrap font-mono font-bold text-slate-900">
                    {log.containerNumber}
                  </td>
                  <td className="py-3 whitespace-nowrap text-slate-600 font-medium">
                    {log.operator}
                  </td>
                  <td className="py-3 pr-2 text-slate-700 leading-relaxed max-w-md">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
