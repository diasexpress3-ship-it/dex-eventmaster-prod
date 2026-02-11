import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Users, ChevronLeft, Search, Sparkles, UserCheck, Heart,
  CheckCircle, Clock, Gift, MapPin, Calendar, Share2,
  Facebook, Twitter, Linkedin, Mail, Link2, Download,
  Star, Award, TrendingUp, ChevronRight, RefreshCw
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useEvent } from '../../components/layout/EventWebsiteLayout';
import { Guest, RSVPStatus } from '../../types';
import { confirmationService } from '../../modules/guest-confirmation/confirmationService';

const PublicGuestsView: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { event } = useEvent();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    confirmedToday: 0,
    lastWeek: 0
  });

  useEffect(() => {
    if (event?.id) {
      setIsLoading(true);
      
      // Carregar do localStorage
      const storageKey = `dex_guests_${event.id}`;
      const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
      
      // Apenas convidados confirmados aparecem na lista pública
      const confirmedGuests = saved.filter((g: Guest) => 
        g.rsvpStatus === RSVPStatus.CONFIRMED
      );
      
      // Ordenar por data de confirmação (mais recentes primeiro)
      confirmedGuests.sort((a: Guest, b: Guest) => {
        const dateA = a.confirmedAt ? new Date(a.confirmedAt).getTime() : 0;
        const dateB = b.confirmedAt ? new Date(b.confirmedAt).getTime() : 0;
        return dateB - dateA;
      });
      
      setGuests(confirmedGuests);
      
      // Calcular estatísticas
      const now = new Date();
      const today = new Date(now.setHours(0, 0, 0, 0));
      const weekAgo = new Date(now.setDate(now.getDate() - 7));
      
      setStats({
        total: confirmedGuests.length,
        confirmedToday: confirmedGuests.filter((g: Guest) => 
          g.confirmedAt && new Date(g.confirmedAt) >= today
        ).length,
        lastWeek: confirmedGuests.filter((g: Guest) => 
          g.confirmedAt && new Date(g.confirmedAt) >= weekAgo
        ).length
      });
      
      setIsLoading(false);
    }
  }, [event?.id]);

  const filteredGuests = useMemo(() => {
    let filtered = guests;
    
    if (searchTerm) {
      filtered = filtered.filter(g => 
        g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  }, [guests, searchTerm]);

  const shareOnSocial = (platform: string) => {
    const url = window.location.href;
    const text = `Já são ${guests.length} convidados confirmados para o casamento de ${event?.coupleNames}!`;
    
    let shareUrl = '';
    switch(platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
        break;
    }
    
    window.open(shareUrl, '_blank');
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('🔗 Link copiado para compartilhamento!');
  };

  if (!event) return null;

  return (
    <div className="min-h-screen bg-white selection:bg-orange-500 pb-32 animate-in fade-in duration-700">
      {/* Header */}
      <header className="p-6 md:p-8 border-b bg-white/90 backdrop-blur-xl sticky top-0 z-[100] flex items-center justify-between shadow-sm">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-slate-900 font-black uppercase text-[10px] tracking-widest hover:text-orange-500 transition-all group"
        >
          <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
          Voltar
        </button>
        
        <div className="text-center">
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 italic">
            Presenças Confirmadas
          </p>
          <h2 className="text-[10px] md:text-sm font-black italic uppercase tracking-[0.2em] text-slate-800">
            {event.coupleNames}
          </h2>
        </div>
        
        <div className="w-10" />
      </header>

      {/* Hero Section */}
      <section className="py-24 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white text-center relative overflow-hidden">
        {/* Elementos decorativos */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-orange-500 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse" />
        </div>
        
        <Sparkles className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-orange-500/10" size={600} />
        
        <div className="max-w-4xl mx-auto px-6 space-y-8 relative z-10">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl shadow-2xl animate-float">
            <Users size={48} className="text-white" />
          </div>
          
          <h2 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter leading-none">
            QUEM JÁ <br />
            <span className="text-orange-500 text-6xl md:text-9xl">CONFIRMOU</span>
          </h2>
          
          <p className="text-slate-400 font-medium italic text-xl leading-relaxed max-w-2xl mx-auto">
            Sua presença é o nosso maior presente. Confira quem já garantiu o lugar nessa celebração única.
          </p>
          
          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mt-12">
            <div className="bg-white/5 backdrop-blur-xl rounded-[2rem] p-6 border border-white/10">
              <p className="text-4xl font-black text-orange-500">{stats.total}</p>
              <p className="text-[10px] font-black uppercase tracking-widest mt-2 opacity-70">
                Total de Confirmados
              </p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-xl rounded-[2rem] p-6 border border-white/10">
              <p className="text-4xl font-black text-green-500">{stats.confirmedToday}</p>
              <p className="text-[10px] font-black uppercase tracking-widest mt-2 opacity-70">
                Confirmaram Hoje
              </p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-xl rounded-[2rem] p-6 border border-white/10">
              <p className="text-4xl font-black text-blue-500">{stats.lastWeek}</p>
              <p className="text-[10px] font-black uppercase tracking-widest mt-2 opacity-70">
                Últimos 7 Dias
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-6xl mx-auto px-4 py-20 space-y-12">
        {/* Busca e Compartilhamento */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome..."
              className="w-full h-16 pl-16 pr-8 bg-slate-50 border-2 border-slate-100 rounded-[2rem] outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500/20 font-bold italic text-slate-700 transition-all"
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={copyShareLink}
              variant="outline"
              className="h-16 px-6 rounded-2xl gap-2 text-[10px] font-black uppercase italic border-slate-200"
            >
              <Link2 size={18} /> Compartilhar
            </Button>
            
            <div className="flex gap-2">
              <button
                onClick={() => shareOnSocial('facebook')}
                className="w-16 h-16 bg-[#1877f2]/10 rounded-2xl flex items-center justify-center text-[#1877f2] hover:bg-[#1877f2] hover:text-white transition-all border-2 border-transparent hover:border-white"
              >
                <Facebook size={24} />
              </button>
              <button
                onClick={() => shareOnSocial('twitter')}
                className="w-16 h-16 bg-black/5 rounded-2xl flex items-center justify-center text-black hover:bg-black hover:text-white transition-all border-2 border-transparent hover:border-white"
              >
                <Twitter size={24} />
              </button>
              <button
                onClick={() => shareOnSocial('whatsapp')}
                className="w-16 h-16 bg-[#25D366]/10 rounded-2xl flex items-center justify-center text-[#25D366] hover:bg-[#25D366] hover:text-white transition-all border-2 border-transparent hover:border-white"
              >
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.473-.15-.673.15-.197.3-.767.967-.94 1.164-.173.198-.347.223-.644.074-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.672-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Grid de Convidados */}
        {isLoading ? (
          <div className="flex justify-center py-32">
            <RefreshCw size={48} className="animate-spin text-orange-500" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredGuests.map((guest) => (
                <Card 
                  key={guest.id} 
                  className="rounded-[2.5rem] p-8 bg-white border-2 border-slate-50 shadow-xl hover:shadow-2xl hover:border-orange-200 transition-all duration-500 group cursor-pointer"
                  onClick={() => setSelectedGuest(guest)}
                >
                  <div className="flex items-start gap-6">
                    <div className="relative">
                      <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-50 rounded-2xl flex items-center justify-center font-black text-2xl text-orange-600 shadow-inner group-hover:scale-110 transition-transform duration-500">
                        {guest.name.charAt(0)}
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-xl flex items-center justify-center border-2 border-white shadow-lg">
                        <CheckCircle size={16} className="text-white" />
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-black text-slate-900 uppercase italic text-lg leading-tight group-hover:text-orange-600 transition-colors">
                        {guest.name}
                      </h4>
                      
                      <div className="flex items-center gap-2 mt-3">
                        <UserCheck size={14} className="text-green-500" />
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                          Confirmado
                        </span>
                      </div>
                      
                      {guest.confirmedAt && (
                        <p className="text-[9px] text-slate-400 mt-2 font-mono">
                          {new Date(guest.confirmedAt).toLocaleDateString('pt-PT', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-1 mt-2">
                        <Heart size={14} className="text-red-200 group-hover:text-red-500 transition-colors" />
                        <span className="text-[8px] font-black uppercase text-slate-300">
                          {guest.guestCount || 1} PAX
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {filteredGuests.length === 0 && (
              <div className="text-center py-32 space-y-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-100 rounded-3xl">
                  <Users size={40} className="text-slate-400" />
                </div>
                <p className="text-xl font-black uppercase tracking-widest text-slate-300 italic">
                  {searchTerm ? 'Nenhum convidado encontrado' : 'Ainda não há confirmações'}
                </p>
                <p className="text-slate-400 italic">
                  {searchTerm ? 'Tente buscar por outro nome' : 'Seja o primeiro a confirmar!'}
                </p>
              </div>
            )}
          </>
        )}

        {/* Mensagem de Agradecimento */}
        <div className="mt-20 p-12 bg-gradient-to-r from-orange-50 to-white rounded-[3rem] border border-orange-100 text-center">
          <Award size={48} className="mx-auto mb-4 text-orange-500" />
          <h3 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 mb-2">
            Gratidão por Confirmar
          </h3>
          <p className="text-slate-600 max-w-2xl mx-auto italic">
            Cada confirmação torna este momento ainda mais especial. 
            Estamos ansiosos para celebrar com vocês!
          </p>
          
          <div className="flex justify-center gap-4 mt-8">
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm">
              <Calendar size={16} className="text-orange-500" />
              <span className="text-[10px] font-black uppercase">{event.weddingDate}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm">
              <MapPin size={16} className="text-orange-500" />
              <span className="text-[10px] font-black uppercase truncate max-w-[150px]">{event.eventLocation}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Modal de Detalhes do Convidado */}
      {selectedGuest && (
        <div className="fixed inset-0 z-[200] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4">
          <Card className="p-12 max-w-md w-full rounded-[4rem] border-none bg-white animate-in zoom-in duration-300">
            <div className="text-center mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-2xl">
                <span className="text-4xl font-black text-white">
                  {selectedGuest.name.charAt(0)}
                </span>
              </div>
              
              <h3 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 mb-2">
                {selectedGuest.name}
              </h3>
              
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-2xl">
                <CheckCircle size={14} className="text-green-600" />
                <span className="text-[10px] font-black uppercase text-green-700">
                  Confirmou Presença
                </span>
              </div>
            </div>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                <span className="text-xs font-bold uppercase text-slate-500">Acompanhantes</span>
                <span className="text-2xl font-black text-orange-500">{selectedGuest.guestCount || 1} PAX</span>
              </div>
              
              {selectedGuest.confirmedAt && (
                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                  <span className="text-xs font-bold uppercase text-slate-500">Confirmado em</span>
                  <span className="text-sm font-mono text-slate-700">
                    {new Date(selectedGuest.confirmedAt).toLocaleString('pt-PT')}
                  </span>
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              <Button 
                onClick={() => {
                  const message = `Estou confirmado no casamento de ${event?.coupleNames}! Já são ${guests.length} convidados confirmados.`;
                  window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
                }}
                className="w-full h-16 rounded-2xl gap-3 bg-green-600 hover:bg-green-700 text-white font-black uppercase text-xs"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.473-.15-.673.15-.197.3-.767.967-.94 1.164-.173.198-.347.223-.644.074-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.672-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                </svg>
                COMPARTILHAR NO WHATSAPP
              </Button>
              
              <button 
                onClick={() => setSelectedGuest(null)} 
                className="w-full py-4 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] hover:text-slate-900 transition-colors"
              >
                FECHAR
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Footer */}
      <footer className="py-20 text-center border-t border-slate-50">
        <p className="text-[9px] font-black uppercase tracking-[0.6em] italic text-slate-300">
          {event.coupleNames} • {new Date(event.weddingDate).toLocaleDateString('pt-PT', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
          })}
        </p>
        <p className="text-[8px] font-mono text-slate-200 mt-6 uppercase tracking-[0.4em]">
          DEX Protocol • Visualização Master de Convidados v2.0
        </p>
      </footer>
    </div>
  );
};

export default PublicGuestsView;
