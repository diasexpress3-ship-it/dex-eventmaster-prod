import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { 
  Type, Square, Trash2, Palette, Maximize, Move, 
  Minus, MapPin, Check, Gift, FileImage, 
  RotateCcw, Send, MessageCircle, X, Search, CheckCircle2, 
  Loader2, FileDown, Settings2, MousePointer, 
  Plus, Layout, Camera, Circle as CircleIcon, CaseUpper, CaseLower,
  Layers, Download, ImagePlus, Save, LayoutTemplate, Briefcase, 
  ImageIcon, Bold, Italic, Type as TypeIcon, Heart, GripHorizontal,
  User, Users, Smartphone, Upload, Paperclip, Copy, UserCheck, QrCode, Lock, ChevronRight,
  Maximize2, Minimize2, Image as ImageIconLucide, ClipboardCheck, ClipboardPaste, Sparkles,
  ExternalLink, CloudCheck, Cloud, AlignLeft, AlignCenter, AlignRight, ZoomIn, ZoomOut, FileText
} from 'lucide-react';
import * as htmlToImage from 'html-to-image';
import { jsPDF } from 'jspdf';
import { FONT_FAMILIES, Guest } from '../../types';
import { useAppStore } from '../store/appStore';

interface CanvasSize {
  name: string;
  width: number;
  height: number;
}

const CANVAS_SIZES_PRESETS: CanvasSize[] = [
  { name: '1080 x 1080 (QUADRADO)', width: 1080, height: 1080 },
  { name: '1080 x 1920 (STORIES 9:16)', width: 1080, height: 1920 },
  { name: '1500 x 2000 (VERTICAL HD)', width: 1500, height: 2000 },
  { name: '2000 x 1500 (HORIZONTAL HD)', width: 2000, height: 1500 },
];

type ElementType = 'text' | 'image' | 'shape' | 'chip' | 'qr_code';

interface Element {
  id: string;
  type: ElementType;
  subtype?: 'rect' | 'circle' | 'heart' | 'chip-confirmed' | 'chip-gift' | 'chip-local';
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
  rotation: number;
  content: string; 
  imageContent?: string; 
  color?: string;
  fontSize?: number;
  fontWeight?: string;
  fontStyle?: string;
  fontFamily?: string;
  textAlign?: 'left' | 'center' | 'right';
  textTransform?: 'none' | 'uppercase' | 'lowercase';
  borderRadius?: number;
  opacity?: number;
  zIndex: number;
}

