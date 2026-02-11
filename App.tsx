
import React from 'react';
import { HashRouter } from 'react-router-dom';
import AppRouter from './routes/AppRouter';
import { useAuth } from './services/context/AuthContext';

const AppContent: React.FC = () => {
  const { isLoading } = useAuth();

  // 🔒 Loading seguro para evitar flashes indesejados
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-6">
        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin shadow-2xl shadow-orange-500/20" />
        <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.5em] animate-pulse">
          Iniciando Dex-Master
        </p>
      </div>
    );
  }

  return <AppRouter />;
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
};

export default App;
