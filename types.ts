
export type ChecklistType = 'ABERTURA' | 'FECHAMENTO';

export interface Sector {
  id: string;
  name: string;
  icon: string;
}

export interface Task {
  id: string;
  sectorId: string;
  type: ChecklistType;
  description: string;
}

export interface Employee {
  id: string;
  name: string;
  sectorId: string;
}

export interface ChecklistRecord {
  id: string;
  sectorId: string;
  employeeName: string;
  type: ChecklistType;
  date: string;
  timestamp: number;
  completedTasks: string[]; // Task IDs
  taskPhotos: { [taskId: string]: string[] }; // Photos associated with specific tasks
  notes: string;
  problemReport: string;
  photos: string[]; // General photos
  status: 'CONCLUIDO' | 'REVISAO_SOLICITADA' | 'REFEITO';
}

export interface DashboardStats {
  completedToday: number;
  pendingToday: number;
  problemsReported: number;
  activeEmployees: number;
}