const Designer: React.FC = () => {
  const { activeEvent, activeEventId } = useAppStore();
  const [elements, setElements] = useState<Element[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [canvasSize, setCanvasSize] = useState<CanvasSize>(CANVAS_SIZES_PRESETS[1]);
  const [background, setBackground] = useState({ image: '', opacity: 1, scale: 1 });
  const [projectName, setProjectName] = useState('PROJETO MASTER SEM NOME');
  const [zoom, setZoom] = useState(0.20);
  
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState('');
  const [pasteFeedback, setPasteFeedback] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const [isWAModalOpen, setIsWAModalOpen] = useState(false);
  const [waSelectedGuestId, setWaSelectedGuestId] = useState<string>('');
  const [waMessage, setWaMessage] = useState('Olá! Preparamos um convite especial para você. Escaneie o QR Code para confirmar sua presença.');
  const [waUploadedInvite, setWaUploadedInvite] = useState<string | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const shapeImageInputRef = useRef<HTMLInputElement>(null);
  const waInviteInputRef = useRef<HTMLInputElement>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<string>('');

  const saveToLocalStorage = useCallback((data: any) => {
    if (!activeEventId) return;
    const serializedData = JSON.stringify(data);
    localStorage.setItem(`dex_designer_v12_${activeEventId}`, serializedData);
    lastSavedRef.current = serializedData;
    return true;
  }, [activeEventId]);

  const loadFromLocalStorage = useCallback(() => {
    if (!activeEventId) return null;
    const saved = localStorage.getItem(`dex_designer_v12_${activeEventId}`);
    if (saved) {
      lastSavedRef.current = saved;
      return JSON.parse(saved);
    }
    return null;
  }, [activeEventId]);

  useEffect(() => {
    if (!activeEventId) return;
    const savedData = loadFromLocalStorage();
    if (savedData) {
      setElements(savedData.elements || []);
      setBackground(savedData.background || { image: '', opacity: 1, scale: 1 });
      setProjectName(savedData.projectName || 'PROJETO MASTER');
      if (savedData.canvasSize) {
        const foundSize = CANVAS_SIZES_PRESETS.find(s => s.width === savedData.canvasSize.width && s.height === savedData.canvasSize.height);
        if (foundSize) setCanvasSize(foundSize);
      }
    } else {
      setElements([]);
      setBackground({ image: '', opacity: 1, scale: 1 });
      setProjectName(`CONVITE - ${activeEvent?.coupleNames || 'MASTER'}`);
    }
  }, [activeEventId, activeEvent?.coupleNames, loadFromLocalStorage]);

  useEffect(() => {
    if (!activeEventId) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      const currentData = { elements, background, projectName, canvasSize, updatedAt: new Date().toISOString() };
      const serializedData = JSON.stringify(currentData);
      if (serializedData !== lastSavedRef.current) {
        setIsAutoSaving(true);
        saveToLocalStorage(currentData);
        setIsAutoSaving(false);
      }
    }, 1500);
    return () => { if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current); };
  }, [elements, background, projectName, canvasSize, activeEventId, saveToLocalStorage]);

  const guests: Guest[] = useMemo(() => {
    if (!activeEventId) return [];
    const raw = localStorage.getItem(`dex_guests_${activeEventId}`);
    return raw ? JSON.parse(raw) : [];
  }, [activeEventId]);

  const selectedElement = useMemo(() => elements.find(el => el.id === selectedId), [elements, selectedId]);

  const addElement = useCallback((type: ElementType, options: Partial<Element> = {}) => {
    const newId = `el_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    let dWidth = options.width || 600;
    let dHeight = options.height || 150;
    let dContent = options.content || '';

    if (type === 'text' && !dContent) dContent = 'EDITAR TEXTO MASTER';
    if (type === 'chip') {
      dWidth = 320; dHeight = 320;
      if (!dContent) {
        dContent = options.subtype === 'chip-confirmed' ? 'CONFIRMAR PRESENÇA' : 
                   options.subtype === 'chip-gift' ? 'LISTA DE MIMOS' : 'LOCAL DO EVENTO';
      }
    }
    if (type === 'shape') {
      dWidth = options.width || 500; dHeight = options.height || 500;
      if (options.subtype === 'heart') { dContent = '❤'; options.fontSize = 250; options.color = '#EF4444'; }
      if (options.subtype === 'circle') { options.borderRadius = 1000; }
    }

    const newElement: Element = {
      id: newId, type,
      x: options.x !== undefined ? options.x : (canvasSize.width / 2) - (dWidth / 2),
      y: options.y !== undefined ? options.y : (canvasSize.height / 2) - (dHeight / 2),
      width: dWidth, height: dHeight, scale: options.scale || 1, rotation: options.rotation || 0,
      content: dContent, color: options.color || (type === 'shape' ? '#F97316' : '#1E293B'),
      fontSize: options.fontSize || (type === 'chip' ? 32 : 80), fontWeight: options.fontWeight || '900',
      fontStyle: 'normal', fontFamily: options.fontFamily || FONT_FAMILIES[0].value,
      zIndex: elements.length + 10, opacity: options.opacity || 1, textAlign: options.textAlign || 'center',
      textTransform: options.textTransform || 'none', borderRadius: options.borderRadius || 0, ...options
    };

    setElements(prev => [...prev, newElement]);
    setSelectedId(newId);
  }, [canvasSize, elements.length]);

  const updateSelectedElement = (updates: Partial<Element>) => {
    if (!selectedId) return;
    setElements(prev => prev.map(el => el.id === selectedId ? { ...el, ...updates } : el));
  };

  const pasteMasterBundle = useCallback(() => {
    try {
      const raw = localStorage.getItem('dex_designer_clipboard_v2');
      if (!raw) { 
        setPasteFeedback('❌ Clipboard Vazio.'); 
        setTimeout(() => setPasteFeedback(''), 3000); 
        return; 
      }
      const bundle = JSON.parse(raw);
      if (bundle.type !== 'dex_guest_bundle_v2') return;

      addElement('qr_code', { content: bundle.qrImage, width: 450, height: 450, y: (canvasSize.height / 2) - 400, x: (canvasSize.width / 2) - 225 });
      addElement('text', { content: bundle.name.toUpperCase(), fontSize: 54, fontWeight: '900', y: (canvasSize.height / 2) + 120, x: (canvasSize.width / 2) - 350, width: 700, fontFamily: "'Montserrat', sans-serif" });
      addElement('text', { content: `CONVITE VÁLIDO PARA ${bundle.pax} PESSOA(S)`, fontSize: 24, fontWeight: '700', color: '#F97316', y: (canvasSize.height / 2) + 210, x: (canvasSize.width / 2) - 300, width: 600, textTransform: 'uppercase' });

      setPasteFeedback(`✅ Convidado Sincronizado!`);
      setTimeout(() => setPasteFeedback(''), 3000);
    } catch (e) {
      setPasteFeedback('❌ Erro no Bundle.');
    }
  }, [addElement, canvasSize]);

  const handlePointerDown = (e: React.PointerEvent, id: string | 'background') => {
    if (id === 'background') {
      setIsPanning(true);
      setLastMousePos({ x: e.clientX, y: e.clientY });
      setSelectedId(null);
      return;
    }
    e.stopPropagation(); 
    setSelectedId(id); 
    setIsDragging(true);
    const el = elements.find(x => x.id === id);
    if (el) setDragOffset({ x: e.clientX / zoom - el.x, y: e.clientY / zoom - el.y });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isPanning) {
      const dx = e.clientX - lastMousePos.x;
      const dy = e.clientY - lastMousePos.y;
      setPanOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      setLastMousePos({ x: e.clientX, y: e.clientY });
      return;
    }
    if (isDragging && selectedId) {
      updateSelectedElement({ x: e.clientX / zoom - dragOffset.x, y: e.clientY / zoom - dragOffset.y });
    }
  };

  const handlePointerUp = () => { setIsDragging(false); setIsPanning(false); };

  const handleSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = CANVAS_SIZES_PRESETS.find(s => s.name === e.target.value);
    if (selected) {
      setCanvasSize(selected);
      if (selected.height >= 1900) setZoom(0.18);
      else setZoom(0.25);
    }
  };

  const exportJPEG = async () => {
    if (!canvasRef.current || isExporting) return;
    setIsExporting(true);
    setSaveFeedback('⏳ Exportando JPG...');
    
    try {
      // Versão corrigida - usando try-catch para fontes externas
      const dataUrl = await htmlToImage.toJpeg(canvasRef.current, { 
        quality: 0.95,
        pixelRatio: 2,
        skipFonts: false,
        // Opção para ignorar erros de CSSRules
        filter: (node) => {
          // Ignora nós de estilo que podem causar erro
          return node.nodeName !== 'STYLE' || !node.textContent?.includes('@font-face');
        }
      });
      
      const link = document.createElement('a');
      link.download = `${projectName.replace(/\s+/g, '_')}.jpg`;
      link.href = dataUrl;
      link.click();
      setSaveFeedback('✅ JPG Exportado!');
    } catch (err) {
      console.error('Export error:', err);
      // Fallback: tenta sem fontes
      try {
        const dataUrl = await htmlToImage.toJpeg(canvasRef.current, { 
          quality: 0.9,
          pixelRatio: 2,
          skipFonts: true
        });
        const link = document.createElement('a');
        link.download = `${projectName.replace(/\s+/g, '_')}.jpg`;
        link.href = dataUrl;
        link.click();
        setSaveFeedback('✅ JPG Exportado!');
      } catch (fallbackErr) {
        setSaveFeedback('❌ Erro na exportação');
      }
    } finally {
      setIsExporting(false);
      setTimeout(() => setSaveFeedback(''), 3000);
    }
  };

  const exportPDF = async () => {
    if (!canvasRef.current || isExporting) return;
    setIsExporting(true);
    setSaveFeedback('⏳ Exportando PDF...');

    try {
      const dataUrl = await htmlToImage.toPng(canvasRef.current, {
        pixelRatio: 2,
        skipFonts: false,
        filter: (node) => {
          return node.nodeName !== 'STYLE' || !node.textContent?.includes('@font-face');
        }
      });
      
      const pdf = new jsPDF({
        orientation: canvasSize.height > canvasSize.width ? 'portrait' : 'landscape',
        unit: 'px',
        format: [canvasSize.width, canvasSize.height]
      });
      
      pdf.addImage(dataUrl, 'PNG', 0, 0, canvasSize.width, canvasSize.height);
      pdf.save(`${projectName.replace(/\s+/g, '_')}.pdf`);
      setSaveFeedback('✅ PDF Exportado!');
    } catch (err) {
      console.error('Export error:', err);
      setSaveFeedback('❌ Erro no PDF.');
    } finally {
      setIsExporting(false);
      setTimeout(() => setSaveFeedback(''), 3000);
    }
  };

  const handleWASend = () => {
    const guest = guests.find(g => g.id === waSelectedGuestId);
    if (!guest || !guest.phone) return alert('Verifique o convidado e o número');
    const encodedText = encodeURIComponent(`${waMessage}\n\nLink do Convite: ${guest.qrCodeUrl}`);
    window.open(`https://web.whatsapp.com/send?phone=${guest.phone.replace(/\D/g, '')}&text=${encodedText}`, '_blank');
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col gap-6 animate-in fade-in duration-300 overflow-hidden text-slate-900 relative bg-white p-2" onPointerMove={handlePointerMove} onPointerUp={handlePointerUp}>
      
      {pasteFeedback && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[2000] bg-slate-900 text-white px-10 py-5 rounded-[2.5rem] shadow-4xl animate-in slide-in-from-top-4 flex items-center gap-4 border-2 border-orange-500">
          <Sparkles className="text-orange-500" />
          <span className="font-black uppercase italic text-sm tracking-widest">{pasteFeedback}</span>
        </div>
      )}

      {/* HEADER MASTER */}
      <div className="flex items-center justify-between bg-white px-8 py-4 rounded-[2.5rem] shadow-sm border border-slate-100 shrink-0">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-600 text-white rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3 transition-transform hover:rotate-0"><Palette size={24} /></div>
            <div>
              <h1 className="text-lg font-black italic uppercase tracking-tighter leading-none">Dex Designer</h1>
              <div className="flex items-center gap-2 mt-1">
                 <div className={`w-2 h-2 rounded-full ${isAutoSaving ? 'bg-orange-500 animate-pulse' : 'bg-green-500'}`} />
                 <span className="text-[7px] font-black uppercase text-slate-400 tracking-[0.2em]">{isAutoSaving ? 'Sincronizando' : 'Protegido'}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input className="bg-slate-50 border border-slate-100 px-6 py-3 rounded-2xl text-[10px] font-black uppercase outline-none w-64 focus:ring-4 focus:ring-orange-500/10 transition-all italic" value={projectName} onChange={(e) => setProjectName(e.target.value.toUpperCase())} />
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 px-6 py-2.5 rounded-2xl">
               <Layout size={18} className="text-orange-500" />
               <div className="flex flex-col">
                  <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Medida Master</span>
                  <select 
                    className="bg-transparent text-[10px] font-black uppercase italic outline-none cursor-pointer text-slate-900 appearance-none pr-4" 
                    value={canvasSize.name} 
                    onChange={handleSizeChange}
                  >
                    {CANVAS_SIZES_PRESETS.map(size => (
                      <option key={size.name} value={size.name}>{size.name}</option>
                    ))}
                  </select>
               </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setPanOffset({ x: 0, y: 0 })} className="p-4 bg-slate-50 rounded-2xl text-slate-400 hover:text-slate-900" title="Centralizar Área"><Move size={18} /></button>
          <button onClick={() => setIsWAModalOpen(true)} className="flex items-center gap-3 bg-green-600 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase shadow-xl hover:bg-green-700 transition-all hover:-translate-y-0.5">
             <MessageCircle size={18} /> WhatsApp Master
          </button>
          <div className="h-8 w-px bg-slate-100 mx-2" />
          <button 
            onClick={() => {
              const currentData = { elements, background, projectName, canvasSize, updatedAt: new Date().toISOString() };
              saveToLocalStorage(currentData);
              setSaveFeedback('✅ Salvo!');
              setTimeout(() => setSaveFeedback(''), 2000);
            }} 
            disabled={isExporting}
            className="bg-slate-950 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] shadow-xl hover:bg-orange-600 transition-all disabled:opacity-50"
          >
            {saveFeedback || 'Salvar Agora'}
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* SIDEBAR FERRAMENTAS */}
        <div className="w-80 bg-white rounded-[3rem] border border-slate-100 shadow-sm p-8 space-y-8 overflow-y-auto custom-scrollbar shrink-0 flex flex-col">
          <div className="flex-1 space-y-8">
            <div className="space-y-6">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] italic border-b pb-2">ADICIONAR ELEMENTOS</p>
              <div className="grid grid-cols-2 gap-4">
                 <button onClick={() => addElement('text')} className="aspect-square bg-slate-50 rounded-3xl flex flex-col items-center justify-center gap-2 hover:bg-orange-50 hover:text-orange-500 transition-all group border border-transparent hover:border-orange-200">
                    <Type size={28} className="text-slate-400 group-hover:text-orange-500" />
                    <span className="text-[8px] font-black uppercase tracking-widest">Texto</span>
                 </button>
                 <button onClick={() => addElement('image')} className="aspect-square bg-slate-50 rounded-3xl flex flex-col items-center justify-center gap-2 hover:bg-orange-50 hover:text-orange-500 transition-all group border border-transparent hover:border-orange-200">
                    <ImagePlus size={28} className="text-slate-400 group-hover:text-orange-500" />
                    <span className="text-[8px] font-black uppercase tracking-widest">Mídia</span>
                 </button>
                 <button onClick={() => addElement('shape', { subtype: 'rect' })} className="aspect-square bg-slate-50 rounded-3xl flex flex-col items-center justify-center gap-2 hover:bg-orange-50 hover:text-orange-500 transition-all group border border-transparent hover:border-orange-200">
                    <Square size={28} className="text-slate-400 group-hover:text-orange-500" />
                    <span className="text-[8px] font-black uppercase tracking-widest">Retângulo</span>
                 </button>
                 <button onClick={() => addElement('shape', { subtype: 'circle' })} className="aspect-square bg-slate-50 rounded-3xl flex flex-col items-center justify-center gap-2 hover:bg-orange-50 hover:text-orange-500 transition-all group border border-transparent hover:border-orange-200">
                    <CircleIcon size={28} className="text-slate-400 group-hover:text-orange-500" />
                    <span className="text-[8px] font-black uppercase tracking-widest">Círculo</span>
                 </button>
                 <button onClick={() => addElement('shape', { subtype: 'heart' })} className="aspect-square bg-slate-50 rounded-3xl flex flex-col items-center justify-center gap-2 hover:bg-orange-50 hover:text-orange-500 transition-all group border border-transparent hover:border-orange-200">
                    <Heart size={28} className="text-slate-400 group-hover:text-orange-500" />
                    <span className="text-[8px] font-black uppercase tracking-widest">Coração</span>
                 </button>
                 <button onClick={() => bgInputRef.current?.click()} className="aspect-square bg-slate-50 rounded-3xl flex flex-col items-center justify-center gap-2 hover:bg-orange-50 hover:text-orange-500 transition-all group border border-transparent hover:border-orange-200">
                    <ImageIcon size={28} className="text-slate-400 group-hover:text-orange-500" />
                    <span className="text-[8px] font-black uppercase tracking-widest">Fundo</span>
                 </button>
              </div>
            </div>

            <div className="space-y-6">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] italic border-b pb-2">CHIPS RSVP NATIVOS</p>
              <div className="grid grid-cols-1 gap-4">
                 <button onClick={() => addElement('chip', { subtype: 'chip-confirmed' })} className="w-full h-20 bg-green-50 rounded-2xl flex items-center px-6 gap-4 hover:bg-green-100 transition-all text-green-700 border border-green-100 group shadow-sm">
                    <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center group-hover:scale-110 transition-transform"><Check size={20} strokeWidth={4} /></div>
                    <span className="text-[9px] font-black uppercase italic">Confirmar</span>
                 </button>
                 <button onClick={() => addElement('chip', { subtype: 'chip-gift' })} className="w-full h-20 bg-orange-50 rounded-2xl flex items-center px-6 gap-4 hover:bg-orange-100 transition-all text-orange-700 border border-orange-100 group shadow-sm">
                    <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center group-hover:scale-110 transition-transform"><Gift size={20} /></div>
                    <span className="text-[9px] font-black uppercase italic">Presente</span>
                 </button>
                 <button onClick={() => addElement('chip', { subtype: 'chip-local' })} className="w-full h-20 bg-blue-50 rounded-2xl flex items-center px-6 gap-4 hover:bg-blue-100 transition-all text-blue-700 border border-blue-100 group shadow-sm">
                    <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center group-hover:scale-110 transition-transform"><MapPin size={20} /></div>
                    <span className="text-[9px] font-black uppercase italic">Localização</span>
                 </button>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t mt-auto">
            <button onClick={pasteMasterBundle} className="w-full py-6 bg-gradient-to-br from-slate-800 to-slate-950 text-white rounded-3xl flex items-center justify-center gap-4 shadow-2xl hover:scale-105 transition-all group active:scale-95">
                <ClipboardPaste size={24} className="text-orange-500 group-hover:animate-bounce" />
                <span className="text-[10px] font-black uppercase italic tracking-widest">Colar Convidado</span>
            </button>
          </div>
        </div>

        {/* CANVAS MASTER - FUNDO BRANCO PARA GRAVAÇÃO */}
        <div 
          className={`flex-1 bg-white rounded-[4rem] border-2 border-slate-100 relative overflow-hidden flex items-center justify-center shadow-inner ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
          onPointerDown={(e) => handlePointerDown(e, 'background')}
        >
           <div className="relative shadow-4xl group z-10 transition-transform duration-75" style={{ transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`, width: canvasSize.width, height: canvasSize.height }}>
              <div ref={canvasRef} className="bg-white w-full h-full relative overflow-hidden ring-[24px] ring-slate-900 rounded-[4rem] shadow-2xl">
                 {background.image && <img src={background.image} className="absolute inset-0 w-full h-full object-cover" style={{ opacity: background.opacity, transform: `scale(${background.scale})` }} alt="BG" />}
                 {elements.sort((a,b) => a.zIndex - b.zIndex).map(el => (
                   <div key={el.id} className={`absolute flex items-center justify-center select-none ${selectedId === el.id ? 'ring-[12px] ring-orange-500 z-[500]' : 'cursor-pointer hover:ring-4 hover:ring-orange-200'}`}
                        style={{ left: el.x, top: el.y, width: el.width, height: el.height, transform: `rotate(${el.rotation}deg) scale(${el.scale})`, zIndex: el.zIndex, borderRadius: el.subtype === 'circle' ? '50%' : `${el.borderRadius}px`, overflow: 'hidden' }}
                        onPointerDown={(e) => handlePointerDown(e, el.id)}>
                        {el.type === 'text' && <div className="w-full h-full flex items-center leading-tight p-2" style={{ color: el.color, fontSize: el.fontSize, fontFamily: el.fontFamily, fontWeight: el.fontWeight, textTransform: el.textTransform, textAlign: el.textAlign }}>{el.content}</div>}
                        {el.type === 'image' && (el.content ? <img src={el.content} className="w-full h-full object-cover pointer-events-none" /> : <Camera size={60} className="text-slate-200" />)}
                        {el.type === 'qr_code' && <img src={el.content} className="w-full h-full object-contain p-8 pointer-events-none" />}
                        {el.type === 'chip' && (
                          <div className="flex flex-col items-center gap-4 w-full h-full justify-center">
                            <div className={`w-32 h-32 rounded-full flex items-center justify-center text-white shadow-3xl shrink-0 ${el.subtype === 'chip-confirmed' ? 'bg-green-500' : el.subtype === 'chip-gift' ? 'bg-orange-500' : 'bg-blue-500'}`}>
                                {el.subtype === 'chip-confirmed' && <Check size={64} strokeWidth={5} />}
                                {el.subtype === 'chip-gift' && <Gift size={64} />}
                                {el.subtype === 'chip-local' && <MapPin size={64} />}
                            </div>
                            <span className="font-black uppercase italic tracking-[0.2em] text-slate-900 text-center px-4" style={{ fontSize: el.fontSize, fontFamily: el.fontFamily }}>{el.content}</span>
                          </div>
                        )}
                        {el.type === 'shape' && (
                          <div className="w-full h-full flex items-center justify-center relative" style={{ backgroundColor: el.subtype === 'heart' ? 'transparent' : (el.imageContent ? 'transparent' : el.color) }}>
                            {el.subtype === 'heart' ? <span style={{ fontSize: el.fontSize, color: el.color }}>❤</span> : el.imageContent && <img src={el.imageContent} className="w-full h-full object-cover" />}
                          </div>
                        )}
                   </div>
                 ))}
              </div>
           </div>

           <div className="absolute bottom-10 bg-slate-950/90 text-white px-8 py-4 rounded-full flex items-center gap-6 shadow-4xl backdrop-blur-2xl border border-white/10 z-[1000]">
              <div className="flex items-center gap-4 border-r border-white/10 pr-6">
                <button onClick={() => setZoom(z => Math.max(0.05, z - 0.05))} className="hover:text-orange-500 transition-colors"><ZoomOut size={18} /></button>
                <span className="font-mono font-black text-[10px] uppercase tracking-widest w-12 text-center">{Math.round(zoom * 100)}%</span>
                <button onClick={() => setZoom(z => Math.min(2.0, z + 0.05))} className="hover:text-orange-500 transition-colors"><ZoomIn size={18} /></button>
              </div>
              <div className="flex items-center gap-3">
                 <button 
                  onClick={exportJPEG} 
                  disabled={isExporting}
                  className="w-8 h-8 bg-white/10 hover:bg-orange-500 rounded-lg flex items-center justify-center transition-all disabled:opacity-50" 
                  title="Exportar JPG HD"
                 >
                    <ImageIconLucide size={14} />
                 </button>
                 <button 
                  onClick={exportPDF} 
                  disabled={isExporting}
                  className="w-8 h-8 bg-white/10 hover:bg-orange-500 rounded-lg flex items-center justify-center transition-all disabled:opacity-50" 
                  title="Exportar PDF HD"
                 >
                    <FileText size={14} />
                 </button>
              </div>
           </div>
        </div>

        <div className="w-96 bg-white rounded-[3rem] border border-slate-100 p-8 space-y-8 overflow-y-auto custom-scrollbar shadow-2xl shrink-0">
           {selectedElement ? (
             <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                <div className="flex items-center justify-between border-b pb-6">
                  <div>
                    <p className="text-[10px] font-black text-orange-500 uppercase italic">Text Master Edition</p>
                    <h4 className="text-sm font-black uppercase italic">{selectedElement.type}</h4>
                  </div>
                  <button onClick={() => { setElements(prev => prev.filter(e => e.id !== selectedId)); setSelectedId(null); }} className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm"><Trash2 size={20} /></button>
                </div>
                <div className="space-y-4">
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic ml-1">Conteúdo Master</label>
                   {selectedElement.type === 'text' || selectedElement.type === 'chip' ? (
                     <textarea className="w-full bg-slate-50 p-6 rounded-3xl font-bold border-none h-32 uppercase text-xs shadow-inner italic" value={selectedElement.content} onChange={(e) => updateSelectedElement({ content: e.target.value })} />
                   ) : (selectedElement.type === 'image' || selectedElement.type === 'shape') && (
                     <button onClick={() => selectedElement.type === 'image' ? imageInputRef.current?.click() : shapeImageInputRef.current?.click()} className="w-full py-5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase italic flex items-center justify-center gap-3 shadow-xl hover:bg-orange-600 transition-all">
                        <ImagePlus size={18} /> {selectedElement.type === 'image' ? 'Alterar Mídia' : 'Inserir Imagem'}
                     </button>
                   )}
                </div>
                {(selectedElement.type === 'text' || selectedElement.type === 'chip') && (
                  <div className="pt-6 border-t border-slate-50 space-y-6">
                    <p className="text-[9px] font-black text-slate-400 uppercase italic ml-1">Estilização Master</p>
                    <div className="space-y-3">
                      <label className="text-[9px] font-black text-slate-400 uppercase italic ml-1">Tipografia Especial</label>
                      <select className="w-full h-14 bg-slate-50 rounded-2xl px-6 font-bold text-xs italic border-none outline-none focus:ring-2 focus:ring-orange-500 transition-all" value={selectedElement.fontFamily} onChange={(e) => updateSelectedElement({ fontFamily: e.target.value })}>
                         {FONT_FAMILIES.map(f => <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>{f.name}</option>)}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <button onClick={() => updateSelectedElement({ textTransform: 'uppercase' })} className={`py-4 rounded-xl text-[10px] font-black uppercase italic border transition-all flex items-center justify-center gap-2 ${selectedElement.textTransform === 'uppercase' ? 'bg-orange-500 text-white border-orange-500 shadow-lg' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                          <CaseUpper size={16} /> MAIÚSCULO
                       </button>
                       <button onClick={() => updateSelectedElement({ textTransform: 'lowercase' })} className={`py-4 rounded-xl text-[10px] font-black uppercase italic border transition-all flex items-center justify-center gap-2 ${selectedElement.textTransform === 'lowercase' ? 'bg-orange-500 text-white border-orange-500 shadow-lg' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                          <CaseLower size={16} /> minúsculo
                       </button>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                       <button onClick={() => updateSelectedElement({ textAlign: 'left' })} className={`py-4 rounded-xl border transition-all flex items-center justify-center ${selectedElement.textAlign === 'left' ? 'bg-orange-500 text-white border-orange-500 shadow-lg' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                          <AlignLeft size={18} />
                       </button>
                       <button onClick={() => updateSelectedElement({ textAlign: 'center' })} className={`py-4 rounded-xl border transition-all flex items-center justify-center ${selectedElement.textAlign === 'center' ? 'bg-orange-500 text-white border-orange-500 shadow-lg' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                          <AlignCenter size={18} />
                       </button>
                       <button onClick={() => updateSelectedElement({ textAlign: 'right' })} className={`py-4 rounded-xl border transition-all flex items-center justify-center ${selectedElement.textAlign === 'right' ? 'bg-orange-500 text-white border-orange-500 shadow-lg' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                          <AlignRight size={18} />
                       </button>
                    </div>
                  </div>
                )}
                <div className="pt-6 border-t border-slate-50 space-y-4">
                   <div className="flex justify-between items-center px-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase italic">Escala Master</label>
                      <span className="text-[10px] font-black text-orange-500">{(selectedElement.scale * 100).toFixed(0)}%</span>
                   </div>
                   <div className="flex items-center gap-3">
                      <button onClick={() => updateSelectedElement({ scale: Math.max(0.1, selectedElement.scale - 0.1) })} className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-600 hover:bg-orange-500 hover:text-white transition-all shadow-sm">
                        <Minus size={20} />
                      </button>
                      <div className="flex-1 px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner flex items-center justify-center">
                         <input type="range" min="0.1" max="5.0" step="0.05" className="w-full accent-orange-500" value={selectedElement.scale} onChange={(e) => updateSelectedElement({ scale: parseFloat(e.target.value) })} />
                      </div>
                      <button onClick={() => updateSelectedElement({ scale: Math.min(5.0, selectedElement.scale + 0.1) })} className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-600 hover:bg-orange-500 hover:text-white transition-all shadow-sm">
                        <Plus size={20} />
                      </button>
                   </div>
                </div>
                {selectedElement.type === 'chip' && (
                  <div className="pt-6 border-t border-slate-50 space-y-4">
                    <div className="flex justify-between items-center px-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase italic">Tamanho do Texto</label>
                        <span className="text-[10px] font-black text-orange-500">{selectedElement.fontSize}px</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => updateSelectedElement({ fontSize: Math.max(8, (selectedElement.fontSize || 32) - 2) })} className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 hover:bg-orange-500 hover:text-white transition-all">
                          <Minus size={16} />
                        </button>
                        <div className="flex-1 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 shadow-inner flex items-center justify-center">
                           <input type="range" min="8" max="120" step="1" className="w-full accent-orange-500" value={selectedElement.fontSize || 32} onChange={(e) => updateSelectedElement({ fontSize: parseInt(e.target.value) })} />
                        </div>
                        <button onClick={() => updateSelectedElement({ fontSize: Math.min(120, (selectedElement.fontSize || 32) + 2) })} className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 hover:bg-orange-500 hover:text-white transition-all">
                          <Plus size={16} />
                        </button>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase italic ml-1">Rotação</label>
                      <input type="number" className="w-full bg-slate-50 p-4 rounded-xl font-bold text-xs italic" value={selectedElement.rotation} onChange={(e) => updateSelectedElement({ rotation: parseInt(e.target.value) })} />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase italic ml-1">Bordas</label>
                      <input type="number" className="w-full bg-slate-50 p-4 rounded-xl font-bold text-xs italic" value={selectedElement.borderRadius} onChange={(e) => updateSelectedElement({ borderRadius: parseInt(e.target.value) })} />
                   </div>
                </div>
                <div className="space-y-4">
                    <label className="text-[9px] font-black text-slate-400 uppercase italic ml-1">Cores</label>
                    <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-inner">
                       <input type="color" className="w-12 h-12 rounded-xl cursor-pointer border-none bg-transparent" value={selectedElement.color} onChange={(e) => updateSelectedElement({ color: e.target.value })} />
                       <span className="font-mono text-[10px] font-black uppercase tracking-widest text-slate-400">{selectedElement.color}</span>
                    </div>
                </div>
             </div>
           ) : (
             <div className="opacity-40 text-center space-y-6 pt-24">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center border-2 border-dashed border-slate-200 mx-auto shadow-inner"><MousePointer size={40} className="text-slate-300" /></div>
                <div className="space-y-2 px-10">
                   <p className="text-[10px] font-black uppercase tracking-[0.4em] italic text-slate-900 leading-relaxed">Seleção Vazia.</p>
                </div>
             </div>
           )}
        </div>
      </div>

      {isWAModalOpen && (
        <div className="fixed inset-0 z-[2500] flex items-center justify-center bg-slate-950/95 backdrop-blur-3xl p-6 animate-in fade-in duration-300">
           <div className="bg-white rounded-[4rem] p-12 max-w-2xl w-full shadow-4xl relative overflow-hidden flex flex-col">
              <button onClick={() => setIsWAModalOpen(false)} className="absolute top-10 right-10 text-slate-300 hover:text-slate-900 transition-colors"><X size={32} /></button>
              <div className="flex items-center gap-8 mb-10">
                 <div className="w-20 h-20 bg-green-100 text-green-600 rounded-3xl flex items-center justify-center shadow-xl shadow-green-500/10"><MessageCircle size={40} /></div>
                 <div>
                    <h3 className="text-3xl font-black italic uppercase tracking-tighter leading-none">WhatsApp Master</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Despacho Elite v3.0</p>
                 </div>
              </div>
              <div className="space-y-6 overflow-y-auto custom-scrollbar pr-2 pb-4">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic ml-2">1. Convidado</label>
                    <select className="w-full h-16 px-8 bg-slate-50 border border-slate-100 rounded-2xl font-black outline-none italic text-slate-800" value={waSelectedGuestId} onChange={(e) => setWaSelectedGuestId(e.target.value)}>
                        <option value="">Escolher...</option>
                        {guests.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic ml-2">2. Upload do Convite Master</label>
                    <div onClick={() => waInviteInputRef.current?.click()} className="w-full h-32 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-orange-500 hover:bg-white transition-all overflow-hidden relative group">
                       {waUploadedInvite ? (
                         <>
                           <img src={waUploadedInvite} className="w-full h-full object-cover opacity-30" />
                           <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                              <CheckCircle2 size={24} className="text-green-500" />
                              <span className="text-[9px] font-black text-green-600 uppercase tracking-widest">Carregado</span>
                           </div>
                         </>
                       ) : (
                         <>
                            <Upload size={24} className="text-slate-300 group-hover:text-orange-500" />
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Selecionar Arquivo</span>
                         </>
                       )}
                    </div>
                    <input type="file" ref={waInviteInputRef} className="hidden" accept="image/*" onChange={(e) => {
                       const file = e.target.files?.[0];
                       if (file) {
                          const reader = new FileReader();
                          reader.onload = () => setWaUploadedInvite(reader.result as string);
                          reader.readAsDataURL(file);
                       }
                    }} />
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic ml-2">3. Mensagem Master</label>
                    <textarea className="w-full h-24 p-6 bg-slate-50 border border-slate-100 rounded-2xl font-medium italic outline-none resize-none text-sm text-slate-600 shadow-inner" value={waMessage} onChange={(e) => setWaMessage(e.target.value)} />
                 </div>
                 <button onClick={handleWASend} className="w-full h-20 bg-slate-950 text-white rounded-3xl font-black italic uppercase tracking-widest text-lg shadow-4xl flex items-center justify-center gap-6 hover:bg-green-600 transition-all transform active:scale-95 group">
                    DISPARAR CONVITE <ExternalLink size={24} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                 </button>
              </div>
           </div>
        </div>
      )}

      <input type="file" ref={bgInputRef} className="hidden" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onload = () => setBackground(prev => ({ ...prev, image: reader.result as string })); reader.readAsDataURL(file); } }} />
      <input type="file" ref={imageInputRef} className="hidden" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file && selectedId) { const reader = new FileReader(); reader.onload = () => updateSelectedElement({ content: reader.result as string }); reader.readAsDataURL(file); } }} />
      <input type="file" ref={shapeImageInputRef} className="hidden" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file && selectedId) { const reader = new FileReader(); reader.onload = () => updateSelectedElement({ imageContent: reader.result as string }); reader.readAsDataURL(file); } }} />
    </div>
  );
};

export default Designer;
