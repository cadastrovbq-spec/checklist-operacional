import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { DB } from '../services/db';
import { Sector, ChecklistType } from '../types';

export const ChecklistForm: React.FC = () => {
  const navigate = useNavigate();
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [step, setStep] = useState(1);
  const [selectedSector, setSelectedSector] = useState<string>('');
  const [selectedType, setSelectedType] = useState<ChecklistType | ''>('');
  const [employeeName, setEmployeeName] = useState<string>('');
  
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [problemReport, setProblemReport] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingSectors, setIsLoadingSectors] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadSectors = async () => {
      setIsLoadingSectors(true);
      const data = await DB.getSectors();
      setSectors(data);
      setIsLoadingSectors(false);
    };
    loadSectors();
  }, []);

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
    if (!selectedSector || !selectedType || !employeeName.trim() || !photoBase64) {
      alert('Preencha todos os campos obrigatórios e capture a foto.');
      return;
    }

    setIsSubmitting(true);
    try {
      const photoUrl = await DB.uploadPhoto(photoBase64);
      if (!photoUrl) throw new Error('Não foi possível salvar a imagem.');

      const { error } = await DB.saveRecord({
        setor_id: parseInt(selectedSector),
        funcionario: employeeName.trim(),
        tipo: selectedType,
        url_foto: photoUrl,
        data: new Date().toISOString().split('T')[0],
        notas: notes,
        problemas: problemReport
      });

      if (error) throw error;

      alert('Checklist enviado com sucesso!');
      navigate('/reports');
    } catch (err: any) {
      console.error(err);
      alert(`Erro: ${err.message || 'Erro ao conectar com o servidor'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === 1) {
    return (
      <div className="p-6 space-y-6 animate-fadeIn">
        <h2 className="text-2xl font-black">Novo Registro VBQ</h2>
        <div className="space-y-6">
          <label className="block">
            <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-3 block">1. Setor Operacional</span>
            {isLoadingSectors ? (
              <div className="grid grid-cols-2 gap-3 opacity-50">
                {[1,2,3,4].map(i => <div key={i} className="h-16 bg-gray-900 animate-pulse rounded-2xl"></div>)}
              </div>
            ) : (
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
            )}
          </label>

          {selectedSector && (
            <label className="block animate-slideUp">
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
          )}

          {selectedType && (
            <label className="block animate-slideUp">
              <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-3 block">3. Nome do Funcionário</span>
              <input
                type="text"
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                placeholder="Quem está registrando?"
                className="w-full bg-gray-900 border border-gray-800 rounded-2xl p-4 font-bold text-white focus:ring-2 focus:ring-blue-500/20 focus:outline-none placeholder:text-gray-700"
              />
            </label>
          )}
        </div>

        <button
          disabled={!selectedSector || !selectedType || !employeeName.trim()}
          onClick={() => setStep(2)}
          className="w-full bg-blue-600 disabled:opacity-50 disabled:bg-gray-800 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-900/20 transition-all active:scale-95 uppercase tracking-widest text-sm"
        >
          Próximo Passo
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fadeIn">
      <header className="flex items-center justify-between mb-2">
        <button onClick={() => setStep(1)} className="text-gray-500 text-xs font-black uppercase tracking-widest flex items-center gap-1">
          <span>←</span> Voltar
        </button>
        <div className="text-right">
          <p className="text-[8px] text-gray-600 uppercase font-black tracking-tighter">{sectors.find(s => s.id === selectedSector)?.name}</p>
          <p className="text-sm font-black text-blue-500">{selectedType}</p>
        </div>
      </header>

      <div className="space-y-6">
        <div 
          onClick={() => !isSubmitting && fileInputRef.current?.click()}
          className={`relative w-full aspect-[4/3] bg-gray-900 border-2 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all ${
            photoBase64 ? 'border-green-500/50' : 'border-gray-800 hover:border-gray-600'
          }`}
        >
          {photoBase64 ? (
            <img src={photoBase64} className="w-full h-full object-cover" />
          ) : (
            <div className="text-center">
              <span className="text-5xl mb-3 block">📸</span>
              <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Tirar Foto do Setor</span>
            </div>
          )}
          <input type="file" accept="image/*" capture="environment" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
        </div>

        <div className="space-y-4">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Observações do turno..."
            className="w-full bg-gray-900 border border-gray-800 rounded-2xl p-4 h-24 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
          />
          <textarea
            value={problemReport}
            onChange={(e) => setProblemReport(e.target.value)}
            placeholder="Relatar problemas ou manutenção necessária..."
            className="w-full bg-red-950/10 border border-red-900/20 rounded-2xl p-4 h-24 text-sm font-medium focus:ring-2 focus:ring-red-500/20 focus:outline-none text-red-200"
          />
        </div>

        <button
          disabled={isSubmitting || !photoBase64}
          onClick={handleSubmit}
          className={`w-full py-5 rounded-2xl font-black transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-sm ${
            isSubmitting ? 'bg-gray-800 text-gray-600 cursor-not-allowed' : 'bg-green-600 text-white shadow-xl shadow-green-900/20 hover:bg-green-500'
          }`}
        >
          {isSubmitting ? (
            <><div className="w-4 h-4 border-2 border-gray-600 border-t-white rounded-full animate-spin"></div> Enviando...</>
          ) : 'Finalizar Registro ✓'}
        </button>
      </div>
    </div>
  );
};