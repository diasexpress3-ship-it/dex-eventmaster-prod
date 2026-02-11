
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gift, ChevronLeft, ShoppingBag, CheckCircle2, Package, Sparkles, AlertCircle } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useEvent } from '../../components/layout/EventWebsiteLayout';
import { GiftItem } from '../../types';

const PublicGiftsView: React.FC = () => {
  const navigate = useNavigate();
  const { event, giftsData } = useEvent();
  
  const [gifts, setGifts] = useState<GiftItem[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (giftsData && Array.isArray(giftsData)) {
      setGifts(giftsData);
    }
  }, [giftsData]);

  const handleSelectGift = (gift: GiftItem) => {
    if (!gift.isAvailable || (gift.currentSelections || 0) >= (gift.maxSelections || 1) || !event) return;

    const updated = gifts.map(g => {
      if (g.id === gift.id) return { ...g, currentSelections: (g.currentSelections || 0) + 1 };
      return g;
    });

    setGifts(updated);
    if (event.id) {
      localStorage.setItem(`dex_gifts_${event.id}`, JSON.stringify(updated));
    }
    
    setFeedback(`Que carinho! Você selecionou "${gift.name}".`);
    setTimeout(() => setFeedback(null), 4000);
  };

  if (!event) return null;

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-orange-500 pb-32 animate-in fade-in duration-700">
      {feedback && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] bg-slate-900 text-white px-10 py-5 rounded-[2.5rem] shadow-4xl flex items-center gap-4 animate-in slide-in-from-top-4 border-2 border-orange-500 backdrop-blur-xl">
          <CheckCircle2 size={28} className="text-orange-500" />
          <span className="text-xs font-black uppercase tracking-widest italic">{feedback}</span>
        </div>
      )}

      <header className="bg-white/90 backdrop-blur-md border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-3 text-slate-900 font-black uppercase text-xs tracking-widest hover:text-orange-500 transition-all">
            <ChevronLeft size={20} /> Voltar
          </button>
          <div className="text-center">
            <h1 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-1">Mimos Master</h1>
            <p className="text-xl font-black italic text-slate-900 tracking-tighter uppercase leading-none">{event.coupleNames}</p>
          </div>
          <div className="w-24" />
        </div>
      </header>

      <section className="py-32 bg-slate-950 text-white text-center relative overflow-hidden">
        <Sparkles className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-orange-500/10" size={600} />
        <div className="max-w-3xl mx-auto px-6 space-y-10 relative z-10">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-orange-600 rounded-[2.5rem] shadow-4xl animate-float">
            <Gift size={48} className="text-white" />
          </div>
          <div className="space-y-4">
             <h2 className="text-5xl md:text-[7rem] font-black italic uppercase tracking-tighter leading-none">MIMOS & <span className="text-orange-500">GRATIDÃO</span></h2>
             <p className="text-slate-400 font-medium italic text-2xl leading-relaxed max-w-2xl mx-auto">Sua presença é o maior presente, mas se desejar nos presentear, escolha um item abaixo.</p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-32">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
          {gifts.map((gift) => {
            const current = gift.currentSelections || 0;
            const max = gift.maxSelections || 1;
            const isLotado = current >= max;
            const hasBeenSelected = current > 0;

            return (
              <Card key={gift.id} className="animate-float group relative overflow-hidden border-0 shadow-3xl rounded-[4rem] bg-white hover:-translate-y-6 transition-all duration-700">
                <div className="aspect-square bg-slate-100 relative overflow-hidden">
                  <img src={gift.imageUrl} className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-[4s] ${isLotado ? 'grayscale opacity-40' : ''}`} alt={gift.name} />
                  
                  {isLotado ? (
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center">
                       <div className="bg-red-500 text-white px-10 py-4 rounded-[1.5rem] flex items-center gap-4 shadow-4xl">
                          <AlertCircle size={24} />
                          <span className="text-xs font-black uppercase tracking-[0.3em]">Item Esgotado</span>
                       </div>
                    </div>
                  ) : hasBeenSelected && (
                    <div className="absolute top-8 right-8 z-10">
                       <div className="bg-green-500 text-white p-4 rounded-full shadow-4xl animate-in zoom-in" title="Este presente já recebeu carinho">
                          <CheckCircle2 size={24} strokeWidth={4} />
                       </div>
                    </div>
                  )}
                </div>
                <div className="p-12 space-y-8">
                  <div className="flex items-center justify-between border-b border-slate-50 pb-6">
                    <span className="text-[10px] font-black uppercase tracking-widest text-orange-500 italic">{gift.category}</span>
                    <span className="text-3xl font-black text-slate-900 italic tracking-tighter">R$ {gift.price.toFixed(2)}</span>
                  </div>
                  
                  <div className="space-y-4">
                     <h4 className="text-2xl font-black text-slate-950 tracking-tight italic uppercase leading-none min-h-[4rem] line-clamp-2">{gift.name}</h4>
                     
                     <div className="space-y-2">
                        <div className="flex justify-between text-[8px] font-black uppercase text-slate-300 italic">
                           <span>Progresso Master</span>
                           <span>{current} / {max}</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                           <div className={`h-full transition-all duration-[2s] ${isLotado ? 'bg-red-500' : 'bg-orange-500'}`} style={{ width: `${(current / max) * 100}%` }} />
                        </div>
                     </div>
                  </div>

                  <Button 
                    disabled={isLotado} 
                    className={`w-full h-20 rounded-[2rem] gap-4 text-xs font-black uppercase italic ${isLotado ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-950 text-white hover:bg-orange-600 shadow-4xl active:scale-95 transition-all'}`} 
                    onClick={() => handleSelectGift(gift)}
                  >
                    {isLotado ? (
                      <>LIMITE ALCANÇADO</>
                    ) : (
                      <><ShoppingBag size={20} /> Escolher Presente</>
                    )}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
        
        {gifts.length === 0 && (
          <div className="text-center py-56 opacity-10 space-y-8">
            <Package size={120} className="mx-auto" />
            <p className="text-2xl font-black uppercase tracking-[0.5em] italic">Lista Master sob curadoria</p>
          </div>
        )}
      </section>

      <footer className="py-32 bg-slate-950 text-center">
         <p className="text-[10px] font-black uppercase tracking-[1em] text-white/10 italic">Digital Excellence Protocol</p>
      </footer>
    </div>
  );
};

export default PublicGiftsView;
