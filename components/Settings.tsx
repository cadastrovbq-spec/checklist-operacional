import React, { useState, useEffect } from 'react';
import { DB } from '../services/db';
import { Sector, Task, ChecklistType } from '../types';
import { AdminGuard } from './AdminGuard';

export const Settings: React.FC = () => {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'SETORES' | 'TAREFAS'>('SETORES');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [secs, tsks] = await Promise.all([DB.getSectors(), DB.getTasks()]);
    setSectors(secs);
    setTasks(tsks);
    setLoading(false);
  };

  const handleAddSector = async () => {
    const name = prompt('Nome do novo setor:');
    if (!name) return;
    const { error } = await DB.saveSector(name);
    if (error) alert('Erro ao salvar setor.');
    else loadData();
  };

  const handleAddTask = async () => {
    if (sectors.length === 0) {
      alert('Crie um setor primeiro!');
      return;
    }

    const description = prompt('Descrição da tarefa (Ex: Limpar balcão):');
    if (!description) return;

    const sectorId = prompt('ID do Setor:\n' + sectors.map(s => `${s.id}: ${s.name}`).join('\n'));
    if (!sectorId || !sectors.find(s => s.id === sectorId)) {
      alert('Setor inválido');
      return;
    }

    const type = prompt('Tipo: Digite 1 para ABERTURA ou 2 para FECHAMENTO');
    const finalType: ChecklistType = type === '1' ? 'ABERTURA' : 'FECHAMENTO';

    const { error } = await DB.saveTask({
      sectorId,
      description,
      type: finalType
    });

    if (error) alert('Erro ao salvar tarefa.');
    else loadData();
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm('Excluir esta tarefa?')) return;
    await DB.deleteTask(id);
    loadData();
  };

  return (
    <AdminGuard>
      <div className="p-6 space-y-6 animate-fadeIn">
        <header className="flex justify-between items-center">
          <h2 className="text-2xl font-black">Configurações</h2>
          <div className="flex gap-2">
            {activeTab === 'SETORES' ? (
              <button onClick={handleAddSector} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase">+ NOVO SETOR</button>
            ) : (
              <button onClick={handleAddTask} className="bg-green-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase">+ NOVA TAREFA</button>
            )}
          </div>
        </header>

        <div className="flex bg-gray-900 p-1 rounded-2xl">
          <button 
            onClick={() => setActiveTab('SETORES')}
            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'SETORES' ? 'bg-gray-800 text-blue-500' : 'text-gray-500'}`}
          >
            Setores
          </button>
          <button 
            onClick={() => setActiveTab('TAREFAS')}
            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'TAREFAS' ? 'bg-gray-800 text-blue-500' : 'text-gray-500'}`}
          >
            Tarefas
          </button>
        </div>

        {loading ? (
          <div className="py-20 text-center text-gray-600 font-black animate-pulse text-xs">SINCRONIZANDO...</div>
        ) : activeTab === 'SETORES' ? (
          <div className="grid gap-3">
            {sectors.map(s => (
              <div key={s.id} className="p-4 bg-gray-900 border border-gray-800 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{s.icon}</span>
                  <div>
                    <p className="font-bold text-sm">{s.name}</p>
                    <p className="text-[8px] text-gray-500 font-black uppercase">ID: {s.id}</p>
                  </div>
                </div>
                <button onClick={() => DB.deleteSector(s.id).then(loadData)} className="text-red-500 p-2">🗑️</button>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {sectors.map(s => (
              <div key={s.id} className="space-y-3">
                <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] px-2">{s.name}</h3>
                <div className="grid gap-2">
                  {tasks.filter(t => t.sectorId === s.id).map(t => (
                    <div key={t.id} className="p-4 bg-gray-900 border border-gray-800 rounded-2xl flex items-center justify-between group">
                      <div className="flex-1">
                        <span className={`text-[8px] font-black px-2 py-0.5 rounded-full mr-2 ${t.type === 'ABERTURA' ? 'bg-orange-500/20 text-orange-500' : 'bg-blue-500/20 text-blue-500'}`}>
                          {t.type}
                        </span>
                        <span className="text-xs font-medium text-gray-200">{t.description}</span>
                      </div>
                      <button onClick={() => handleDeleteTask(t.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 p-1">✕</button>
                    </div>
                  ))}
                  {tasks.filter(t => t.sectorId === s.id).length === 0 && (
                    <p className="text-[10px] text-gray-700 italic px-2">Nenhuma tarefa para este setor.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminGuard>
  );
};