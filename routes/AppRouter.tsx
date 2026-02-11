
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Login from '../pages/Login';

// ---------------- ADMIN PAGES ----------------
import AdminPanel from '../pages/admin/AdminPanel';
import Dashboard from '../pages/admin/Dashboard';
import Provisioning from '../pages/admin/Provisioning';
import Guests from '../pages/admin/Guests';
import SiteMaster from '../pages/admin/SiteMaster';
import BuffetManager from '../pages/admin/BuffetManager';
import Designer from '../pages/admin/Designer';
import GiftsAdmin from '../pages/admin/Gifts';
import Tables from '../pages/admin/Tables';
import AccessControl from '../pages/admin/AccessControl';

// ---------------- PUBLIC SITE PAGES ----------------
import EventWebsiteLayout from '../components/layout/EventWebsiteLayout';
import PublicGuestView from '../pages/guest/PublicGuestView';
import PublicGiftsView from '../pages/site/PublicGiftsView';
import PublicGuestsView from '../pages/site/PublicGuestsView';
import WebsitePreview from '../pages/site/WebsitePreview';
import PublicBuffetView from '../pages/site/PublicBuffetView';

// ---------------- LAYOUT & SECURITY ----------------
import ProtectedRoute from './ProtectedRoute';
import AdminLayout from '../components/layout/AdminLayout';
import { UserRole } from '../types';

const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* ================= LOGIN ================= */}
      <Route path="/login" element={<Login />} />

      {/* ================= SITE PÚBLICO (SEM AUTENTICAÇÃO) ================= */}
      
      {/* Rotas com layout e contexto de evento */}
      <Route path="/:eventSlug" element={<EventWebsiteLayout />}>
        <Route index element={<PublicGuestView />} />
        <Route path="gifts" element={<PublicGiftsView />} />
        <Route path="buffet" element={<PublicBuffetView />} />
        <Route path="attendees" element={<PublicGuestsView />} />
      </Route>

      {/* Redirecionamento alternativo legacy */}
      <Route path="/e/:slug" element={<Navigate to="/:slug" replace />} />

      {/* Preview do Website (requer autenticação) */}
      <Route 
        path="/site/preview" 
        element={
          <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.MANAGER]}>
            <WebsitePreview />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/site/preview/:guestId" 
        element={
          <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.MANAGER]}>
            <WebsitePreview />
          </ProtectedRoute>
        } 
      />

      {/* ================= ADMIN (REQUER AUTENTICAÇÃO) ================= */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.MANAGER]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminPanel />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="provisioning" element={<Provisioning />} />
        <Route path="guests" element={<Guests />} />
        <Route path="site-master" element={<SiteMaster />} />
        <Route path="designer" element={<Designer />} />
        <Route path="buffet" element={<BuffetManager />} />
        <Route path="gifts" element={<GiftsAdmin />} />
        <Route path="tables" element={<Tables />} />
        <Route path="users" element={<AccessControl />} />
      </Route>

      {/* Redirecionamentos padrão */}
      <Route path="/" element={<Navigate to="/admin" replace />} />
      
      {/* Página de evento não encontrado */}
      <Route path="/event-not-found" element={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 text-white">
          <div className="text-center p-8 max-w-md">
            <div className="w-20 h-20 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl">🚫</span>
            </div>
            <h1 className="text-3xl font-black mb-4">Evento Não Encontrado</h1>
            <p className="text-slate-300 mb-6">
              O evento que você está tentando acessar não existe ou não está ativo no momento.
            </p>
            <a href="/admin" className="inline-block px-6 py-3 bg-orange-500 hover:bg-orange-600 rounded-2xl font-bold transition-colors">Acessar Painel Admin</a>
          </div>
        </div>
      } />
      
      {/* Rota fallback */}
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
};

export default AppRouter;
