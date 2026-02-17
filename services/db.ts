import { Sector, ChecklistRecord, Task } from '../types';
import { supabase } from './supabase';

export const DB = {
  // --- SETORES ---
  getSectors: async (): Promise<Sector[]> => {
    try {
      const { data, error } = await supabase
        .from('setores')
        .select('*')
        .order('nome');
      
      if (error) throw error;
      return (data || []).map(s => ({ 
        id: s.id.toString(), 
        name: s.nome, 
        icon: s.icon || '🏢' 
      }));
    } catch (err) {
      console.error('Erro ao buscar setores:', err);
      return [];
    }
  },

  saveSector: async (name: string) => {
    return await supabase
      .from('setores')
      .insert([{ nome: name, icon: '🏢' }])
      .select();
  },

  deleteSector: async (id: string) => {
    return await supabase.from('setores').delete().eq('id', id);
  },

  // --- TAREFAS ---
  getTasks: async (sectorId?: string): Promise<Task[]> => {
    try {
      let query = supabase.from('tarefas').select('*').order('tipo');
      if (sectorId) query = query.eq('setor_id', sectorId);
      
      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map(t => ({
        id: t.id.toString(),
        sectorId: t.setor_id.toString(),
        type: t.tipo as any,
        description: t.descricao
      }));
    } catch (err) {
      console.error('Erro ao buscar tarefas:', err);
      return [];
    }
  },

  saveTask: async (task: Omit<Task, 'id'>) => {
    return await supabase
      .from('tarefas')
      .insert([{ 
        setor_id: parseInt(task.sectorId), 
        tipo: task.type, 
        descricao: task.description 
      }])
      .select();
  },

  deleteTask: async (id: string) => {
    return await supabase.from('tarefas').delete().eq('id', id);
  },

  // --- REGISTROS ---
  getRecords: async (): Promise<ChecklistRecord[]> => {
    try {
      const { data, error } = await supabase
        .from('registros_fotos')
        .select('*, setores(nome)')
        .order('id', { ascending: false });

      if (error) throw error;

      return (data || []).map(r => ({
        id: r.id.toString(),
        sectorId: r.setor_id?.toString() || '',
        employeeName: r.funcionario,
        type: r.tipo as any,
        date: r.data,
        timestamp: new Date(r.created_at || Date.now()).getTime(),
        completedTasks: r.tarefas_concluidas || [],
        taskPhotos: {},
        notes: r.notas || '',
        problemReport: r.problemas || '',
        photos: r.url_foto ? [r.url_foto] : [],
        status: 'CONCLUIDO'
      }));
    } catch (err) {
      console.error('Erro ao buscar registros:', err);
      return [];
    }
  },

  saveRecord: async (recordData: {
    setor_id: number;
    funcionario: string;
    tipo: string;
    url_foto: string;
    data: string;
    notas?: string;
    problemas?: string;
    tarefas_concluidas?: string[];
  }) => {
    return await supabase
      .from('registros_fotos')
      .insert([{
        setor_id: recordData.setor_id,
        funcionario: recordData.funcionario,
        tipo: recordData.tipo,
        url_foto: recordData.url_foto,
        data: recordData.data,
        notas: recordData.notas,
        problemas: recordData.problemas,
        tarefas_concluidas: recordData.tarefas_concluidas || []
      }])
      .select();
  },

  uploadPhoto: async (base64: string): Promise<string | null> => {
    try {
      const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'image/jpeg' });
      
      const fileName = `check_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
      
      const { data, error } = await supabase.storage
        .from('checklist_photos')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
          upsert: false
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('checklist_photos')
        .getPublicUrl(data.path);

      return publicUrl;
    } catch (err) {
      console.error('Erro no upload do storage:', err);
      return null;
    }
  }
};