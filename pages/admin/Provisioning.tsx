import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { 
  Shield, Globe, Lock, Mail, Calendar, 
  Link as LinkIcon, Sparkles, RefreshCw, 
  Clock, Plus, Trash2, Eye, EyeOff, CheckCircle2,
  ChevronRight, Layout, Zap, KeyRound, AlertCircle,
  Users, ExternalLink, Copy
} from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { EventProvisioning } from '../../types';

const Provisioning: React.FC = () => {
  const { provisionings, addProvisioning, updateProvisioning, deleteProvisioning, setActiveEventId, activeEventId } = useAppStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  
  const [formData, setFormData] = useState<Partial<EventProvisioning>>({
    coupleNames: '',
    slug: '',
    weddingDate: '',
    eventTime: '19:00',
    managerEmail: '',
    managerPassword: ''
  });

  // Gerador automático de slug amigável
  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    setFormData(prev => ({ ...prev, coupleNames: name, slug }));
  };

  useEffect(() => {
    if (confirmPassword && formData.managerPassword !== confirmPassword) {
      setPasswordError(true);
    } else {
      setPasswordError(false);
    }
  }, [confirmPassword, formData.managerPassword]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.managerPassword !== confirmPassword) {
      alert("As passwords não coincidem!");
      return;
    }

    const id = Math.random().toString(36).substr(2, 9);
    const finalSlug = formData.slug || id;
    
    const newProv: EventProvisioning = {
      id,
      slug: finalSlug,
      coupleNames: formData.coupleNames || 'Novo Evento',
      weddingDate: formData.weddingDate || '',
      eventTime: formData.eventTime || '19:00',
      managerEmail: formData.managerEmail || '',
      managerPassword: formData.managerPassword || '',
      eventUrl: `${window.location.origin}/#/e/${finalSlug}`,
      isProvisioned: true,
      isActive: false,
      isHidden: false
    };

    addProvisioning(newProv);
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({ coupleNames: '', slug: '', weddingDate: '', eventTime: '19:00', managerEmail: '', managerPassword: '' });
    setConfirmPassword('');
    setPasswordError(false);
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    alert('URL do Evento Copiada!');
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-orange-600 text-white rounded-3xl shadow-xl shadow-orange-500/20">
            <RefreshCw size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">Repositório de Provisionamento</h1>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-1">Gestão de Instâncias e Eventos Dex</p>
          </div>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="rounded-2xl gap-3 px-8 h-14 bg-slate-900 shadow-2xl">
          <Plus size={20} /> NOVO PROVISIONAMENTO
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
           <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-2 italic">Eventos Criados na Aplicação</h3>
           {provisionings.length === 0 ? (
             <Card className="rounded-[3rem] p-20 text-center border-dashed border-2 bg-slate-50/50">
               <Sparkles size={64} className="mx-auto text-slate-200 mb-6" />
               <p className="text-slate-400 font-black uppercase text-xs tracking-widest">Nenhum evento provisionado até o momento.</p>
             </Card>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {provisionings.map((prov) => (
                 <Card 
                   key={prov.id} 
                   className={`rounded-[2.5rem] p-8 border-none shadow-2xl transition-all relative overflow-hidden group ${activeEventId === prov.id ? 'ring-4 ring-orange-500 bg-white' : 'bg-white/80 hover:bg-white'}`}
                 >
                   {activeEventId === prov.id && (
                     <div className="absolute top-0 right-0 bg-orange-500 text-white px-6 py-2 rounded-bl-3xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                       <CheckCircle2 size={12} /> EVENTO ATIVO
                     </div>
                   )}
                   
                   <div className="space-y-6">
                     <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-orange-100 group-hover:text-orange-500 transition-colors">
                           <Layout size={24} />
                        </div>
                        <div>
                           <h4 className="text-xl font-black text-slate-800 tracking-tighter italic">{prov.coupleNames}</h4>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                              <Calendar size={12} /> {prov.weddingDate} às {prov.eventTime}
                           </p>
                        </div>
                     </div>

                     <div className="flex flex-wrap gap-2">
                        <button 
                          onClick={() => setActiveEventId(prov.id)}
                          className={`flex-1 py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${activeEventId === prov.id ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                        >
                          {activeEventId === prov.id ? 'Sincronizado' : 'Ativar Agora'}
                        </button>
                        <button 
                          onClick={() => updateProvisioning(prov.id, { isHidden: !prov.isHidden })}
                          className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors"
                        >
                          {prov.isHidden ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                        <button 
                          onClick={() => deleteProvisioning(prov.id)}
                          className="w-14 h-14 bg-red-50 text-red-300 rounded-2xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                     </div>

                     <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between group-hover:bg-white transition-colors">
                        <div className="truncate pr-4">
                           <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">URL Personalizada</p>
                           <p className="text-[10px] font-mono text-orange-600 truncate font-bold">/e/{prov.slug}</p>
                        </div>
                        <button onClick={() => copyUrl(prov.eventUrl)} className="text-slate-300 hover:text-orange-500 hover:scale-110 transition-transform"><LinkIcon size={14} /></button>
                     </div>
                   </div>
                 </Card>
               ))}
             </div>
           )}
        </div>

        <div className="space-y-8">
           <Card className="rounded-[3rem] bg-slate-900 text-white p-10 border-none relative overflow-hidden shadow-2xl">
              <Lock className="absolute -right-8 -bottom-8 text-white/5" size={180} />
              <div className="relative z-10 space-y-6">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-orange-500"><Shield size={32} /></div>
                <h4 className="text-2xl font-black italic tracking-tighter">Cluster de Eventos</h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                  O sistema Dex-EventMaster permite o gerenciamento simultâneo de múltiplos eventos. Personalize a URL para que seus convidados acessem um ambiente exclusivo.
                </p>
                <div className="flex items-center gap-3 text-[10px] font-black uppercase text-orange-500">
                   <div className="w-2 h-2 bg-orange-500 rounded-full animate-ping"></div>
                   URL Dinâmica Ativa
                </div>
              </div>
           </Card>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <Card className="w-full max-w-xl shadow-[0_50px_100px_rgba(0,0,0,0.4)] rounded-[4rem] border-0 p-12 bg-white max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="space-y-8">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-[2rem] flex items-center justify-center shadow-inner">
                  <RefreshCw size={36} />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight italic">Provisionar Evento</h3>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1 italic">Instalação de Nova Instância Dex</p>
                </div>
              </div>

              <form onSubmit={handleCreate} className="space-y-8">
                {/* Seção 01: Identidade */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 px-2">
                    <Sparkles size={16} className="text-orange-500" />
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Identidade do Evento</h4>
                  </div>
                  
                  <Input 
                    label="Nome do Evento / Casal" 
                    required 
                    placeholder="Ex: Ana & Roberto"
                    value={formData.coupleNames} 
                    onChange={e => handleNameChange(e.target.value)}
                    className="rounded-3xl h-16 bg-slate-50 border-none px-6 font-bold" 
                  />

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Personalização do Link (Slug)</label>
                    <div className="flex items-center bg-slate-50 rounded-3xl h-16 px-6 border border-slate-100 focus-within:ring-2 focus-within:ring-orange-500/20">
                       <span className="text-slate-400 text-xs font-bold font-mono">/e/</span>
                       <input 
                         className="flex-1 bg-transparent border-none outline-none px-2 font-mono text-sm font-black text-orange-600 lowercase"
                         value={formData.slug}
                         onChange={e => setFormData({...formData, slug: e.target.value.replace(/\s+/g, '-')})}
                         placeholder="link-personalizado"
                       />
                       <Zap size={14} className="text-orange-300" />
                    </div>
                  </div>
                </div>

                {/* Seção 02: Logística */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 px-2">
                      <Calendar size={14} className="text-slate-400" />
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Data</h4>
                    </div>
                    <Input 
                      type="date" 
                      required 
                      value={formData.weddingDate}
                      onChange={e => setFormData({...formData, weddingDate: e.target.value})}
                      className="rounded-3xl h-16 bg-slate-50 border-none px-6 font-bold" 
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 px-2">
                      <Clock size={14} className="text-slate-400" />
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Hora</h4>
                    </div>
                    <Input 
                      type="time" 
                      required 
                      value={formData.eventTime}
                      onChange={e => setFormData({...formData, eventTime: e.target.value})}
                      className="rounded-3xl h-16 bg-slate-50 border-none px-6 font-bold" 
                    />
                  </div>
                </div>

                {/* Seção 03: Credenciais de Acesso (Solicitado) */}
                <div className="space-y-6 pt-6 border-t border-slate-100">
                  <div className="flex items-center gap-3 px-2">
                    <KeyRound size={16} className="text-orange-500" />
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Credenciais do Cliente / Gestor</h4>
                  </div>
                  
                  <Input 
                    label="E-mail de Acesso" 
                    type="email" 
                    required 
                    placeholder="gestor@cliente.com"
                    value={formData.managerEmail}
                    onChange={e => setFormData({...formData, managerEmail: e.target.value})}
                    className="rounded-3xl h-16 bg-slate-50 border-none px-6 font-bold" 
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Input 
                        label="Password Master" 
                        type="password" 
                        required 
                        placeholder="••••••••"
                        value={formData.managerPassword}
                        onChange={e => setFormData({...formData, managerPassword: e.target.value})}
                        className={`rounded-3xl h-16 bg-slate-50 border-none px-6 font-bold ${passwordError ? 'ring-2 ring-red-500/20' : ''}`} 
                      />
                    </div>
                    <div className="space-y-1">
                      <Input 
                        label="Confirmar Password" 
                        type="password" 
                        required 
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        className={`rounded-3xl h-16 bg-slate-50 border-none px-6 font-bold ${passwordError ? 'ring-2 ring-red-500/20' : ''}`} 
                      />
                    </div>
                  </div>

                  {passwordError && (
                    <div className="flex items-center gap-2 px-4 py-3 bg-red-50 text-red-500 rounded-2xl animate-in fade-in slide-in-from-top-2">
                      <AlertCircle size={14} />
                      <span className="text-[10px] font-black uppercase tracking-widest italic">As passwords não coincidem!</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                  <Button variant="ghost" type="button" onClick={() => { setIsModalOpen(false); resetForm(); }} className="rounded-2xl px-10 h-14 uppercase text-[10px] font-black tracking-widest">Abortar</Button>
                  <Button 
                    variant="primary" 
                    type="submit" 
                    disabled={passwordError || !formData.managerPassword}
                    className="rounded-2xl px-12 h-14 bg-orange-600 shadow-2xl shadow-orange-500/20 font-black italic uppercase tracking-widest disabled:opacity-50"
                  >
                    Ativar Instância
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Provisioning
