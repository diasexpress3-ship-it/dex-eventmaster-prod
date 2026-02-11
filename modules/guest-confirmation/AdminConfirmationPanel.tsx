
import React, { useState, useEffect } from 'react';
import { 
  Users, CheckCircle2, XCircle, Clock, 
  MessageSquare, RefreshCw, BarChart3, 
  Search, FileSpreadsheet, Sparkles
} from 'lucide-react';
import { confirmationService, ConfirmationV2 } from './confirmationService';

interface Props {
  eventId: string;
}

export const AdminConfirmationPanel: React.FC<Props> = ({ eventId }) => {
  const [confirmations, setConfirmations] = useState<ConfirmationV2[]>([]);
  const [stats, setStats] = useState({ total: 0, confirmed: 0, declined: 0, paxCount: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const loadData = () => {
    setIsLoading(true);
    const data = confirmationService.getConfirmations(eventId);
    setConfirmations(data);
    setStats(confirmationService.getStats(eventId));
    setTimeout(() => setIsLoading(false), 500);
  };

  useEffect(() => {
    loadData();
  }, [eventId]);

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Respostas Totais</p>
           <h4 className="text-3xl font-black italic text-slate-900">{stats.total}</h4>
        </div>
        <div className="bg-green-50 p-8 rounded-[2.5rem] shadow-sm border border-green-100">
           <p className="text-[9px] font-black text-green-600 uppercase tracking-widest mb-1">Confirmados</p>
           <h4 className="text-3xl font-black italic text-green-900">{stats.confirmed}</h4>
        </div>
        <div className="bg-red-50 p-8 rounded-[2.5rem] shadow-sm border border-red-100">
           <p className="text-[9px] font-black text-red-600 uppercase tracking-widest mb-1">Não Irão</p>
           <h4 className="text-3xl font-black italic text-red-900">{stats.declined}</h4>
        </div>
        <div className="bg-orange-50 p-8 rounded-[2.5rem] shadow-sm border border-orange-100">
           <p className="text-[9px] font-black text-orange-600 uppercase tracking-widest mb-1">Total de PAX</p>
           <h4 className="text-3xl font-black italic text-orange-900">{stats.paxCount}</h4>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden">
        <div className="p-10 border-b border-slate-50 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-950 text-white rounded-xl flex items-center justify-center"><BarChart3 size={20} /></div>
              <h3 className="text-xl font-black italic uppercase tracking-tighter">Relatório RSVP v2</h3>
           </div>
           <button onClick={loadData} className="p-3 hover:bg-slate-50 rounded-xl transition-all text-slate-400"><RefreshCw size={18} /></button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                <th className="px-10 py-6">Timestamp</th>
                <th className="px-10 py-6">Status</th>
                <th className="px-10 py-6">PAX</th>
                <th className="px-10 py-6">Recado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {confirmations.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/50 transition-all">
                  <td className="px-10 py-6 text-[10px] font-bold text-slate-500">{new Date(c.timestamp).toLocaleString()}</td>
                  <td className="px-10 py-6">
                     <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${c.status === 'confirmed' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                       {c.status === 'confirmed' ? 'PRESENÇA' : 'AUSÊNCIA'}
                     </span>
                  </td>
                  <td className="px-10 py-6 font-black italic text-slate-900">{c.pax}</td>
                  <td className="px-10 py-6">
                     <p className="text-xs italic text-slate-500 max-w-xs truncate">{c.message || '—'}</p>
                  </td>
                </tr>
              ))}
              {confirmations.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-10 py-24 text-center">
                    <Sparkles size={48} className="mx-auto text-slate-100 mb-4" />
                    <p className="text-[10px] font-black uppercase text-slate-300 tracking-[0.3em]">Nenhuma resposta registrada neste módulo</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
