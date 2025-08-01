import { apiService } from './api';
import { SquadDTO } from '../types/entities';

export const squadService = {
  // Get all squads
  getAll: () => apiService.get<SquadDTO[]>('/squads'),

  // Get squad by ID
  getById: (id: number) => apiService.get<SquadDTO>(`/squads/${id}`),

  // Create new squad
  create: (squad: Omit<SquadDTO, 'id'>) => 
    apiService.post<SquadDTO>('/squads', squad),

  // Update squad
  update: (id: number, squad: Partial<SquadDTO>) =>
    apiService.put<SquadDTO>(`/squads/${id}`, squad),

  // Delete squad
  delete: (id: number) => apiService.delete(`/squads/${id}`),

  // Search squads
  search: (query: string) => 
    apiService.get<SquadDTO[]>(`/squads/search?query=${encodeURIComponent(query)}`),

  // Get squads by working pattern
  getByWorkingPattern: (patternId: number) =>
    apiService.get<SquadDTO[]>(`/squads/working-pattern/${patternId}`),

  // Get squads with staff
  getWithStaff: () => apiService.get<SquadDTO[]>('/squads/with-staff'),

  // Get squads without staff
  getWithoutStaff: () => apiService.get<SquadDTO[]>('/squads/without-staff'),

  // Get squads by start date
  getByStartDate: (startDate: string) =>
    apiService.get<SquadDTO[]>(`/squads/start-date/${startDate}`),

  // Get squad staff count
  getStaffCount: (id: number) =>
    apiService.get<number>(`/squads/${id}/staff-count`),

  // Get squad cycle position
  getCyclePosition: (id: number) =>
    apiService.get<{ date: string; position: number }>(`/squads/${id}/cycle-position`),

  // Get new squads (recent)
  getNew: () => apiService.get<SquadDTO[]>('/squads/new'),

  // Get squad count
  getCount: () => apiService.get<number>('/squads/count'),
};