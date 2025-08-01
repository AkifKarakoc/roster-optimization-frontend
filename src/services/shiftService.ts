import { apiService } from './api';
import { ShiftDTO } from '../types/entities';

export const shiftService = {
  // Get all shifts
  getAll: () => apiService.get<ShiftDTO[]>('/shifts'),

  // Get shift by ID
  getById: (id: number) => apiService.get<ShiftDTO>(`/shifts/${id}`),

  // Create new shift
  create: (shift: Omit<ShiftDTO, 'id'>) => 
    apiService.post<ShiftDTO>('/shifts', shift),

  // Update shift
  update: (id: number, shift: Partial<ShiftDTO>) =>
    apiService.put<ShiftDTO>(`/shifts/${id}`, shift),

  // Delete shift
  delete: (id: number) => apiService.delete(`/shifts/${id}`),

  // Search shifts
  search: (query: string) => 
    apiService.get<ShiftDTO[]>(`/shifts/search?query=${encodeURIComponent(query)}`),

  // Get shifts by working period
  getByWorkingPeriod: (workingPeriodId: number) =>
    apiService.get<ShiftDTO[]>(`/shifts/working-period/${workingPeriodId}`),

  // Get day shifts
  getDayShifts: () => apiService.get<ShiftDTO[]>('/shifts/day'),

  // Get night shifts
  getNightShifts: () => apiService.get<ShiftDTO[]>('/shifts/night'),

  // Get shift count
  getCount: () => apiService.get<number>('/shifts/count'),
};