
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Table2, 
  Palette, 
  Gift, 
  Globe, 
  ShieldCheck,
  ChevronRight,
  RefreshCw,
  Monitor,
  Utensils,
  LayoutGrid
} from 'lucide-react';
import { useAuth } from '../../services/context/AuthContext';

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Painel Master', path: '/admin', icon: LayoutGrid, end: true },
    { name: 'Métricas', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Provisionamento', path: '/admin/provisioning', icon: RefreshCw },
    { name: 'Convidados', path: '/admin/guests', icon: Users },
    { name: 'Mesas', path: '/admin/tables', icon: Table2 },
    { name: 'Designer', path: '/admin/designer', icon: Palette },
    { name: 'Buffet Master', path: '/admin/buffet', icon: Utensils },
    { name: 'Presentes', path: '/admin/gifts', icon: Gift },
    { name: 'Site Master', path: '/admin/site-master', icon: Globe },
    { name: 'Website', path: '/site/preview', icon: Monitor },
    { name: 'Controle de Acesso', path: '/admin/users', icon: ShieldCheck },
  ];

  return (
    <aside className="w-64 h-screen bg-slate-950 text-slate-300 flex flex-col fixed left-0 top-0 z-[20] shadow-3xl border-r border-white/5">
      {/* Cabeçalho do App com Logotipo - Clicar leva ao Painel Master */}
      <div 
        className="p-8 flex items-center gap-4 cursor-pointer group"
        onClick={() => navigate('/admin')}
      >
        <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center font-black text-white shadow-[0_0_30px_rgba(249,115,22,0.4)] transform -rotate-3 transition-transform group-hover:rotate-0">
          <span className="text-xl italic">D</span>
        </div>
        <div>
          <h1 className="text-lg font-black text-white tracking-tighter leading-none italic uppercase group-hover:text-orange-500 transition-colors">Dex-EventMaster</h1>
          <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em] mt-1 italic">Gestão Elite de Eventos</p>
        </div>
      </div>

      {/* Navegação por Seções */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        <p className="px-4 py-4 text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] italic leading-none">Gestão do Evento</p>
        
        <div className="space-y-1.5">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) => `
                flex items-center justify-between px-5 py-3.5 rounded-2xl transition-all duration-300 group
                ${isActive 
                  ? 'bg-orange-500 text-white shadow-[0_10px_25px_rgba(249,115,22,0.3)] ring-1 ring-orange-400' 
                  : 'hover:bg-white/5 hover:text-white'}
              `}
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-4">
                    <item.icon size={18} className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-orange-400 transition-colors'} />
                    <span className="text-[11px] font-black uppercase tracking-wider italic">{item.name}</span>
                  </div>
                  <ChevronRight size={14} className={`transition-all duration-300 ${isActive ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'}`} />
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Widget do Utilizador Logado */}
      <div className="p-6 border-t border-white/5 bg-black/20">
        <div className="bg-white/5 rounded-[2rem] p-4 border border-white/5 group hover:bg-white/10 transition-all cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-white font-black text-lg border border-white/10 shadow-inner italic">
                {user?.name.charAt(0)}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-slate-950 shadow-lg" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-black text-white truncate italic uppercase tracking-tight leading-none mb-1">{user?.name}</p>
              <p className="text-[8px] font-bold text-slate-500 truncate uppercase tracking-widest">{user?.role || 'Administrador'}</p>
            </div>
          </div>
        </div>
        
        <div className="mt-8 flex flex-col items-center opacity-30">
          <div className="w-8 h-1 bg-slate-800 rounded-full mb-3" />
          <p className="text-[7px] font-black text-slate-500 uppercase tracking-[0.6em] italic text-center">Event Master SDK v1.0</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
