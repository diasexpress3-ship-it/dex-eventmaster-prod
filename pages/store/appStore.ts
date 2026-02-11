
import { useState, useEffect, useCallback } from 'react';
import { SiteConfig, EventProvisioning, BuffetConfig, GiftItem, RSVPConfig } from '../../types';

const INITIAL_SITE_STATE: SiteConfig = {
  sectionOrder: ['identity', 'history', 'couple', 'agenda', 'buffet', 'gifts', 'rsvp_v2'],
  lockedSections: [],
  identity: {
    heroImageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80',
    initialCall: { text: 'NOSSA UNIÃO', font: { family: "'Cinzel', serif", size: 14, color: '#F97316' } },
    mainIdentity: { text: 'Ana & Roberto', font: { family: "'Great Vibes', cursive", size: 100, color: '#0F172A' } },
    tagline: { text: '15 DE JULHO • SÃO PAULO', font: { family: "'Montserrat', sans-serif", size: 12, color: '#64748B' } },
  },
  couple: {
    avatarUrl: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80',
    effectUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80',
    brideName: 'ANA OLIVEIRA',
    brideBio: 'Uma alma criativa que encontrou no amor a sua maior inspiração.',
    groomName: 'ROBERTO SANTOS',
    groomBio: 'Um sonhador determinado que descobriu que a happiness é melhor compartilhada.',
    nameSize: 80,
    nameColor: '#0F172A',
    bioSize: 18,
    bioColor: '#64748B'
  },
  agenda: [
    {
      id: 'default-1',
      name: 'CERIMÔNIA RELIGIOSA',
      startTime: '19:30',
      endTime: '',
      location: 'Catedral Master',
      imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80'
    },
    {
      id: 'default-2',
      name: 'RECEPÇÃO ELITE',
      startTime: '21:00',
      endTime: '',
      location: 'Grand Hall Dex',
      imageUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80'
    },
    {
      id: 'default-3',
      name: 'AFTER PARTY',
      startTime: '23:59',
      endTime: '',
      location: 'Lounge Dex',
      imageUrl: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80'
    }
  ],
  agendaLayout: 'horizontal',
  history: [
    {
      id: 'h1',
      title: 'O PRIMEIRO OLHAR',
      description: 'Tudo começou em uma tarde chuvosa onde o destino decidiu nos unir para sempre.',
      imageUrl: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80',
      textPosition: 'below',
      font: { family: "'Inter', sans-serif", size: 16, color: '#1E293B' }
    },
    {
      id: 'h2',
      title: 'A DECISÃO',
      description: 'Entre sorrisos e planos, percebemos que o futuro só fazia sentido se estivéssemos juntos.',
      imageUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80',
      textPosition: 'below',
      font: { family: "'Inter', sans-serif", size: 16, color: '#1E293B' }
    }
  ],
  historyTitle: 'Nossa história',
  buffet: {
    heroImageUrl: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80',
    menuDetailImageUrl: 'https://images.unsplash.com/photo-1541529086526-db283c563270?auto=format&fit=crop&q=80',
    title: 'MENU MASTER GOURMET',
    description: 'Uma curadoria gastronômica pensada para elevar os sentidos.',
    descriptionBlocks: [],
    menuItems: [],
    galleryImages: [],
    observations: 'Caso possua restrições alimentares, informe nossa equipe.'
  },
  giftLink: '',
  visibility: {
    identity: true, couple: true, agenda: true, history: true, gifts: true, buffet: true, rsvp_v2: true
  }
};

let listeners: Array<() => void> = [];
let siteState: SiteConfig = { ...INITIAL_SITE_STATE };
let eventProvisionings: EventProvisioning[] = JSON.parse(localStorage.getItem('dex_provisionings_v9') || '[]');
let activeEventId: string | null = localStorage.getItem('dex_active_event_id');

let buffetData: BuffetConfig | null = null;
let giftsData: GiftItem[] = [];

const deepMergeEvent = (saved: any): SiteConfig => {
  if (!saved) return { ...INITIAL_SITE_STATE };
  
  const mergedIdentity = {
    ...INITIAL_SITE_STATE.identity,
    ...(saved.identity || {}),
    initialCall: { ...INITIAL_SITE_STATE.identity.initialCall, ...(saved.identity?.initialCall || {}) },
    mainIdentity: { ...INITIAL_SITE_STATE.identity.mainIdentity, ...(saved.identity?.mainIdentity || {}) },
    tagline: { ...INITIAL_SITE_STATE.identity.tagline, ...(saved.identity?.tagline || {}) }
  };

  return {
    ...INITIAL_SITE_STATE,
    ...saved,
    identity: mergedIdentity,
    couple: { ...INITIAL_SITE_STATE.couple, ...(saved.couple || {}) },
    visibility: { ...INITIAL_SITE_STATE.visibility, ...(saved.visibility || {}) },
    sectionOrder: Array.isArray(saved.sectionOrder) ? saved.sectionOrder : INITIAL_SITE_STATE.sectionOrder
  };
};

