
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  RefreshCw, 
  Users, 
  Table2, 
  Palette, 
  Utensils, 
  Gift, 
  Globe, 
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Zap
} from 'lucide-react';
import Card from '../../components/ui/Card';
import { useAuth } from '../../services/context/AuthContext';

const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const modules = [
    { 
      id: 'provisioning', 
      name: 'Provisionamento', 
      desc: 'Gestão de instâncias e slugs de eventos.', 
      path: '/admin/provisioning', 
      icon: RefreshCw, 
      color: 'bg-orange-500' 
    },
    { 
      id: 'dashboard', 
      name: 'Métricas Master', 
      desc: 'Visão analítica e status de RSVP.', 
      path: '/admin/dashboard', 
      icon: LayoutDashboard, 
      color: 'bg-blue-500' 
    },
    { 
      id: 'guests', 
      name: 'Convidados', 
      desc: 'Base de dados e QR Codes individuais.', 
      path: '/admin/guests', 
      icon: Users, 
      color: 'bg-emerald-500' 
    },
    { 
      id: 'tables', 
      name: 'Mapa de Mesas', 
      desc: 'Organização de assentos e setores.', 
      path: '/admin/tables', 
      icon: Table2, 
      color: 'bg-purple-500' 
    },
    { 
      id: 'designer', 
      name: 'Designer Hub', 
      desc: 'Criação de convites e artes digitais.', 
      path: '/admin/designer', 
      icon: Palette, 
      color: 'bg-pink-500' 
    },
    { 
      id: 'buffet', 
      name: 'Gestão de Buffet', 
      desc: 'Cardápios e experiências gastronômicas.', 
      path: '/admin/buffet', 
      icon: Utensils, 
      color: 'bg-amber-500' 
    },
    { 
      id: 'gifts', 
      name: 'Presentes', 
      desc: 'Curadoria de mimos e cotas master.', 
      path: '/admin/gifts', 
      icon: Gift, 
      color: 'bg-rose-500' 
    },
    { 
      id: 'site-master', 
      name: 'Site Master', 
      desc: 'Construtor visual do website do evento.', 
      path: '/admin/site-master', 
      icon: Globe, 
      color: 'bg-cyan-500' 
    },
    { 
      id: 'users', 
      name: 'Acessos Master', 
      desc: 'Controle de privilégios e auditoria.', 
      path: '/admin/users', 
      icon: ShieldCheck, 
      color: 'bg-slate-800' 
    },
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      {/* HEADER MASTER */}
      <div className="relative overflow-hidden bg-slate-900 rounded-[3rem] p-12 text-white shadow-4xl border border-white/5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-orange-500/20 px-4 py-2 rounded-xl text-orange-400 text-[10px] font-black uppercase tracking-widest border border-orange-500/20">
              <Zap size={14} className="animate-pulse" /> Painel de Controle Elite
            </div>
            <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter leading-none">
              Bem-vindo, <span className="text-orange-500">{user?.name.split(' ')[0]}</span>
            </h1>
            <p className="text-slate-400 font-medium italic max-w-xl">
              Central de Comando Dex-EventMaster. Gerencie todos os aspectos do seu ecossistema de eventos a partir deste hub centralizado.
            </p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white/5 backdrop-blur-md px-8 py-4 rounded-3xl border border-white/10 text-center">
              <p className="text-2xl font-black italic tracking-tighter text-white">09</p>
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Módulos Ativos</p>
            </div>
            <div className="bg-white/5 backdrop-blur-md px-8 py-4 rounded-3xl border border-white/10 text-center">
              <p className="text-2xl font-black italic tracking-tighter text-orange-500">PRO</p>
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Plano Master</p>
            </div>
          </div>
        </div>
      </div>

      {/* GRID DE MÓDULOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {modules.map((module, index) => (
          <Card 
            key={module.id} 
            onClick={() => navigate(module.path)}
            className="group relative overflow-hidden rounded-[2.5rem] border-none shadow-2xl bg-white p-10 cursor-pointer hover:-translate-y-3 transition-all duration-500 animate-in slide-in-from-bottom-8"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-10 transition-opacity">
              <module.icon size={120} />
            </div>
            
            <div className="relative z-10 space-y-6">
              <div className={`w-16 h-16 ${module.color} text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-black/10 transition-transform group-hover:rotate-6`}>
                <module.icon size={32} />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-black italic uppercase tracking-tighter text-slate-900 group-hover:text-orange-600 transition-colors">
                  {module.name}
                </h3>
                <p className="text-xs text-slate-500 font-medium italic leading-relaxed">
                  {module.desc}
                </p>
              </div>

              <div className="flex items-center gap-2 text-[9px] font-black text-slate-300 uppercase tracking-widest group-hover:text-slate-900 transition-all">
                Acessar Módulo <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="text-center pt-10">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.6em] italic">
          Digital Excellence Studio • Protocolo Master 2024
        </p>
      </div>
    </div>
  );
};

export default AdminPanel;
