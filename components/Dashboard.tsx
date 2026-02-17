
import React, { useState, useEffect } from 'react';
import { DB } from '../services/db';
import { ChecklistRecord, Sector } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

export const Dashboard: React.FC = () => {
  const [records, setRecords] = useState<ChecklistRecord[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);

  useEffect(() => {
    setRecords(DB.getRecords());
    setSectors(DB.getSectors());
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecords = records.filter(r => r.date === todayStr);
  const problemsCount = todayRecords.filter(r => r.problemReport.length > 0).length;

  const chartData = sectors.map(s => {
    const sectorToday = todayRecords.filter(r => r.sectorId === s.id);
    return {
      name: s.name,
      concluidos: sectorToday.length,
    };
  });

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="p-6 space-y-8 animate-fadeIn">
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Hoje', val: todayRecords.length, icon: '📅', color: 'bg-blue-500/10 text-blue-500' },
          { label: 'Problemas', val: problemsCount, icon: '⚠️', color: 'bg-red-500/10 text-red-500' },
          { label: 'Setores', val: sectors.length, icon: '🏢', color: 'bg-purple-500/10 text-purple-500' },
          { label: 'Total Mês', val: records.length, icon: '📈', color: 'bg-green-500/10 text-green-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-gray-900 border border-gray-800 p-4 rounded-2xl flex flex-col items-center">
            <span className={`w-10 h-10 rounded-full flex items-center justify-center text-xl mb-2 ${stat.color}`}>
              {stat.icon}
            </span>
            <span className="text-2xl font-bold">{stat.val}</span>
            <span className="text-xs text-gray-500 font-medium">{stat.label}</span>
          </div>
        ))}
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <span>🔥</span> Atividade por Setor (Hoje)
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: '#1f2937' }}
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }}
                />
                <Bar dataKey="concluidos" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="bg-gray-900 border border-gray-800 p-6 rounded-2xl overflow-hidden">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <span>🕒</span> Atividade Recente
          </h2>
          <div className="space-y-4 max-h-[256px] overflow-y-auto pr-2">
            {records.slice(0, 5).map((rec) => {
              const sector = sectors.find(s => s.id === rec.sectorId);
              return (
                <div key={rec.id} className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl border border-gray-800">
                  <span className="text-2xl">{sector?.icon || '📁'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{sector?.name || 'Desconhecido'}</p>
                    <p className="text-xs text-gray-500 italic">{rec.type} • {new Date(rec.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                    rec.status === 'CONCLUIDO' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {rec.status}
                  </span>
                </div>
              );
            })}
            {records.length === 0 && (
              <div className="text-center py-10 text-gray-500">Nenhuma atividade registrada ainda.</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
