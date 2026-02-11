
/**
 * SERVIÇO DE CONFIRMAÇÃO V2 - ISOLAMENTO TOTAL
 * Dex-EventMaster Modules
 */
import { Guest } from '../../types';

export interface ConfirmationV2 {
  id: string;
  guestId: string;
  eventId: string;
  status: 'confirmed' | 'declined';
  pax: number;
  message: string;
  timestamp: string;
}

const STORAGE_KEY = 'dex_conf_v2_data';

export const confirmationService = {
  getConfirmations: (eventId: string): ConfirmationV2[] => {
    const raw = localStorage.getItem(STORAGE_KEY);
    const all: ConfirmationV2[] = raw ? JSON.parse(raw) : [];
    return all.filter(c => c.eventId === eventId);
  },

  submitConfirmation: async (data: Omit<ConfirmationV2, 'id' | 'timestamp'>): Promise<{ success: boolean; id: string }> => {
    const raw = localStorage.getItem(STORAGE_KEY);
    const all: ConfirmationV2[] = raw ? JSON.parse(raw) : [];
    
    const newEntry: ConfirmationV2 = {
      ...data,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString()
    };

    all.push(newEntry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    
    // Simulação de delay de rede
    await new Promise(resolve => setTimeout(resolve, 800));
    return { success: true, id: newEntry.id };
  },

  // Fix: Added syncGuestFromLegacy method
  syncGuestFromLegacy: (guest: Guest): void => {
    console.debug('Syncing legacy guest with RSVP V2:', guest.id);
    // Implementation can be expanded if specific synchronization logic is required
  },

  // Fix: Added deleteGuest method
  deleteGuest: (guestId: string): void => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const all: ConfirmationV2[] = JSON.parse(raw);
      const filtered = all.filter(c => c.guestId !== guestId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    }
  },

  getStats: (eventId: string) => {
    const confs = confirmationService.getConfirmations(eventId);
    return {
      total: confs.length,
      confirmed: confs.filter(c => c.status === 'confirmed').length,
      declined: confs.filter(c => c.status === 'declined').length,
      paxCount: confs.reduce((acc, curr) => acc + (curr.status === 'confirmed' ? curr.pax : 0), 0)
    };
  }
};
