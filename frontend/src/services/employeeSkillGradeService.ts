import api from './api';
import { EmployeeSkillGrade, EmployeeSkillGradeRequest } from '../types';

export const employeeSkillGradeService = {
  getAll: async (): Promise<EmployeeSkillGrade[]> => {
    const response = await api.get<EmployeeSkillGrade[]>('/employee-skill-grades');
    return response.data;
  },

  getByEmployeeId: async (employeeId: number): Promise<EmployeeSkillGrade[]> => {
    const response = await api.get<EmployeeSkillGrade[]>('/employee-skill-grades', {
      params: { employeeId },
    });
    return response.data;
  },

  getBySkillGradeId: async (skillGradeId: number): Promise<EmployeeSkillGrade[]> => {
    const response = await api.get<EmployeeSkillGrade[]>('/employee-skill-grades', {
      params: { skillGradeId },
    });
    return response.data;
  },

  getById: async (id: number): Promise<EmployeeSkillGrade> => {
    const response = await api.get<EmployeeSkillGrade>(`/employee-skill-grades/${id}`);
    return response.data;
  },

  create: async (esg: EmployeeSkillGradeRequest): Promise<EmployeeSkillGrade> => {
    const response = await api.post<EmployeeSkillGrade>('/employee-skill-grades', esg);
    return response.data;
  },

  update: async (id: number, esg: EmployeeSkillGradeRequest): Promise<EmployeeSkillGrade> => {
    const response = await api.put<EmployeeSkillGrade>(`/employee-skill-grades/${id}`, esg);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/employee-skill-grades/${id}`);
  },
};
