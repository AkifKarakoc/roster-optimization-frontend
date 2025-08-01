import { apiService } from './api';
import { DepartmentDTO } from '../types/entities';

export const departmentService = {
  // Get all departments
  getAll: () => apiService.get<DepartmentDTO[]>('/departments'),

  // Get department by ID
  getById: (id: number) => apiService.get<DepartmentDTO>(`/departments/${id}`),

  // Create new department
  create: (department: Omit<DepartmentDTO, 'id'>) => 
    apiService.post<DepartmentDTO>('/departments', department),

  // Update department
  update: (id: number, department: Partial<DepartmentDTO>) =>
    apiService.put<DepartmentDTO>(`/departments/${id}`, department),

  // Delete department
  delete: (id: number) => apiService.delete(`/departments/${id}`),

  // Search departments
  search: (query: string) => 
    apiService.get<DepartmentDTO[]>(`/departments/search?query=${encodeURIComponent(query)}`),

  // Get department count
  getCount: () => apiService.get<number>('/departments/count'),
};