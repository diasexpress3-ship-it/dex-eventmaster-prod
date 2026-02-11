import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/context/AuthContext';
import { UserRole, User } from '../types';

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Credenciais master exatas
      const MASTER_EMAIL = 'startbusiness26@gmail.com';
      const MASTER_PASSWORD = 'Sahombe13';

      // Tratamento rigoroso para evitar erros de digitação comuns
      const typedEmail = email.trim().toLowerCase();
      const typedPassword = password.trim();

      // Simulação rápida de rede para UX
      await new Promise(resolve => setTimeout(resolve, 800));

      if (typedEmail === MASTER_EMAIL && typedPassword === MASTER_PASSWORD) {
        const userData: User = {
          id: 'master-001',
          name: 'Administrador Master',
          email: MASTER_EMAIL,
          role: UserRole.ADMIN,
          isActive: true,
          createdAt: new Date().toISOString()
        };
        
        login(userData);
        
        // Navegação para a rota administrativa
        navigate('/admin/dashboard');
      } else {
        setError('Credenciais incorretas. Verifique o email e a senha.');
      }
    } catch (err) {
      setError('Ocorreu um erro no servidor de autenticação.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-[3rem] shadow-2xl p-10 w-full max-w-md border border-slate-200 animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-500 rounded-3xl mb-6 shadow-xl shadow-orange-500/20">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-slate-800 italic uppercase tracking-tighter leading-none">Acesso Master</h1>
          <p className="text-slate-500 mt-3 text-[10px] font-black uppercase tracking-widest">Dex-EventMaster Control Panel</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 animate-rsvp-shake">
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 italic">E-mail Administrativo</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all font-bold"
                placeholder="startbusiness26@gmail.com"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 italic">Senha Master</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all font-bold"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-slate-900 hover:bg-orange-500 text-white font-black py-5 px-6 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-orange-500/20 disabled:opacity-70 flex items-center justify-center gap-3 uppercase italic tracking-widest text-sm"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Validando Acesso...
              </>
            ) : (
              'Entrar no Painel'
            )}
          </button>

          <div className="pt-8 border-t border-slate-50 text-center">
             <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic leading-none">Digital Excellence Studio • Segurança Master</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
