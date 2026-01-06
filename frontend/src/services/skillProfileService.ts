import api from './api';
import { SkillProfile, SkillProfileRequest } from '../types';

export const skillProfileService = {
  getAll: async (): Promise<SkillProfile[]> => {
    const response = await api.get<SkillProfile[]>('/skill-profiles');
    return response.data;
  },

  getById: async (id: number): Promise<SkillProfile> => {
    const response = await api.get<SkillProfile>(`/skill-profiles/${id}`);
    return response.data;
  },

  create: async (skillProfile: SkillProfileRequest): Promise<SkillProfile> => {
    const response = await api.post<SkillProfile>('/skill-profiles', skillProfile);
    return response.data;
  },

  update: async (id: number, skillProfile: SkillProfileRequest): Promise<SkillProfile> => {
    const response = await api.put<SkillProfile>(`/skill-profiles/${id}`, skillProfile);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/skill-profiles/${id}`);
  },
};
