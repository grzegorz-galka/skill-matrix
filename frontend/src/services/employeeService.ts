import api from './api';
import { Employee, EmployeeRequest, Page, SkillProfile } from '../types';

export const employeeService = {
  getAll: async (page = 0, size = 20): Promise<Page<Employee>> => {
    const response = await api.get<Page<Employee>>('/employees', {
      params: { page, size },
    });
    return response.data;
  },

  getById: async (id: number): Promise<Employee> => {
    const response = await api.get<Employee>(`/employees/${id}`);
    return response.data;
  },

  create: async (employee: EmployeeRequest): Promise<Employee> => {
    const response = await api.post<Employee>('/employees', employee);
    return response.data;
  },

  update: async (id: number, employee: EmployeeRequest): Promise<Employee> => {
    const response = await api.put<Employee>(`/employees/${id}`, employee);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/employees/${id}`);
  },

  getSkillProfiles: async (id: number): Promise<SkillProfile[]> => {
    const response = await api.get<SkillProfile[]>(`/employees/${id}/skill-profiles`);
    return response.data;
  },

  assignSkillProfile: async (employeeId: number, skillProfileId: number): Promise<void> => {
    await api.post(`/employees/${employeeId}/skill-profiles/${skillProfileId}`);
  },

  removeSkillProfile: async (employeeId: number, skillProfileId: number): Promise<void> => {
    await api.delete(`/employees/${employeeId}/skill-profiles/${skillProfileId}`);
  },
};
