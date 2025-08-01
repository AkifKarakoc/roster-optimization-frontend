import { apiService } from './api';
import { TaskDTO } from '../types/entities';

export const taskService = {
  // Get all tasks
  getAll: () => apiService.get<TaskDTO[]>('/tasks'),

  // Get task by ID
  getById: (id: number) => apiService.get<TaskDTO>(`/tasks/${id}`),

  // Create new task
  create: (task: Omit<TaskDTO, 'id'>) => 
    apiService.post<TaskDTO>('/tasks', task),

  // Update task
  update: (id: number, task: Partial<TaskDTO>) =>
    apiService.put<TaskDTO>(`/tasks/${id}`, task),

  // Delete task
  delete: (id: number) => apiService.delete(`/tasks/${id}`),

  // Search tasks
  search: (query: string) => 
    apiService.get<TaskDTO[]>(`/tasks/search?query=${encodeURIComponent(query)}`),

  // Get tasks by department
  getByDepartment: (departmentId: number) =>
    apiService.get<TaskDTO[]>(`/tasks/department/${departmentId}`),

  // Get tasks by priority
  getByPriority: (priority: number) =>
    apiService.get<TaskDTO[]>(`/tasks/priority/${priority}`),

  // Get high priority tasks
  getHighPriority: () => apiService.get<TaskDTO[]>('/tasks/high-priority'),

  // Get ongoing tasks
  getOngoing: () => apiService.get<TaskDTO[]>('/tasks/ongoing'),

  // Get upcoming tasks
  getUpcoming: () => apiService.get<TaskDTO[]>('/tasks/upcoming'),

  // Get tasks by date
  getByDate: (date: string) =>
    apiService.get<TaskDTO[]>(`/tasks/date/${date}`),

  // Get task count
  getCount: () => apiService.get<number>('/tasks/count'),

  // Get task count by department
  getCountByDepartment: (departmentId: number) =>
    apiService.get<number>(`/tasks/count/department/${departmentId}`),
};