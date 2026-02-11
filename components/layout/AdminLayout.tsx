
import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../services/context/AuthContext';
import { LogOut, LayoutGrid } from 'lucide-react';
import Sidebar from './Sidebar';

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* SIDEBAR FIXA */}
      <Sidebar />

      {/* ÁREA DE CONTEÚDO PRINCIPAL */}
      <div className="flex-1 flex flex-col pl-64">
        <header className="bg-white border-b sticky top-0 z-50 shadow-sm h-20 shrink-0">
          <div className="max-w-7xl mx-auto px-8 h-full flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/admin')}
                className="p-3 bg-slate-50 hover:bg-orange-500 hover:text-white rounded-2xl text-slate-400 transition-all border border-slate-100 group"
                title="Ir para o Hub Central"
              >
                <LayoutGrid size={20} className="group-hover:rotate-12 transition-transform" />
              </button>
              <div className="h-8 w-px bg-slate-100 mx-2" />
              <div>
                <h1 className="text-sm font-black text-slate-900 uppercase tracking-tighter italic">Digital Excellence Hub</h1>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-0.5">
                  Operador: {user?.name || 'Admin'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-orange-50 rounded-xl border border-orange-100">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest italic">Servidores Online</span>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-red-600 rounded-2xl text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-black/10 group"
              >
                <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
                Encerrar Sessão
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-8 bg-slate-50/50">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