const loadEventData = (id: string) => {
  if (!id) {
    siteState = { ...INITIAL_SITE_STATE };
    return;
  }
  
  const savedSite = localStorage.getItem(`dex_site_data_${id}`);
  if (savedSite) {
    try {
      siteState = deepMergeEvent(JSON.parse(savedSite));
    } catch {
      siteState = { ...INITIAL_SITE_STATE };
    }
  } else {
    const prov = eventProvisionings.find(p => p.id === id);
    if (prov) {
      siteState = {
        ...INITIAL_SITE_STATE,
        identity: {
          ...INITIAL_SITE_STATE.identity,
          mainIdentity: { ...INITIAL_SITE_STATE.identity.mainIdentity, text: prov.coupleNames },
          tagline: { ...INITIAL_SITE_STATE.identity.tagline, text: `${prov.weddingDate.split('-').reverse().join('/')} • ${prov.eventTime}` }
        }
      };
    }
  }

  const savedBuffet = localStorage.getItem(`dex_buffet_${id}`);
  buffetData = savedBuffet ? JSON.parse(savedBuffet) : siteState.buffet;
  const savedGifts = localStorage.getItem(`dex_gifts_${id}`);
  giftsData = savedGifts ? JSON.parse(savedGifts) : [];
};

if (activeEventId) loadEventData(activeEventId);

const emitChange = () => listeners.forEach(l => l());

export const useAppStore = () => {
  const [, setTick] = useState(0);

  useEffect(() => {
    const l = () => setTick(t => t + 1);
    listeners.push(l);
    return () => { listeners = listeners.filter(x => x !== l); };
  }, []);

  const setActiveEventId = useCallback((id: string) => {
    activeEventId = id;
    localStorage.setItem('dex_active_event_id', id);
    loadEventData(id);
    emitChange();
  }, []);

  const updateSection = useCallback((section: keyof SiteConfig, data: any) => {
    siteState = { ...siteState, [section]: data };
    if (activeEventId) {
      localStorage.setItem(`dex_site_data_${activeEventId}`, JSON.stringify(siteState));
    }
    emitChange();
  }, [activeEventId]);

  const reorderSections = useCallback((fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= siteState.sectionOrder.length) return;
    const newOrder = [...siteState.sectionOrder];
    const [movedItem] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, movedItem);
    updateSection('sectionOrder', newOrder);
  }, [updateSection]);

  return {
    state: siteState,
    provisionings: eventProvisionings,
    activeEventId,
    activeEvent: eventProvisionings.find(p => p.id === activeEventId),
    buffetData,
    giftsData,
    updateSection,
    reorderSections,
    toggleVisibility: (sectionId: string) => {
      const newVis = { ...siteState.visibility, [sectionId]: !siteState.visibility[sectionId] };
      updateSection('visibility', newVis);
    },
    toggleLock: (sectionId: string) => {
      const isLocked = siteState.lockedSections?.includes(sectionId);
      const newLocked = isLocked 
        ? siteState.lockedSections.filter(id => id !== sectionId)
        : [...(siteState.lockedSections || []), sectionId];
      updateSection('lockedSections', newLocked);
    },
    publishChanges: () => { 
      if (activeEventId) {
        localStorage.setItem(`dex_site_data_${activeEventId}`, JSON.stringify(siteState));
        localStorage.setItem(`dex_buffet_${activeEventId}`, JSON.stringify(siteState.buffet));
      }
      emitChange();
    },
    addProvisioning: (p: EventProvisioning) => {
      eventProvisionings = [...eventProvisionings, p];
      localStorage.setItem('dex_provisionings_v9', JSON.stringify(eventProvisionings));
      emitChange();
    },
    updateProvisioning: (id: string, updates: Partial<EventProvisioning>) => {
      eventProvisionings = eventProvisionings.map(p => p.id === id ? { ...p, ...updates } : p);
      localStorage.setItem('dex_provisionings_v9', JSON.stringify(eventProvisionings));
      emitChange();
    },
    deleteProvisioning: (id: string) => {
      eventProvisionings = eventProvisionings.filter(p => p.id !== id);
      localStorage.setItem('dex_provisionings_v9', JSON.stringify(eventProvisionings));
      if (activeEventId === id) {
        activeEventId = null;
        localStorage.setItem('dex_active_event_id', '');
      }
      emitChange();
    },
    setActiveEventId,
    fetchEventData: (id: string) => { loadEventData(id); emitChange(); },
  };
};
