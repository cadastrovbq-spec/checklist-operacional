
import React from 'react';
import { Sector, Task, Employee } from './types';

export const INITIAL_SECTORS: Sector[] = [
  { id: '1', name: 'Cozinha', icon: '🍳' },
  { id: '2', name: 'Bar', icon: '🍹' },
  { id: '3', name: 'Salão', icon: '🍽️' },
  { id: '4', name: 'Estoque', icon: '📦' },
];

export const INITIAL_EMPLOYEES: Employee[] = [
  { id: '101', name: 'João Silva', sectorId: '1' },
  { id: '102', name: 'Maria Santos', sectorId: '1' },
  { id: '103', name: 'Carlos Oliveira', sectorId: '2' },
  { id: '104', name: 'Ana Costa', sectorId: '3' },
];

export const INITIAL_TASKS: Task[] = [
  // Kitchen Opening
  { id: 'k-o-1', sectorId: '1', type: 'ABERTURA', description: 'Verificar temperatura das geladeiras' },
  { id: 'k-o-2', sectorId: '1', type: 'ABERTURA', description: 'Limpar bancadas de preparo' },
  { id: 'k-o-3', sectorId: '1', type: 'ABERTURA', description: 'Organizar mise-en-place' },
  { id: 'k-o-4', sectorId: '1', type: 'ABERTURA', description: 'Checar validade dos insumos' },
  // Kitchen Closing
  { id: 'k-c-1', sectorId: '1', type: 'FECHAMENTO', description: 'Higienizar fogão e coifas' },
  { id: 'k-c-2', sectorId: '1', type: 'FECHAMENTO', description: 'Retirar lixo e lavar baldes' },
  { id: 'k-c-3', sectorId: '1', type: 'FECHAMENTO', description: 'Desligar equipamentos não essenciais' },
  // Bar Opening
  { id: 'b-o-1', sectorId: '2', type: 'ABERTURA', description: 'Preparar guarnições de frutas' },
  { id: 'b-o-2', sectorId: '2', type: 'ABERTURA', description: 'Repor gelo e bebidas' },
];
