
import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  MapPin, Gift, Check, Sparkles, Utensils, Clock, BookOpen, 
  MessageSquare, X, ArrowDown, ChevronLeft, AlertCircle, Users, 
  ShieldCheck, Calendar, ArrowRight, Heart, RefreshCw, ChefHat, Star,
  CheckCircle2, Info
} from 'lucide-react';
import Card from '../../components/ui/Card';
import { RSVPStatus, Guest, SiteConfig, EventProvisioning, HistoryChapter } from '../../types';
import { ConfirmationPlugin } from './ConfirmationPlugin';

interface CountdownState {
  days: number; hours: number; minutes: number; seconds: number;
}

interface PreviewGuestViewProps {
  configOverride?: SiteConfig;
  event: EventProvisioning | null;
  guestData?: Guest | null;
}

const PreviewGuestView: React.FC<PreviewGuestViewProps> = ({ 
  configOverride, 
  event,
  guestData: initialGuestData 
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const guestId = searchParams.get('g') || (initialGuestData?.id);
  const [countdown, setCountdown] = useState<CountdownState>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const siteData = configOverride;

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

  const handleNavigate = (subpath: string) => {
    if (!event) return;
    navigate(`/${event.slug}${subpath}${guestId ? `?g=${guestId}` : ''}`);
  };

  const getFontStyle = (font: any) => {
    if (!font) return {};
    return {
      fontFamily: font.family,
      fontSize: typeof font.size === 'number' ? `${font.size}px` : font.size,
      color: font.color
    };
  };

  const safeText = (val: any, fallback: string = ''): string => {
    if (val === null || val === undefined) return fallback;
    if (typeof val === 'string') return val;
    if (typeof val === 'number') return val.toString();
    return fallback;
  };

  if (!event || !siteData) return null;

  const renderSection = (id: string) => {
    if (siteData.visibility && siteData.visibility[id] === false) return null;

    switch (id) {
      case 'identity':
        return (
          <section key="identity" className="relative h-screen flex items-center justify-center overflow-hidden bg-white">
            <img src={safeText(siteData.identity?.heroImageUrl)} className="absolute inset-0 w-full h-full object-cover animate-zoom-out-slow opacity-90" alt="Hero" />
            <div className="absolute inset-0 bg-white/20" />
            <div className="relative z-10 text-center text-slate-900 p-6 space-y-8">
              <div className="space-y-2">
                <p style={getFontStyle(siteData.identity?.initialCall?.font)} className="uppercase tracking-[0.4em] font-black italic">{safeText(siteData.identity?.initialCall?.text)}</p>
                <h1 style={getFontStyle(siteData.identity?.mainIdentity?.font)} className="text-[60px] md:text-[80px] leading-tight text-slate-950">{safeText(siteData.identity?.mainIdentity?.text)}</h1>
                <p style={getFontStyle(siteData.identity?.tagline?.font)} className="uppercase tracking-[0.4em] font-black italic opacity-70">{safeText(siteData.identity?.tagline?.text)}</p>
              </div>
              <div className="flex justify-center gap-6 md:gap-12 pt-6">
                {['Dias', 'Horas', 'Minutos', 'Segundos'].map((label, i) => (
                  <div key={label} className="text-center">
                    <p className="text-4xl md:text-5xl font-black tracking-tighter italic text-slate-950">
                      {String([countdown.days, countdown.hours, countdown.minutes, countdown.seconds][i]).padStart(2, '0')}
                    </p>
                    <p className="text-[8px] font-black uppercase tracking-widest opacity-50 mt-1">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      case 'history':
        return (
          <section key="history" className="py-32 px-6 bg-white">
            <div className="max-w-5xl mx-auto space-y-32">
               {siteData.history?.map((chapter: HistoryChapter, index: number) => (
                 <div key={chapter.id} className={`flex flex-col lg:items-center gap-16 lg:gap-20 ${index % 2 !== 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>
                    <div className="flex-1 space-y-6">
                       <h3 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter leading-tight text-slate-950" style={getFontStyle(chapter.font)}>{safeText(chapter.title)}</h3>
                       <p className="text-slate-500 font-medium italic leading-relaxed">{safeText(chapter.description)}</p>
                    </div>
                    <div className="flex-1 relative">
                       <div className="aspect-[4/5] rounded-[3rem] overflow-hidden shadow-4xl border-[10px] border-white relative z-10">
                          <img src={safeText(chapter.imageUrl)} className="w-full h-full object-cover" alt={safeText(chapter.title)} />
                       </div>
                    </div>
                 </div>
               ))}
            </div>
          </section>
        );

      case 'couple':
        return (
          <section key="couple" className="py-32 px-4 bg-white relative">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-16">
               <div className="flex-1 text-center lg:text-left space-y-4">
                  <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter leading-none text-slate-900">{safeText(siteData.couple?.brideName)}</h2>
                  <p className="text-slate-500 font-medium italic leading-relaxed">{safeText(siteData.couple?.brideBio)}</p>
               </div>
               <div className="relative w-64 h-64 md:w-96 md:h-96 flex items-center justify-center shrink-0">
                  <div className="absolute inset-0 rounded-full overflow-hidden border-[10px] border-orange-100 animate-zoom-out-in">
                     {siteData.couple?.effectUrl && <img src={safeText(siteData.couple.effectUrl)} className="w-full h-full object-cover" alt="Effect" />}
                  </div>
                  <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-[10px] border-white shadow-4xl animate-zoom-in-out z-10">
                     <img src={safeText(siteData.couple?.avatarUrl)} className="w-full h-full object-cover" alt="Casal" />
                  </div>
               </div>
               <div className="flex-1 text-center lg:text-right space-y-4">
                  <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter leading-none text-slate-900">{safeText(siteData.couple?.groomName)}</h2>
                  <p className="text-slate-500 font-medium italic leading-relaxed">{safeText(siteData.couple?.groomBio)}</p>
               </div>
            </div>
          </section>
        );

      case 'agenda':
        return (
          <section key="agenda" className="py-32 bg-white text-slate-900 relative border-t border-slate-50">
            <div className="max-w-6xl mx-auto px-6 space-y-20">
               <div className="text-center space-y-4">
                  <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-none text-slate-950">A Nossa <span className="text-orange-500">Programação</span></h2>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  {siteData.agenda?.map((moment: any) => (
                    <div key={moment.id} className="bg-slate-50 p-8 rounded-[3.5rem] border border-slate-100 text-center space-y-6">
                       <div className="aspect-square rounded-[2.5rem] overflow-hidden">
                          <img src={safeText(moment.imageUrl)} className="w-full h-full object-cover" alt={safeText(moment.name)} />
                       </div>
                       <div>
                          <h4 className="text-lg font-black italic uppercase">{safeText(moment.name)}</h4>
                          <p className="text-orange-500 font-black uppercase text-[10px]">{safeText(moment.startTime)}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </section>
        );

      case 'buffet':
        return (
          <section key="buffet" className="py-32 px-6 bg-white">
            <Card className="rounded-[3rem] overflow-hidden border-none shadow-3xl bg-slate-50 group h-80 relative max-w-md mx-auto border border-slate-100">
               <img src={safeText(siteData.buffet?.heroImageUrl)} className="absolute inset-0 w-full h-full object-cover opacity-50" alt="Buffet" />
               <div className="absolute inset-0 flex flex-col justify-center items-center p-12 text-slate-900 space-y-4">
                  <h3 className="text-3xl font-black italic uppercase tracking-tighter text-center">Menu Gourmet</h3>
                  <button onClick={() => handleNavigate('/buffet')} className="px-8 py-4 bg-slate-950 text-white rounded-2xl font-black uppercase italic tracking-widest text-[9px] hover:bg-orange-600 transition-colors">ABRIR CARDÁPIO</button>
               </div>
            </Card>
          </section>
        );

      case 'gifts':
        return (
          <section key="gifts" className="py-32 px-6 bg-white">
            <Card className="rounded-[3rem] overflow-hidden border-none shadow-3xl bg-slate-50 group h-80 relative max-w-md mx-auto border border-slate-100">
               <img src="https://images.unsplash.com/photo-1549465220-1d8c9d9c47db?auto=format&fit=crop&q=80" className="absolute inset-0 w-full h-full object-cover opacity-50" alt="Gifts" />
               <div className="absolute inset-0 flex flex-col justify-center items-center p-12 text-slate-900 space-y-4">
                  <h3 className="text-3xl font-black italic uppercase tracking-tighter text-center">Mimos Master</h3>
                  <button onClick={() => handleNavigate('/gifts')} className="px-8 py-4 bg-orange-600 text-white rounded-2xl font-black uppercase italic tracking-widest text-[9px] hover:bg-slate-950 transition-colors">ACESSAR LISTA</button>
               </div>
            </Card>
          </section>
        );

      case 'rsvp_v2':
        return (
          <section key="rsvp_v2" className="py-32 px-6 bg-white border-t border-slate-50">
             <div className="max-w-xl mx-auto space-y-8">
                <div className="text-center">
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900">Confirmação (Preview)</h3>
                  <p className="text-slate-400 text-xs italic mt-1 uppercase tracking-widest">Simulação do formulário de resposta</p>
                </div>
                <div className="bg-white rounded-[3rem] shadow-4xl border border-slate-100 overflow-hidden">
                   <ConfirmationPlugin 
                     eventId={safeText(event.id)}
                     guestId={safeText(initialGuestData?.id)}
                     guestName={safeText(initialGuestData?.name, 'Convidado Preview')}
                     isPreview={true}
                   />
                </div>
             </div>
          </section>
        );

      default:
        return null;
    }
  };

  const currentOrder = siteData.sectionOrder || ['identity', 'history', 'couple', 'agenda', 'buffet', 'gifts', 'rsvp_v2'];

  return (
    <div className="min-h-screen bg-white selection:bg-orange-500 selection:text-white pb-32 overflow-x-hidden">
      {currentOrder.map(sectionId => renderSection(sectionId))}

      <footer className="py-12 bg-white text-center text-slate-200 border-t border-slate-50">
         <p className="text-[8px] font-black uppercase tracking-[0.5em] italic">Dex Protocol • Preview Hub</p>
      </footer>
    </div>
  );
};

export default PreviewGuestView;
