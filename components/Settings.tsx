import React, { useState, useEffect } from 'react';
import { DB } from '../services/db';
import { Sector } from '../types';
import { AdminGuard } from './AdminGuard';

export const Settings: React.FC = () => {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSectors();
  }, []);

  const loadSectors = async () => {
    setLoading(true);
    const data = await DB.getSectors();
    setSectors(data);
    setLoading(false);
  };

  const handleAddSector = async () => {
    const name = prompt('Nome do novo setor:');
    if (!name) return;
    
    const { error } = await DB.saveSector(name);
    if (error) alert('Erro no Supabase ao salvar.');
    else loadSectors();
  };

  const handleRemoveSector = async (id: string) => {
    if (!confirm('Deseja excluir este setor?')) return;
    const { error } = await DB.deleteSector(id);
    if (error) alert('Erro: Verifique se existem fotos vinculadas a este setor.');
    else loadSectors();
  };

  return (
    <AdminGuard>
      <div className="p-6 space-y-6 animate-fadeIn">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-black">Ajustes VBQ</h2>
          <button 
            onClick={handleAddSector}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-[10px] font-black shadow-lg shadow-blue-900/20"
          >
            + NOVO SETOR
          </button>
        </div>
        
        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4">Setores Ativos (Banco de Dados)</h3>
          
          {loading ? (
            <div className="py-20 text-center text-gray-600 font-black animate-pulse text-xs">CARREGANDO...</div>
          ) : (
            <div className="grid gap-3">
              {sectors.map(s => (
                <div key={s.id} className="p-4 bg-gray-900 border border-gray-800 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{s.icon}</span>
                    <span className="font-bold">{s.name}</span>
                  </div>
                  <button 
                    onClick={() => handleRemoveSector(s.id)}
                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    🗑️
                  </button>
                </div>
              ))}
              {sectors.length === 0 && (
                <p className="text-center py-10 text-gray-700 italic">Nenhum setor encontrado.</p>
              )}
            </div>
          )}
        </section>

        <section className="bg-blue-950/20 border border-blue-500/20 p-6 rounded-[2rem] mt-12">
          <h4 className="text-blue-400 font-black text-xs mb-3 uppercase tracking-widest">Status do Backend</h4>
          <div className="flex items-center gap-2 text-[10px] text-blue-200/60 font-medium">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            CONECTADO AO PROJETO AMCQYXKKUFMJHEAANZNN
          </div>
          <p className="mt-4 text-[9px] text-gray-500 leading-relaxed uppercase tracking-widest">
            A senha de acesso administrativo é definida via código para garantir a integridade operacional do sistema VBQ.
          </p>
        </section>
      </div>
    </AdminGuard>
  );
};