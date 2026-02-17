
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { DB } from '../services/db';
import { Sector, Task, ChecklistType, ChecklistRecord } from '../types';

export const ChecklistForm: React.FC = () => {
  const navigate = useNavigate();
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);

  const [step, setStep] = useState(1);
  const [selectedSector, setSelectedSector] = useState<string>('');
  const [selectedType, setSelectedType] = useState<ChecklistType | ''>('');
  const [employeeName, setEmployeeName] = useState<string>('');
  
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([]);
  const [taskPhotos, setTaskPhotos] = useState<{ [taskId: string]: string[] }>({});
  const [notes, setNotes] = useState('');
  const [problemReport, setProblemReport] = useState('');
  const [generalPhotos, setGeneralPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const taskFileInputRef = useRef<HTMLInputElement>(null);
  const [activeTaskIdForUpload, setActiveTaskIdForUpload] = useState<string | null>(null);

  useEffect(() => {
    setSectors(DB.getSectors());
    setAllTasks(DB.getTasks());
  }, []);

  const currentTasks = allTasks.filter(t => t.sectorId === selectedSector && t.type === selectedType);

  const toggleTask = (id: string) => {
    setCompletedTaskIds(prev => 
      prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]
    );
  };

  const handleTaskPhotoUpload = (taskId: string) => {
    setActiveTaskIdForUpload(taskId);
    taskFileInputRef.current?.click();
  };

  const onTaskFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    const taskId = activeTaskIdForUpload;
    if (files && taskId) {
      Array.from(files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setTaskPhotos(prev => ({
            ...prev,
            [taskId]: [...(prev[taskId] || []), reader.result as string]
          }));
          // Auto-complete task if photo is added
          if (!completedTaskIds.includes(taskId)) {
            setCompletedTaskIds(prev => [...prev, taskId]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
    // Reset
    if (e.target) e.target.value = '';
  };

  const handleGeneralPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setGeneralPhotos(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleSubmit = () => {
    if (!selectedSector || !selectedType || !employeeName.trim()) return;

    setIsSubmitting(true);
    const newRecord: ChecklistRecord = {
      id: Math.random().toString(36).substr(2, 9),
      sectorId: selectedSector,
      employeeName: employeeName.trim(),
      type: selectedType,
      date: new Date().toISOString().split('T')[0],
      timestamp: Date.now(),
      completedTasks: completedTaskIds,
      taskPhotos: taskPhotos,
      notes,
      problemReport,
      photos: generalPhotos,
      status: 'CONCLUIDO',
    };

    DB.saveRecord(newRecord);
    setTimeout(() => {
      setIsSubmitting(false);
      navigate('/reports');
    }, 1000);
  };

  if (step === 1) {
    return (
      <div className="p-6 space-y-6 animate-fadeIn">
        <h2 className="text-2xl font-bold">Iniciar Checklist</h2>
        <div className="space-y-4">
          <label className="block">
            <span className="text-gray-400 text-sm font-medium mb-2 block uppercase tracking-wider">1. Selecione o Setor</span>
            <div className="grid grid-cols-2 gap-3">
              {sectors.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSector(s.id)}
                  className={`p-4 rounded-2xl border transition-all text-left flex items-center gap-3 ${
                    selectedSector === s.id ? 'border-blue-500 bg-blue-500/10 ring-2 ring-blue-500/20' : 'border-gray-800 bg-gray-900 hover:border-gray-700'
                  }`}
                >
                  <span className="text-2xl">{s.icon}</span>
                  <span className="font-semibold">{s.name}</span>
                </button>
              ))}
            </div>
          </label>

          {selectedSector && (
            <label className="block animate-slideUp">
              <span className="text-gray-400 text-sm font-medium mb-2 block uppercase tracking-wider">2. Tipo de Checklist</span>
              <div className="flex gap-3">
                {(['ABERTURA', 'FECHAMENTO'] as ChecklistType[]).map(type => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`flex-1 p-4 rounded-2xl border transition-all font-bold ${
                      selectedType === type ? 'border-blue-500 bg-blue-500/10 text-blue-500' : 'border-gray-800 bg-gray-900 text-gray-400 hover:border-gray-700'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </label>
          )}

          {selectedType && (
            <label className="block animate-slideUp">
              <span className="text-gray-400 text-sm font-medium mb-2 block uppercase tracking-wider">3. Seu Nome (Responsável)</span>
              <input
                type="text"
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                placeholder="Quem está realizando o checklist?"
                className="w-full bg-gray-900 border border-gray-800 rounded-2xl p-4 font-semibold text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </label>
          )}
        </div>

        <button
          disabled={!selectedSector || !selectedType || !employeeName.trim()}
          onClick={() => setStep(2)}
          className="w-full bg-blue-600 disabled:opacity-50 disabled:bg-gray-800 text-white font-bold py-5 rounded-2xl shadow-xl shadow-blue-900/20 transition-all active:scale-95"
        >
          PRÓXIMO PASSO
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fadeIn">
      <input 
        type="file" 
        accept="image/*" 
        ref={taskFileInputRef} 
        onChange={onTaskFileChange} 
        className="hidden" 
      />

      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setStep(1)} className="text-gray-400 font-medium flex items-center gap-1 hover:text-white transition-colors">
          <span>←</span> Voltar
        </button>
        <div className="text-right">
          <p className="text-xs text-gray-500 uppercase font-bold">{sectors.find(s => s.id === selectedSector)?.name}</p>
          <p className="text-lg font-bold text-blue-500">{selectedType}</p>
        </div>
      </div>

      <section className="space-y-3">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex justify-between items-center">
          Tarefas ({completedTaskIds.length}/{currentTasks.length})
          <button 
            onClick={() => setCompletedTaskIds(currentTasks.map(t => t.id))} 
            className="text-[10px] text-blue-500 bg-blue-500/10 px-2 py-1 rounded"
          >
            MARCAR TODAS
          </button>
        </h3>
        {currentTasks.length === 0 ? (
          <div className="p-10 text-center bg-gray-900 border border-dashed border-gray-800 rounded-2xl text-gray-500">
            Nenhuma tarefa cadastrada. Vá em Ajustes para adicionar.
          </div>
        ) : (
          <div className="grid gap-3">
            {currentTasks.map(task => (
              <div key={task.id} className="flex flex-col gap-2">
                <div className={`p-4 rounded-xl border flex items-center gap-4 transition-all ${
                  completedTaskIds.includes(task.id) 
                    ? 'border-green-500/30 bg-green-500/5' 
                    : 'border-gray-800 bg-gray-900'
                }`}>
                  <button
                    onClick={() => toggleTask(task.id)}
                    className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                      completedTaskIds.includes(task.id) ? 'bg-green-500 border-green-500 text-white' : 'border-gray-700'
                    }`}
                  >
                    {completedTaskIds.includes(task.id) && <span>✓</span>}
                  </button>
                  <span className={`flex-1 text-sm font-medium ${completedTaskIds.includes(task.id) ? 'text-gray-400' : 'text-gray-200'}`}>
                    {task.description}
                  </span>
                  <button 
                    onClick={() => handleTaskPhotoUpload(task.id)}
                    className={`p-2 rounded-lg border border-gray-700 hover:bg-gray-800 transition-colors ${taskPhotos[task.id]?.length > 0 ? 'text-blue-500 border-blue-500/50 bg-blue-500/10' : 'text-gray-500'}`}
                  >
                    📸
                  </button>
                </div>
                {taskPhotos[task.id] && taskPhotos[task.id].length > 0 && (
                  <div className="flex gap-2 px-2 overflow-x-auto pb-2">
                    {taskPhotos[task.id].map((p, idx) => (
                      <div key={idx} className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border border-gray-800">
                        <img src={p} className="w-full h-full object-cover" />
                        <button 
                          onClick={() => setTaskPhotos(prev => ({
                            ...prev,
                            [task.id]: prev[task.id].filter((_, i) => i !== idx)
                          }))}
                          className="absolute top-0 right-0 bg-red-600 text-white w-4 h-4 text-[8px] flex items-center justify-center rounded-bl-lg"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4 pt-4 border-t border-gray-800">
        <label className="block">
          <span className="text-sm font-bold text-gray-400 uppercase tracking-widest block mb-2">Observações Gerais</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Algum detalhe relevante sobre o turno?"
            className="w-full bg-gray-900 border border-gray-800 rounded-xl p-4 h-24 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
          />
        </label>

        <label className="block">
          <span className="text-sm font-bold text-red-500 uppercase tracking-widest block mb-2 flex items-center gap-2">
            ⚠️ Registro de Problemas
          </span>
          <textarea
            value={problemReport}
            onChange={(e) => setProblemReport(e.target.value)}
            placeholder="Descreva equipamentos com defeito ou outras falhas..."
            className="w-full bg-red-950/10 border border-red-500/20 rounded-xl p-4 h-24 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:outline-none text-red-200 placeholder-red-700"
          />
        </label>

        <div>
          <span className="text-sm font-bold text-gray-400 uppercase tracking-widest block mb-3">Outras Fotos (Gerais)</span>
          <div className="grid grid-cols-4 gap-2 mb-4">
            {generalPhotos.map((p, i) => (
              <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-gray-800 group">
                <img src={p} className="w-full h-full object-cover" />
                <button 
                  onClick={() => setGeneralPhotos(prev => prev.filter((_, idx) => idx !== i))}
                  className="absolute top-1 right-1 bg-red-600 text-white w-5 h-5 rounded-full text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ✕
                </button>
              </div>
            ))}
            <label className="aspect-square bg-gray-800 border-2 border-dashed border-gray-700 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-700 transition-colors">
              <span className="text-2xl">📸</span>
              <span className="text-[10px] text-gray-400 mt-1 uppercase">Extra</span>
              <input type="file" accept="image/*" multiple onChange={handleGeneralPhotoUpload} className="hidden" />
            </label>
          </div>
        </div>
      </section>

      <button
        disabled={isSubmitting}
        onClick={handleSubmit}
        className={`w-full py-5 rounded-2xl shadow-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${
          isSubmitting ? 'bg-gray-800 text-gray-500' : 'bg-green-600 text-white shadow-green-900/20'
        }`}
      >
        {isSubmitting ? 'SALVANDO...' : 'FINALIZAR CHECKLIST ✓'}
      </button>
    </div>
  );
};
