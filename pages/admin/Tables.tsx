
import React, { useState, useEffect, useMemo } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { 
  Table2, Plus, Users, Trash2, UserPlus, 
  AlertTriangle, UserCheck, Search,
  RefreshCw, Sparkles, X
} from 'lucide-react';
import { Guest } from '../../types';
import { useAppStore } from '../store/appStore';

interface Table {
  id: string;
  number: string;
  capacity: number;
  guestIds: string[];
}

const Tables: React.FC = () => {
  const { activeEventId, activeEvent } = useAppStore();
  const [tables, setTables] = useState<Table[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);

  const tablesKey = useMemo(() => `dex_tables_${activeEventId || 'global'}`, [activeEventId]);
  const guestsKey = useMemo(() => `dex_guests_${activeEventId || 'global'}`, [activeEventId]);

  useEffect(() => {
    const savedTables = localStorage.getItem(tablesKey);
    const savedGuests = localStorage.getItem(guestsKey);
    setTables(savedTables ? JSON.parse(savedTables) : []);
    setGuests(savedGuests ? JSON.parse(savedGuests) : []);
    setSelectedTable(null);
  }, [tablesKey, guestsKey]);

  const saveTables = (updatedTables: Table[]) => {
    setTables(updatedTables);
    localStorage.setItem(tablesKey, JSON.stringify(updatedTables));
  };

  const addTable = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const newTable: Table = {
      id: Math.random().toString(36).substr(2, 9),
      number: formData.get('number') as string,
      capacity: Number(formData.get('capacity')),
      guestIds: []
    };
    saveTables([...tables, newTable]);
    setIsModalOpen(false);
  };

  const deleteTable = (id: string) => {
    if (confirm('Excluir esta mesa e liberar os convidados?')) {
      const tableToDelete = tables.find(t => t.id === id);
      if (tableToDelete) {
        const updatedGuests = guests.map(g => 
          tableToDelete.guestIds.includes(g.id) ? { ...g, tableNumber: '' } : g
        );
        setGuests(updatedGuests);
        localStorage.setItem(guestsKey, JSON.stringify(updatedGuests));
      }
      saveTables(tables.filter(t => t.id !== id));
      if (selectedTable?.id === id) setSelectedTable(null);
    }
  };

  const assignGuestToTable = (tableId: string, guestId: string) => {
    const table = tables.find(t => t.id === tableId);
    if (!table) return;

    if (table.guestIds.length >= table.capacity) {
      alert('Esta mesa está LOTADA!');
      return;
    }

    const updatedTables = tables.map(t => {
      if (t.id === tableId) return { ...t, guestIds: [...t.guestIds, guestId] };
      return { ...t, guestIds: t.guestIds.filter(id => id !== guestId) };
    });

    // Sincronização Master: Atualiza o número da mesa no perfil do convidado
    const updatedGuests = guests.map(g => 
      g.id === guestId ? { ...g, tableNumber: table.number } : g
    );

    setGuests(updatedGuests);
    localStorage.setItem(guestsKey, JSON.stringify(updatedGuests));
    saveTables(updatedTables);
    setSelectedTable(updatedTables.find(t => t.id === tableId) || null);
  };

  const removeGuestFromTable = (tableId: string, guestId: string) => {
    const updatedTables = tables.map(t => 
      t.id === tableId ? { ...t, guestIds: t.guestIds.filter(id => id !== guestId) } : t
    );
    const updatedGuests = guests.map(g => 
      g.id === guestId ? { ...g, tableNumber: '' } : g
    );
    setGuests(updatedGuests);
    localStorage.setItem(guestsKey, JSON.stringify(updatedGuests));
    saveTables(updatedTables);
    setSelectedTable(updatedTables.find(t => t.id === tableId) || null);
  };

  const filteredGuestsWithoutTable = useMemo(() => 
    guests.filter(g => (!g.tableNumber || g.tableNumber === '') && g.name.toLowerCase().includes(searchTerm.toLowerCase())),
    [guests, searchTerm]
  );

  if (!activeEventId) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center opacity-40">
        <RefreshCw size={80} className="animate-spin-slow mb-6" />
        <h2 className="text-2xl font-black italic uppercase">Selecione um Evento</h2>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-orange-600 text-white rounded-3xl shadow-xl shadow-orange-500/20"><Table2 size={32} /></div>
          <div>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">Mapa de Assentos Master</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-2">
              <Sparkles size={12} className="text-orange-500" /> {activeEvent?.coupleNames} • Sincronização Master Ativa
            </p>
          </div>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="rounded-2xl h-14 bg-slate-900 shadow-2xl px-8 text-[10px] font-black uppercase italic">
          <Plus size={20} /> Nova Mesa Master
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {tables.map((table) => {
            const isFull = table.guestIds.length >= table.capacity;
            const isSelected = selectedTable?.id === table.id;
            return (
              <Card 
                key={table.id} 
                className={`group relative rounded-[2.5rem] p-8 transition-all duration-500 cursor-pointer overflow-hidden ${isSelected ? 'ring-4 ring-orange-500 bg-white shadow-2xl' : 'bg-white/80 hover:bg-white'}`}
                onClick={() => setSelectedTable(table)}
              >
                {isFull && (
                  <div className="absolute top-0 right-0 bg-orange-600 text-white px-5 py-2 rounded-bl-2xl text-[8px] font-black uppercase tracking-widest flex items-center gap-2 z-10 animate-pulse">
                    <AlertTriangle size={12} /> MESA LOTADA
                  </div>
                )}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg italic shadow-inner ${isFull ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-400'}`}>
                      {table.number}
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-slate-800 italic uppercase">Mesa {table.number}</h4>
                      <p className={`text-[9px] font-black uppercase ${isFull ? 'text-orange-500' : 'text-slate-400'}`}>{table.guestIds.length} / {table.capacity} LUGARES</p>
                    </div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); deleteTable(table.id); }} className="p-3 text-slate-300 hover:text-red-500 transition-all"><Trash2 size={16} /></button>
                </div>
                <div className="flex -space-x-3 overflow-hidden mb-8">
                  {table.guestIds.map(gid => {
                    const guest = guests.find(g => g.id === gid);
                    return <div key={gid} className="inline-block h-10 w-10 rounded-xl ring-4 ring-white bg-slate-200 flex items-center justify-center text-[10px] font-black text-slate-500 border border-white" title={guest?.name}>{guest?.name.charAt(0)}</div>;
                  })}
                  {Array.from({ length: Math.max(0, table.capacity - table.guestIds.length) }).map((_, i) => (
                    <div key={i} className="inline-block h-10 w-10 rounded-xl ring-4 ring-white bg-slate-50 border border-dashed border-slate-200" />
                  ))}
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                   <div className={`h-full transition-all duration-1000 ${isFull ? 'bg-orange-500' : 'bg-slate-900'}`} style={{ width: `${(table.guestIds.length/table.capacity)*100}%` }} />
                </div>
              </Card>
            );
          })}
        </div>

        <div className="space-y-6">
          <Card className="rounded-[2.5rem] border-none shadow-2xl p-8 bg-slate-950 text-white sticky top-24">
            <h4 className="text-sm font-black italic uppercase tracking-tighter mb-6 flex items-center gap-3"><Users size={18} /> Gestor de Assentos</h4>
            {!selectedTable ? (
              <p className="text-[10px] font-bold text-slate-500 uppercase text-center py-20 italic">Selecione uma mesa no mapa para alocar convidados.</p>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center text-[10px] font-black text-orange-500 uppercase italic">
                  <span>Mesa {selectedTable.number}</span>
                  <span className={selectedTable.guestIds.length >= selectedTable.capacity ? 'text-red-500 animate-pulse' : ''}>{selectedTable.guestIds.length} / {selectedTable.capacity}</span>
                </div>
                
                {selectedTable.guestIds.length > 0 && (
                  <div className="space-y-2 border-b border-white/10 pb-4">
                     <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest italic">Na Mesa:</p>
                     {selectedTable.guestIds.map(gid => {
                       const g = guests.find(x => x.id === gid);
                       return (
                         <div key={gid} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                            <span className="text-[10px] font-black uppercase italic truncate">{g?.name}</span>
                            <button onClick={() => removeGuestFromTable(selectedTable.id, gid)} className="text-red-400 hover:text-red-300"><X size={14} /></button>
                         </div>
                       );
                     })}
                  </div>
                )}

                <div className="space-y-3">
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest italic">Aguardando Assento:</p>
                  <div className="relative mb-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                    <input 
                      className="w-full h-10 bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 text-[10px] font-black uppercase outline-none focus:ring-1 focus:ring-orange-500" 
                      placeholder="Filtrar convidados..." 
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                    {filteredGuestsWithoutTable.map(guest => (
                      <button 
                        key={guest.id} 
                        disabled={selectedTable.guestIds.length >= selectedTable.capacity}
                        onClick={() => assignGuestToTable(selectedTable.id, guest.id)}
                        className="w-full flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-orange-500 transition-all disabled:opacity-20 group"
                      >
                        <span className="text-[10px] font-black uppercase italic truncate max-w-[120px]">{guest.name}</span>
                        <UserPlus size={16} className="text-slate-600 group-hover:text-white" />
                      </button>
                    ))}
                    {filteredGuestsWithoutTable.length === 0 && (
                      <div className="text-center py-10 opacity-30">
                         <UserCheck size={32} className="mx-auto mb-2" />
                         <p className="text-[8px] font-black uppercase">Todos já possuem mesa</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4">
          <Card className="w-full max-w-sm rounded-[3rem] p-12 bg-white shadow-4xl space-y-8 animate-in zoom-in duration-300">
            <h3 className="text-xl font-black italic uppercase text-slate-900 leading-none">Criar Mesa Master</h3>
            <form onSubmit={addTable} className="space-y-6">
              <Input label="NÚMERO OU NOME DA MESA" name="number" required placeholder="Ex: 01, VIP, FAMÍLIA" className="h-14 rounded-xl font-black uppercase" />
              <Input label="CAPACIDADE DE LUGARES" name="capacity" type="number" defaultValue={8} required className="h-14 rounded-xl font-black" />
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setIsModalOpen(false)} className="text-[10px] font-black uppercase text-slate-400">Cancelar</button>
                <Button variant="primary" type="submit" className="h-14 px-8 rounded-xl font-black uppercase italic shadow-2xl bg-slate-950">Confirmar</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Tables;
