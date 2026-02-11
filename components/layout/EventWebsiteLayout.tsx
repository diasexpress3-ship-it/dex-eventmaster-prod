
// components/layout/EventWebsiteLayout.tsx
import React, { useEffect, createContext, useContext, useState } from 'react';
import { useParams, Outlet, useNavigate } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { EventProvisioning } from '../../types';
import './styles.css';

interface EventContextType {
  event: EventProvisioning | null;
  siteData: any;
  buffetData: any;
  giftsData: any;
  loading: boolean;
}

export const EventContext = createContext<EventContextType>({
  event: null,
  siteData: null,
  buffetData: null,
  giftsData: null,
  loading: false
});

const EventWebsiteLayout: React.FC = () => {
  const { eventSlug } = useParams<{ eventSlug: string }>();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(true);
  const [event, setEvent] = useState<EventProvisioning | null>(null);
  const [siteData, setSiteData] = useState<any>(null);
  const [buffetData, setBuffetData] = useState<any>(null);
  const [giftsData, setGiftsData] = useState<any>([]);

  useEffect(() => {
    const loadEventData = () => {
      if (!eventSlug) {
        setIsLoading(false);
        return;
      }

      try {
        // Correção: Usar a chave correta de provisionamento v9
        const eventsData = localStorage.getItem('dex_provisionings_v9');
        const events: EventProvisioning[] = eventsData ? JSON.parse(eventsData) : [];
        
        const foundEvent = events.find(e => e.slug === eventSlug);
        
        if (!foundEvent) {
          setIsLoading(false);
          return;
        }
        
        setEvent(foundEvent);
        
        // Correção: Usar a chave site_data_ID
        const siteDataKey = `dex_site_data_${foundEvent.id}`;
        const savedSiteData = localStorage.getItem(siteDataKey);
        if (savedSiteData) {
          setSiteData(JSON.parse(savedSiteData));
        }
        
        // Buscar buffetData
        const buffetDataKey = `dex_buffet_${foundEvent.id}`;
        const savedBuffetData = localStorage.getItem(buffetDataKey);
        if (savedBuffetData) {
          setBuffetData(JSON.parse(savedBuffetData));
        }
        
        // Buscar giftsData
        const giftsDataKey = `dex_gifts_${foundEvent.id}`;
        const savedGiftsData = localStorage.getItem(giftsDataKey);
        if (savedGiftsData) {
          setGiftsData(JSON.parse(savedGiftsData));
        }
        
      } catch (error) {
        console.error('Erro ao carregar dados do evento:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadEventData();
  }, [eventSlug]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6">
        <div className="relative">
          <div className="w-20 h-20 bg-orange-500 rounded-3xl flex items-center justify-center animate-spin">
            <RefreshCw size={28} className="text-white" />
          </div>
        </div>
        <div className="text-center space-y-2 mt-8">
          <h3 className="text-slate-900 font-black italic text-sm uppercase tracking-widest animate-pulse">
            Sincronizando Website
          </h3>
          <p className="text-slate-500 text-[9px] font-bold uppercase tracking-[0.4em]">
            Digital Excellence Hub
          </p>
        </div>
      </div>
    );
  }

  if (!event && eventSlug) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-6 text-center">
        <div className="max-w-md space-y-6">
          <div className="text-orange-500 text-6xl mx-auto mb-4 italic font-black">404</div>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter">Evento não localizado</h1>
          <p className="text-slate-400 font-medium italic leading-relaxed">
            O link de acesso para o evento <span className="text-orange-500">"{eventSlug}"</span> não existe ou foi desativado pelo administrador.
          </p>
          <button 
            onClick={() => navigate('/login')}
            className="px-10 py-4 bg-orange-600 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-2xl hover:bg-orange-500 transition-all"
          >
            Acessar Painel Master
          </button>
        </div>
      </div>
    );
  }

  return (
    <EventContext.Provider value={{ 
      event, 
      siteData, 
      buffetData,
      giftsData,
      loading: false 
    }}>
      <div className="min-h-screen bg-white">
        <Outlet />
      </div>
    </EventContext.Provider>
  );
};

export const useEvent = () => useContext(EventContext);
export default EventWebsiteLayout;
