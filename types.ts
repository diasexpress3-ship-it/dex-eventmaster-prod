
import React from 'react';

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  GUEST = 'guest'
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

export interface EventProvisioning {
  id: string;
  slug: string;
  coupleNames: string;
  weddingDate: string;
  eventTime: string;
  managerEmail: string;
  managerPassword: string;
  eventUrl: string;
  isProvisioned: boolean;
  isActive: boolean;
  isHidden: boolean;
  contactEmail?: string;
  eventLocation?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AgendaItem {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  location: string;
  imageUrl: string;
}

export interface HistoryChapter {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  textPosition: 'above' | 'below';
  font: {
    family: string;
    size: number;
    color: string;
  };
}

export interface BuffetItem {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
}

export interface DescriptionBlock {
  id: string;
  text: string;
  fontSize: number;
  isBold: boolean;
  showIcon: boolean;
  textTransform: 'uppercase' | 'none';
  role: 'header' | 'side' | 'list';
}

export interface BuffetConfig {
  heroImageUrl: string;
  menuDetailImageUrl: string;
  title: string;
  description: string;
  descriptionBlocks: DescriptionBlock[];
  menuItems: BuffetItem[];
  galleryImages: string[];
  observations: string;
}

export interface RSVPConfig {
  message: string;
  maxGuests: number;
  confirmationDeadline: string;
  requireMealChoice: boolean;
  mealOptions: string[];
}

export interface SiteConfig {
  sectionOrder: string[];
  lockedSections: string[];
  visibility: Record<string, boolean>;
  identity: any;
  couple: any;
  agenda: AgendaItem[];
  agendaLayout: 'horizontal' | 'vertical';
  history: HistoryChapter[];
  historyTitle: string;
  buffet: BuffetConfig;
  giftLink: string;
}

export enum RSVPStatus {
  PENDING = 'Pendente',
  CONFIRMED = 'Confirmado',
  DECLINED = 'Não Comparecerá'
}

export interface Guest {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  guestCount: number;
  rsvpStatus: RSVPStatus;
  rsvpNote?: string;
  eventId?: string;
  qrCodeUrl: string;
  invitationToken?: string;
  createdAt?: string;
  confirmedAt?: string;
  tableNumber?: string;
  groupName?: string;
  rsvpDate?: string;
  updatedAt?: string;
}

export const FONT_FAMILIES = [
  { name: 'Jakarta Sans', value: "'Inter', sans-serif" },
  { name: 'Montserrat Bold', value: "'Montserrat', sans-serif" },
  { name: 'Cinzel Master', value: "'Cinzel', serif" },
  { name: 'Playfair Display', value: "'Playfair Display', serif" },
  { name: 'Great Vibes', value: "'Great Vibes', cursive" },
  { name: 'Dancing Script', value: "'Dancing Script', cursive" },
  { name: 'Alex Brush', value: "'Alex Brush', cursive" },
  { name: 'Lora Serif', value: "'Lora', serif" },
];

export interface GiftItem {
  id: string;
  name: string;
  price: number;
  category: string;
  imageUrl: string;
  link: string;
  purchased: boolean;
  isAvailable: boolean;
  maxSelections: number;
  currentSelections: number;
}
