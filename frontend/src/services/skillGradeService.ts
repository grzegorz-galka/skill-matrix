import api from './api';
import { SkillGrade, SkillGradeRequest } from '../types';

export const skillGradeService = {
  getAll: async (): Promise<SkillGrade[]> => {
    const response = await api.get<SkillGrade[]>('/skill-grades');
    return response.data;
  },

  getBySkillId: async (skillId: number): Promise<SkillGrade[]> => {
    const response = await api.get<SkillGrade[]>('/skill-grades', {
      params: { skillId },
    });
    return response.data;
  },

  getById: async (id: number): Promise<SkillGrade> => {
    const response = await api.get<SkillGrade>(`/skill-grades/${id}`);
    return response.data;
  },

  create: async (skillGrade: SkillGradeRequest): Promise<SkillGrade> => {
    const response = await api.post<SkillGrade>('/skill-grades', skillGrade);
    return response.data;
  },

  update: async (id: number, skillGrade: SkillGradeRequest): Promise<SkillGrade> => {
    const response = await api.put<SkillGrade>(`/skill-grades/${id}`, skillGrade);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/skill-grades/${id}`);
  },
};
