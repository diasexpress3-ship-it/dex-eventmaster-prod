
import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Send, MessageSquare, Users, Sparkles, Loader2 } from 'lucide-react';
import { confirmationService } from './confirmationService';

interface Props {
  eventId: string;
  guestId: string;
  guestName: string;
  invitationToken?: string; // Fix: Added invitationToken prop
  onSuccess?: () => void;
}

/**
 * COMPONENTE GUEST-CONFIRMATION-V2
 * Estilos encapsulados via classes isoladas para evitar vazamento de CSS.
 */
export const ConfirmationPlugin: React.FC<Props> = ({ eventId, guestId, guestName, invitationToken, onSuccess }) => {
  const [status, setStatus] = useState<'idle' | 'confirmed' | 'declined'>('idle');
  const [pax, setPax] = useState(1);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const handleConfirm = async () => {
    if (status === 'idle') return;
    setIsLoading(true);
    try {
      await confirmationService.submitConfirmation({
        eventId,
        guestId,
        status: status as any,
        pax: status === 'confirmed' ? pax : 0,
        message
      });
      setIsDone(true);
      if (onSuccess) onSuccess();
    } catch (e) {
      alert('Erro no módulo de confirmação.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isDone) {
    return (
      <div className="bg-green-50 border-2 border-green-200 p-10 rounded-[3rem] text-center space-y-4 animate-in zoom-in duration-500">
        <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg">
          <CheckCircle size={32} strokeWidth={3} />
        </div>
        <h4 className="text-xl font-black italic uppercase text-green-900 tracking-tighter">Resposta Registrada</h4>
        <p className="text-green-700 text-sm italic font-medium">Obrigado por confirmar sua presença, {guestName.split(' ')[0]}!</p>
      </div>
    );
  }

  return (
    <div className="guest-conf-v2-container bg-white border border-slate-100 shadow-4xl rounded-[4rem] p-8 md:p-12 space-y-10">
      <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
        <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-xl">
          <Sparkles size={24} />
        </div>
        <div>
          <h3 className="text-lg font-black italic uppercase text-slate-900 leading-none">Confirmação Master</h3>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Módulo Isolado v2.0</p>
        </div>
      </div>

      <div className="space-y-6">
        <p className="text-slate-500 italic text-sm font-medium leading-relaxed">
          Olá <span className="text-orange-600 font-bold">{guestName}</span>, por favor informe sua disponibilidade para o evento:
        </p>

        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => setStatus('confirmed')}
            className={`h-20 rounded-3xl border-4 transition-all flex flex-col items-center justify-center gap-1 ${status === 'confirmed' ? 'bg-orange-600 border-orange-400 shadow-2xl scale-105' : 'bg-slate-50 border-slate-100 grayscale opacity-60'}`}
          >
            <CheckCircle size={20} className={status === 'confirmed' ? 'text-white' : 'text-slate-400'} />
            <span className={`text-[9px] font-black uppercase tracking-widest ${status === 'confirmed' ? 'text-white' : 'text-slate-400'}`}>Sim, irei</span>
          </button>
          <button 
            onClick={() => setStatus('declined')}
            className={`h-20 rounded-3xl border-4 transition-all flex flex-col items-center justify-center gap-1 ${status === 'declined' ? 'bg-slate-900 border-slate-700 shadow-2xl scale-105' : 'bg-slate-50 border-slate-100 grayscale opacity-60'}`}
          >
            <XCircle size={20} className={status === 'declined' ? 'text-white' : 'text-slate-400'} />
            <span className={`text-[9px] font-black uppercase tracking-widest ${status === 'declined' ? 'text-white' : 'text-slate-400'}`}>Não poderei</span>
          </button>
        </div>

        {status === 'confirmed' && (
          <div className="bg-slate-50 p-6 rounded-3xl space-y-4 animate-in slide-in-from-top-4 duration-300">
             <label className="flex items-center gap-3 text-[10px] font-black uppercase text-slate-400 italic">
               <Users size={14} /> Total de Pessoas (Incluindo você)
             </label>
             <div className="flex items-center gap-6">
                <input 
                  type="range" min="1" max="10" step="1" value={pax} 
                  onChange={(e) => setPax(parseInt(e.target.value))}
                  className="flex-1 accent-orange-500"
                />
                <span className="w-12 h-12 bg-white rounded-xl flex items-center justify-center font-black text-orange-600 shadow-sm border border-slate-100">{pax}</span>
             </div>
          </div>
        )}

        <div className="space-y-3">
          <label className="flex items-center gap-3 text-[10px] font-black uppercase text-slate-400 italic">
            <MessageSquare size={14} /> Mensagem Opcional
          </label>
          <textarea 
            placeholder="Alguma restrição ou recado especial?"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full h-24 bg-slate-50 border-none rounded-3xl p-5 italic font-medium text-sm outline-none focus:ring-4 focus:ring-orange-500/10 transition-all shadow-inner"
          />
        </div>

        <button
          onClick={handleConfirm}
          disabled={status === 'idle' || isLoading}
          className="w-full h-20 bg-slate-950 text-white rounded-[2rem] font-black italic uppercase tracking-widest text-sm shadow-4xl flex items-center justify-center gap-4 hover:bg-orange-600 disabled:opacity-30 transition-all active:scale-95"
        >
          {isLoading ? <Loader2 size={24} className="animate-spin" /> : <><Send size={20} /> Enviar Resposta</>}
        </button>
      </div>
    </div>
  );
};
