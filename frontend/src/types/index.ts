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

export interface SkillProfile {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SkillProfileRequest {
  name: string;
  description?: string;
}

export interface Skill {
  id: number;
  name: string;
  skillProfiles: SkillProfile[];
  grades: SkillGrade[];
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
  level: number;
  createdAt: string;
  updatedAt: string;
}

export interface SkillGradeRequest {
  skillId: number;
  code: string;
  description?: string;
  level?: number;
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

export interface SkillsMatrixFilterRequest {
  namePatterns?: string[];
  departmentPatterns?: string[];
  positionPatterns?: string[];
  skillNamePatterns?: string[];
  skillProfilePatterns?: string[];
}

export interface MatrixEmployee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  department?: string;
  position?: string;
}

export interface MatrixSkill {
  id: number;
  name: string;
  skillProfileNames: string[];
}

export interface MatrixCell {
  employeeId: number;
  skillId: number;
  skillGradeId: number;
  gradeCode: string;
  gradeDescription?: string;
  level: number;
  yearsOfExperience?: number;
  certified: boolean;
}

export interface SkillSummary {
  skillId: number;
  gradeCounts: Record<string, number>;
}

export interface SkillsMatrixResponse {
  employees: MatrixEmployee[];
  skills: MatrixSkill[];
  cells: Record<string, MatrixCell>;
  skillSummaries: Record<number, SkillSummary>;
}

export interface SkillsMatrixFilterHints {
  names: string[];
  departments: string[];
  positions: string[];
  skillNames: string[];
  skillProfileNames: string[];
}
