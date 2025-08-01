import { apiService } from './api';
import { SquadWorkingPatternDTO } from '../types/entities';

export const squadWorkingPatternService = {
  // Get all squad working patterns
  getAll: () => apiService.get<SquadWorkingPatternDTO[]>('/squad-working-patterns'),

  // Get squad working pattern by ID
  getById: (id: number) => apiService.get<SquadWorkingPatternDTO>(`/squad-working-patterns/${id}`),

  // Create new squad working pattern
  create: (pattern: Omit<SquadWorkingPatternDTO, 'id'>) => 
    apiService.post<SquadWorkingPatternDTO>('/squad-working-patterns', pattern),

  // Update squad working pattern
  update: (id: number, pattern: Partial<SquadWorkingPatternDTO>) =>
    apiService.put<SquadWorkingPatternDTO>(`/squad-working-patterns/${id}`, pattern),

  // Delete squad working pattern
  delete: (id: number) => apiService.delete(`/squad-working-patterns/${id}`),
  

  // Search squad working patterns
  search: (query: string) => 
    apiService.get<SquadWorkingPatternDTO[]>(`/squad-working-patterns/search?query=${encodeURIComponent(query)}`),

  // Get patterns by cycle length
  getByCycleLength: (cycleLength: number) =>
    apiService.get<SquadWorkingPatternDTO[]>(`/squad-working-patterns/cycle-length/${cycleLength}`),

  // Get patterns containing specific shift
  getByShift: (shiftName: string) =>
    apiService.get<SquadWorkingPatternDTO[]>(`/squad-working-patterns/shift/${encodeURIComponent(shiftName)}`),

  // Validate pattern
  validatePattern: (data: { shiftPattern: string; cycleLength: number }) =>
    apiService.post<{ valid: boolean; errors: string[] }>('/squad-working-patterns/validate', data),

  // Get pattern count
  getCount: () => apiService.get<number>('/squad-working-patterns/count'),
};