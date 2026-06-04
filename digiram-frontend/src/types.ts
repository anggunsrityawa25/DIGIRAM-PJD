// FILE: src/types.ts

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
  role: 'hospital' | 'health_office';
  hospital?: string | null;
  hospital_id?: number | null;
  organizationName?: string | null;
}

export interface Hospital {
  id: number;
  name: string;
  address?: string;
  city?: string;
  province?: string;
  type?: string;
  bed_capacity?: number;
  current_emram_stage?: number;
  last_assessment_date?: string;
}

export interface AssessmentAnswer {
  questionId: string;
  score: number;
  notes?: string;
}

export interface Assessment {
  id: string;
  hospitalId: string;
  hospitalName?: string;
  regionId?: string;
  status: AssessmentStatus;
  answers: Record<string, 'yes' | 'partial' | 'no'> | AssessmentAnswer[];
  totalScore?: number;
  categoryScores?: Record<string, number>;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  reviewedAt?: string;
  validatedAt?: string;
  reviewerComments?: string;
  reviewedBy?: string;
  ministryComments?: string;
  validatedBy?: string;
  fieldFindings?: Record<number, string>;
  stageVerifications?: Record<number, 'sesuai' | 'belum'>;
  catatanKoordinasi?: string;
  currentStage?: number;
  targetStage?: number;
  hospitalNotes?: string;
  emramAnswers?: Record<string, 'yes' | 'partial' | 'no'>;
  vendorRME?: string;

  // Koordinator RME (berbeda dengan pemilik akun)
  koordinatorName?: string;
  koordinatorEmail?: string;
  koordinator_rme?: string;
  koordinator_email?: string;

  // Field dari backend Laravel
  pic_name?: string;
  pic_email?: string;
  vendor_simrs?: string;
  nama_sistem_rme?: string;
  periode?: string;
  stage_result?: number;
  verification_notes?: string;

  // Field verifikasi 3 tahap
  tinjau_keputusan?: string;
  tinjau_catatan?: string;
  pic_dinkes?: string;
  tanggal_kunjungan?: string;
  temuan_per_stage?: Record<number, string>;
  keputusan_per_stage?: Record<number, string>;
  catatan_kunjungan?: string;
  keputusan_akhir?: string;
  catatan_akhir?: string;
}