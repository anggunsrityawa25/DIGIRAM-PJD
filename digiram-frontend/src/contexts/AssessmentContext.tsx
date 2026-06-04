// FILE: src/contexts/AssessmentContext.tsx

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Assessment, AssessmentStatus } from '../types';
import {
  getAllAssessments,
  getMyAssessments,
  createAssessment as apiCreate,
  updateAssessment as apiUpdate,
  deleteAssessment as apiDelete,
  submitAssessment as apiSubmit,
  verifyAssessment as apiVerify,
  type VerifyPayload,
} from '../services/api';
import { useAuth } from './AuthContext';

interface AssessmentAnswer {
  questionId: string;
  score: number;
  notes?: string;
}

interface AssessmentContextType {
  assessments: Assessment[];
  loading: boolean;
  createAssessment: (data: any) => Promise<Assessment>;
  updateAssessment: (id: string, updates: Partial<Assessment> & Record<string, any>) => Promise<void>;
  deleteAssessment: (id: string) => Promise<void>;
  submitAssessment: (id: string) => Promise<void>;
  reviewAssessment: (id: string, notes: string, name: string, extra?: Omit<VerifyPayload, 'status' | 'verification_notes'>) => Promise<void>;
  rejectAssessment: (id: string, notes: string, extra?: Omit<VerifyPayload, 'status' | 'verification_notes'>) => Promise<void>;
  validateAssessment: (id: string, comments: string, validatorId: string) => Promise<void>;
  updateAnswers: (id: string, answers: AssessmentAnswer[]) => void;
  getAssessmentById: (id: string) => Assessment | undefined;
  getAssessmentsByHospital: (hospitalId: string) => Assessment[];
  getAssessmentsByStatus: (status: AssessmentStatus) => Assessment[];
  getAssessmentsByRegion: (regionId: string) => Assessment[];
  refreshAssessments: () => Promise<void>;
}

const AssessmentContext = createContext<AssessmentContextType | undefined>(undefined);

// Normalisasi data mentah dari backend ke format Assessment frontend
function normalizeAssessment(raw: any): Assessment {
  return {
    ...raw,
    id:               String(raw.id),
    hospitalId:       String(raw.user_id),
    hospitalName:     raw.user?.hospital?.name ?? raw.pic_name ?? 'RS Tidak Diketahui',
    regionId:         'yogyakarta',
    status:           raw.status ?? 'draft',
    emramAnswers:     typeof raw.answers === 'object' && !Array.isArray(raw.answers) ? raw.answers : {},
    answers:          [],
    totalScore:       raw.stage_result ?? 0,          // skor % hasil verifikasi dinkes (0-100)
    stage_result_pct: raw.stage_result ?? 0,          // alias eksplisit persentase skor
    categoryScores:   {},
    // target_stage = stage yang RS ajukan; stage_result = skor % hasil verifikasi dinkes
    targetStage:      raw.target_stage ?? 0,
    currentStage:     raw.target_stage ?? 0,          // stage RS (bukan skor)
    createdAt:        raw.created_at  ?? new Date().toISOString(),
    updatedAt:        raw.updated_at  ?? new Date().toISOString(),
    submittedAt:      raw.submitted_at  ?? undefined,
    reviewedAt:       raw.verified_at   ?? raw.reviewed_at ?? undefined,
    reviewerComments: raw.verification_notes ?? raw.catatan_akhir ?? undefined,
    reviewedBy:       raw.reviewer?.name ?? undefined,

    // Field PIC dari backend
    pic_name:         raw.pic_name      ?? '',
    pic_email:        raw.pic_email     ?? '',

    // Field koordinator RME (perbaikan: petakan dari backend)
    koordinator_rme:   raw.koordinator_rme   ?? '',
    koordinator_email: raw.koordinator_email ?? '',
    koordinatorName:   raw.koordinator_rme   ?? raw.pic_name   ?? '',
    koordinatorEmail:  raw.koordinator_email ?? raw.pic_email  ?? '',

    // Vendor & sistem RME
    vendor_simrs:     raw.vendor_simrs    ?? '',
    nama_sistem_rme:  raw.nama_sistem_rme ?? '',
    vendorRME:        raw.vendor_simrs    ?? '',

    // Periode & catatan
    periode:          raw.periode ?? '',
    hospitalNotes:    undefined,
    verification_notes: raw.verification_notes ?? '',

    // Field verifikasi 3 tahap
    tinjau_keputusan:    raw.tinjau_keputusan    ?? '',
    tinjau_catatan:      raw.tinjau_catatan      ?? '',
    pic_dinkes:          raw.pic_dinkes          ?? '',
    tanggal_kunjungan:   raw.tanggal_kunjungan   ?? '',
    temuan_per_stage:    raw.temuan_per_stage    ?? {},
    keputusan_per_stage: raw.keputusan_per_stage ?? {},
    catatan_kunjungan:   raw.catatan_kunjungan   ?? '',
    keputusan_akhir:     raw.keputusan_akhir     ?? '',
    catatan_akhir:       raw.catatan_akhir       ?? '',
    // Petakan ke field yang dipakai komponen modal laporan
    stageVerifications:  raw.keputusan_per_stage ?? {},
    fieldFindings:       raw.temuan_per_stage    ?? {},
    catatanKoordinasi:   raw.catatan_kunjungan   ?? '',
  } as unknown as Assessment;
}

