import { apiService } from './api';
import { StaffDTO } from '../types/entities';

export const staffService = {
  // Get all staff
  getAll: () => apiService.get<StaffDTO[]>('/staff'),

  // Get staff by ID
  getById: (id: number) => apiService.get<StaffDTO>(`/staff/${id}`),

  // Create new staff
  create: (staff: Omit<StaffDTO, 'id'>) => 
    apiService.post<StaffDTO>('/staff', staff),

  // Update staff
  update: (id: number, staff: Partial<StaffDTO>) =>
    apiService.put<StaffDTO>(`/staff/${id}`, staff),

  // Delete staff
  delete: (id: number) => apiService.delete(`/staff/${id}`),

  // Search staff
  search: (query: string) => 
    apiService.get<StaffDTO[]>(`/staff/search?query=${encodeURIComponent(query)}`),

  // Get staff by department
  getByDepartment: (departmentId: number) =>
    apiService.get<StaffDTO[]>(`/staff/department/${departmentId}`),

  // Get staff by squad
  getBySquad: (squadId: number) =>
    apiService.get<StaffDTO[]>(`/staff/squad/${squadId}`),

  // Get staff by qualification
  getByQualification: (qualificationId: number) =>
    apiService.get<StaffDTO[]>(`/staff/qualification/${qualificationId}`),

  // Get staff by registration code
  getByRegistrationCode: (registrationCode: string) =>
    apiService.get<StaffDTO>(`/staff/registration/${encodeURIComponent(registrationCode)}`),

  // Get staff by email
  getByEmail: (email: string) =>
    apiService.get<StaffDTO>(`/staff/email/${encodeURIComponent(email)}`),

  // Get staff with day off rules
  getWithDayOffRules: () => apiService.get<StaffDTO[]>('/staff/with-day-off-rules'),

  // Get staff with constraint overrides
  getWithConstraintOverrides: () => apiService.get<StaffDTO[]>('/staff/with-constraint-overrides'),

  // Get staff without qualifications
  getWithoutQualifications: () => apiService.get<StaffDTO[]>('/staff/without-qualifications'),

  // Search staff with qualifications (any)
  searchWithQualificationsAny: (qualificationIds: number[]) =>
    apiService.post<StaffDTO[]>('/staff/qualifications/any', { qualificationIds }),

  // Search staff with qualifications (all)
  searchWithQualificationsAll: (qualificationIds: number[]) =>
    apiService.post<StaffDTO[]>('/staff/qualifications/all', { qualificationIds }),

  // Get staff count
  getCount: () => apiService.get<number>('/staff/count'),

  // Get staff count by department
  getCountByDepartment: (departmentId: number) =>
    apiService.get<number>(`/staff/count/department/${departmentId}`),

  // Get staff count by squad
  getCountBySquad: (squadId: number) =>
    apiService.get<number>(`/staff/count/squad/${squadId}`),
};