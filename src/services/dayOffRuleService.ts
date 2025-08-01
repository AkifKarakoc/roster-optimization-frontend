import { apiService } from './api';
import { DayOffRuleDTO } from '../types/entities';

export const dayOffRuleService = {
  // Get all day off rules
  getAll: () => apiService.get<DayOffRuleDTO[]>('/day-off-rules'),

  // Get day off rule by ID
  getById: (id: number) => apiService.get<DayOffRuleDTO>(`/day-off-rules/${id}`),

  // Create new day off rule
  create: (rule: Omit<DayOffRuleDTO, 'id'>) => 
    apiService.post<DayOffRuleDTO>('/day-off-rules', rule),

  // Update day off rule
  update: (id: number, rule: Partial<DayOffRuleDTO>) =>
    apiService.put<DayOffRuleDTO>(`/day-off-rules/${id}`, rule),

  // Delete day off rule
  delete: (id: number) => apiService.delete(`/day-off-rules/${id}`),

  // Get rule by staff
  getByStaff: (staffId: number) =>
    apiService.get<DayOffRuleDTO>(`/day-off-rules/staff/${staffId}`),

  // Get rule by staff (optional - returns null if not found)
  getByStaffOptional: (staffId: number) =>
    apiService.get<DayOffRuleDTO | null>(`/day-off-rules/staff/${staffId}/optional`),

  // Check if staff has rule
  staffHasRule: (staffId: number) =>
    apiService.get<boolean>(`/day-off-rules/staff/${staffId}/exists`),

  // Get rule by staff registration code
  getByStaffRegistration: (registrationCode: string) =>
    apiService.get<DayOffRuleDTO>(`/day-off-rules/staff/registration/${encodeURIComponent(registrationCode)}`),

  // Get rules by department
  getByDepartment: (departmentId: number) =>
    apiService.get<DayOffRuleDTO[]>(`/day-off-rules/department/${departmentId}`),

  // Get rules by squad
  getBySquad: (squadId: number) =>
    apiService.get<DayOffRuleDTO[]>(`/day-off-rules/squad/${squadId}`),

  // Get flexible rules (no fixed days)
  getFlexible: () => apiService.get<DayOffRuleDTO[]>('/day-off-rules/flexible'),

  // Get fixed rules (with fixed days)
  getFixed: () => apiService.get<DayOffRuleDTO[]>('/day-off-rules/fixed'),

  // Get rules by working days
  getByWorkingDays: (workingDays: number) =>
    apiService.get<DayOffRuleDTO[]>(`/day-off-rules/working-days/${workingDays}`),

  // Get rules by off days
  getByOffDays: (offDays: number) =>
    apiService.get<DayOffRuleDTO[]>(`/day-off-rules/off-days/${offDays}`),

  // Get rules by fixed day of week
  getByFixedDay: (dayOfWeek: string) =>
    apiService.get<DayOffRuleDTO[]>(`/day-off-rules/fixed-day/${encodeURIComponent(dayOfWeek)}`),

  // Get statistics
  getStatistics: () => apiService.get<{
    totalRules: number;
    fixedRules: number;
    flexibleRules: number;
    fixedPercentage: number;
    flexiblePercentage: number;
  }>('/day-off-rules/statistics'),

  // Get rule count
  getCount: () => apiService.get<number>('/day-off-rules/count'),

  // Get flexible rule count
  getFlexibleCount: () => apiService.get<number>('/day-off-rules/count/flexible'),

  // Get fixed rule count
  getFixedCount: () => apiService.get<number>('/day-off-rules/count/fixed'),
};