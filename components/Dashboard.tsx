import React, { useState, useEffect } from 'react';
import { DB } from '../services/db';
import { ChecklistRecord, Sector } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const Dashboard: React.FC = () => {
  const [records, setRecords] = useState<ChecklistRecord[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);

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

  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecords = records.filter(r => r.date === todayStr);
  const problemsCount = todayRecords.filter(r => r.problemReport.length > 0).length;

  const chartData = sectors.map(s => ({
    name: s.name,
    concluidos: todayRecords.filter(r => r.sectorId === s.id).length
  }));

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
        <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">Sincronizando VBQ...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 animate-fadeIn">
      <section className="grid grid-cols-2 gap-4">
        {[
          { label: 'Hoje', val: todayRecords.length, icon: '📅', color: 'bg-blue-500/10 text-blue-500' },
          { label: 'Problemas', val: problemsCount, icon: '⚠️', color: 'bg-red-500/10 text-red-500' },
          { label: 'Setores', val: sectors.length, icon: '🏢', color: 'bg-purple-500/10 text-purple-500' },
          { label: 'Total DB', val: records.length, icon: '☁️', color: 'bg-green-500/10 text-green-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-gray-900 border border-gray-800 p-6 rounded-[2.5rem] flex flex-col items-center shadow-xl">
            <span className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-3 ${stat.color}`}>
              {stat.icon}
            </span>
            <span className="text-3xl font-black">{stat.val}</span>
            <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1 text-center">{stat.label}</span>
          </div>
        ))}
      </section>

      <section className="bg-gray-900 border border-gray-800 p-6 rounded-[3rem] shadow-2xl overflow-hidden">
        <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-8 flex items-center gap-2">
          <span>📊</span> Atividade por Setor (Hoje)
        </h2>
        <div className="h-64">
          {chartData.some(d => d.concluidos > 0) ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#4b5563" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: '#1f2937' }}
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '16px' }}
                />
                <Bar dataKey="concluidos" fill="#3b82f6" radius={[8, 8, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-600 text-[10px] italic uppercase tracking-widest text-center px-10">
              Nenhuma atividade sincronizada com o Supabase hoje.
            </div>
          )}
        </div>
      </section>

      <div className="text-center pb-4">
        <p className="text-[9px] text-gray-600 font-black uppercase tracking-[0.3em]">Checklist VBQ v2.0 • Operacional</p>
      </div>
    </div>
  );
};