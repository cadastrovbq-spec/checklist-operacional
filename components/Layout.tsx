
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const NavItem: React.FC<{ 
  icon: string; 
  label: string; 
  path: string; 
  active: boolean;
  onClick: () => void;
}> = ({ icon, label, path, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center py-2 px-1 transition-colors ${
      active ? 'text-blue-500' : 'text-gray-400 hover:text-gray-200'
    }`}
  >
    <span className="text-2xl mb-1">{icon}</span>
    <span className="text-[10px] font-medium uppercase tracking-wider">{label}</span>
  </button>
);

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="flex flex-col min-h-screen max-w-5xl mx-auto border-x border-gray-800 bg-gray-950">
      <header className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-md border-b border-gray-800 p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">C</div>
          <h1 className="text-xl font-bold tracking-tight">CheckMaster <span className="text-blue-500">Pro</span></h1>
        </div>
        <div className="text-sm text-gray-400 font-medium">
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
      </header>

      <main className="flex-1 pb-24 overflow-y-auto">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 max-w-5xl mx-auto bg-gray-900 border-t border-gray-800 px-6 py-2 grid grid-cols-4 gap-2 z-50 shadow-2xl">
        <NavItem 
          icon="📊" 
          label="Dashboard" 
          path="/" 
          active={location.pathname === '/'} 
          onClick={() => navigate('/')} 
        />
        <NavItem 
          icon="✅" 
          label="Novo" 
          path="/check" 
          active={location.pathname.startsWith('/check')} 
          onClick={() => navigate('/check')} 
        />
        <NavItem 
          icon="📋" 
          label="Relatórios" 
          path="/reports" 
          active={location.pathname === '/reports'} 
          onClick={() => navigate('/reports')} 
        />
        <NavItem 
          icon="⚙️" 
          label="Ajustes" 
          path="/settings" 
          active={location.pathname === '/settings'} 
          onClick={() => navigate('/settings')} 
        />
      </nav>
    </div>
  );
};
