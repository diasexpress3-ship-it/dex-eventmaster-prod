
import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { 
  ShieldCheck, 
  UserPlus, 
  Trash2, 
  Mail, 
  Lock, 
  Shield, 
  User, 
  CheckCircle2,
  Key,
  Smartphone,
  Zap,
  Copy,
  UserCircle
} from 'lucide-react';
import { UserRole, User as UserType } from '../../types';

interface SystemUser extends UserType {
  identifier: string; // Email ou Telefone
  password?: string;
  isTemporary: boolean;
  createdAt: string;
}

const AccessControl: React.FC = () => {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [tempPassword, setTempPassword] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('dex_users');
    if (saved) {
      setUsers(JSON.parse(saved));
    } else {
      /* Fix: Added isActive to default admin user */
      const initial: SystemUser[] = [
        { 
          id: '1', 
          name: 'Administrador Master', 
          email: 'admin@eventmaster.com', 
          identifier: 'admin@eventmaster.com',
          role: UserRole.ADMIN, 
          isActive: true,
          isTemporary: false,
          createdAt: new Date().toISOString() 
        }
      ];
      setUsers(initial);
      localStorage.setItem('dex_users', JSON.stringify(initial));
    }
  }, []);

  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
    let pass = "";
    for (let i = 0; i < 8; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length));
    setTempPassword(pass);
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    /* Fix: Added isActive to new user object */
    const newUser: SystemUser = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.get('name') as string,
      email: formData.get('identifier') as string,
      identifier: formData.get('identifier') as string,
      role: formData.get('role') as UserRole,
      isActive: true,
      password: tempPassword || formData.get('password') as string,
      isTemporary: true,
      createdAt: new Date().toISOString()
    };

    const updated = [...users, newUser];
    setUsers(updated);
    localStorage.setItem('dex_users', JSON.stringify(updated));
    
    setIsModalOpen(false);
    setTempPassword('');
    showFeedback(`Acesso concedido para ${newUser.name}`);
  };

  const deleteUser = (id: string) => {
    if (id === '1') return alert('O Administrador Root não pode ser removido.');
    if (confirm('Deseja revogar o acesso deste utilizador?')) {
      const updated = users.filter(u => u.id !== id);
      setUsers(updated);
      localStorage.setItem('dex_users', JSON.stringify(updated));
      showFeedback('Acesso revogado com sucesso.');
    }
  };

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  const copyToClipboard = (text: string) => {
    // Fix: Using writeText instead of .text which is not part of the Clipboard API
    navigator.clipboard.writeText(text);
    showFeedback("Credenciais copiadas!");
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-slate-950 text-orange-500 rounded-3xl shadow-2xl ring-1 ring-white/10">
            <ShieldCheck size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic uppercase">Controle de Privilégios</h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.3em]">Gestão de Acessos de Clientes e Administradores</p>
          </div>
        </div>
        <Button onClick={() => { generatePassword(); setIsModalOpen(true); }} className="rounded-2xl gap-3 px-10 h-14 bg-slate-950 shadow-2xl shadow-slate-900/20 text-xs font-black uppercase tracking-widest italic">
          <UserPlus size={18} /> Atribuir Novo Perfil
        </Button>
      </div>

      {feedback && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[200] bg-slate-900 text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-4 animate-in slide-in-from-top-4 border border-white/10">
          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
            <CheckCircle2 size={18} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest">{feedback}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 rounded-[3.5rem] border-none shadow-2xl overflow-hidden p-0 bg-white">
          <div className="p-10 border-b bg-slate-50/50 flex items-center justify-between">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] italic">Base de Credenciais Ativas</h3>
            <div className="flex items-center gap-2 text-[10px] font-black text-orange-500 uppercase italic">
              <Zap size={14} className="animate-pulse" /> Sincronizado
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b">
                  <th className="px-10 py-5">Identidade</th>
                  <th className="px-10 py-5">Cargo / Nível</th>
                  <th className="px-10 py-5">Identificador Dex</th>
                  <th className="px-10 py-5 text-right">Controle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-all group">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-5">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black shadow-inner ${u.role === UserRole.ADMIN ? 'bg-slate-950 text-orange-500' : 'bg-orange-100 text-orange-600'}`}>
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-base italic">{u.name}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Membro Ativo</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="inline-flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
                        {u.role === UserRole.ADMIN ? <Shield size={14} className="text-orange-600" /> : <UserCircle size={14} className="text-slate-400" />}
                        <span className={`text-[10px] font-black uppercase tracking-widest ${u.role === UserRole.ADMIN ? 'text-orange-600' : 'text-slate-500'}`}>
                          {u.role}
                        </span>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-700">{u.identifier}</span>
                        {u.password && (
                           <button onClick={() => copyToClipboard(u.password!)} className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1 flex items-center gap-1 hover:text-orange-500 transition-colors">
                             <Lock size={10} /> Password Gerada <Copy size={10} />
                           </button>
                        )}
                      </div>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <button 
                        onClick={() => deleteUser(u.id)}
                        className={`p-4 rounded-2xl transition-all shadow-sm ${u.id === '1' ? 'text-slate-200 cursor-not-allowed' : 'text-slate-400 bg-white hover:bg-red-50 hover:text-red-500 hover:shadow-red-500/10 border border-slate-100'}`}
                      >
                        <Trash2 size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-8">
          <Card className="rounded-[3rem] bg-slate-950 text-white p-10 border-none relative overflow-hidden shadow-2xl group">
            <Key className="absolute -right-6 -bottom-6 text-white/5 group-hover:scale-110 transition-transform duration-1000" size={160} />
            <div className="relative z-10 space-y-6">
              <h4 className="text-2xl font-black italic tracking-tighter mb-4">Segurança Master Dex</h4>
              <p className="text-slate-400 text-xs leading-relaxed font-medium">
                Cada novo utilizador recebe uma <span className="text-orange-500 font-bold">Palavra-passe Temporária</span> encriptada. Recomenda-se que o utilizador altere a password no primeiro login.
              </p>
              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-orange-500">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                  Login Único por Sessão
                </div>
                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-orange-500">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                  Logs de Atividade em Tempo Real
                </div>
              </div>
            </div>
          </Card>

          <Card className="rounded-[3rem] p-10 border-none shadow-xl bg-white space-y-6 border border-slate-100">
             <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 shadow-inner">
                <Smartphone size={28} />
             </div>
             <h4 className="text-sm font-black uppercase tracking-[0.2em] text-slate-800 italic">Provisionamento de Cliente</h4>
             <p className="text-xs text-slate-500 font-medium leading-relaxed italic">Atribua credenciais de "Gestor" para seus clientes para que eles possam acompanhar os convidados e RSVP diretamente do telemóvel.</p>
          </Card>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <Card className="w-full max-w-xl shadow-[0_50px_100px_rgba(0,0,0,0.5)] rounded-[4rem] border-0 p-12 bg-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            <div className="space-y-10 relative z-10">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-slate-950 text-orange-500 rounded-[2rem] flex items-center justify-center shadow-2xl ring-4 ring-orange-500/10">
                  <UserPlus size={36} />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tighter italic">Novo Acesso Master</h3>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mt-1">Configuração Instantânea de Perfil</p>
                </div>
              </div>

              <form onSubmit={handleAddUser} className="space-y-6">
                <Input 
                  label="NOME COMPLETO DO UTILIZADOR" 
                  name="name" 
                  required 
                  placeholder="Ex: Dr. Marco André" 
                  className="rounded-3xl h-16 bg-slate-50 border-none px-6 font-bold text-slate-800 placeholder:text-slate-300" 
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Input 
                    label="IDENTIFICADOR (EMAIL/CELULAR)" 
                    name="identifier" 
                    required 
                    placeholder="E-mail ou Telemóvel" 
                    className="rounded-3xl h-16 bg-slate-50 border-none px-6 font-bold text-slate-800 placeholder:text-slate-300" 
                  />
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">CARGO / NÍVEL</label>
                    <select 
                      name="role" 
                      className="w-full h-16 px-6 bg-slate-50 border-none rounded-3xl text-xs font-black uppercase tracking-widest focus:ring-4 focus:ring-orange-500/10 transition-all outline-none appearance-none cursor-pointer"
                    >
                      <option value={UserRole.ADMIN}>Administrador Master</option>
                      <option value={UserRole.MANAGER}>Gestor (Cliente)</option>
                      <option value={UserRole.GUEST}>Apenas Visualização</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2 pt-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-2 italic">
                    <Key size={12} className="text-orange-500" /> Password Master Temporária
                  </label>
                  <div className="relative group">
                    <input 
                      type="text" 
                      value={tempPassword}
                      readOnly
                      placeholder="Gerando automaticamente..."
                      className="w-full h-16 px-6 bg-slate-950 text-orange-500 rounded-3xl font-mono text-lg font-black tracking-widest border-none shadow-2xl" 
                    />
                    <button 
                      type="button"
                      onClick={generatePassword}
                      className="absolute right-5 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-orange-500 hover:text-white rounded-2xl transition-all text-slate-400"
                      title="Gerar Nova Password"
                    >
                      <RefreshCw size={18} />
                    </button>
                  </div>
                  <p className="text-[9px] text-slate-400 font-bold italic px-2 mt-2 tracking-widest uppercase">Esta password deve ser fornecida ao utilizador para o seu primeiro acesso.</p>
                </div>

                <div className="flex justify-end gap-3 pt-10 border-t border-slate-100">
                  <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)} className="rounded-2xl px-10 h-14 uppercase text-[10px] font-black tracking-widest">Abortar</Button>
                  <Button variant="primary" type="submit" className="rounded-2xl px-12 h-14 bg-orange-600 shadow-2xl shadow-orange-500/30 text-[11px] font-black uppercase tracking-[0.2em] italic">Ativar Credenciais</Button>
                </div>
              </form>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

// Internal icon for refresh
const RefreshCw = ({ size, className = '' }: { size: number, className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
    <path d="M16 16h5v5" />
  </svg>
);

export default AccessControl;
