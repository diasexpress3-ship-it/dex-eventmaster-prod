
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Gift, Plus, Trash2, Edit3, DollarSign, Package, Link as LinkIcon, Camera, Upload, CheckCircle2, AlertCircle, ShoppingBag, Wand2, Loader2, Star, X, Users, RefreshCw } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { GiftItem } from '../../types';
import { useAppStore } from '../store/appStore';

const CATEGORIES = ['Cozinha', 'Quarto', 'Sala', 'Banheiro', 'Eletros', 'Fixo (Cotas)', 'Outros'];

const Gifts: React.FC = () => {
  const { activeEventId, activeEvent, provisionings, setActiveEventId } = useAppStore();
  const [gifts, setGifts] = useState<GiftItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGift, setEditingGift] = useState<GiftItem | null>(null);
  const [tempImage, setTempImage] = useState<string>('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const storageKey = useMemo(() => `dex_gifts_${activeEventId || 'global'}`, [activeEventId]);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) setGifts(JSON.parse(saved));
    else setGifts([]);
  }, [storageKey]);

  const handleManualSave = () => {
    if (!activeEventId) return;
    setSaveStatus('saving');
    localStorage.setItem(storageKey, JSON.stringify(gifts));
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 800);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setTempImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEventId) return;
    const formData = new FormData(e.target as HTMLFormElement);
    /* Fix: Added 'purchased' and 'link' to the GiftItem object literal */
    const giftData: GiftItem = {
      id: editingGift?.id || Math.random().toString(36).substr(2, 9),
      name: formData.get('name') as string,
      price: Number(formData.get('price')),
      category: formData.get('category') as string,
      imageUrl: tempImage || editingGift?.imageUrl || 'https://images.unsplash.com/photo-1549465220-1d8c9d9c47db?auto=format&fit=crop&q=80&w=200',
      link: formData.get('link') as string,
      purchased: editingGift?.purchased || false,
      isAvailable: formData.get('isAvailable') === 'on',
      maxSelections: Number(formData.get('maxSelections')) || 3,
      currentSelections: editingGift?.currentSelections || 0,
    };

    const updated = editingGift ? gifts.map(g => g.id === editingGift.id ? giftData : g) : [...gifts, giftData];
    setGifts(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    setIsModalOpen(false);
    setEditingGift(null);
    setTempImage('');
  };

  const deleteGift = (id: string) => {
    if (confirm('Excluir este presente?')) {
      const updated = gifts.filter(g => g.id !== id);
      setGifts(updated);
      localStorage.setItem(storageKey, JSON.stringify(updated));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 text-slate-900">
      {/* SELETOR MASTER DE PROVISIONAMENTO */}
      <div className="bg-slate-950 px-8 py-4 rounded-[2rem] flex items-center justify-between shadow-2xl">
         <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white"><Gift size={20} /></div>
               <div>
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Mimos Master</p>
                  <h4 className="text-white font-black italic text-xs uppercase tracking-tighter">Lista por Provisionamento</h4>
               </div>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <select 
              className="bg-slate-900 text-white border border-white/10 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-orange-500 outline-none cursor-pointer min-w-[200px]"
              value={activeEventId || ''}
              onChange={(e) => setActiveEventId(e.target.value)}
            >
              <option value="" disabled>SELECIONAR EVENTO...</option>
              {provisionings.map(p => <option key={p.id} value={p.id}>{p.coupleNames.toUpperCase()}</option>)}
            </select>
         </div>
         <div className="flex items-center gap-4">
            <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 transition-all ${saveStatus === 'saved' ? 'text-green-500 border-green-500/20' : 'text-slate-500 border-white/5'}`}>
               <CheckCircle2 size={14} className={saveStatus === 'saving' ? 'animate-spin' : ''} />
               <span className="text-[9px] font-black uppercase tracking-widest">{saveStatus === 'saving' ? 'Gravando...' : saveStatus === 'saved' ? 'Sincronizado' : 'Modo Seguro'}</span>
            </div>
            <Button onClick={() => { setEditingGift(null); setTempImage(''); setIsModalOpen(true); }} disabled={!activeEventId} className="rounded-xl gap-3 px-8 h-12 bg-white text-slate-900 hover:bg-orange-500 hover:text-white transition-all shadow-xl font-black uppercase tracking-widest text-[9px] border-none">
              <Plus size={16} /> Novo Item
            </Button>
         </div>
      </div>

      {!activeEventId ? (
         <div className="h-[60vh] flex flex-col items-center justify-center opacity-20 gap-6">
            <RefreshCw size={64} className="animate-spin-slow" />
            <p className="font-black uppercase tracking-widest text-sm">Selecione o Evento Raiz</p>
         </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-in slide-in-from-right-10 duration-700">
          {gifts.map((gift) => (
            <Card key={gift.id} className="group relative overflow-hidden border-0 shadow-2xl rounded-[2.5rem] bg-white hover:-translate-y-2 transition-all duration-500">
              <div className="aspect-square bg-slate-100 relative overflow-hidden">
                <img src={gift.imageUrl} alt={gift.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={() => { setEditingGift(gift); setTempImage(gift.imageUrl); setIsModalOpen(true); }} className="p-3 bg-white rounded-xl text-slate-600 hover:text-orange-500 shadow-xl transition-colors"><Edit3 size={16} /></button>
                  <button onClick={() => deleteGift(gift.id)} className="p-3 bg-white rounded-xl text-slate-600 hover:text-red-500 shadow-xl transition-colors"><Trash2 size={16} /></button>
                </div>
              </div>
              <div className="p-8 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-widest text-orange-500 italic">{gift.category}</span>
                  <span className="text-xl font-black italic text-slate-900 tracking-tighter">R$ {gift.price || 'Sugerido'}</span>
                </div>
                <h4 className="font-black text-slate-800 line-clamp-1 italic uppercase text-sm tracking-tight">{gift.name}</h4>
              </div>
            </Card>
          ))}
          {gifts.length === 0 && (
             <div className="col-span-full py-32 text-center opacity-10">
                <Gift size={100} className="mx-auto" />
                <p className="text-xl font-black uppercase tracking-widest mt-4">Lista Vazia para este Evento</p>
             </div>
          )}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md p-4 flex items-center justify-center">
          <Card className="w-full max-w-2xl shadow-2xl rounded-[4rem] border-0 p-12 bg-white max-h-[90vh] overflow-y-auto">
             <h3 className="text-2xl font-black italic uppercase mb-8">Item da Lista Raiz</h3>
             <form onSubmit={handleSave} className="space-y-6">
                <Input name="name" defaultValue={editingGift?.name} required placeholder="DESCRIÇÃO DO MIMO" className="rounded-2xl h-14 uppercase font-black" />
                <div className="grid grid-cols-2 gap-4">
                   <Input name="price" type="number" defaultValue={editingGift?.price} placeholder="Preço Sugerido R$" className="rounded-2xl h-14" />
                   <select name="category" className="w-full h-14 px-6 bg-slate-50 border-none rounded-2xl text-xs font-black uppercase" defaultValue={editingGift?.category || 'Cozinha'}>
                      {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                   </select>
                </div>
                <div className="flex justify-end gap-3 pt-8">
                   <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 text-[10px] font-black uppercase text-slate-400">Abortar</button>
                   <Button type="submit" className="h-14 px-10 rounded-2xl uppercase italic">Lançar Item</Button>
                </div>
             </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Gifts;
