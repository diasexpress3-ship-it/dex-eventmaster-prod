
import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import { 
  Users, 
  CheckCircle, 
  Clock, 
  XCircle, 
  TrendingUp, 
  Calendar as CalendarIcon,
  Zap,
  QrCode,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';

const Dashboard: React.FC = () => {
  const [showCheckinModal, setShowCheckinModal] = useState(false);

  const stats = [
    { label: 'Convidados Totais', value: 248, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Confirmados', value: 182, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50' },
    { label: 'Pendentes', value: 45, icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50' },
    { label: 'Recusados', value: 21, icon: XCircle, color: 'text-red-500', bg: 'bg-red-50' },
  ];

  const chartData = [
    { name: 'Confirmados', value: 182, color: '#22C55E' },
    { name: 'Pendentes', value: 45, color: '#F97316' },
    { name: 'Recusados', value: 21, color: '#EF4444' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">Visão Geral Elite</h1>
          <p className="text-slate-500 font-medium italic mt-1">Bem-vindo ao centro de comando operacional Dex-EventMaster.</p>
        </div>
        <div className="flex gap-4">
           <button 
             onClick={() => setShowCheckinModal(true)}
             className="flex items-center gap-3 bg-slate-950 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] shadow-2xl hover:bg-orange-600 transition-all"
           >
             <QrCode size={18} /> Iniciar Check-in
           </button>
           <div className="flex items-center gap-3 bg-white px-6 py-4 border border-slate-100 rounded-2xl shadow-sm">
             <CalendarIcon size={18} className="text-orange-500" />
             <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest italic">15 JULHO, 2024</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="hover:border-orange-200 transition-all group animate-float" style={{ animationDelay: `${i * 100}ms` }}>
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <p className="text-3xl font-black text-slate-900 italic tracking-tighter">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 rounded-[3rem] p-10 bg-white">
          <div className="flex items-center justify-between mb-8">
             <h3 className="text-xl font-black italic uppercase tracking-tighter">Status de RSVP Master</h3>
             <div className="flex items-center gap-4 text-[9px] font-black text-slate-300 uppercase italic">
                Sincronizado com EventCloud <Zap size={14} className="text-orange-500" />
             </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: '900', fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: '900', fill: '#64748b' }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', padding: '15px' }}
                />
                <Bar dataKey="value" radius={[12, 12, 0, 0]} barSize={60}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="space-y-8">
          <Card className="rounded-[3rem] bg-slate-900 text-white p-10 relative overflow-hidden">
             <Sparkles className="absolute -right-10 -bottom-10 text-white/5" size={200} />
             <div className="relative z-10 space-y-6">
                <div className="w-14 h-14 bg-orange-600 rounded-2xl flex items-center justify-center text-white shadow-xl"><TrendingUp size={28} /></div>
                <h4 className="text-2xl font-black italic uppercase tracking-tighter">Resumo Master AI</h4>
                <p className="text-slate-400 text-xs italic font-medium leading-relaxed">
                  "O evento atinge 73% de confirmação. A curva de resposta é estável. Recomendamos o envio de lembrete final para os 45 pendentes via WhatsApp Elite."
                </p>
                <button className="flex items-center gap-2 text-orange-500 text-[9px] font-black uppercase tracking-widest hover:gap-4 transition-all">
                  Ver Relatório Completo <ArrowRight size={14} />
                </button>
             </div>
          </Card>

          <Card title="Checklist Final" subtitle="Ações prioritárias" className="rounded-[3rem]">
            <div className="space-y-4 mt-6">
              {[
                { text: 'Validar mapa de mesas', done: true },
                { text: 'Lançar Menu Gourmet AI', done: true },
                { text: 'Sincronizar QR Codes', done: false },
                { text: 'Conferir Lista de Mimos', done: false },
              ].map((task, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl group cursor-pointer hover:bg-orange-50 transition-all">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${task.done ? 'bg-green-500 border-green-500 text-white' : 'border-slate-200'}`}>
                    {task.done && <CheckCircle size={14} strokeWidth={4} />}
                  </div>
                  <span className={`text-[10px] font-black uppercase italic ${task.done ? 'line-through text-slate-300' : 'text-slate-600'}`}>
                    {task.text}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {showCheckinModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-6">
           <Card className="w-full max-w-md rounded-[4rem] p-12 bg-white text-center space-y-8 animate-in zoom-in duration-300">
              <div className="w-24 h-24 bg-orange-100 text-orange-600 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-xl"><QrCode size={48} /></div>
              <div className="space-y-2">
                 <h3 className="text-3xl font-black italic uppercase tracking-tighter">Modo Check-in</h3>
                 <p className="text-slate-400 font-medium italic">Aponte a câmera para o QR Code do convite.</p>
              </div>
              <div className="aspect-square bg-slate-100 rounded-[3rem] border-4 border-slate-50 shadow-inner flex items-center justify-center relative overflow-hidden group">
                 <div className="absolute inset-0 bg-gradient-to-t from-orange-500/20 to-transparent animate-pulse" />
                 <span className="text-slate-300 font-black uppercase text-[10px] tracking-widest">Aguardando Captura...</span>
              </div>
              <button 
                onClick={() => setShowCheckinModal(false)}
                className="w-full py-6 bg-slate-950 text-white rounded-3xl font-black uppercase italic text-xs tracking-widest hover:bg-red-600 transition-all"
              >
                Encerrar Sessão
              </button>
           </Card>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
