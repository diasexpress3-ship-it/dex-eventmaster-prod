import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Smartphone, Monitor, Tablet, ExternalLink, RefreshCw, ArrowLeft, UserCheck, Globe, AlertCircle } from 'lucide-react';
import Button from '../../components/ui/Button';
import { useAppStore } from '../store/appStore';
import PreviewGuestView from './PreviewGuestView';
import { Guest } from '../../types';

const WebsitePreview: React.FC = () => {
  const navigate = useNavigate();
  const { guestId: routeGuestId } = useParams<{ guestId?: string }>();
  const { activeEvent, state: siteState, activeEventId } = useAppStore();

  const [viewMode, setViewMode] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [scannedGuest, setScannedGuest] = useState<Guest | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!activeEvent) return;
    const storageKey = `dex_guests_${activeEvent.id}`;
    const guestsRaw = localStorage.getItem(storageKey);
    if (guestsRaw && routeGuestId) {
      const guests: Guest[] = JSON.parse(guestsRaw);
      const found = guests.find(g => g.id === routeGuestId);
      if (found) setScannedGuest(found);
    }
  }, [routeGuestId, activeEvent]);

  const getWidth = () => {
    if (viewMode === 'mobile') return '375px';
    if (viewMode === 'tablet') return '768px';
    return '100%';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center gap-6">
        <div className="relative">
          <div className="w-24 h-24 bg-orange-500 rounded-3xl flex items-center justify-center animate-spin">
            <RefreshCw size={32} className="text-white" />
          </div>
          <div className="absolute -inset-4 border-4 border-orange-500/30 rounded-[2rem] animate-ping" />
        </div>
        <div className="space-y-2">
           <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter">Carregando Preview</h2>
           <p className="text-slate-400 max-w-sm italic">Preparando a visualização do website...</p>
        </div>
      </div>
    );
  }

  if (!activeEvent) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center gap-6">
        <div className="w-32 h-32 bg-orange-500/20 rounded-3xl flex items-center justify-center text-orange-500 border-2 border-orange-500/30">
          <AlertCircle size={64} />
        </div>
        <div className="space-y-4 max-w-md">
           <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter">Nenhum Evento Ativo</h2>
           <p className="text-slate-400 italic">
             Para visualizar o website, primeiro selecione ou crie um evento no Provisioning.
           </p>
           <p className="text-slate-500 text-sm">
             Evento ativo atual: <span className="text-orange-500 font-bold">{activeEventId || 'Nenhum'}</span>
           </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <Button 
            onClick={() => navigate('/admin/provisioning')} 
            className="h-14 px-10 rounded-2xl gap-3 bg-orange-600 hover:bg-orange-500"
          >
            <RefreshCw size={18} /> Ir para Provisionamento
          </Button>
          <Button 
            onClick={() => navigate('/admin/site-master')} 
            variant="outline"
            className="h-14 px-10 rounded-2xl gap-3 border-orange-500 text-orange-500 hover:bg-orange-500/10"
          >
            <Globe size={18} /> Acessar Site Master
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col gap-6 p-6 bg-slate-100 overflow-hidden">
      <div className="flex items-center justify-between bg-white px-8 py-4 rounded-[2.5rem] shadow-xl border border-slate-200 z-50 shrink-0">
        <div className="flex items-center gap-6">
           <button onClick={() => navigate(-1)} className="p-3 hover:bg-slate-50 rounded-2xl text-slate-400 transition-colors"><ArrowLeft size={24} /></button>
           <div>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Simulador Master de Interface</p>
              <h1 className="text-slate-900 font-black italic text-sm uppercase tracking-tighter">{activeEvent.coupleNames}</h1>
           </div>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-[1.5rem] border border-slate-200">
          {[
            { id: 'mobile', icon: Smartphone },
            { id: 'tablet', icon: Tablet },
            { id: 'desktop', icon: Monitor }
          ].map((mode) => (
            <button key={mode.id} onClick={() => setViewMode(mode.id as any)} className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${viewMode === mode.id ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-white'}`}><mode.icon size={20} /></button>
          ))}
        </div>
        <div className="flex items-center gap-3">
           {scannedGuest && <div className="bg-green-50 border border-green-200 px-5 py-2 rounded-xl flex items-center gap-2"><UserCheck size={16} className="text-green-600" /><span className="text-[10px] font-black uppercase text-green-700">Modo: {scannedGuest.name}</span></div>}
           <Button onClick={() => window.open(`${window.location.origin}/#/e/${activeEvent.slug}`, '_blank')} className="h-14 px-8 rounded-2xl gap-3 text-[10px] font-black uppercase italic shadow-xl">Abrir Live Site <ExternalLink size={18} /></Button>
        </div>
      </div>
      <div className="flex-1 flex justify-center items-center relative overflow-hidden">
        <div className="bg-white shadow-[0_50px_100px_rgba(0,0,0,0.15)] rounded-[3rem] overflow-hidden transition-all duration-700 border-[12px] border-white relative h-full flex flex-col" style={{ width: getWidth() }}>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <PreviewGuestView 
              configOverride={siteState} 
              event={activeEvent}
              guestData={scannedGuest}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebsitePreview;
