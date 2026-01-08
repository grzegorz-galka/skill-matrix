import api from './api';
import { JobProfile, JobProfileRequest } from '../types';

export const jobProfileService = {
  getAll: async (): Promise<JobProfile[]> => {
    const response = await api.get<JobProfile[]>('/job-profiles');
    return response.data;
  },

  getById: async (id: number): Promise<JobProfile> => {
    const response = await api.get<JobProfile>(`/job-profiles/${id}`);
    return response.data;
  },

  create: async (jobProfile: JobProfileRequest): Promise<JobProfile> => {
    const response = await api.post<JobProfile>('/job-profiles', jobProfile);
    return response.data;
  },

  update: async (id: number, jobProfile: JobProfileRequest): Promise<JobProfile> => {
    const response = await api.put<JobProfile>(`/job-profiles/${id}`, jobProfile);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/job-profiles/${id}`);
  },
};
