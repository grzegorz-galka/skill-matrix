import api from './api';
import { SkillProfile, Skill, SkillRequest, Page } from '../types';

export const skillService = {
  getAll: async (page = 0, size = 20): Promise<Page<Skill>> => {
    const params = { page, size };
    const response = await api.get<Page<Skill>>('/skills', { params });
    return response.data;
  },

  getAllUnpaginated: async (): Promise<Skill[]> => {
    const response = await api.get<Skill[]>('/skills');
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

  // Skill profile association methods
  getSkillProfiles: async (skillId: number): Promise<SkillProfile[]> => {
    const response = await api.get<SkillProfile[]>(`/skills/${skillId}/skill-profiles`);
    return response.data;
  },

  addSkillProfile: async (skillId: number, skillProfileId: number): Promise<void> => {
    await api.post(`/skills/${skillId}/skill-profiles/${skillProfileId}`);
  },

  removeSkillProfile: async (skillId: number, skillProfileId: number): Promise<void> => {
    await api.delete(`/skills/${skillId}/skill-profiles/${skillProfileId}`);
  },
};
