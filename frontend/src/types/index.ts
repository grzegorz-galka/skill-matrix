export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  department?: string;
  position?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeRequest {
  firstName: string;
  lastName: string;
  email: string;
  department?: string;
  position?: string;
}

export interface JobProfile {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobProfileRequest {
  name: string;
  description?: string;
}

export interface Skill {
  id: number;
  name: string;
  jobProfiles: JobProfile[];
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SkillRequest {
  name: string;
  description?: string;
}

export interface SkillGrade {
  id: number;
  skillId: number;
  skillName: string;
  code: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SkillGradeRequest {
  skillId: number;
  code: string;
  description?: string;
}

export interface EmployeeSkillGrade {
  id: number;
  employeeId: number;
  employeeFullName: string;
  skillGradeId: number;
  skillGradeCode: string;
  skillId: number;
  skillName: string;
  yearsOfExperience?: number;
  lastUsedDate?: string;
  certified: boolean;
  employeeComment?: string;
  reviewedByEmployeeId?: number;
  reviewedByEmployeeName?: string;
  reviewerComment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeSkillGradeRequest {
  employeeId: number;
  skillGradeId: number;
  yearsOfExperience?: number;
  lastUsedDate?: string;
  certified?: boolean;
  employeeComment?: string;
  reviewedByEmployeeId?: number;
  reviewerComment?: string;
}

export interface Page<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface ErrorResponse {
  status: number;
  error: string;
  message: string;
  details?: string[];
  timestamp: string;
}
