
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import * as XLSX from 'xlsx';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import {
  Search, Plus, QrCode, Trash2, Edit3, CheckCircle2,
  X, Users, UserPlus, ClipboardCopy, Loader2, Minus, 
  Upload, Link as LinkIcon, Share2, Copy, Sparkles, 
  FileSpreadsheet, FileText, AlertCircle, Send, CheckCircle,
  Clock, XCircle, RefreshCw, Mail, Smartphone, Link2
} from 'lucide-react';
import { Guest, RSVPStatus } from '../../types';
import { useAppStore } from '../store/appStore';
import { confirmationService } from '../../modules/guest-confirmation/confirmationService';

const Guests: React.FC = () => {
  const { activeEvent, activeEventId } = useAppStore();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [newGuestCount, setNewGuestCount] = useState(1);
  const [isImporting, setIsImporting] = useState(false);
  const [importStats, setImportStats] = useState<{ total: number; added: number } | null>(null);
  const [filterStatus, setFilterStatus] = useState<RSVPStatus | 'ALL'>('ALL');
  const [isGeneratingInvites, setIsGeneratingInvites] = useState(false);
  
  const importInputRef = useRef<HTMLInputElement>(null);

  const storageKey = useMemo(() => `dex_guests_${activeEventId || 'global'}`, [activeEventId]);

  // Carregar convidados do localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsedGuests = JSON.parse(saved);
        setGuests(parsedGuests);
        
        // Sincronizar com o confirmationService
        parsedGuests.forEach((guest: Guest) => {
          confirmationService.syncGuestFromLegacy(guest);
        });
      } else {
        setGuests([]);
      }
    } catch {
      setGuests([]);
    }
  }, [storageKey]);

  const saveToStorage = useCallback((data: Guest[]) => {
    setGuests(data);
    localStorage.setItem(storageKey, JSON.stringify(data));
    
    // Sincronizar com o novo sistema RSVP
    data.forEach(guest => {
      confirmationService.syncGuestFromLegacy(guest);
    });
  }, [storageKey]);

  const generateModernUrl = useCallback((guestId: string) => {
    if (!activeEvent) return '';
    return `${window.location.origin}/#/${activeEvent.slug}?g=${guestId}`;
  }, [activeEvent]);

  const generateInvitationToken = useCallback((guestId: string) => {
    return `inv_${guestId}_${Date.now().toString(36)}`;
  }, []);

  const handleSaveGuest = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!activeEvent) return;
    
    const formData = new FormData(e.currentTarget);
    const name = String(formData.get('name')).toUpperCase().trim();
    const email = String(formData.get('email') || '').trim();
    const phone = String(formData.get('phone') || '').trim();
    
    if (!name) return;

    if (editingGuest) {
      const updated = guests.map(g =>
        g.id === editingGuest.id ? { 
          ...g, 
          name, 
          email,
          phone, 
          guestCount: newGuestCount 
        } : g
      );
      saveToStorage(updated);
    } else {
      const id = crypto.randomUUID();
      const invitationToken = generateInvitationToken(id);
      const newGuest: Guest = {
        id,
        name,
        email,
        phone,
        guestCount: newGuestCount,
        rsvpStatus: RSVPStatus.PENDING,
        qrCodeUrl: generateModernUrl(id),
        invitationToken,
        createdAt: new Date().toISOString()
      };
      saveToStorage([...guests, newGuest]);
    }
    
    setIsModalOpen(false);
    setEditingGuest(null);
    setNewGuestCount(1);
  };

  const handleImportClick = () => {
    importInputRef.current?.click();
  };

  const processImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeEvent) return;

    setIsImporting(true);
    setImportStats(null);

    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: "", raw: false });
        
        const newGuestsBatch: Guest[] = [];
        let addedCount = 0;

        rows.forEach((row: any) => {
          let name = "";
          let phone = "";
          let email = "";
          let pax = 1;

          Object.keys(row).forEach(key => {
            const lowerKey = key.toLowerCase().trim();
            const val = String(row[key] || "").trim();
            
            if (lowerKey.includes("nome") || lowerKey.includes("name") || lowerKey.includes("convidado") || lowerKey.includes("guest")) {
              if (!name) name = val.toUpperCase();
            } else if (lowerKey.includes("tel") || lowerKey.includes("phone") || lowerKey.includes("whatsapp") || lowerKey.includes("cel")) {
              if (!phone) phone = val;
            } else if (lowerKey.includes("email") || lowerKey.includes("e-mail") || lowerKey.includes("mail")) {
              if (!email) email = val.toLowerCase();
            } else if (lowerKey.includes("pax") || lowerKey.includes("convidados") || lowerKey.includes("count") || lowerKey.includes("qtd")) {
              pax = parseInt(val) || 1;
            }
          });

          if (name && name !== "" && name !== "UNDEFINED" && name !== "NULL") {
            const id = crypto.randomUUID();
            const invitationToken = generateInvitationToken(id);
            newGuestsBatch.push({
              id,
              name,
              email,
              phone: String(phone).replace(/\s/g, '').trim(),
              guestCount: pax,
              rsvpStatus: RSVPStatus.PENDING,
              qrCodeUrl: generateModernUrl(id),
              invitationToken,
              createdAt: new Date().toISOString()
            });
            addedCount++;
          }
        });

        if (newGuestsBatch.length > 0) {
          saveToStorage([...guests, ...newGuestsBatch]);
          setImportStats({ total: rows.length, added: addedCount });
        } else {
          alert("Nenhum convidado válido encontrado. Verifique os cabeçalhos das colunas (Nome, Telefone, Email, Pax).");
        }
        
        setIsImporting(false);
        if (importInputRef.current) importInputRef.current.value = "";
      };

      reader.readAsBinaryString(file);
    } catch (error) {
      console.error("Erro na importação:", error);
      alert("Erro ao processar arquivo. Utilize formatos .xlsx ou .csv padrão.");
      setIsImporting(false);
    }
  };

  const generateAllInvitationLinks = async () => {
    setIsGeneratingInvites(true);
    
    const updatedGuests = guests.map(guest => {
      if (!guest.invitationToken) {
        return {
          ...guest,
          invitationToken: generateInvitationToken(guest.id)
        };
      }
      return guest;
    });
    
    saveToStorage(updatedGuests);
    
    setTimeout(() => {
      setIsGeneratingInvites(false);
      alert(`${updatedGuests.filter(g => g.invitationToken).length} links de convite gerados com sucesso!`);
    }, 500);
  };

  const copyInvitationLink = (guest: Guest) => {
    if (!activeEvent) return;
    
    const token = guest.invitationToken || generateInvitationToken(guest.id);
    const link = `${window.location.origin}/#/${activeEvent.slug}?token=${token}`;
    
    navigator.clipboard.writeText(link);
    
    // Atualizar o convidado se não tinha token
    if (!guest.invitationToken) {
      const updated = guests.map(g =>
        g.id === guest.id ? { ...g, invitationToken: token.split('token=')[1] } : g
      );
      saveToStorage(updated);
    }
    
    alert(`🔗 Link do convite copiado para ${guest.name}`);
  };

  const copyMasterBundle = (guest: Guest) => {
    if (!activeEvent) return;
    
    const token = guest.invitationToken || generateInvitationToken(guest.id);
    const invitationLink = `${window.location.origin}/#/${activeEvent.slug}?token=${token}`;
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(invitationLink)}`;
    
    const bundle = {
      type: 'dex_guest_bundle_v2',
      name: guest.name,
      email: guest.email,
      phone: guest.phone,
      pax: guest.guestCount,
      invitationLink,
      qrImage: qrImageUrl,
      timestamp: Date.now(),
      eventId: activeEvent.id,
      eventName: activeEvent.coupleNames
    };
    
    localStorage.setItem('dex_designer_clipboard_v2', JSON.stringify(bundle));
    navigator.clipboard.writeText(invitationLink);
    
    alert(`✅ MASTER BUNDLE COPIADO!\n${guest.name} (${guest.guestCount} PAX)\nLink do convite pronto para compartilhar.`);
  };

  const getStatusBadge = (status: RSVPStatus) => {
    switch(status) {
      case RSVPStatus.CONFIRMED:
        return <span className="text-[8px] px-2 py-1 bg-green-500 text-white rounded-full flex items-center gap-1"><CheckCircle size={10} /> CONFIRMADO</span>;
      case RSVPStatus.DECLINED:
        return <span className="text-[8px] px-2 py-1 bg-red-500 text-white rounded-full flex items-center gap-1"><XCircle size={10} /> RECUSADO</span>;
      default:
        return <span className="text-[8px] px-2 py-1 bg-slate-400 text-white rounded-full flex items-center gap-1"><Clock size={10} /> PENDENTE</span>;
    }
  };

  const filteredGuests = useMemo(() => {
    let filtered = guests;
    
    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(g => 
        g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.phone?.includes(searchTerm)
      );
    }
    
    // Filtro por status
    if (filterStatus !== 'ALL') {
      filtered = filtered.filter(g => g.rsvpStatus === filterStatus);
    }
    
    return filtered;
  }, [guests, searchTerm, filterStatus]);

  const stats = useMemo(() => {
    return {
      total: guests.length,
      confirmed: guests.filter(g => g.rsvpStatus === RSVPStatus.CONFIRMED).length,
      declined: guests.filter(g => g.rsvpStatus === RSVPStatus.DECLINED).length,
      pending: guests.filter(g => g.rsvpStatus === RSVPStatus.PENDING).length,
      totalPax: guests.reduce((acc, g) => acc + (g.guestCount || 1), 0),
      confirmedPax: guests.filter(g => g.rsvpStatus === RSVPStatus.CONFIRMED)
        .reduce((acc, g) => acc + (g.guestCount || 1), 0)
    };
  }, [guests]);

  if (!activeEventId) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-6 opacity-40">
        <Users size={80} className="text-slate-300 animate-float" />
        <h2 className="text-2xl font-black uppercase italic tracking-tighter">Aguardando Seleção de Evento</h2>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
      <input 
        type="file" 
        ref={importInputRef} 
        onChange={processImport} 
        accept=".csv, .xlsx, .xls" 
        className="hidden" 
      />

      {/* Header com Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 rounded-[2rem] bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none shadow-2xl md:col-span-2">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-orange-500/20 rounded-2xl flex items-center justify-center">
              <Users size={28} className="text-orange-500" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60 italic">Total de Convidados</p>
              <h3 className="text-4xl font-black italic tracking-tighter">{stats.total}</h3>
              <p className="text-xs opacity-80 mt-1">{stats.totalPax} PAX no total</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6 rounded-[2rem] bg-white border-2 border-slate-50 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle size={24} className="text-green-600" />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest italic">Confirmados</p>
              <p className="text-2xl font-black text-slate-900">{stats.confirmed}</p>
              <p className="text-[10px] text-slate-500">{stats.confirmedPax} PAX</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6 rounded-[2rem] bg-white border-2 border-slate-50 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
              <Clock size={24} className="text-slate-600" />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest italic">Pendentes</p>
              <p className="text-2xl font-black text-slate-900">{stats.pending}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Ações em Massa */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex-1 flex gap-3">
          <Button 
            onClick={generateAllInvitationLinks} 
            variant="outline" 
            isLoading={isGeneratingInvites}
            className="gap-2 h-14 rounded-2xl border-slate-200 text-slate-700 shadow-sm text-[10px] font-black uppercase italic"
          >
            <Link2 size={20} /> Gerar Todos os Links
          </Button>
          <Button 
            onClick={handleImportClick} 
            variant="outline" 
            isLoading={isImporting} 
            className="gap-2 h-14 rounded-2xl border-slate-200 text-slate-700 shadow-sm text-[10px] font-black uppercase italic"
          >
            <FileSpreadsheet size={20} /> Importar
          </Button>
          <Button 
            onClick={() => { setEditingGuest(null); setIsModalOpen(true); }} 
            className="gap-2 h-14 rounded-2xl bg-slate-900 text-white shadow-xl text-[10px] font-black uppercase italic"
          >
            <Plus size={20} /> Adicionar
          </Button>
        </div>
        
        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as RSVPStatus | 'ALL')}
            className="h-14 px-6 bg-slate-50 border-none rounded-2xl text-xs font-black uppercase italic tracking-wider outline-none focus:ring-4 focus:ring-orange-500/10"
          >
            <option value="ALL">Todos</option>
            <option value={RSVPStatus.PENDING}>Pendentes</option>
            <option value={RSVPStatus.CONFIRMED}>Confirmados</option>
            <option value={RSVPStatus.DECLINED}>Recusados</option>
          </select>
        </div>
      </div>

      {/* Status da Importação */}
      {importStats && (
        <div className="bg-green-50 border border-green-100 p-5 rounded-[2rem] flex items-center justify-between animate-in slide-in-from-top-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg">
              <CheckCircle2 size={20} />
            </div>
            <p className="text-[11px] font-black uppercase italic text-green-700">
              Importação concluída: <strong>{importStats.added}</strong> convidados adicionados
            </p>
          </div>
          <button onClick={() => setImportStats(null)} className="text-green-300 hover:text-green-600 transition-colors">
            <X size={20} />
          </button>
        </div>
      )}

      {/* Lista de Convidados */}
      <Card className="rounded-[3rem] border-none shadow-2xl bg-white p-8">
        <div className="relative mb-8">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome, email ou telefone..."
            className="w-full h-16 pl-16 pr-8 bg-slate-50 border-none rounded-[1.5rem] outline-none focus:ring-4 focus:ring-orange-500/10 font-bold italic text-slate-700"
          />
        </div>

        <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
          {filteredGuests.map(g => (
            <div 
              key={g.id} 
              className="flex flex-col lg:flex-row lg:items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-slate-100 group hover:bg-white hover:border-orange-200 transition-all"
            >
              <div className="flex items-center gap-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-sm shadow-inner ${
                  g.rsvpStatus === RSVPStatus.CONFIRMED ? 'bg-green-100 text-green-600' : 
                  g.rsvpStatus === RSVPStatus.DECLINED ? 'bg-red-100 text-red-600' : 
                  'bg-slate-200 text-slate-400'
                }`}>
                  {g.name.charAt(0)}
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <p className="font-black uppercase italic text-slate-900 text-lg leading-tight">
                      {g.name}
                    </p>
                    {getStatusBadge(g.rsvpStatus)}
                    <span className="text-[10px] font-bold text-orange-500 uppercase bg-orange-50 px-3 py-1 rounded-lg">
                      {g.guestCount || 1} PAX
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs">
                    {g.email && (
                      <span className="flex items-center gap-1 text-slate-500">
                        <Mail size={12} /> {g.email}
                      </span>
                    )}
                    {g.phone && (
                      <span className="flex items-center gap-1 text-slate-500">
                        <Smartphone size={12} /> {g.phone}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-1 mt-2">
                    {g.invitationToken && (
                      <span className="text-[8px] font-mono bg-slate-100 px-2 py-1 rounded text-slate-500 truncate max-w-[200px]">
                        Token: {g.invitationToken.slice(0, 16)}...
                      </span>
                    )}
                    {g.confirmedAt && (
                      <span className="text-[8px] font-black uppercase text-green-600">
                        Confirmado em: {new Date(g.confirmedAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mt-4 lg:mt-0">
                <button 
                  onClick={() => copyInvitationLink(g)} 
                  className="p-4 bg-white rounded-2xl text-slate-400 hover:text-blue-500 shadow-sm border border-slate-100 transition-all"
                  title="Copiar link do convite"
                >
                  <Link2 size={20} />
                </button>
                <button 
                  onClick={() => setSelectedGuest(g)} 
                  className="p-4 bg-white rounded-2xl text-slate-400 hover:text-orange-500 shadow-sm border border-slate-100 transition-all"
                  title="QR Code e Bundle"
                >
                  <QrCode size={20} />
                </button>
                <button 
                  onClick={() => { 
                    setEditingGuest(g); 
                    setNewGuestCount(g.guestCount || 1); 
                    setIsModalOpen(true); 
                  }} 
                  className="p-4 bg-white rounded-2xl text-slate-400 hover:text-blue-500 border border-slate-100 transition-all"
                >
                  <Edit3 size={20} />
                </button>
                <button 
                  onClick={() => { 
                    if(confirm(`Remover ${g.name}?`)) {
                      const updated = guests.filter(x => x.id !== g.id);
                      saveToStorage(updated);
                      confirmationService.deleteGuest(g.id);
                    }
                  }} 
                  className="p-4 bg-white rounded-2xl text-slate-400 hover:text-red-500 border border-slate-100 transition-all"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
          
          {filteredGuests.length === 0 && (
            <div className="text-center py-20 opacity-50">
              <Users size={48} className="mx-auto mb-4" />
              <p className="font-black uppercase italic">Nenhum convidado encontrado</p>
            </div>
          )}
        </div>
      </Card>

      {/* MODAL QR CODE E BUNDLE */}
      {selectedGuest && (
        <div className="fixed inset-0 z-[200] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4">
          <Card className="p-12 text-center rounded-[4rem] max-w-md w-full animate-in zoom-in duration-300 border-none bg-white shadow-3xl">
            <h3 className="font-black uppercase italic text-2xl tracking-tighter mb-1 text-slate-900">
              {selectedGuest.name}
            </h3>
            <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-2 italic">
              {selectedGuest.guestCount || 1} PAX
            </p>
            
            {selectedGuest.invitationToken && (
              <div className="mb-6 p-3 bg-slate-50 rounded-2xl">
                <p className="text-[8px] font-black uppercase text-slate-400 mb-1">Link do Convite</p>
                <div className="flex items-center gap-2">
                  <code className="text-[10px] bg-white p-2 rounded-lg border truncate font-mono">
                    {`${window.location.origin}/#/${activeEvent?.slug}?token=${selectedGuest.invitationToken.slice(0, 20)}...`}
                  </code>
                  <button
                    onClick={() => copyInvitationLink(selectedGuest)}
                    className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    <Copy size={14} />
                  </button>
                </div>
              </div>
            )}
            
            <div 
              className="bg-white p-8 rounded-[3rem] shadow-2xl mb-8 border border-slate-100 cursor-pointer group relative overflow-hidden"
              onClick={() => copyMasterBundle(selectedGuest)}
            >
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(
                  `${window.location.origin}/#/${activeEvent?.slug}?token=${selectedGuest.invitationToken || generateInvitationToken(selectedGuest.id)}`
                )}`} 
                alt="QR Code" 
                className="w-full aspect-square object-contain group-hover:scale-105 transition-transform" 
              />
              <div className="absolute inset-0 bg-orange-500/10 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                <Copy size={48} className="text-orange-600 animate-pulse" />
              </div>
            </div>

            <div className="space-y-4">
              <Button 
                onClick={() => copyMasterBundle(selectedGuest)} 
                className="w-full h-16 rounded-[1.5rem] gap-3 font-black uppercase text-xs shadow-2xl bg-orange-600 hover:bg-orange-700"
              >
                <Sparkles size={20} /> COPIAR MASTER BUNDLE
              </Button>
              <Button 
                onClick={() => copyInvitationLink(selectedGuest)} 
                variant="outline"
                className="w-full h-16 rounded-[1.5rem] gap-3 font-black uppercase text-xs border-2"
              >
                <Link2 size={20} /> COPIAR LINK DO CONVITE
              </Button>
              <button 
                onClick={() => setSelectedGuest(null)} 
                className="text-[10px] font-black uppercase text-slate-300 tracking-[0.3em] mt-4 hover:text-slate-900 transition-colors"
              >
                FECHAR
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* MODAL CADASTRO MANUAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4">
          <Card className="p-12 max-w-lg w-full rounded-[4rem] border-none bg-white">
            <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-10 text-slate-900">
              {editingGuest ? 'Editar Convidado' : 'Novo Convidado'}
            </h3>
            
            <form onSubmit={handleSaveGuest} className="space-y-6">
              <Input 
                name="name" 
                defaultValue={editingGuest?.name} 
                required 
                placeholder="NOME DO CONVIDADO *" 
                className="h-16 rounded-[1.5rem] bg-slate-50 border-none font-black uppercase italic text-lg px-8 shadow-inner" 
              />
              
              <Input 
                name="email" 
                defaultValue={editingGuest?.email} 
                placeholder="EMAIL (opcional)" 
                type="email"
                className="h-16 rounded-[1.5rem] bg-slate-50 border-none font-bold px-8 shadow-inner" 
              />
              
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  name="phone" 
                  defaultValue={editingGuest?.phone} 
                  placeholder="WHATSAPP / CONTATO" 
                  className="h-16 rounded-[1.5rem] bg-slate-50 border-none font-bold px-8 shadow-inner" 
                />
                
                <div className="flex items-center justify-between h-16 px-8 bg-slate-50 rounded-[1.5rem] shadow-inner">
                  <button 
                    type="button" 
                    onClick={() => setNewGuestCount(p => Math.max(1, p - 1))} 
                    className="w-8 h-8 bg-white rounded-lg shadow-sm text-orange-500 hover:bg-orange-500 hover:text-white transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <strong className="text-xl font-black text-slate-900">{newGuestCount}</strong>
                  <button 
                    type="button" 
                    onClick={() => setNewGuestCount(p => p + 1)} 
                    className="w-8 h-8 bg-white rounded-lg shadow-sm text-orange-500 hover:bg-orange-500 hover:text-white transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-10 border-t border-slate-50">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-8 text-[11px] font-black uppercase text-slate-400 italic hover:text-slate-900 transition-colors"
                >
                  Cancelar
                </button>
                <Button 
                  type="submit" 
                  className="h-16 rounded-2xl px-12 font-black italic uppercase shadow-2xl bg-orange-600 text-white border-none hover:bg-orange-700"
                >
                  {editingGuest ? 'Atualizar' : 'Adicionar'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Guests;
