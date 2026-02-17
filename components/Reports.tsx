import React, { useState, useEffect } from 'react';
import { DB } from '../services/db';
import { ChecklistRecord, Sector } from '../types';
import { AdminGuard } from './AdminGuard';

export const Reports: React.FC = () => {
  const [records, setRecords] = useState<ChecklistRecord[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<ChecklistRecord | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [recs, secs] = await Promise.all([DB.getRecords(), DB.getSectors()]);
    setRecords(recs);
    setSectors(secs);
    setLoading(false);
  };

  return (
    <AdminGuard>
      <div className="p-6 space-y-6 animate-fadeIn">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-black">Histórico VBQ</h2>
          <button onClick={loadData} className="p-2 bg-gray-900 border border-gray-800 rounded-xl text-blue-500 text-xs font-black">
            ATUALIZAR
          </button>
        </div>

        {loading ? (
          <div className="py-32 flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
            <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest">Acessando Banco de Dados...</p>
          </div>
        ) : records.length === 0 ? (
          <div className="p-12 text-center bg-gray-900/50 border border-gray-800 rounded-[2.5rem] text-gray-600 italic text-sm">
            Nenhum registro encontrado.
          </div>
        ) : (
          <div className="grid gap-3">
            {records.map(rec => {
              const sector = sectors.find(s => s.id === rec.sectorId);
              return (
                <div 
                  key={rec.id} 
                  onClick={() => setSelectedRecord(rec)}
                  className="bg-gray-900 border border-gray-800 p-4 rounded-2xl flex items-center gap-4 hover:border-gray-600 transition-all cursor-pointer active:scale-95"
                >
                  <div className="w-12 h-12 bg-gray-800 rounded-xl overflow-hidden flex-shrink-0">
                    {rec.photos[0] ? (
                      <img src={rec.photos[0]} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl">📋</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm truncate">{sector?.name || 'Setor'} • {rec.type}</h4>
                    <p className="text-[9px] text-gray-500 font-black uppercase mt-1">
                      {new Date(rec.timestamp).toLocaleDateString()} • {rec.employeeName}
                    </p>
                  </div>
                  {rec.problemReport && <span className="text-red-500 animate-pulse">⚠️</span>}
                  <span className="text-gray-700">→</span>
                </div>
              );
            })}
          </div>
        )}

        {selectedRecord && (
          <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
            <div className="bg-gray-950 w-full max-w-lg rounded-[3rem] border border-gray-800 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-gray-900 flex justify-between items-center">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Detalhes do Turno</span>
                <button onClick={() => setSelectedRecord(null)} className="text-gray-500 hover:text-white font-bold">FECHAR</button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="w-full aspect-video bg-gray-900 rounded-[2rem] overflow-hidden border border-gray-800">
                  <img src={selectedRecord.photos[0]} className="w-full h-full object-cover" />
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 bg-gray-900 rounded-2xl">
                      <p className="text-[8px] font-black text-gray-600 uppercase mb-1">Setor</p>
                      <p className="text-xs font-bold">{sectors.find(s => s.id === selectedRecord.sectorId)?.name || 'N/A'}</p>
                    </div>
                    <div className="p-4 bg-gray-900 rounded-2xl">
                      <p className="text-[8px] font-black text-gray-600 uppercase mb-1">Turno</p>
                      <p className="text-xs font-bold">{selectedRecord.type}</p>
                    </div>
                  </div>

                  {selectedRecord.notes && (
                    <div className="p-4 bg-gray-900 rounded-2xl">
                      <p className="text-[8px] font-black text-gray-600 uppercase mb-1">Notas</p>
                      <p className="text-xs italic text-gray-300">"{selectedRecord.notes}"</p>
                    </div>
                  )}

                  {selectedRecord.problemReport && (
                    <div className="p-4 bg-red-950/20 border border-red-500/20 rounded-2xl">
                      <p className="text-[8px] font-black text-red-500 uppercase mb-1">Manutenção/Problemas</p>
                      <p className="text-xs font-bold text-red-200">{selectedRecord.problemReport}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminGuard>
  );
};