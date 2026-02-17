
import React, { useState, useEffect } from 'react';
import { DB } from '../services/db';
import { Sector, Task, ChecklistType } from '../types';

export const Settings: React.FC = () => {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState<'SETORES' | 'TAREFAS'>('SETORES');

  // New task form state
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskSector, setNewTaskSector] = useState('');
  const [newTaskType, setNewTaskType] = useState<ChecklistType>('ABERTURA');

  useEffect(() => {
    setSectors(DB.getSectors());
    setTasks(DB.getTasks());
  }, []);

  const addSector = () => {
    const name = prompt('Nome do Setor:');
    if (!name) return;
    const newSectors = [...sectors, { id: Date.now().toString(), name, icon: '📁' }];
    setSectors(newSectors);
    DB.saveSectors(newSectors);
  };

  const removeSector = (id: string) => {
    if (!confirm('Excluir este setor e todos os dados relacionados?')) return;
    const filtered = sectors.filter(s => s.id !== id);
    setSectors(filtered);
    DB.saveSectors(filtered);
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskDesc.trim() || !newTaskSector) return;

    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      sectorId: newTaskSector,
      type: newTaskType,
      description: newTaskDesc.trim()
    };

    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    DB.saveTasks(updatedTasks);
    
    // Reset form
    setNewTaskDesc('');
  };

  const removeTask = (id: string) => {
    if (!confirm('Excluir esta tarefa?')) return;
    const filtered = tasks.filter(t => t.id !== id);
    setTasks(filtered);
    DB.saveTasks(filtered);
  };

  return (
    <div className="p-6 space-y-6 animate-fadeIn">
      <h2 className="text-2xl font-bold">Configurações</h2>
      
      <div className="flex bg-gray-900 p-1 rounded-2xl border border-gray-800">
        {(['SETORES', 'TAREFAS'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 rounded-xl text-[10px] font-bold tracking-widest transition-all ${
              activeTab === tab ? 'bg-gray-800 text-blue-500 shadow-lg' : 'text-gray-500'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <section className="space-y-4">
        {activeTab === 'SETORES' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-bold text-gray-500 uppercase">Gerenciar Setores</h3>
              <button onClick={addSector} className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-bold">+ ADICIONAR</button>
            </div>
            {sectors.map(s => (
              <div key={s.id} className="p-4 bg-gray-900 border border-gray-800 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{s.icon}</span>
                  <span className="font-semibold">{s.name}</span>
                </div>
                <button onClick={() => removeSector(s.id)} className="text-red-500 text-xs font-bold p-2">Remover</button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'TAREFAS' && (
          <div className="space-y-6">
            <section className="bg-gray-900/50 p-5 rounded-3xl border border-gray-800 space-y-4">
              <h3 className="text-sm font-bold text-blue-500 uppercase tracking-widest">Nova Tarefa</h3>
              <form onSubmit={addTask} className="space-y-4">
                <input
                  type="text"
                  placeholder="Descrição da tarefa..."
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={newTaskSector}
                    onChange={(e) => setNewTaskSector(e.target.value)}
                    className="bg-gray-950 border border-gray-800 rounded-xl p-3 text-sm focus:outline-none"
                  >
                    <option value="">Selecione o Setor</option>
                    {sectors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  <select
                    value={newTaskType}
                    onChange={(e) => setNewTaskType(e.target.value as ChecklistType)}
                    className="bg-gray-950 border border-gray-800 rounded-xl p-3 text-sm focus:outline-none"
                  >
                    <option value="ABERTURA">Abertura</option>
                    <option value="FECHAMENTO">Fechamento</option>
                  </select>
                </div>
                <button 
                  type="submit"
                  disabled={!newTaskDesc.trim() || !newTaskSector}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-600 text-white font-bold p-3 rounded-xl text-xs transition-colors"
                >
                  SALVAR NOVA TAREFA
                </button>
              </form>
            </section>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Lista de Tarefas ({tasks.length})</h3>
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                {tasks.length === 0 && <p className="text-center text-gray-600 text-xs py-10">Nenhuma tarefa cadastrada.</p>}
                {tasks.slice().reverse().map(t => (
                  <div key={t.id} className="p-4 bg-gray-900 border border-gray-800 rounded-2xl flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${t.type === 'ABERTURA' ? 'bg-blue-500' : 'bg-orange-500'}`}></div>
                      <div>
                        <p className="text-sm font-medium">{t.description}</p>
                        <p className="text-[10px] text-gray-500 uppercase">{sectors.find(s => s.id === t.sectorId)?.name} • {t.type}</p>
                      </div>
                    </div>
                    <button onClick={() => removeTask(t.id)} className="text-red-500 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity p-2">
                      Excluir
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
