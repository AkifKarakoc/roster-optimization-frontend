import { apiService } from './api';
import { QualificationDTO } from '../types/entities';

export const qualificationService = {
  // Get all qualifications
  getAll: () => apiService.get<QualificationDTO[]>('/qualifications'),

  // Get qualification by ID
  getById: (id: number) => apiService.get<QualificationDTO>(`/qualifications/${id}`),

  // Create new qualification
  create: (qualification: Omit<QualificationDTO, 'id'>) => 
    apiService.post<QualificationDTO>('/qualifications', qualification),

  // Update qualification
  update: (id: number, qualification: Partial<QualificationDTO>) =>
    apiService.put<QualificationDTO>(`/qualifications/${id}`, qualification),

  // Delete qualification
  delete: (id: number) => apiService.delete(`/qualifications/${id}`),

  // Search qualifications
  search: (query: string) => 
    apiService.get<QualificationDTO[]>(`/qualifications/search?query=${encodeURIComponent(query)}`),

  // Get qualification count
  getCount: () => apiService.get<number>('/qualifications/count'),
};