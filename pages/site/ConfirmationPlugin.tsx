
import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, XCircle, Clock, Heart, Sparkles, 
  AlertCircle, RefreshCw, Users, MessageCircle,
  Mail, Smartphone, Check, Calendar, MapPin, Send, ChevronDown
} from 'lucide-react';
import { RSVPStatus, Guest } from '../../types';

interface ConfirmationPluginProps {
  eventId: string;
  guestId?: string;
  guestName?: string;
  invitationToken?: string;
  onSuccess?: (status: RSVPStatus) => void;
  isPreview?: boolean;
}

export const ConfirmationPlugin: React.FC<ConfirmationPluginProps> = ({
  eventId,
  guestId,
  guestName = 'Convidado Especial',
  invitationToken,
  onSuccess,
  isPreview = false
}) => {
  const [loading, setLoading] = useState(!isPreview);
  const [submitting, setSubmitting] = useState(false);
  const [guest, setGuest] = useState<Guest | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [guestCount, setGuestCount] = useState(1);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsappTarget, setWhatsappTarget] = useState('+258822798360'); // Padrão Noiva
  const [rsvpMessage, setRsvpMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [eventDetails, setEventDetails] = useState<any>(null);

  const storageKey = `dex_guests_${eventId}`;

  useEffect(() => {
    try {
      const events = JSON.parse(localStorage.getItem('dex_provisionings_v9') || '[]');
      const found = events.find((e: any) => e.id === eventId);
      if (found) setEventDetails(found);
    } catch (error) {
      console.error('Erro ao carregar evento:', error);
    }
  }, [eventId]);

  useEffect(() => {
    if (isPreview) {
      setLoading(false);
      return;
    }

    const loadGuest = () => {
      setLoading(true);
      setError(null);
      
      try {
        const guests: Guest[] = JSON.parse(localStorage.getItem(storageKey) || '[]');
        let foundGuest: Guest | undefined;

        if (invitationToken) {
          foundGuest = guests.find(g => g.invitationToken === invitationToken);
        } else if (guestId) {
          foundGuest = guests.find(g => g.id === guestId);
        }
        
        if (foundGuest) {
          setGuest(foundGuest);
          setGuestCount(foundGuest.guestCount || 1);
          setEmail(foundGuest.email || '');
          setPhone(foundGuest.phone || '');
          
          if (foundGuest.rsvpStatus === RSVPStatus.CONFIRMED || foundGuest.rsvpStatus === RSVPStatus.DECLINED) {
            setSuccessMessage(
              foundGuest.rsvpStatus === RSVPStatus.CONFIRMED 
                ? '✅ Presença confirmada com sucesso!' 
                : '❌ Presença não confirmada'
            );
            setShowForm(false);
          }
        }
      } catch (err) {
        setError('Erro ao carregar dados do convite');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    if (eventId && (guestId || invitationToken)) {
      loadGuest();
    } else {
      setLoading(false);
    }
  }, [eventId, guestId, invitationToken, storageKey, isPreview]);

  const updateStore = (status: RSVPStatus, count: number) => {
    if (isPreview) return;

    try {
      const guests: Guest[] = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const now = new Date().toISOString();
      const targetId = guest?.id || guestId;

      const updatedGuests = guests.map(g => {
        if (g.id === targetId || (invitationToken && g.invitationToken === invitationToken)) {
          const updated: Guest = {
            ...g,
            rsvpStatus: status,
            guestCount: count,
            email: email || g.email,
            phone: phone || g.phone,
            confirmedAt: now,
            updatedAt: now
          };
          setGuest(updated);
          return updated;
        }
        return g;
      });

      localStorage.setItem(storageKey, JSON.stringify(updatedGuests));
      
      const v2DataKey = 'dex_conf_v2_data';
      const v2Store = JSON.parse(localStorage.getItem(v2DataKey) || '[]');
      v2Store.push({
        id: crypto.randomUUID(),
        guestId: targetId || 'generic',
        eventId: eventId,
        status: status === RSVPStatus.CONFIRMED ? 'confirmed' : 'declined',
        pax: count,
        message: rsvpMessage,
        timestamp: now
      });
      localStorage.setItem(v2DataKey, JSON.stringify(v2Store));

      if (onSuccess) onSuccess(status);
    } catch (err) {
      throw err;
    }
  };

  const handleWAConfirmation = () => {
    const statusText = guestCount > 0 ? "CONFIRMO minha presença" : "Não poderei comparecer";
    const paxText = guestCount > 0 ? ` para ${guestCount} pessoa(s)` : "";
    const msg = encodeURIComponent(
      `Olá! Eu sou ${guest?.name || guestName}.\n\n${statusText}${paxText}.\n\n"${rsvpMessage || 'Sem mensagem adicional'}"\n\nConfirmado via Dex-EventMaster.`
    );
    window.open(`https://wa.me/${whatsappTarget}?text=${msg}`, '_blank');
  };

  const handleConfirm = async (withWhatsApp: boolean = false) => {
    setSubmitting(true);
    setError(null);
    try {
      updateStore(RSVPStatus.CONFIRMED, guestCount);
      if (withWhatsApp) handleWAConfirmation();
      setSuccessMessage('✅ Presença confirmada com sucesso!');
      setShowForm(false);
    } catch (err) {
      setError('Erro ao confirmar presença.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDecline = async (withWhatsApp: boolean = false) => {
    setSubmitting(true);
    setError(null);
    try {
      updateStore(RSVPStatus.DECLINED, 0);
      if (withWhatsApp) handleWAConfirmation();
      setSuccessMessage('Sua resposta foi registrada. Sentiremos sua falta!');
      setShowForm(false);
    } catch (err) {
      setError('Erro ao registrar resposta.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-white rounded-[2rem] border border-slate-100">
        <RefreshCw size={40} className="animate-spin text-orange-500 mb-4" />
        <p className="text-sm font-medium text-slate-500">Sincronizando convite...</p>
      </div>
    );
  }

  if (!isPreview && !guestId && !invitationToken && !guest) {
    return (
      <div className="text-center py-16 px-6 bg-white rounded-[2rem] border-2 border-slate-100">
        <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={40} className="text-slate-400" />
        </div>
        <h3 className="text-xl font-black uppercase italic text-slate-900 mb-2">Acesso Restrito</h3>
        <p className="text-slate-500 max-w-md mx-auto">Utilize o link exclusivo enviado no seu convite.</p>
      </div>
    );
  }

  if (successMessage) {
    return (
      <div className="text-center py-16 px-6 bg-white rounded-[2rem] border-2 border-green-100 animate-in fade-in zoom-in duration-300">
        <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={40} className="text-green-600" />
        </div>
        <h3 className="text-xl font-black uppercase italic text-slate-900 mb-3">Resposta Registrada!</h3>
        <p className="text-slate-600 text-lg mb-6 max-w-md mx-auto">{successMessage}</p>
        <button onClick={() => { setSuccessMessage(null); setShowForm(false); }} className="mt-8 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium text-sm transition-colors">Voltar</button>
      </div>
    );
  }

  if (!showForm) {
    return (
      <div className="space-y-8 py-8 px-6 bg-white rounded-[2rem] border-2 border-orange-100">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Sparkles size={40} className="text-white" />
          </div>
          <h3 className="text-2xl font-black uppercase italic text-slate-900 mb-2">
            Olá, <span className="text-orange-600">{guest?.name.split(' ')[0] || (isPreview ? 'Visitante Master' : 'Convidado')}</span>
          </h3>
          <p className="text-slate-600 max-w-md mx-auto">Sua presença é fundamental para nós. Por favor, confirme se poderá comparecer ao grande dia.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <button 
            onClick={() => setShowForm(true)} 
            className="px-10 py-5 bg-green-600 text-white rounded-2xl font-bold text-sm hover:shadow-lg transition-all flex items-center justify-center gap-2 shadow-green-500/20 animate-nod-yes"
          >
            <CheckCircle2 size={20} /> CONFIRMAR PRESENÇA
          </button>
          <button 
            onClick={() => { setGuestCount(0); setShowForm(true); }}
            className="px-10 py-5 bg-red-600 text-white rounded-2xl font-bold text-sm hover:bg-red-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 animate-shake-no"
          >
            <XCircle size={20} /> NÃO PODEREI IR
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-6 px-6 bg-white rounded-[2rem] border-2 border-slate-100 shadow-xl">
      <div className="text-center border-b border-slate-100 pb-4">
        <h3 className="text-xl font-black uppercase italic text-slate-900">Configuração de Resposta</h3>
      </div>
      
      <div className="space-y-4">
        {guestCount > 0 && (
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-2 italic">QUANTIDADE DE LUGARES</label>
            <div className="flex items-center justify-between h-14 px-4 bg-slate-50 rounded-xl border border-slate-200">
              <button type="button" onClick={() => setGuestCount(p => Math.max(1, p - 1))} className="w-10 h-10 bg-white rounded-lg shadow-sm text-orange-500 hover:bg-orange-500 hover:text-white transition-colors flex items-center justify-center text-xl font-black" disabled={submitting}>-</button>
              <div className="text-center flex items-baseline gap-2"><span className="text-2xl font-black text-slate-900">{guestCount}</span><span className="text-[10px] font-black text-slate-400">PESSOA(S)</span></div>
              <button type="button" onClick={() => setGuestCount(p => p + 1)} className="w-10 h-10 bg-white rounded-lg shadow-sm text-orange-500 hover:bg-orange-500 hover:text-white transition-colors flex items-center justify-center text-xl font-black" disabled={submitting}>+</button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-2 italic">EMAIL (OPCIONAL)</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" className="w-full h-14 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20 text-xs font-bold" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-2 italic">NOTIFICAR VIA WHATSAPP</label>
            <div className="relative">
              <Smartphone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500" />
              <select 
                value={whatsappTarget} 
                onChange={(e) => setWhatsappTarget(e.target.value)}
                className="w-full h-14 pl-10 pr-10 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500/20 text-xs font-bold appearance-none cursor-pointer"
              >
                <option value="+258822798360">Noiva (+258 822798360)</option>
                <option value="+258824780630">Noivo (+258 824780630)</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase text-slate-500 mb-2 italic">MENSAGEM PARA O CASAL</label>
          <div className="relative">
            <MessageCircle size={16} className="absolute left-3 top-4 text-slate-400" />
            <textarea 
              value={rsvpMessage} 
              onChange={(e) => setRsvpMessage(e.target.value)} 
              placeholder="Escreva aqui seu carinho..." 
              className="w-full h-24 pl-10 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20 text-xs font-medium italic resize-none shadow-inner"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 pt-6 border-t border-slate-100">
        <button 
          onClick={() => guestCount > 0 ? handleConfirm(true) : handleDecline(true)} 
          disabled={submitting} 
          className="w-full py-5 bg-green-600 text-white rounded-2xl font-black text-xs uppercase italic hover:bg-green-700 transition-all shadow-xl flex items-center justify-center gap-3 animate-nod-yes"
        >
          {submitting ? <RefreshCw size={18} className="animate-spin" /> : <><MessageCircle size={20} /> ENVIAR & NOTIFICAR WHATSAPP</>}
        </button>
        
        <div className="flex gap-2">
          <button 
            onClick={() => guestCount > 0 ? handleConfirm(false) : handleDecline(false)} 
            disabled={submitting} 
            className="flex-1 py-4 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase italic hover:bg-orange-600 transition-all shadow-md flex items-center justify-center gap-2"
          >
            {submitting ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} strokeWidth={3} />} APENAS SALVAR NO SITE
          </button>
          <button 
            onClick={() => setShowForm(false)} 
            className="px-6 py-4 bg-slate-100 text-slate-600 rounded-xl font-black text-[10px] uppercase italic hover:bg-slate-200 transition-all" 
            disabled={submitting}
          >
            VOLTAR
          </button>
        </div>
      </div>
    </div>
  );
};
