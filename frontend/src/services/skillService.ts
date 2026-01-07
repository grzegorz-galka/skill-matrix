import api from './api';
import { JobProfile, Skill, SkillRequest } from '../types';

export const skillService = {
  getAll: async (): Promise<Skill[]> => {
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

  // Job profile association methods
  getJobProfiles: async (skillId: number): Promise<JobProfile[]> => {
    const response = await api.get<JobProfile[]>(`/skills/${skillId}/job-profiles`);
    return response.data;
  },

  addJobProfile: async (skillId: number, jobProfileId: number): Promise<void> => {
    await api.post(`/skills/${skillId}/job-profiles/${jobProfileId}`);
  },

  removeJobProfile: async (skillId: number, jobProfileId: number): Promise<void> => {
    await api.delete(`/skills/${skillId}/job-profiles/${jobProfileId}`);
  },
};
