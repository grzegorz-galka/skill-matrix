import api from './api';
import { Skill, SkillRequest } from '../types';

export const skillService = {
  getAll: async (): Promise<Skill[]> => {
    const response = await api.get<Skill[]>('/skills');
    return response.data;
  },

  getByProfileId: async (profileId: number): Promise<Skill[]> => {
    const response = await api.get<Skill[]>('/skills', {
      params: { profileId },
    });
    return response.data;
  },

  getById: async (id: number): Promise<Skill> => {
    const response = await api.get<Skill>(`/skills/${id}`);
    return response.data;
  },

  create: async (skill: SkillRequest): Promise<Skill> => {
    const response = await api.post<Skill>('/skills', skill);
    return response.data;
  },

  update: async (id: number, skill: SkillRequest): Promise<Skill> => {
    const response = await api.put<Skill>(`/skills/${id}`, skill);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/skills/${id}`);
  },
};
