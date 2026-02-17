import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { DB } from '../services/db';
import { Sector, ChecklistType, Task } from '../types';

export const ChecklistForm: React.FC = () => {
  const navigate = useNavigate();
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [step, setStep] = useState(1);
  const [selectedSector, setSelectedSector] = useState<string>('');
  const [selectedType, setSelectedType] = useState<ChecklistType | ''>('');
  const [employeeName, setEmployeeName] = useState<string>('');
  
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([]);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [problemReport, setProblemReport] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadSectors();
  }, []);

  useEffect(() => {
    if (selectedSector && selectedType) {
      loadTasks();
    }
  }, [selectedSector, selectedType]);

  const loadSectors = async () => {
    setIsLoading(true);
    const data = await DB.getSectors();
    setSectors(data);
    setIsLoading(false);
  };

  const loadTasks = async () => {
    const data = await DB.getTasks(selectedSector);
    setTasks(data.filter(t => t.type === selectedType));
  };

  const handleToggleTask = (id: string) => {
    setCompletedTaskIds(prev => 
      prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!photoBase64) {
      alert('Capture a foto obrigatória do setor.');
      return;
    }

    if (tasks.length > 0 && completedTaskIds.length === 0) {
      if (!confirm('Você não marcou nenhuma tarefa. Deseja enviar assim mesmo?')) return;
    }

    setIsSubmitting(true);
    try {
      const photoUrl = await DB.uploadPhoto(photoBase64);
      if (!photoUrl) throw new Error('Erro no upload da imagem.');

      const { error } = await DB.saveRecord({
        setor_id: parseInt(selectedSector),
        funcionario: employeeName.trim(),
        tipo: selectedType as ChecklistType,
        url_foto: photoUrl,
        data: new Date().toISOString().split('T')[0],
        notas: notes,
        problemas: problemReport,
        tarefas_concluidas: completedTaskIds
      });

      if (error) throw error;

      alert('Checklist enviado com sucesso!');
      navigate('/reports');
    } catch (err: any) {
      console.error(err);
      alert('Erro ao salvar no banco de dados: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === 1) {
    return (
      <div className="p-6 space-y-6 animate-fadeIn">
        <h2 className="text-2xl font-black">Novo Registro</h2>
        <div className="space-y-6">
          <label className="block">
            <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-3 block">1. Local</span>
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
                  <span className="font-bold text-xs truncate">{s.name}</span>
                </button>
              ))}
            </div>
          </label>

          {selectedSector && (
            <div className="animate-slideUp space-y-4">
              <label className="block">
                <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-3 block">2. Turno</span>
                <div className="flex gap-3">
                  {(['ABERTURA', 'FECHAMENTO'] as ChecklistType[]).map(type => (
                    <button
                      key={type}
                      onClick={() => setSelectedType(type)}
                      className={`flex-1 p-4 rounded-2xl border transition-all font-black text-xs ${
                        selectedType === type ? 'border-blue-500 bg-blue-500/10 text-blue-500' : 'border-gray-800 bg-gray-900 text-gray-400'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </label>

              <label className="block">
                <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-3 block">3. Identificação</span>
                <input
                  type="text"
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                  placeholder="Seu nome"
                  className="w-full bg-gray-900 border border-gray-800 rounded-2xl p-4 font-bold text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </label>
            </div>
          )}
        </div>

        <button
          disabled={!selectedSector || !selectedType || !employeeName.trim()}
          onClick={() => setStep(2)}
          className="w-full bg-blue-600 disabled:opacity-50 text-white font-black py-5 rounded-2xl uppercase tracking-widest text-sm shadow-xl shadow-blue-900/20 active:scale-95 transition-all"
        >
          Ir para Checklist
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fadeIn">
      <header className="flex items-center justify-between">
        <button onClick={() => setStep(1)} className="text-gray-500 text-xs font-black uppercase tracking-widest flex items-center gap-1">← Voltar</button>
        <div className="text-right">
          <p className="text-[8px] text-gray-600 uppercase font-black">{sectors.find(s => s.id === selectedSector)?.name}</p>
          <p className="text-sm font-black text-blue-500">{selectedType}</p>
        </div>
      </header>

      <section className="space-y-4">
        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Itens de Verificação</h3>
        <div className="space-y-2">
          {tasks.length > 0 ? (
            tasks.map(task => (
              <div 
                key={task.id} 
                onClick={() => handleToggleTask(task.id)}
                className={`p-4 rounded-2xl border transition-all flex items-center gap-3 cursor-pointer ${
                  completedTaskIds.includes(task.id) ? 'bg-green-500/10 border-green-500/50' : 'bg-gray-900 border-gray-800 hover:border-gray-700'
                }`}
              >
                <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${
                  completedTaskIds.includes(task.id) ? 'bg-green-500 border-green-500' : 'border-gray-700 bg-gray-950'
                }`}>
                  {completedTaskIds.includes(task.id) && <span className="text-white text-xs">✓</span>}
                </div>
                <span className={`text-xs font-bold ${completedTaskIds.includes(task.id) ? 'text-green-200' : 'text-gray-400'}`}>
                  {task.description}
                </span>
              </div>
            ))
          ) : (
            <p className="py-8 text-center bg-gray-900/50 rounded-3xl border border-gray-800 border-dashed text-gray-600 italic text-xs px-10">
              Nenhuma tarefa específica para este turno. Capture a foto para prosseguir.
            </p>
          )}
        </div>
      </section>

      <div 
        onClick={() => !isSubmitting && fileInputRef.current?.click()}
        className={`relative w-full aspect-video bg-gray-900 border-2 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all ${
          photoBase64 ? 'border-blue-500/50' : 'border-gray-800 hover:border-gray-700'
        }`}
      >
        {photoBase64 ? (
          <img src={photoBase64} className="w-full h-full object-cover" />
        ) : (
          <div className="text-center">
            <span className="text-4xl mb-2 block">📸</span>
            <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">FOTO OBRIGATÓRIA</span>
          </div>
        )}
        <input type="file" accept="image/*" capture="environment" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
      </div>

      <div className="space-y-4">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notas adicionais (opcional)..."
          className="w-full bg-gray-900 border border-gray-800 rounded-2xl p-4 h-20 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
        <textarea
          value={problemReport}
          onChange={(e) => setProblemReport(e.target.value)}
          placeholder="Relatar Problemas ou Manutenção (se houver)..."
          className="w-full bg-red-950/10 border border-red-900/20 rounded-2xl p-4 h-20 text-sm text-red-200 focus:outline-none focus:ring-2 focus:ring-red-500/20"
        />
      </div>

      <button
        disabled={isSubmitting || !photoBase64}
        onClick={handleSubmit}
        className={`w-full py-5 rounded-2xl font-black transition-all uppercase tracking-widest text-sm flex items-center justify-center gap-3 ${
          isSubmitting ? 'bg-gray-800 text-gray-600 cursor-not-allowed' : 'bg-green-600 text-white shadow-xl shadow-green-900/20 hover:bg-green-500'
        }`}
      >
        {isSubmitting ? (
          <>
            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            ENVIANDO...
          </>
        ) : 'Finalizar Registro ✓'}
      </button>
    </div>
  );
};