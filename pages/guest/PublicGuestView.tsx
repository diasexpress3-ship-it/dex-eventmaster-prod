import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { 
  MapPin, Gift, Check, Sparkles, Utensils, Clock, BookOpen, 
  MessageSquare, X, ArrowDown, ChevronLeft, AlertCircle, Users, 
  ShieldCheck, Calendar, ArrowRight, Heart, RefreshCw, Star,
  ChevronRight, ChefHat, CheckCircle2, Info
} from 'lucide-react';
import Card from '../../components/ui/Card';
import { useEvent } from '../../components/layout/EventWebsiteLayout';
import { RSVPStatus, Guest, SiteConfig, HistoryChapter } from '../../types';
import { ConfirmationPlugin } from '../site/ConfirmationPlugin';

interface CountdownState {
  days: number; hours: number; minutes: number; seconds: number;
}

interface PublicGuestViewProps {
  configOverride?: SiteConfig;
}

const PublicGuestView: React.FC<PublicGuestViewProps> = ({ configOverride }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const guestId = searchParams.get('g');
  const invitationToken = searchParams.get('token');
  
  const { event, siteData: contextSiteData } = useEvent();
  const siteData = configOverride || contextSiteData;
  
  const [countdown, setCountdown] = useState<CountdownState>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [guestData, setGuestData] = useState<Guest | null>(null);

  useEffect(() => {
    if ((guestId || invitationToken) && event?.id) {
      const storageKey = `dex_guests_${event.id}`;
      const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
      let found = guestId ? saved.find((g: Guest) => g.id === guestId) : saved.find((g: Guest) => g.invitationToken === invitationToken);
      if (found) setGuestData(found);
    }
  }, [guestId, invitationToken, event?.id]);

  const eventDate = useMemo(() => {
    if (!event) return new Date();
    return new Date(`${event.weddingDate}T${event.eventTime || '19:00'}:00`);
  }, [event]);

  useEffect(() => {
    const timer = setInterval(() => {
      const distance = eventDate.getTime() - new Date().getTime();
      if (distance < 0) return setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      setCountdown({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [eventDate]);

  const getFontStyle = (font: any) => {
    if (!font) return {};
    return {
      fontFamily: font.family,
      fontSize: typeof font.size === 'number' ? `${font.size}px` : font.size,
      color: font.color
    };
  };

  // Defensive string converter to prevent Error #31
  const safeText = (val: any, fallback: string = ''): string => {
    if (val === null || val === undefined) return fallback;
    if (typeof val === 'string') return val;
    if (typeof val === 'number') return val.toString();
    return fallback;
  };

  if (!event || !siteData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6">
        <RefreshCw size={40} className="animate-spin text-orange-500 mb-4" />
        <p className="font-black uppercase tracking-widest text-[10px] animate-pulse">Sincronização Master...</p>
      </div>
    );
  }

  const renderSection = (id: string) => {
    if (siteData.visibility && siteData.visibility[id] === false) return null;

    switch (id) {
      case 'identity':
        return (
          <section key="identity" className="relative h-screen flex items-center justify-center overflow-hidden bg-white">
            <img 
              src={safeText(siteData.identity?.heroImageUrl, 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80')} 
              className="absolute inset-0 w-full h-full object-cover animate-zoom-out-slow opacity-90" 
              alt="Hero" 
            />
            <div className="absolute inset-0 bg-white/20" />
            <div className="relative z-10 text-center text-slate-900 p-6 space-y-8 w-full max-w-4xl">
              {guestData && (
                <div className="bg-white/80 backdrop-blur-xl px-10 py-5 rounded-[2.5rem] inline-flex flex-col items-center border border-slate-200 shadow-2xl animate-fade-in mx-auto">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] mb-1 opacity-60">Seja Bem-vindo</span>
                  <h2 className="text-xl font-black italic tracking-tight">{safeText(guestData.name)}</h2>
                </div>
              )}
              <div className="space-y-2 px-4">
                <p style={getFontStyle(siteData.identity?.initialCall?.font)} className="uppercase tracking-[0.4em] font-black italic text-sm">
                  {safeText(siteData.identity?.initialCall?.text, 'Estamos Contando os Segundos')}
                </p>
                <h1 style={getFontStyle(siteData.identity?.mainIdentity?.font)} className="text-[60px] md:text-[100px] leading-tight text-slate-950 drop-shadow-sm break-words">
                  {safeText(siteData.identity?.mainIdentity?.text, 'O Nosso Grande Dia')}
                </h1>
                <p style={getFontStyle(siteData.identity?.tagline?.font)} className="uppercase tracking-[0.4em] font-black italic opacity-70 text-sm">
                  {safeText(siteData.identity?.tagline?.text, 'Celebre Conosco')}
                </p>
              </div>
              <div className="flex justify-center gap-6 md:gap-12 pt-6">
                {['Dias', 'Horas', 'Min', 'Seg'].map((label, i) => (
                  <div key={label} className="text-center">
                    <p className="text-4xl md:text-6xl font-black tracking-tighter italic text-slate-950">
                      {String([countdown.days, countdown.hours, countdown.minutes, countdown.seconds][i]).padStart(2, '0')}
                    </p>
                    <p className="text-[9px] font-black uppercase tracking-widest opacity-50 mt-1">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      case 'history':
        return (
          <section key="history" className="py-32 px-6 bg-white overflow-hidden">
            <div className="max-w-6xl mx-auto space-y-32">
               <div className="text-center space-y-4">
                  <span className="text-orange-500 font-black uppercase tracking-[0.4em] text-[10px] italic">Nossa Jornada</span>
                  <h2 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter leading-none text-slate-950">
                    Nossa <span className="text-orange-500">História</span>
                  </h2>
               </div>
               <div className="space-y-32">
                  {siteData.history?.map((chapter: HistoryChapter, index: number) => (
                    <div key={chapter.id} className={`flex flex-col lg:items-center gap-16 lg:gap-24 ${index % 2 !== 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>
                       <div className="flex-1 space-y-8">
                          <div className="w-16 h-1 bg-orange-500 rounded-full" />
                          <h3 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter leading-tight text-slate-950">
                            {safeText(chapter.title)}
                          </h3>
                          <p className="text-xl text-slate-500 font-medium italic leading-relaxed">
                            {safeText(chapter.description)}
                          </p>
                       </div>
                       <div className="flex-1 relative group">
                          <div className="aspect-[4/5] rounded-[4rem] overflow-hidden shadow-4xl border-[12px] border-slate-50 relative z-10">
                             <img 
                               src={safeText(chapter.imageUrl)} 
                               className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[3s]" 
                               alt={safeText(chapter.title)} 
                             />
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </section>
        );

      case 'couple':
        return (
          <section key="couple" className="py-32 px-4 bg-white relative overflow-hidden">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-16">
               <div className="flex-1 text-center lg:text-left space-y-6">
                  <span className="text-orange-500 font-black uppercase tracking-[0.4em] text-[10px] italic flex items-center justify-center lg:justify-start gap-2">
                    <Heart size={14} /> Protagonista
                  </span>
                  <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-none text-slate-900">
                    {safeText(siteData.couple?.brideName, 'A Noiva')}
                  </h2>
                  <p className="text-slate-500 font-medium italic text-lg leading-relaxed">
                    {safeText(siteData.couple?.brideBio)}
                  </p>
               </div>
               <div className="relative w-64 h-64 md:w-[500px] md:h-[500px] flex items-center justify-center shrink-0">
                  <div className="absolute inset-0 rounded-full overflow-hidden border-[15px] border-orange-50 animate-zoom-out-in">
                     {siteData.couple?.effectUrl && <img src={safeText(siteData.couple.effectUrl)} className="w-full h-full object-cover" alt="Effect" />}
                  </div>
                  <div className="relative w-48 h-48 md:w-[320px] md:h-[320px] rounded-full overflow-hidden border-[15px] border-white shadow-4xl animate-zoom-in-out z-10">
                     <img 
                       src={safeText(siteData.couple?.avatarUrl)} 
                       className="w-full h-full object-cover" 
                       alt="Couple" 
                     />
                  </div>
               </div>
               <div className="flex-1 text-center lg:text-right space-y-6">
                  <span className="text-orange-500 font-black uppercase tracking-[0.4em] text-[10px] italic flex items-center justify-center lg:justify-end gap-2">
                    <Heart size={14} /> Protagonista
                  </span>
                  <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-none text-slate-900">
                    {safeText(siteData.couple?.groomName, 'O Noivo')}
                  </h2>
                  <p className="text-slate-500 font-medium italic text-lg leading-relaxed">
                    {safeText(siteData.couple?.groomBio)}
                  </p>
               </div>
            </div>
          </section>
        );

      case 'agenda':
        return (
          <section key="agenda" className="py-32 bg-white text-slate-900 relative border-t border-slate-50 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 space-y-20">
               <div className="text-center space-y-4">
                  <span className="text-orange-500 font-black uppercase tracking-[0.4em] text-[10px] italic">Save the Date</span>
                  <h2 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter leading-none text-slate-950">
                    A Nossa <span className="text-orange-500">Programação</span>
                  </h2>
               </div>
               
               <div className="flex overflow-x-auto custom-scrollbar-h gap-10 md:grid md:grid-cols-3 md:gap-10 pb-6">
                  {siteData.agenda?.map((moment: any) => (
                    <div key={moment.id} className="min-w-[300px] md:min-w-0 bg-slate-50 p-10 rounded-[3.5rem] border border-slate-100 text-center space-y-8 group hover:bg-orange-500 hover:text-white transition-all duration-300">
                       <div className="aspect-square rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl relative">
                          <img 
                            src={safeText(moment.imageUrl)} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                            alt={safeText(moment.name)} 
                          />
                       </div>
                       <div className="space-y-4">
                          <h4 className="text-xl font-black italic uppercase tracking-tighter leading-none">
                            {safeText(moment.name)}
                          </h4>
                          <div className="flex flex-col gap-2">
                             <span className="inline-flex items-center justify-center gap-2 text-orange-600 font-black uppercase italic text-[10px] group-hover:text-white">
                               <Clock size={12} /> {safeText(moment.startTime)}
                             </span>
                             <span className="inline-flex items-center justify-center gap-2 text-slate-400 font-bold italic text-[9px] group-hover:text-white/80">
                               <MapPin size={12} /> {safeText(moment.location)}
                             </span>
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </section>
        );

      case 'buffet':
        return (
          <section key="buffet" className="py-20 px-6 bg-white overflow-hidden">
            <div className="max-w-4xl mx-auto text-center space-y-8">
               <div className="space-y-2">
                  <h3 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">Menu Gourmet</h3>
                  <p className="text-slate-500 font-medium italic text-sm">Nossa curadoria gastronômica.</p>
               </div>
               <Link 
                 to={`/${event.slug}/buffet${guestId ? `?g=${guestId}` : invitationToken ? `?token=${invitationToken}` : ''}`}
                 className="block w-full py-10 bg-orange-50 text-orange-500 rounded-[2.5rem] font-black uppercase italic tracking-widest text-xl border-4 border-orange-500 hover:bg-orange-500 hover:text-white transition-all shadow-4xl animate-slide-lr no-underline flex items-center justify-center gap-6"
               >
                  <ChefHat size={28} /> ABRIR CARDÁPIO MASTER <ArrowRight size={24} />
               </Link>
            </div>
          </section>
        );

      case 'gifts':
        return (
          <section key="gifts" className="py-20 px-6 bg-white overflow-hidden">
            <div className="max-w-4xl mx-auto text-center space-y-8">
               <div className="space-y-2">
                  <h3 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">Lista de Mimos</h3>
                  <p className="text-slate-500 font-medium italic text-sm">Se desejar nos presentear.</p>
               </div>
               <Link 
                 to={`/${event.slug}/gifts${guestId ? `?g=${guestId}` : invitationToken ? `?token=${invitationToken}` : ''}`}
                 className="block w-full py-10 bg-orange-600 text-white rounded-[2.5rem] font-black uppercase italic tracking-widest text-xl hover:bg-slate-950 transition-all shadow-4xl animate-float-master no-underline flex items-center justify-center gap-6"
               >
                  <Gift size={28} /> ACESSAR LISTA DE PRESENTES <ArrowRight size={24} />
               </Link>
            </div>
          </section>
        );

      case 'rsvp_v2':
        return (
          <section key="rsvp_v2" id="confirmacao-presenca" className="py-32 px-6 bg-gradient-to-b from-white to-orange-50 border-t border-slate-50 overflow-hidden">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl flex items-center justify-center shadow-2xl">
                    <CheckCircle2 className="text-white" size={24} />
                  </div>
                  <div className="text-left">
                    <h2 className="text-5xl font-black italic uppercase tracking-tighter leading-tight text-slate-900">
                      Confirme sua <span className="text-orange-500">Presença</span>
                    </h2>
                    <p className="text-orange-400 font-black uppercase tracking-[0.3em] text-[10px] mt-1">
                      RSVP • RESPOSTA REQUERIDA
                    </p>
                  </div>
                </div>
                
                <p className="text-slate-600 font-medium italic text-lg max-w-2xl mx-auto leading-relaxed">
                  {guestData 
                    ? `Olá ${safeText(guestData.name)}, estamos ansiosos para celebrar este momento especial com você! `
                    : 'Use o link exclusivo do seu convite para confirmar sua participação no nosso grande dia. '
                  }
                </p>
              </div>

              <div className="bg-white rounded-[3rem] border border-slate-200 p-12 shadow-2xl relative overflow-hidden mx-auto">
                <div className="relative z-10">
                  <ConfirmationPlugin 
                    eventId={safeText(event.id)} 
                    guestId={safeText(guestData?.id)}
                    guestName={safeText(guestData?.name, 'Convidado')}
                    invitationToken={safeText(invitationToken || guestData?.invitationToken)}
                  />
                </div>
              </div>
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  const currentOrder = [...(siteData.sectionOrder || ['identity', 'history', 'couple', 'agenda', 'buffet', 'gifts', 'rsvp_v2'])];

  return (
    <div className="min-h-screen bg-white selection:bg-orange-500 selection:text-white pb-20 overflow-x-hidden w-full">
      {currentOrder.map(sectionId => renderSection(sectionId))}

      <footer className="py-16 bg-white text-center text-slate-200 border-t border-slate-50">
        <p className="text-[8px] font-black uppercase tracking-[0.4em] italic">
          Digital Excellence Hub • Protocolo v3.0
        </p>
      </footer>
    </div>
  );
};

export default PublicGuestView;