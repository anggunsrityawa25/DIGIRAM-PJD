// EMRAM (Electronic Medical Record Adoption Model) Stages
export type EMRAMStage = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

// User roles in the system
export type UserRole = 'hospital' | 'health_office' | 'ministry';

// Assessment status workflow
export type AssessmentStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'reviewed'
  | 'under_validation'
  | 'validated'
  | 'rejected'
  | 'revision_required';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organizationId: string;
  organizationName: string;
  regionId?: string;
}

export interface Hospital {
  id: string;
  name: string;
  regionId: string;
  regionName: string;
  type: 'general' | 'specialized' | 'teaching' | 'district';
  bedCount: number;
  city: string;
  currentEMRAMStage: EMRAMStage;
  lastAssessmentDate?: string;
}

export interface Region {
  id: string;
  name: string;
  healthOfficeId: string;
  hospitalCount: number;
}

export interface AssessmentCategory {
  id: string;
  name: string;
  description: string;
  weight: number;
  criteria: AssessmentCriterion[];
}

export interface AssessmentCriterion {
  id: string;
  categoryId: string;
  question: string;
  description: string;
  requiredForStage: EMRAMStage;
  maxScore: number;
  type: 'boolean' | 'scale' | 'multiple_choice';
  options?: string[];
}

export interface AssessmentAnswer {
  criterionId: string;
  value: boolean | number | string;
  score: number;
  evidence?: string;
  attachments?: string[];
}

export interface Assessment {
  id: string;
  hospitalId: string;
  hospitalName: string;
  regionId: string;
  status: AssessmentStatus;
  currentStage: EMRAMStage;
  targetStage: EMRAMStage;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  reviewedAt?: string;
  validatedAt?: string;
  answers: AssessmentAnswer[];
  totalScore: number;
  categoryScores: Record<string, number>;
  createdBy: string;
  reviewedBy?: string;
  validatedBy?: string;
  hospitalNotes?: string;
  reviewerComments?: string;
  ministryComments?: string;
  version: number;
  previousVersionId?: string;
  fieldFindings?: Record<number, string>;
  stageVerifications?: Record<number, 'sesuai' | 'belum'>;
  catatanKoordinasi?: string;
  emramAnswers?: Record<string, 'yes' | 'partial' | 'no'>;
  koordinatorName?: string;
  koordinatorEmail?: string;
  vendorRME?: string;
}
