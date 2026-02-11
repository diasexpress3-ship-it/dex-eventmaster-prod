
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Globe, Save, Eye, EyeOff, Image as ImageIcon, Plus, Trash2, Clock, 
  MapPin, Utensils, Heart, Layers, Settings2, Sparkles, RefreshCw, 
  Type, Camera, CheckCircle2, Wand2, Loader2, Info, Edit3, Upload, 
  Gift, ArrowUp, ArrowDown, Type as FontIcon, ClipboardList
} from 'lucide-react';
import { useAppStore } from '../store/appStore';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { AgendaItem, HistoryChapter, FONT_FAMILIES, GiftItem, BuffetItem } from '../../types';
import { generateEventContent } from '../../services/googleGenAIService';
import { AdminConfirmationPanel } from '../../modules/guest-confirmation/AdminConfirmationPanel';

const SiteMaster: React.FC = () => {
  const { 
    state, 
    updateSection, 
    reorderSections,
    toggleVisibility, 
    publishChanges, 
    provisionings, 
    activeEventId, 
    setActiveEventId 
  } = useAppStore();
  
  const navigate = useNavigate();
  const [activeLayer, setActiveLayer] = useState('identity');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTarget, setUploadTarget] = useState<{ section: string, field: string, id?: string } | null>(null);

  const [gifts, setGifts] = useState<GiftItem[]>([]);

  const giftsStorageKey = useMemo(() => `dex_gifts_${activeEventId || 'global'}`, [activeEventId]);

  useEffect(() => {
    if (activeEventId) {
      const saved = localStorage.getItem(giftsStorageKey);
      if (saved) setGifts(JSON.parse(saved));
      else setGifts([]);
    }
  }, [activeEventId, giftsStorageKey]);

  const handlePublish = () => {
    if (!activeEventId) return;
    setSaveStatus('saving');
    publishChanges();
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 1000);
  };

  const handleAiGenerate = async (type: 'bride' | 'groom' | 'buffet', currentVal: string) => {
    setAiLoading(type);
    const result = await generateEventContent(type, currentVal || "Conte algo emocionante sobre o casal");
    
    if (type === 'bride' || type === 'groom') {
      updateSection('couple', { ...state.couple, [`${type}Bio`]: result });
    } else if (type === 'buffet') {
      updateSection('buffet', { ...state.buffet, description: result });
    }
    
    setAiLoading(null);
  };

  const triggerUpload = (section: string, field: string, id?: string) => {
    setUploadTarget({ section, field, id });
    fileInputRef.current?.click();
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && uploadTarget) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const url = reader.result as string;
        if (uploadTarget.section === 'identity') {
          updateSection('identity', { ...state.identity, [uploadTarget.field]: url });
        } else if (uploadTarget.section === 'couple') {
          updateSection('couple', { ...state.couple, [uploadTarget.field]: url });
        } else if (uploadTarget.section === 'history' && uploadTarget.id) {
          const updated = state.history.map((h: HistoryChapter) => h.id === uploadTarget.id ? { ...h, imageUrl: url } : h);
          updateSection('history', updated);
        } else if (uploadTarget.section === 'agenda' && uploadTarget.id) {
          const updated = state.agenda.map((a: AgendaItem) => a.id === uploadTarget.id ? { ...a, imageUrl: url } : a);
          updateSection('agenda', updated);
        } else if (uploadTarget.section === 'buffet') {
          if (uploadTarget.field === 'gallery') {
            const currentGallery = state.buffet.galleryImages || [];
            updateSection('buffet', { ...state.buffet, galleryImages: [...currentGallery, url] });
          } else {
            updateSection('buffet', { ...state.buffet, [uploadTarget.field]: url });
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const layersDefinitions = [
    { id: 'identity', name: 'Identidade Master', icon: Layers },
    { id: 'history', name: 'Nossa História', icon: Sparkles },
    { id: 'couple', name: 'O Casal', icon: Heart },
    { id: 'agenda', name: 'Programação', icon: Clock },
    { id: 'buffet', name: 'Buffet Gourmet', icon: Utensils },
    { id: 'gifts', name: 'Presentes Master', icon: Gift },
    { id: 'rsvp_v2', name: 'RSVP Master v2', icon: ClipboardList },
  ];

  const sortedLayers = useMemo(() => {
    const order = state.sectionOrder || layersDefinitions.map(l => l.id);
    const available = order.map(id => layersDefinitions.find(l => l.id === id)).filter(Boolean) as typeof layersDefinitions;
    // Garante que o RSVP_v2 apareça se não estiver no order original (devido ao isolamento)
    if (!available.find(a => a.id === 'rsvp_v2')) {
      available.push(layersDefinitions.find(l => l.id === 'rsvp_v2')!);
    }
    return available;
  }, [state.sectionOrder]);

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col gap-6 animate-in fade-in duration-300 text-slate-900 overflow-hidden">
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={onFileChange} />
      
      <div className="bg-white px-10 py-6 rounded-[3rem] flex items-center justify-between shadow-2xl border border-slate-50 shrink-0">
        <div className="flex items-center gap-8">
           <div className="flex flex-col">
              <h1 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">Designer Master Pro</h1>
              <div className="flex items-center gap-2 mt-2">
                 <RefreshCw size={12} className="text-orange-500 animate-spin-slow" />
                 <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Master AI Sync v3.1</p>
              </div>
           </div>
           <div className="h-10 w-px bg-slate-100" />
           <select 
             className="bg-slate-50 border-none rounded-2xl px-6 py-3 text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer"
             value={activeEventId || ''}
             onChange={(e) => setActiveEventId(e.target.value)}
           >
             <option value="" disabled>SELECIONE O EVENTO...</option>
             {provisionings.map(p => <option key={p.id} value={p.id}>{p.coupleNames}</option>)}
           </select>
        </div>
        <div className="flex items-center gap-3">
           <button onClick={() => navigate('/site/preview')} className="px-8 py-3 bg-slate-100 rounded-2xl text-[10px] font-black uppercase italic tracking-widest text-slate-500 hover:bg-slate-200 transition-all">Ver Site</button>
           <Button onClick={handlePublish} disabled={!activeEventId} className="rounded-2xl px-10 h-14 uppercase font-black text-[10px] bg-orange-500 text-white shadow-3xl hover:bg-orange-600 transition-all">
             {saveStatus === 'saving' ? 'Sincronizando...' : 'Publicar Agora'}
           </Button>
        </div>
      </div>

      <div className="flex-1 flex gap-8 overflow-hidden">
        <div className="w-80 flex flex-col gap-6 overflow-hidden">
          <Card className="rounded-[3.5rem] border-none shadow-2xl bg-white p-6 overflow-hidden flex flex-col flex-1">
            <div className="flex items-center justify-between px-4 py-6 border-b border-slate-50 mb-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic">Camadas do Site</span>
              <Settings2 size={16} className="text-slate-300" />
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 p-2">
              {sortedLayers.map((layer, index) => {
                const isActive = activeLayer === layer.id;
                const isVisible = state.visibility[layer.id] !== false;
                return (
                  <div 
                    key={layer.id} 
                    className={`flex flex-col p-3 rounded-[1.8rem] transition-all cursor-pointer group border ${isActive ? 'bg-orange-500 text-white shadow-xl border-orange-400' : 'text-slate-500 hover:bg-slate-50 border-transparent'}`} 
                    onClick={() => setActiveLayer(layer.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all ${isActive ? 'bg-white/20' : 'bg-slate-50 group-hover:bg-white'}`}>
                        <layer.icon size={16} />
                      </div>
                      <span className="flex-1 text-[9px] font-black uppercase tracking-widest italic truncate">{layer.name}</span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleVisibility(layer.id); }}
                        className={`p-1.5 rounded-lg transition-colors ${isActive ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`}
                      >
                        {isVisible ? <Eye size={14} /> : <EyeOff size={14} className="text-red-400" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 pb-20">
          {!activeEventId ? (
             <div className="h-full flex flex-col items-center justify-center text-center opacity-30 gap-6">
                <RefreshCw size={80} className="text-slate-200 animate-spin-slow" />
                <h3 className="text-2xl font-black italic uppercase tracking-tighter">Escolha um Evento Master</h3>
             </div>
          ) : (
            <div className="animate-in slide-in-from-right-10 duration-500">
              {activeLayer === 'rsvp_v2' ? (
                <AdminConfirmationPanel eventId={activeEventId} />
              ) : activeLayer === 'identity' && (
                <div className="space-y-12">
                   <div className="flex items-center gap-6 bg-white p-8 rounded-[3rem] shadow-sm">
                      <Layers size={28} className="text-orange-500" />
                      <h2 className="text-xl font-black italic uppercase">Identidade Visual (Hero)</h2>
                   </div>
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="space-y-8">
                        {['initialCall', 'mainIdentity', 'tagline'].map((field) => (
                          <Card key={field} className="rounded-[3.5rem] p-10 bg-white shadow-2xl space-y-6">
                            <p className="text-[10px] font-black text-orange-500 uppercase italic border-b pb-4">
                              {field === 'initialCall' ? 'Chamada Superior' : field === 'mainIdentity' ? 'Título Central' : 'Subtítulo (Data/Local)'}
                            </p>
                            <input value={state.identity[field].text} onChange={e => updateSection('identity', { ...state.identity, [field]: { ...state.identity[field], text: e.target.value } })} className="w-full text-2xl font-black italic uppercase bg-slate-50 p-6 rounded-3xl outline-none" />
                            <div className="grid grid-cols-2 gap-4">
                               <select className="bg-slate-50 p-3 rounded-xl text-[10px] font-bold" value={state.identity[field].font.family} onChange={e => updateSection('identity', { ...state.identity, [field]: { ...state.identity[field], font: { ...state.identity[field].font, family: e.target.value } } })}>
                                 {FONT_FAMILIES.map(f => <option key={f.value} value={f.value}>{f.name}</option>)}
                               </select>
                               <input type="range" min="10" max="150" value={state.identity[field].font.size} onChange={e => updateSection('identity', { ...state.identity, [field]: { ...state.identity[field], font: { ...state.identity[field].font, size: parseInt(e.target.value) } } })} className="accent-orange-500" />
                            </div>
                          </Card>
                        ))}
                      </div>
                      <Card className="rounded-[4rem] p-10 bg-white shadow-2xl flex flex-col items-center justify-center text-center gap-8 h-fit sticky top-0">
                         <div className="aspect-[9/16] w-64 rounded-[3.5rem] bg-slate-50 overflow-hidden relative group cursor-pointer shadow-4xl border-[10px] border-white" onClick={() => triggerUpload('identity', 'heroImageUrl')}>
                            {state.identity.heroImageUrl ? <img src={state.identity.heroImageUrl} className="w-full h-full object-cover" /> : <div className="h-full flex flex-col items-center justify-center"><Camera size={48} /></div>}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"><Camera size={32} className="text-white" /></div>
                         </div>
                      </Card>
                   </div>
                </div>
              )}

              {activeLayer === 'couple' && (
                <div className="space-y-12">
                   <div className="flex items-center gap-6 bg-white p-8 rounded-[3rem] shadow-sm">
                      <Heart size={28} className="text-orange-500" />
                      <h2 className="text-xl font-black italic uppercase tracking-tighter">O Casal (Elite AI Bios)</h2>
                   </div>
                   <Card className="rounded-[5rem] p-16 bg-white shadow-4xl border-none">
                      <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
                         <div className="flex-1 space-y-10 w-full">
                            <input value={state.couple.brideName} onChange={e => updateSection('couple', { ...state.couple, brideName: e.target.value.toUpperCase() })} className="w-full text-4xl font-black italic uppercase bg-slate-50 p-8 rounded-[2.5rem] outline-none shadow-inner" placeholder="NOME DA NOIVA" />
                            <div className="relative group">
                              <textarea value={state.couple.brideBio} onChange={e => updateSection('couple', { ...state.couple, brideBio: e.target.value })} className="w-full h-48 p-8 bg-slate-50 rounded-[2.5rem] italic font-medium text-slate-500 outline-none shadow-inner resize-none" placeholder="Conte a biografia..." />
                              <button 
                                onClick={() => handleAiGenerate('bride', state.couple.brideBio)}
                                disabled={aiLoading === 'bride'}
                                className="absolute bottom-4 right-4 bg-orange-600 text-white p-3 rounded-2xl shadow-xl hover:scale-110 transition-all disabled:opacity-50"
                              >
                                {aiLoading === 'bride' ? <Loader2 size={18} className="animate-spin" /> : <Wand2 size={18} />}
                              </button>
                            </div>
                         </div>
                         <div className="relative w-72 h-72 rounded-full border-[15px] border-white shadow-4xl overflow-hidden animate-zoom-in-out z-10 cursor-pointer" onClick={() => triggerUpload('couple', 'avatarUrl')}>
                            {state.couple.avatarUrl ? <img src={state.couple.avatarUrl} className="w-full h-full object-cover" /> : <Camera size={40} className="text-slate-200 mx-auto" />}
                         </div>
                         <div className="flex-1 space-y-10 w-full">
                            <input value={state.couple.groomName} onChange={e => updateSection('couple', { ...state.couple, groomName: e.target.value.toUpperCase() })} className="w-full text-4xl font-black italic uppercase bg-slate-50 p-8 rounded-[2.5rem] outline-none shadow-inner text-right" placeholder="NOME DO NOIVO" />
                            <div className="relative group">
                              <textarea value={state.couple.groomBio} onChange={e => updateSection('couple', { ...state.couple, groomBio: e.target.value })} className="w-full h-48 p-8 bg-slate-50 rounded-[2.5rem] italic font-medium text-slate-500 outline-none shadow-inner text-right resize-none" placeholder="Conte a biografia..." />
                              <button 
                                onClick={() => handleAiGenerate('groom', state.couple.groomBio)}
                                disabled={aiLoading === 'groom'}
                                className="absolute bottom-4 left-4 bg-orange-600 text-white p-3 rounded-2xl shadow-xl hover:scale-110 transition-all disabled:opacity-50"
                              >
                                {aiLoading === 'groom' ? <Loader2 size={18} className="animate-spin" /> : <Wand2 size={18} />}
                              </button>
                            </div>
                         </div>
                      </div>
                   </Card>
                </div>
              )}

              {activeLayer === 'buffet' && (
                <div className="space-y-12">
                   <div className="flex items-center gap-6 bg-white p-8 rounded-[3rem] shadow-sm">
                      <Utensils size={28} className="text-orange-500" />
                      <h2 className="text-xl font-black italic uppercase">Menu Gourmet (AI Assisted)</h2>
                   </div>
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <Card className="rounded-[3rem] p-10 bg-white shadow-2xl space-y-6">
                         <h3 className="text-sm font-black italic uppercase border-b pb-4">Descrição Principal</h3>
                         <div className="relative">
                            <textarea value={state.buffet.description} onChange={e => updateSection('buffet', { ...state.buffet, description: e.target.value })} className="w-full h-40 bg-slate-50 p-6 rounded-3xl italic font-medium text-sm outline-none resize-none" placeholder="Descreva a experiência gourmet..." />
                            <button 
                              onClick={() => handleAiGenerate('buffet', state.buffet.description)}
                              disabled={aiLoading === 'buffet'}
                              className="absolute bottom-4 right-4 bg-slate-950 text-white p-3 rounded-xl shadow-xl hover:bg-orange-600 transition-all"
                            >
                               {aiLoading === 'buffet' ? <Loader2 size={18} className="animate-spin" /> : <Wand2 size={18} />}
                            </button>
                         </div>
                      </Card>
                      <Card className="rounded-[3rem] p-10 bg-white shadow-2xl space-y-6">
                         <h3 className="text-sm font-black italic uppercase border-b pb-4">Itens Selecionados</h3>
                         <div className="space-y-3">
                           {state.buffet.menuItems.map((item: any) => (
                             <div key={item.id} className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between">
                                <span className="font-black italic text-[10px] uppercase">{item.name}</span>
                                <button onClick={() => updateSection('buffet', { ...state.buffet, menuItems: state.buffet.menuItems.filter((i:any) => i.id !== item.id) })} className="text-red-400"><Trash2 size={14} /></button>
                             </div>
                           ))}
                           <button onClick={() => updateSection('buffet', { ...state.buffet, menuItems: [...state.buffet.menuItems, { id: Date.now(), name: 'NOVO PRATO', description: '' }] })} className="w-full py-3 border-2 border-dashed border-slate-200 rounded-2xl text-[8px] font-black uppercase">+ Adicionar</button>
                         </div>
                      </Card>
                   </div>
                </div>
              )}

              {activeLayer === 'history' && (
                <div className="space-y-12">
                   <div className="flex items-center justify-between bg-white p-8 rounded-[3rem] shadow-sm">
                      <div className="flex items-center gap-6"><Sparkles size={28} className="text-orange-500" /><h2 className="text-xl font-black italic uppercase">Nossa História</h2></div>
                      <button onClick={() => updateSection('history', [...state.history, { id: crypto.randomUUID(), title: 'NOVO CAPÍTULO', description: 'Nossa jornada continua...', imageUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80', textPosition: 'below', font: { family: FONT_FAMILIES[0].value, size: 16, color: '#1E293B' } }])} className="bg-slate-950 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase flex items-center gap-3"><Plus size={16} /> Adicionar</button>
                   </div>
                   {state.history.map((chapter: HistoryChapter) => (
                     <Card key={chapter.id} className="rounded-[4rem] p-10 bg-white shadow-2xl grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-4">
                           <input value={chapter.title} onChange={e => updateSection('history', state.history.map((h:any) => h.id === chapter.id ? { ...h, title: e.target.value.toUpperCase() } : h))} className="w-full text-2xl font-black italic bg-slate-50 p-6 rounded-3xl outline-none" />
                           <textarea value={chapter.description} onChange={e => updateSection('history', state.history.map((h:any) => h.id === chapter.id ? { ...h, description: e.target.value } : h))} className="w-full h-32 p-6 bg-slate-50 rounded-3xl italic outline-none" />
                        </div>
                        <div className="aspect-square rounded-3xl bg-slate-50 overflow-hidden cursor-pointer" onClick={() => triggerUpload('history', 'imageUrl', chapter.id)}>
                           <img src={chapter.imageUrl} className="w-full h-full object-cover" />
                        </div>
                     </Card>
                   ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SiteMaster;