export function AssessmentProvider({ children }: { children: ReactNode }) {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading]         = useState(false);
  const { isAuthenticated, user }     = useAuth();

  const refreshAssessments = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      let raw: any[];
      if (user?.role === 'health_office') {
        raw = await getAllAssessments();
      } else {
        raw = await getMyAssessments();
      }
      setAssessments(raw.map(normalizeAssessment));
    } catch (err: any) {
      console.error('Gagal memuat assessment:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refreshAssessments(); }, [isAuthenticated]);

  const createAssessment = async (data: any): Promise<Assessment> => {
    const res = await apiCreate(data);
    await refreshAssessments();
    return normalizeAssessment(res.data);
  };

  const updateAssessment = async (id: string, updates: Partial<Assessment> & Record<string, any>) => {
    const payload: Record<string, any> = {};

    // Field jawaban
    if (updates.answers      !== undefined) payload.answers      = updates.answers;
    if (updates.emramAnswers !== undefined) payload.answers      = updates.emramAnswers;
    // stage_result dari frontend = target stage yang RS ajukan → kirim sebagai stage_result ke backend
    // Backend akan simpan ke kolom target_stage
    if (updates.stage_result !== undefined) payload.stage_result = updates.stage_result;
    if (updates.totalScore   !== undefined) payload.stage_result = updates.totalScore;
    if (updates.targetStage  !== undefined) payload.stage_result = updates.targetStage;
    if (updates.status       !== undefined) payload.status       = updates.status;

    // Field PIC & koordinator
    const backendFields = [
      'pic_name', 'pic_email',
      'koordinator_rme', 'koordinator_email',
      'vendor_simrs', 'nama_sistem_rme',
      'periode', 'evidence_notes',
    ];
    for (const f of backendFields) {
      if (updates[f] !== undefined) payload[f] = updates[f];
    }

    await apiUpdate(id, payload);
    await refreshAssessments();
  };

  const deleteAssessment = async (id: string) => {
    await apiDelete(id);
    setAssessments(prev => prev.filter(a => a.id !== id));
  };

  const submitAssessment = async (id: string) => {
    await apiSubmit(id);
    await refreshAssessments();
  };

  const reviewAssessment = async (
    id: string,
    notes: string,
    _name: string,
    extra?: Omit<VerifyPayload, 'status' | 'verification_notes'>
  ) => {
    await apiVerify(id, 'reviewed', notes, extra);
    await refreshAssessments();
  };

  const rejectAssessment = async (id: string, notes: string, extra?: Omit<VerifyPayload, 'status' | 'verification_notes'>) => {
    await apiVerify(id, 'rejected', notes, extra);
    await refreshAssessments();
  };

  const validateAssessment = async (id: string, comments: string, _validatorId: string) => {
    await apiVerify(id, 'reviewed', comments);
    await refreshAssessments();
  };

  const updateAnswers = (id: string, answers: AssessmentAnswer[]) => {
    setAssessments(prev => prev.map(a => a.id === id ? { ...a, answers } : a));
  };

  return (
    <AssessmentContext.Provider
      value={{
        assessments, loading,
        createAssessment, updateAssessment, deleteAssessment,
        submitAssessment, reviewAssessment, rejectAssessment,
        validateAssessment, updateAnswers, refreshAssessments,
        getAssessmentById:        id  => assessments.find(a => a.id === id),
        getAssessmentsByHospital: hId => assessments.filter(a => a.hospitalId === hId),
        getAssessmentsByStatus:   s   => assessments.filter(a => a.status === s),
        getAssessmentsByRegion:   _r  => assessments,
      }}
    >
      {children}
    </AssessmentContext.Provider>
  );
}

export function useAssessments() {
  const context = useContext(AssessmentContext);
  if (context === undefined) {
    throw new Error('useAssessments must be used within an AssessmentProvider');
  }
  return context;
}