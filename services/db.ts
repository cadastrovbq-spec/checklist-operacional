
import { Sector, Task, Employee, ChecklistRecord } from '../types';
import { INITIAL_SECTORS, INITIAL_EMPLOYEES, INITIAL_TASKS } from '../constants';

const KEYS = {
  SECTORS: 'cm_sectors',
  EMPLOYEES: 'cm_employees',
  TASKS: 'cm_tasks',
  RECORDS: 'cm_records',
};

export const DB = {
  getSectors: (): Sector[] => {
    const data = localStorage.getItem(KEYS.SECTORS);
    return data ? JSON.parse(data) : INITIAL_SECTORS;
  },
  saveSectors: (sectors: Sector[]) => localStorage.setItem(KEYS.SECTORS, JSON.stringify(sectors)),

  getEmployees: (): Employee[] => {
    const data = localStorage.getItem(KEYS.EMPLOYEES);
    return data ? JSON.parse(data) : INITIAL_EMPLOYEES;
  },
  saveEmployees: (employees: Employee[]) => localStorage.setItem(KEYS.EMPLOYEES, JSON.stringify(employees)),

  getTasks: (): Task[] => {
    const data = localStorage.getItem(KEYS.TASKS);
    return data ? JSON.parse(data) : INITIAL_TASKS;
  },
  saveTasks: (tasks: Task[]) => localStorage.setItem(KEYS.TASKS, JSON.stringify(tasks)),

  getRecords: (): ChecklistRecord[] => {
    const data = localStorage.getItem(KEYS.RECORDS);
    return data ? JSON.parse(data) : [];
  },
  saveRecord: (record: ChecklistRecord) => {
    const records = DB.getRecords();
    const updated = [record, ...records];
    localStorage.setItem(KEYS.RECORDS, JSON.stringify(updated));
  },
  updateRecord: (record: ChecklistRecord) => {
    const records = DB.getRecords();
    const updated = records.map(r => r.id === record.id ? record : r);
    localStorage.setItem(KEYS.RECORDS, JSON.stringify(updated));
  }
};
