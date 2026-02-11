import React, { useState, useRef, useEffect, useMemo } from 'react';
// Added useNavigate import to fix the navigation error
import { useNavigate } from 'react-router-dom';
import { 
  Utensils, Plus, Trash2, Save, Image as ImageIcon, 
  CheckCircle2, AlertCircle, RefreshCw, Camera, 
  Info, AlignLeft, Type, Star, ChevronRight, 
  Settings2, Eye, Sparkles
} from 'lucide-react';
import { useAppStore } from '../store/appStore';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { DescriptionBlock, BuffetConfig } from '../../types';

const BuffetManager: React.FC = () => {
  // Initialized navigate hook
  const navigate = useNavigate();
  const { 
    state, 
    updateSection, 
    activeEventId, 
    activeEvent, 
    provisionings, 
    setActiveEventId,
    publishChanges 
  } = useAppStore();

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTarget, setUploadTarget] = useState<'hero' | 'detail' | null>(null);

  // Fallback seguro para evitar erros de renderização
  const buffet = state?.buffet || {
    title: 'MENU MASTER GOURMET',
    description: 'Uma curadoria gastronômica pensada para elevar os sentidos.',
    heroImageUrl: '',
    menuDetailImageUrl: '',
    descriptionBlocks: [],
    observations: ''
  };

  const handleSave = () => {
    if (!activeEventId) return;
    setSaveStatus('saving');
    publishChanges();
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 800);
  };

  const updateBuffet = (updates: Partial<BuffetConfig>) => {
    updateSection('buffet', { ...buffet, ...updates });
  };

  const addBlock = () => {
    const newBlock: DescriptionBlock = {
      id: Math.random().toString(36).substr(2, 9),
      text: 'NOVO ITEM DO MENU',
      fontSize: 14,
      isBold: true,
      showIcon: true,
      textTransform: 'uppercase',
      role: 'list'
    };
    updateBuffet({ descriptionBlocks: [...(buffet.descriptionBlocks || []), newBlock] });
  };

  const removeBlock = (id: string) => {
    updateBuffet({ 
      descriptionBlocks: (buffet.descriptionBlocks || []).filter(b => b.id !== id) 
    });
  };

  const updateBlock = (id: string, updates: Partial<DescriptionBlock>) => {
    updateBuffet({
      descriptionBlocks: (buffet.descriptionBlocks || []).map(b => b.id === id ? { ...b, ...updates } : b)
    });
  };

  const triggerUpload = (target: 'hero' | 'detail') => {
    setUploadTarget(target);
    fileInputRef.current?.click();
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && uploadTarget) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const url = reader.result as string;
        if (uploadTarget === 'hero') updateBuffet({ heroImageUrl: url });
        else updateBuffet({ menuDetailImageUrl: url });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 text-slate-900">
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={onFileChange} />

      {/* HEADER ELITE COM SELETOR */}
      <div className="bg-slate-950 px-8 py-4 rounded-[2rem] flex items-center justify-between shadow-2xl shrink-0">
        <div className="flex items-center gap-6">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                <Utensils size={20} />
              </div>
              <div>
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Experiência Gastronômica</p>
                <h4 className="text-white font-black italic text-xs uppercase tracking-tighter">Gestor de Buffet Master</h4>
              </div>
           </div>
           <div className="h-8 w-px bg-white/10" />
           <div className="flex items-center gap-4">
              <p className="text-[9px] font-black text-orange-500 uppercase tracking-widest italic">Provisionamento:</p>
              <select 
                className="bg-slate-900 text-white border border-white/10 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none transition-all cursor-pointer min-w-[220px]"
                value={activeEventId || ''}
                onChange={(e) => setActiveEventId(e.target.value)}
              >
                <option value="" disabled>SELECIONAR EVENTO...</option>
                {provisionings.map(p => (
                  <option key={p.id} value={p.id}>{p.coupleNames.toUpperCase()}</option>
                ))}
              </select>
           </div>
        </div>
        <div className="flex items-center gap-4">
           <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 transition-all ${saveStatus === 'saved' ? 'text-green-500 border-green-500/20' : 'text-slate-500 border-white/5'}`}>
              <CheckCircle2 size={14} className={saveStatus === 'saving' ? 'animate-spin' : ''} />
              <span className="text-[9px] font-black uppercase tracking-widest">{saveStatus === 'saving' ? 'Sincronizando...' : saveStatus === 'saved' ? 'Lançado com Sucesso' : 'Modo Seguro'}</span>
           </div>
           <Button onClick={handleSave} disabled={!activeEventId} className="rounded-2xl h-12 gap-3 uppercase font-black text-[10px] bg-orange-600 text-white shadow-xl hover:bg-orange-500 disabled:opacity-30">
             Lançar Menu Gourmet <Save size={16} />
           </Button>
        </div>
      </div>

      {!activeEventId ? (
        <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-6 opacity-30">
          <RefreshCw size={80} className="text-slate-300 animate-spin-slow" />
          <h3 className="text-2xl font-black italic uppercase tracking-tighter">Aguardando Seleção de Evento</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-8 duration-700">
          <div className="lg:col-span-2 space-y-8">
            {/* CONFIGURAÇÕES BÁSICAS */}
            <Card className="rounded-[3rem] p-10 space-y-8 border-none shadow-2xl bg-white">
               <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-orange-500 shadow-inner">
                    <Type size={24} />
                  </div>
                  <h3 className="text-lg font-black italic uppercase tracking-tighter">Identidade do Cardápio</h3>
               </div>
               <div className="space-y-6">
                 <Input label="TÍTULO DO BUFFET" value={buffet.title} onChange={(e) => updateBuffet({ title: e.target.value.toUpperCase() })} />
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">DESCRIÇÃO PRINCIPAL</label>
                    <textarea 
                      className="w-full p-6 bg-slate-50 rounded-2xl border-none outline-none font-bold italic text-sm text-slate-600 focus:ring-4 focus:ring-orange-500/10 transition-all h-28"
                      value={buffet.description}
                      onChange={(e) => updateBuffet({ description: e.target.value })}
                    />
                 </div>
               </div>
            </Card>

            {/* ITENS DO MENU / BLOCOS */}
            <Card className="rounded-[3rem] p-10 space-y-8 border-none shadow-2xl bg-white">
               <div className="flex items-center justify-between border-b border-slate-50 pb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-orange-500 shadow-inner">
                      <Sparkles size={24} />
                    </div>
                    <h3 className="text-lg font-black italic uppercase tracking-tighter">Blocos de Degustação</h3>
                  </div>
                  <Button onClick={addBlock} className="h-10 px-6 rounded-xl bg-slate-900 gap-2 text-[9px] font-black uppercase tracking-widest">
                    <Plus size={14} /> Adicionar Bloco
                  </Button>
               </div>
               
               <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                  {(buffet.descriptionBlocks || []).map((block) => (
                    <div key={block.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 group hover:border-orange-200 transition-all">
                       <div className="flex items-center gap-4 mb-4">
                          <input 
                            className="flex-1 bg-white px-5 py-3 rounded-xl font-black italic uppercase text-xs border-none outline-none shadow-sm focus:ring-2 focus:ring-orange-500/20"
                            value={block.text}
                            onChange={(e) => updateBlock(block.id, { text: e.target.value })}
                          />
                          <button onClick={() => removeBlock(block.id)} className="p-3 bg-white rounded-xl text-slate-300 hover:text-red-500 shadow-sm transition-colors">
                            <Trash2 size={16} />
                          </button>
                       </div>
                       <div className="flex items-center gap-6 px-2">
                          <div className="flex items-center gap-2">
                             <input 
                               type="checkbox" 
                               checked={block.isBold} 
                               onChange={(e) => updateBlock(block.id, { isBold: e.target.checked })}
                               className="w-4 h-4 accent-orange-500" 
                             />
                             <span className="text-[9px] font-black uppercase text-slate-400 italic">Negrito</span>
                          </div>
                          <div className="flex items-center gap-2">
                             <input 
                               type="checkbox" 
                               checked={block.showIcon} 
                               onChange={(e) => updateBlock(block.id, { showIcon: e.target.checked })}
                               className="w-4 h-4 accent-orange-500" 
                             />
                             <span className="text-[9px] font-black uppercase text-slate-400 italic">Ícone</span>
                          </div>
                          <div className="flex-1" />
                          <div className="flex items-center gap-2">
                             <span className="text-[9px] font-black uppercase text-slate-400 italic">Tamanho: {block.fontSize}px</span>
                             <input 
                               type="range" min="10" max="40" step="1"
                               value={block.fontSize}
                               onChange={(e) => updateBlock(block.id, { fontSize: parseInt(e.target.value) })}
                               className="accent-orange-500 h-1.5 bg-white rounded-full appearance-none cursor-pointer w-24"
                             />
                          </div>
                       </div>
                    </div>
                  ))}
                  {(buffet.descriptionBlocks || []).length === 0 && (
                    <div className="py-20 text-center opacity-20 italic">Nenhum bloco definido para o menu.</div>
                  )}
               </div>
            </Card>

            <Card className="rounded-[3rem] p-10 space-y-6 border-none shadow-2xl bg-white">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 shadow-inner">
                    <Info size={24} />
                  </div>
                  <h3 className="text-lg font-black italic uppercase tracking-tighter">Observações Master</h3>
               </div>
               <Input 
                 placeholder="Ex: Alérgicos, restrições alimentares ou notas especiais..."
                 value={buffet.observations}
                 onChange={(e) => updateBuffet({ observations: e.target.value })}
                 className="rounded-2xl h-16 bg-slate-50 border-none px-6 font-bold"
               />
            </Card>
          </div>

          <div className="space-y-8">
            {/* GESTÃO DE MÍDIA */}
            <Card className="rounded-[3rem] p-8 space-y-8 border-none shadow-2xl bg-white">
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic border-b pb-4">Galeria Gastronômica</p>
               
               <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase italic">Hero Principal (Banner)</label>
                  <div className="aspect-video relative rounded-3xl overflow-hidden border-4 border-slate-50 shadow-xl group cursor-pointer" onClick={() => triggerUpload('hero')}>
                     {buffet.heroImageUrl ? (
                        <img src={buffet.heroImageUrl} className="w-full h-full object-cover" />
                     ) : (
                        <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center gap-2">
                           <ImageIcon size={32} className="text-slate-300" />
                           <span className="text-[8px] font-black uppercase text-slate-400">Clique para carregar</span>
                        </div>
                     )}
                     <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                        <Camera size={32} className="text-white" />
                     </div>
                  </div>
               </div>

               <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase italic">Detalhe do Menu (Foco)</label>
                  <div className="aspect-video relative rounded-3xl overflow-hidden border-4 border-slate-50 shadow-xl group cursor-pointer" onClick={() => triggerUpload('detail')}>
                     {buffet.menuDetailImageUrl ? (
                        <img src={buffet.menuDetailImageUrl} className="w-full h-full object-cover" />
                     ) : (
                        <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center gap-2">
                           <ImageIcon size={32} className="text-slate-300" />
                           <span className="text-[8px] font-black uppercase text-slate-400">Clique para carregar</span>
                        </div>
                     )}
                     <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                        <Camera size={32} className="text-white" />
                     </div>
                  </div>
               </div>
            </Card>

            <Card className="rounded-[3rem] bg-slate-900 p-10 text-white relative overflow-hidden shadow-2xl">
               <Utensils className="absolute -right-8 -bottom-8 text-white/5" size={180} />
               <div className="relative z-10 space-y-6">
                 <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-orange-500 shadow-xl">
                   <Settings2 size={32} />
                 </div>
                 <h4 className="text-2xl font-black italic tracking-tighter">Guia de Experiência</h4>
                 <p className="text-slate-400 text-sm leading-relaxed font-medium italic">
                   Organize o buffet por "momentos": Coquetel, Entradas, Prato Principal e Sobremesas. Use ícones para destacar opções vegetarianas ou exclusivas.
                 </p>
                 <button 
                  onClick={() => navigate('/site/preview')}
                  className="w-full py-4 bg-white/10 hover:bg-white text-white hover:text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                 >
                   <Eye size={14} /> Visualizar no Site
                 </button>
               </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuffetManager;