
import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ChevronLeft, Utensils, Star, Info, 
  ChefHat, Scissors, Sparkles, Camera
} from 'lucide-react';
import Card from '../../components/ui/Card';
import { useEvent } from '../../components/layout/EventWebsiteLayout';
import { BuffetItem } from '../../types';

export default function PublicBuffetView() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const guestId = searchParams.get('g');
  const { event, buffetData, siteData } = useEvent();

  const buffetConfig = buffetData || siteData?.buffet;

  const goBack = () => {
    if (event?.slug) {
      navigate(`/${event.slug}${guestId ? `?g=${guestId}` : ''}`);
    } else {
      navigate('/');
    }
  };

  if (!event) return null;

  return (
    <div className="min-h-screen bg-white selection:bg-orange-500 overflow-x-hidden animate-in fade-in duration-700 pb-32">
      {/* HEADER MASTER ELITE */}
      <header className="p-6 md:p-8 border-b bg-white/90 backdrop-blur-xl sticky top-0 z-[100] flex items-center justify-between shadow-sm">
        <button onClick={goBack} className="flex items-center gap-2 text-slate-900 font-black uppercase text-[10px] tracking-widest hover:text-orange-500 transition-all">
          <ChevronLeft size={18} /> Voltar
        </button>
        <div className="text-center">
           <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 italic">Menu Degustação</p>
           <h2 className="text-[10px] md:text-sm font-black italic uppercase tracking-[0.2em] text-slate-800">{event.coupleNames}</h2>
        </div>
        <div className="w-10" />
      </header>

      {/* 1. CAPA MASTER (HERO BANNER) */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <img 
          src={buffetConfig?.heroImageUrl || 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80'} 
          className="absolute inset-0 w-full h-full object-cover animate-zoom-out-slow" 
          alt="Buffet Hero" 
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 text-center text-white px-6 space-y-8 animate-in fade-in zoom-in duration-1000">
           <div className="flex flex-col items-center">
              <div className="flex items-center gap-6 text-orange-500 mb-6">
                 <Scissors size={48} className="rotate-90" />
                 <Utensils size={48} />
              </div>
              <h1 className="text-5xl md:text-[8rem] font-black italic uppercase tracking-tighter leading-none">
                Buffet <span className="text-orange-500">Master</span>
              </h1>
              <div className="h-1 w-24 bg-orange-500 rounded-full mt-6" />
           </div>
           <p className="text-lg md:text-3xl text-white/80 italic max-w-3xl mx-auto font-medium leading-relaxed">
             {buffetConfig?.description || 'Uma curadoria gastronômica de elite pensada exclusivamente para celebrar este momento único.'}
           </p>
        </div>
      </section>

      {/* 2. CARDÁPIO SPLIT (LISTA ESQUERDA / IMAGEM DIREITA) */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-start">
          <div className="space-y-20">
            <div className="space-y-4">
               <span className="text-orange-500 font-black uppercase tracking-[0.4em] text-[10px] italic">Curadoria Gourmet</span>
               <h3 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none text-slate-950">O Nosso <br /> <span className="text-orange-500">Cardápio</span></h3>
            </div>
            
            <div className="space-y-16">
              {(buffetConfig?.menuItems || []).map((item: BuffetItem, idx: number) => (
                <div key={item.id} className="group space-y-4 animate-in slide-in-from-left duration-700" style={{ animationDelay: `${idx * 100}ms` }}>
                  <div className="flex items-center gap-6">
                    <span className="text-orange-500 font-black italic text-3xl">0{idx + 1}.</span>
                    <h4 className="text-3xl font-black italic uppercase text-slate-900 tracking-tight group-hover:text-orange-600 transition-colors">{item.name}</h4>
                  </div>
                  <p className="text-xl text-slate-500 italic font-medium leading-relaxed pl-16 border-l-4 border-slate-50 group-hover:border-orange-200 transition-all">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="lg:sticky lg:top-40">
             <div className="aspect-[4/5] rounded-[6rem] overflow-hidden shadow-4xl border-[20px] border-slate-50 relative group">
                <img 
                  src={buffetConfig?.menuDetailImageUrl || 'https://images.unsplash.com/photo-1541529086526-db283c563270?auto=format&fit=crop&q=80'} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[3s]"
                  alt="Menu Detail"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                <div className="absolute bottom-10 left-10 text-white space-y-2">
                   <div className="w-12 h-1 bg-orange-500 rounded-full" />
                   <p className="text-[10px] font-black uppercase tracking-[0.4em]">Experiência Master</p>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* 3. GALERIA GASTRONÔMICA (DISH PHOTOS) */}
      <section className="py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 space-y-20">
           <div className="text-center space-y-4">
              <span className="text-orange-500 font-black uppercase tracking-[0.4em] text-[10px] italic">Visual Tasting</span>
              <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-none text-slate-950">Galeria <span className="text-orange-500">Gastronômica</span></h2>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {(buffetConfig?.galleryImages || []).map((img: string, idx: number) => (
                <div key={idx} className="aspect-square rounded-[4rem] overflow-hidden shadow-2xl border-[12px] border-white group relative hover:-translate-y-4 transition-all duration-700">
                   <img src={img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                   <div className="absolute inset-0 bg-orange-600/10 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                      <Camera size={40} className="text-white drop-shadow-2xl" />
                   </div>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* FOOTER OBSERVATIONS */}
      <section className="py-32 text-center px-6">
         <Card className="max-w-4xl mx-auto rounded-[4rem] bg-slate-950 p-20 border-none shadow-4xl text-center space-y-8 relative overflow-hidden">
            <Sparkles className="absolute top-0 right-0 text-white/5" size={200} />
            <div className="relative z-10 space-y-6">
               <Info size={48} className="mx-auto text-orange-500 mb-6 animate-pulse" />
               <h4 className="text-[12px] font-black uppercase tracking-[0.6em] text-orange-500">Protocolo Gastronômico</h4>
               <p className="text-2xl md:text-3xl italic font-bold text-white leading-relaxed max-w-2xl mx-auto">
                 {buffetConfig?.observations || 'Nossa equipe está preparada para atender restrições alimentares específicas. Por favor, informe-nos.'}
               </p>
            </div>
         </Card>
      </section>
    </div>
  );
}
