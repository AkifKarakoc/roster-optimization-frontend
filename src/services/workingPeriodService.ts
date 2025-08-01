import { apiService } from './api';
import { WorkingPeriodDTO } from '../types/entities';

export const workingPeriodService = {
  // Get all working periods
  getAll: () => apiService.get<WorkingPeriodDTO[]>('/working-periods'),

  // Get working period by ID
  getById: (id: number) => apiService.get<WorkingPeriodDTO>(`/working-periods/${id}`),

  // Create new working period
  create: (workingPeriod: Omit<WorkingPeriodDTO, 'id'>) => 
    apiService.post<WorkingPeriodDTO>('/working-periods', workingPeriod),

  // Update working period
  update: (id: number, workingPeriod: Partial<WorkingPeriodDTO>) =>
    apiService.put<WorkingPeriodDTO>(`/working-periods/${id}`, workingPeriod),

  // Delete working period
  delete: (id: number) => apiService.delete(`/working-periods/${id}`),

  // Search working periods
  search: (query: string) => 
    apiService.get<WorkingPeriodDTO[]>(`/working-periods/search?query=${encodeURIComponent(query)}`),

  // Get working period count
  getCount: () => apiService.get<number>('/working-periods/count'),
};