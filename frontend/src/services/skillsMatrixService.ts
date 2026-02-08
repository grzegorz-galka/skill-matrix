import api from './api';
import { SkillsMatrixFilterRequest, SkillsMatrixResponse, SkillsMatrixFilterHints } from '../types';

export const skillsMatrixService = {
  getMatrix: async (filter?: SkillsMatrixFilterRequest): Promise<SkillsMatrixResponse> => {
    const response = await api.post<SkillsMatrixResponse>('/skills-matrix', filter || {});
    return response.data;
  },

  getFilterHints: async (): Promise<SkillsMatrixFilterHints> => {
    const response = await api.get<SkillsMatrixFilterHints>('/skills-matrix/filter-hints');
    return response.data;
  },
};

export default skillsMatrixService;
