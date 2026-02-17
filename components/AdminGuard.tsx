import React, { useState, useEffect } from 'react';

const ADMIN_PASSWORD = '20262';

export const AdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    sessionStorage.getItem('cm_admin_auth') === 'true'
  );
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(sessionStorage.getItem('cm_admin_auth') === 'true');
    };
    // Sincroniza estado entre componentes quando a autenticação muda
    window.addEventListener('storage', checkAuth);
    const interval = setInterval(checkAuth, 1000);
    return () => {
      window.removeEventListener('storage', checkAuth);
      clearInterval(interval);
    };
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem('cm_admin_auth', 'true');
      setIsAuthenticated(true);
      setError(false);
      window.dispatchEvent(new Event('storage'));
    } else {
      setError(true);
      setPassword('');
      setTimeout(() => setError(false), 2000);
    }
  };

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 animate-fadeIn">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 p-8 rounded-[2.5rem] shadow-2xl text-center space-y-6">
        <div className="w-20 h-20 bg-blue-600/10 text-blue-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
          🔒
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Área do Gestor</h2>
          <p className="text-gray-500 text-sm mt-2 font-medium">
            Digite a senha para acessar relatórios e configurações.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="password"
            inputMode="numeric"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="•••••"
            autoFocus
            className={`w-full bg-gray-950 border ${
              error ? 'border-red-500 ring-2 ring-red-500/20 animate-shake' : 'border-gray-800'
            } rounded-2xl p-5 text-center text-3xl tracking-[0.5em] font-bold text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all`}
          />
          
          {error && (
            <p className="text-red-500 text-xs font-bold uppercase tracking-widest">
              Senha Incorreta
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-900/20 transition-all active:scale-95"
          >
            LIBERAR ACESSO
          </button>
        </form>
        
        <button 
          onClick={() => window.history.back()}
          className="text-gray-500 text-xs font-bold hover:text-gray-300 uppercase tracking-widest"
        >
          Voltar
        </button>
      </div>
    </div>
  );
};