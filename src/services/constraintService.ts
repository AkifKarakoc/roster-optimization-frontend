import { apiService } from './api';
import { ConstraintDTO, ConstraintOverrideDTO } from '../types/entities';

export const constraintService = {
  // Get all constraints
  getAll: () => apiService.get<ConstraintDTO[]>('/constraints'),

  // Get constraint by ID
  getById: (id: number) => apiService.get<ConstraintDTO>(`/constraints/${id}`),

  // Create new constraint
  create: (constraint: Omit<ConstraintDTO, 'id'>) => 
    apiService.post<ConstraintDTO>('/constraints', constraint),

  // Update constraint
  update: (id: number, constraint: Partial<ConstraintDTO>) =>
    apiService.put<ConstraintDTO>(`/constraints/${id}`, constraint),

  // Delete constraint
  delete: (id: number) => apiService.delete(`/constraints/${id}`),

  // Get constraint by name
  getByName: (name: string) => 
    apiService.get<ConstraintDTO>(`/constraints/name/${encodeURIComponent(name)}`),

  // Get constraints by type
  getByType: (type: 'HARD' | 'SOFT') =>
    apiService.get<ConstraintDTO[]>(`/constraints/type/${type}`),

  // Get hard constraints
  getHardConstraints: () => apiService.get<ConstraintDTO[]>('/constraints/hard'),

  // Get soft constraints
  getSoftConstraints: () => apiService.get<ConstraintDTO[]>('/constraints/soft'),

  // Get constraints with overrides
  getWithOverrides: () => apiService.get<ConstraintDTO[]>('/constraints/with-overrides'),

  // Get constraints without overrides
  getWithoutOverrides: () => apiService.get<ConstraintDTO[]>('/constraints/without-overrides'),

  // Search constraints
  search: (query: string) => 
    apiService.get<ConstraintDTO[]>(`/constraints/search?query=${encodeURIComponent(query)}`),

  // Search in descriptions
  searchDescription: (query: string) => 
    apiService.get<ConstraintDTO[]>(`/constraints/search-description?query=${encodeURIComponent(query)}`),

  // Get effective value for staff
  getEffectiveValue: (constraintName: string, staffId: number) =>
    apiService.get<string>(`/constraints/effective-value?constraintName=${encodeURIComponent(constraintName)}&staffId=${staffId}`),

  // Get statistics
  getStatistics: () => apiService.get<{
    totalConstraints: number;
    hardConstraints: number;
    softConstraints: number;
    constraintsWithOverrides: number;
    hardPercentage: number;
    softPercentage: number;
    overridePercentage: number;
  }>('/constraints/statistics'),

  // Get constraint count
  getCount: () => apiService.get<number>('/constraints/count'),

  // Get constraint count by type
  getCountByType: (type: 'HARD' | 'SOFT') =>
    apiService.get<number>(`/constraints/count/${type}`),

  // Get count with overrides
  getCountWithOverrides: () => apiService.get<number>('/constraints/count/with-overrides'),

  // Bulk create constraints
  bulkCreate: (constraints: Omit<ConstraintDTO, 'id'>[]) =>
    apiService.post<ConstraintDTO[]>('/constraints/bulk', constraints),

  // Bulk update constraints
  bulkUpdate: (constraints: Partial<ConstraintDTO>[]) =>
    apiService.put<ConstraintDTO[]>('/constraints/bulk', constraints),
};