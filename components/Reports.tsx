
import React, { useState, useEffect } from 'react';
import { DB } from '../services/db';
import { ChecklistRecord, Sector, Task } from '../types';
import { getManagerInsight } from '../geminiService';
import { AdminGuard } from './AdminGuard';

export const Reports: React.FC = () => {
  const [records, setRecords] = useState<ChecklistRecord[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<ChecklistRecord | null>(null);
  const [insight, setInsight] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [viewingPhoto, setViewingPhoto] = useState<string | null>(null);

  useEffect(() => {
    setRecords(DB.getRecords());
    setSectors(DB.getSectors());
    setTasks(DB.getTasks());
  }, []);

  const handleReview = (id: string, status: ChecklistRecord['status']) => {
    const record = records.find(r => r.id === id);
    if (!record) return;
    const updated = { ...record, status };
    DB.updateRecord(updated);
    setRecords(DB.getRecords());
    if (selectedRecord?.id === id) setSelectedRecord(updated);
  };

  const generateInsight = async (rec: ChecklistRecord) => {
    setIsAnalyzing(true);
    setInsight(null);
    const sector = sectors.find(s => s.id === rec.sectorId);
    const sectorTasks = tasks.filter(t => t.sectorId === rec.sectorId && t.type === rec.type);
    if (sector) {
      const text = await getManagerInsight(rec, sector, sectorTasks);
      setInsight(text);
    }
    setIsAnalyzing(false);
  };

  return (
    <AdminGuard>
      <div className="p-6 space-y-6 animate-fadeIn">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <span>📋</span> Histórico de Realizados
        </h2>

        {records.length === 0 ? (
          <div className="p-20 text-center bg-gray-900 border border-gray-800 rounded-3xl text-gray-500">
            Nenhum checklist registrado até o momento.
          </div>
        ) : (
          <div className="grid gap-4">
            {records.map(rec => {
              const sector = sectors.find(s => s.id === rec.sectorId);
              return (
                <div 
                  key={rec.id} 
                  className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-600 transition-colors cursor-pointer group"
                  onClick={() => {
                    setSelectedRecord(rec);
                    setInsight(null);
                  }}
                >
                  <div className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                      {sector?.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-gray-100">{sector?.name} - {rec.type}</h4>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded ${
                          rec.status === 'CONCLUIDO' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {rec.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Responsável: <span className="text-gray-200 font-medium">{rec.employeeName}</span>
                      </p>
                      <p className="text-[10px] text-gray-500 uppercase mt-1">
                        {new Date(rec.timestamp).toLocaleDateString('pt-BR')} às {new Date(rec.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal Detalhes */}
        {selectedRecord && (
          <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 backdrop-blur-md">
            <div className="bg-gray-950 w-full max-w-3xl max-h-[95vh] rounded-[2.5rem] overflow-hidden flex flex-col animate-scaleUp shadow-2xl border border-gray-800">
              <div className="p-8 border-b border-gray-800 flex justify-between items-center bg-gray-950/50 backdrop-blur-xl">
                <div>
                  <h3 className="text-2xl font-bold">Relatório Operacional</h3>
                  <p className="text-xs text-blue-500 font-bold uppercase tracking-widest mt-1">
                    {sectors.find(s => s.id === selectedRecord.sectorId)?.name} • {selectedRecord.type}
                  </p>
                </div>
                <button onClick={() => setSelectedRecord(null)} className="text-2xl text-gray-500 hover:text-white transition-colors w-12 h-12 flex items-center justify-center rounded-full hover:bg-gray-800">✕</button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                {/* Header Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-900 border border-gray-800 rounded-3xl text-center">
                    <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Conformidade</p>
                    <p className="text-3xl font-black text-blue-500">
                      {Math.round((selectedRecord.completedTasks.length / tasks.filter(t => t.sectorId === selectedRecord.sectorId && t.type === selectedRecord.type).length) * 100 || 0)}%
                    </p>
                  </div>
                  <div className="p-4 bg-gray-900 border border-gray-800 rounded-3xl text-center col-span-2 flex flex-col justify-center">
                    <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Responsável pelo Turno</p>
                    <p className="text-lg font-bold text-gray-100">{selectedRecord.employeeName}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-black text-gray-500 uppercase tracking-widest">Evidências por Tarefa</h4>
                    <span className="text-[10px] text-gray-600 italic">Clique nas fotos para ampliar</span>
                  </div>
                  <div className="grid gap-4">
                    {tasks
                      .filter(t => t.sectorId === selectedRecord.sectorId && t.type === selectedRecord.type)
                      .map(task => {
                        const isCompleted = selectedRecord.completedTasks.includes(task.id);
                        const tPhotos = selectedRecord.taskPhotos?.[task.id] || [];
                        
                        return (
                          <div key={task.id} className={`p-5 rounded-[2rem] border transition-all ${
                            isCompleted 
                              ? 'bg-gray-900/40 border-gray-800' 
                              : 'bg-red-500/5 border-red-900/30 grayscale opacity-60'
                          }`}>
                            <div className="flex items-start gap-4 mb-3">
                              <div className={`mt-1 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                                isCompleted ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                              }`}>
                                <span className="text-[10px] font-bold">{isCompleted ? '✓' : '✕'}</span>
                              </div>
                              <div className="flex-1">
                                <p className={`text-sm font-bold ${isCompleted ? 'text-gray-200' : 'text-gray-500'}`}>
                                  {task.description}
                                </p>
                              </div>
                              {tPhotos.length > 0 && (
                                <span className="bg-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                  {tPhotos.length} {tPhotos.length === 1 ? 'Foto' : 'Fotos'}
                                </span>
                              )}
                            </div>
                            
                            {tPhotos.length > 0 && (
                              <div className="grid grid-cols-4 gap-2 mt-4 p-2 bg-gray-950/50 rounded-2xl border border-gray-800/50">
                                {tPhotos.map((img, idx) => (
                                  <div 
                                    key={idx} 
                                    className="aspect-square rounded-xl overflow-hidden border border-gray-800 cursor-pointer hover:border-blue-500 hover:scale-[1.05] transition-all shadow-lg"
                                    onClick={() => setViewingPhoto(img)}
                                  >
                                    <img src={img} className="w-full h-full object-cover" loading="lazy" />
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedRecord.notes && (
                    <div className="p-6 bg-gray-900 border border-gray-800 rounded-3xl">
                      <p className="text-xs font-bold text-gray-500 uppercase mb-3">📝 Observações</p>
                      <p className="text-sm text-gray-300 italic">"{selectedRecord.notes}"</p>
                    </div>
                  )}

                  {selectedRecord.problemReport && (
                    <div className="p-6 bg-red-950/20 border border-red-500/20 rounded-3xl">
                      <p className="text-xs font-bold text-red-500 uppercase mb-3 flex items-center gap-2">
                        <span>⚠️</span> Problemas Reportados
                      </p>
                      <p className="text-sm text-red-200 leading-relaxed font-bold">{selectedRecord.problemReport}</p>
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t border-gray-800">
                  <button 
                    onClick={() => generateInsight(selectedRecord)}
                    disabled={isAnalyzing}
                    className="w-full bg-blue-600 text-white p-5 rounded-3xl font-black mb-4 hover:bg-blue-500 transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-900/20 active:scale-[0.98]"
                  >
                    {isAnalyzing ? (
                      <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <span className="text-xl">✨</span>
                        <span>GERAR INSIGHT DE OPERAÇÃO</span>
                      </>
                    )}
                  </button>
                  {insight && (
                    <div className="p-6 bg-blue-950/20 border border-blue-500/20 rounded-3xl text-sm italic leading-relaxed text-blue-200 animate-slideUp">
                      {insight}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 border-t border-gray-800 bg-gray-950/80 backdrop-blur-xl grid grid-cols-2 gap-4">
                <button 
                  onClick={() => handleReview(selectedRecord.id, 'REVISAO_SOLICITADA')}
                  className="p-4 bg-gray-900 text-red-500 rounded-2xl font-bold text-sm border border-red-500/20 hover:bg-red-500/10 transition-colors"
                >
                  Solicitar Refação
                </button>
                <button 
                  onClick={() => handleReview(selectedRecord.id, 'CONCLUIDO')}
                  className="p-4 bg-green-600 text-white rounded-2xl font-black text-sm hover:bg-green-500 transition-all shadow-lg shadow-green-900/20"
                >
                  Aprovar Operação ✓
                </button>
              </div>
            </div>
          </div>
        )}

        {viewingPhoto && (
          <div 
            className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4 animate-fadeIn backdrop-blur-xl"
            onClick={() => setViewingPhoto(null)}
          >
            <button 
              className="absolute top-8 right-8 text-white text-5xl hover:text-gray-400 z-[210] transition-colors"
              onClick={() => setViewingPhoto(null)}
            >
              ✕
            </button>
            <img 
              src={viewingPhoto} 
              className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl animate-scaleUp border border-white/10" 
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </div>
    </AdminGuard>
  );
};
