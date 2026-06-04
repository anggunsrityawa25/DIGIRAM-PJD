// FILE: src/components/SimariHospitalDashboard.tsx

import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAssessments } from '../contexts/AssessmentContext';
import { Sidebar } from './Sidebar';
import { InstrumentEMRAM } from './InstrumentEMRAM';
import { AuditBaruEMRAM } from './AuditBaruEMRAM';
import { PengaturanAkses } from './PengaturanAkses';
import { RiwayatAssessment } from './RiwayatAssessment';

type AnswerValue = 'yes' | 'partial' | 'no' | null;

interface DraftState {
  assessmentId: string;
  answers: Record<string, AnswerValue>;
  step: number;
}

interface FormData {
  namaPIC: string;
  emailPIC: string;
  vendor: string;
  koordinatorRME: string;
  koordinatorEmail: string;
  namaSistemRME: string;
}

export function SimariHospitalDashboard() {
  const { user, logout } = useAuth();
  const {
    getAssessmentsByHospital,
    createAssessment,
    updateAssessment,
    submitAssessment,
  } = useAssessments();

  const [currentPage, setCurrentPage] = useState('dashboard');
  const [savedDrafts, setSavedDrafts]         = useState<Record<string, DraftState>>({});
  const [activeInstrumentId, setActiveInstrumentId] = useState<string | null>(null);
  const [pendingFormData, setPendingFormData]  = useState<FormData | null>(null);
  const [isSaving, setIsSaving]               = useState(false);
  const [showSaveDraftToast, setShowSaveDraftToast] = useState(false);

  // Data hospital dari login response
  const hospital = (user as any)?.hospital_data ?? null;

  // Deklarasikan dulu sebelum digunakan
  const hospitalAssessments = getAssessmentsByHospital(String(user?.id || ''));

  // currentStage = stage tertinggi yang sudah TERVALIDASI Dinkes (status reviewed/validated)
  // Dihitung dari assessment yang sudah disetujui, bukan dari hospital_data yang bisa stale
  const validatedAssessments = hospitalAssessments.filter(
    a => a.status === 'reviewed' || a.status === 'validated'
  );
  const currentStageRaw: number = validatedAssessments.length > 0
    ? Math.max(...validatedAssessments.map(a => (a as any).targetStage ?? (a as any).currentStage ?? 0))
    : (hospital?.current_emram_stage ?? 0);
  // Clamp to valid range 0-7 (backend may store legacy values >7)
  const currentStage: number = Math.min(7, Math.max(0, Number(currentStageRaw) || 0));
  const draftCount     = hospitalAssessments.filter(a => a.status === 'draft').length;
  const reviewCount    = hospitalAssessments.filter(a => a.status === 'submitted' || a.status === 'under_review').length;
  const validatedCount = hospitalAssessments.filter(a => a.status === 'reviewed' || a.status === 'validated').length;

  // Cek apakah user ini belum pernah melakukan audit sama sekali
  // Jika belum ada assessment apapun, saat klik "Mulai Audit" → diarahkan ke stage 0
  const hasEverDoneAudit = hospitalAssessments.length > 0;

  const getStageClass = (stage: number) => `stage-s${stage}`;

  const calcScore = (answers: Record<string, AnswerValue>): number => {
    const vals = Object.values(answers).filter(v => v !== null);
    if (vals.length === 0) return 0;
    const points = vals.reduce((s, v) => s + (v === 'yes' ? 1 : v === 'partial' ? 0.5 : 0), 0);
    return Math.round((points / vals.length) * 100);
  };

  const buildEmramAnswers = (answers: Record<string, AnswerValue>): Record<string, 'yes' | 'partial' | 'no'> =>
    Object.fromEntries(
      Object.entries(answers).filter(([, v]) => v !== null) as [string, 'yes' | 'partial' | 'no'][]
    );

  const deriveTargetStage = (answers: Record<string, AnswerValue>): 0|1|2|3|4|5|6|7 => {
    let highest = 0;
    for (let s = 7; s >= 0; s--) {
      const hasAnswer = Object.entries(answers).some(([k, v]) => k.startsWith(`s${s}i`) && v !== null);
      if (hasAnswer) { highest = s; break; }
    }
    return Math.min(highest, 7) as 0|1|2|3|4|5|6|7;
  };

  const handleSaveDraft = async (answers: Record<string, AnswerValue>, _step: number, evidenceNotes?: Record<string, string>) => {
    if (isSaving) return;
    setIsSaving(true);
    let assessmentId = activeInstrumentId;
    const emramAnswers = buildEmramAnswers(answers);
    const targetStage  = deriveTargetStage(answers);

    try {
      if (!assessmentId) {
        // Buat draf baru hanya jika memang belum ada assessmentId
        const newAssessment = await createAssessment({
          pic_name:          user?.name || '',
          pic_email:         user?.email || '',
          koordinator_rme:   pendingFormData?.koordinatorRME   || '',
          koordinator_email: pendingFormData?.koordinatorEmail || '',
          vendor_simrs:      pendingFormData?.vendor           || '',
          nama_sistem_rme:   pendingFormData?.namaSistemRME    || '',
          periode:           'Q2 2026',
          answers:           emramAnswers,
          stage_result:      targetStage,
          ...(evidenceNotes && Object.keys(evidenceNotes).length > 0 ? { evidence_notes: evidenceNotes } : {}),
        });
        assessmentId = newAssessment.id;
        setActiveInstrumentId(assessmentId);
      } else {
        // Update draf yang sudah ada — JANGAN buat baru
        await updateAssessment(assessmentId, {
          answers:      emramAnswers,
          stage_result: targetStage,
          totalScore:   calcScore(answers),
          ...(evidenceNotes && Object.keys(evidenceNotes).length > 0 ? { evidence_notes: evidenceNotes } : {}),
        });
      }
      setSavedDrafts(prev => ({
        ...prev,
        [assessmentId!]: { assessmentId: assessmentId!, answers, step: _step },
      }));
      // Tampilkan toast notifikasi
      setShowSaveDraftToast(true);
      setTimeout(() => setShowSaveDraftToast(false), 3500);
      // Arahkan ke Riwayat Penilaian
      setActiveInstrumentId(null);
      setCurrentPage('riwayat');
    } catch (err: any) {
      console.error('Gagal simpan draft:', err);
      alert(`Gagal menyimpan draf: ${err.message || 'Cek koneksi ke server Laravel.'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitToDinkes = async (answers: Record<string, AnswerValue>, _step: number, evidenceNotes?: Record<string, string>) => {
    if (isSaving) return;
    setIsSaving(true);
    let assessmentId = activeInstrumentId;
    const emramAnswers = buildEmramAnswers(answers);
    const targetStage  = deriveTargetStage(answers);

    try {
      if (!assessmentId) {
        const newAssessment = await createAssessment({
          pic_name:          user?.name || '',
          pic_email:         user?.email || '',
          koordinator_rme:   pendingFormData?.koordinatorRME   || '',
          koordinator_email: pendingFormData?.koordinatorEmail || '',
          vendor_simrs:      pendingFormData?.vendor           || '',
          nama_sistem_rme:   pendingFormData?.namaSistemRME    || '',
          periode:           'Q2 2026',
          answers:           emramAnswers,
          stage_result:      targetStage,
          ...(evidenceNotes && Object.keys(evidenceNotes).length > 0 ? { evidence_notes: evidenceNotes } : {}),
        });
        assessmentId = newAssessment.id;
      } else {
        await updateAssessment(assessmentId, {
          answers:      emramAnswers,
          stage_result: targetStage,
          totalScore:   calcScore(answers),
          ...(evidenceNotes && Object.keys(evidenceNotes).length > 0 ? { evidence_notes: evidenceNotes } : {}),
        });
      }
      await submitAssessment(assessmentId!);
      setSavedDrafts(prev => ({
        ...prev,
        [assessmentId!]: { assessmentId: assessmentId!, answers, step: _step },
      }));
      setActiveInstrumentId(null);
      setCurrentPage('riwayat');
    } catch (err: any) {
      console.error('Gagal submit:', err);
      alert(`Gagal mengirim ke Dinkes: ${err.message || 'Cek koneksi ke server Laravel.'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleContinueDraft = (assessmentId: string) => {
    // Ambil jawaban dari assessment yang sudah tersimpan di backend
    const existingAssessment = getAssessmentsByHospital(String(user?.id || '')).find(a => a.id === assessmentId);
    if (existingAssessment?.emramAnswers && Object.keys(existingAssessment.emramAnswers).length > 0) {
      const answers = existingAssessment.emramAnswers as Record<string, AnswerValue>;
      const highestStage = deriveTargetStage(answers);
      const resumeStep = highestStage + 1;
      setSavedDrafts(prev => ({
        ...prev,
        [assessmentId]: {
          assessmentId,
          answers,
          // Gunakan step yang sudah tersimpan jika ada, atau hitung dari stage tertinggi
          step: prev[assessmentId]?.step ?? resumeStep,
        },
      }));
    }
    // activeInstrumentId HARUS diset ke assessmentId yang sedang dilanjutkan
    // agar handleSaveDraft melakukan UPDATE (bukan create baru)
    setActiveInstrumentId(assessmentId);
    setCurrentPage('instrument');
  };

  // Handler saat "Mulai Audit" diklik dari AuditBaruEMRAM
  // Jika sudah ada stage tervalidasi, InstrumentEMRAM akan mulai dari stage berikutnya
  const handleStartAudit = (data: FormData) => {
    setPendingFormData(data as FormData);

    // Cek apakah ada draf yang sedang aktif untuk dilanjutkan
    const existingDraft = hospitalAssessments.find(a => a.status === 'draft');
    if (existingDraft) {
      // Lanjutkan draf yang sudah ada
      handleContinueDraft(existingDraft.id);
      return;
    }

    // Tidak ada draf — mulai audit baru dari stage berikutnya (setelah currentStage tervalidasi)
    setActiveInstrumentId(null);
    setCurrentPage('instrument');
  };

  const stageDescriptions: Record<number, string> = {
    0: 'Belum ada sistem digital — data klinis masih paper-based',
    1: 'Sistem ancillary terpasang — LIS, RIS, dan Farmasi aktif',
    2: 'CDR & Terminologi — data terhimpun, coding diagnosis & prosedur',
    3: 'Dokumentasi Klinis — catatan perawat dan eMedicrec elektronik',
    4: 'CPOE & CDS — order elektronik + clinical decision support',
    5: 'Closed Loop — verifikasi obat dan dokumentasi lengkap terverifikasi',
    6: 'Teknologi Lanjutan — analitik klinis dan data warehouse aktif',
    7: 'Paperless — rekam medis penuh digital dengan HIE nasional',
  };

  return (
    <div className="simari-app">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} onLogout={logout} />

      <main className="simari-main">

        {/* ── DASHBOARD ── */}
        {currentPage === 'dashboard' && (
          <div className="page-content">
            <div className="page-header">
              <h1>Selamat datang, {user?.name?.split(' ').slice(-2).join(' ')}</h1>
              <p>Penilaian mandiri EMRAM untuk {hospital?.name || user?.hospital || '...'}</p>
            </div>

            {/* Metrik */}
            <div className="grid-4 mb-20">
              <div className="metric-card">
                <div className="metric-label">Stage EMRAM Saat Ini</div>
                <div className="metric-value">{currentStage > 0 ? currentStage : '—'}</div>
                <div className="metric-change">
                  <span className={getStageClass(currentStage)}>● Stage {currentStage}</span>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Draf Penilaian</div>
                <div className="metric-value">{draftCount}</div>
                <div className="metric-change text-muted">Belum dikirim</div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Dalam Tinjauan</div>
                <div className="metric-value">{reviewCount}</div>
                <div className="metric-change text-muted">Menunggu verifikasi</div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Tervalidasi</div>
                <div className="metric-value">{validatedCount}</div>
                <div className="metric-change text-muted">Sudah terverifikasi</div>
              </div>
            </div>

            {/* Progress Kematangan RME
                currentStage berasal dari hospital.current_emram_stage (database),
                yang diupdate setiap kali Dinkes memvalidasi assessment.
                Untuk user baru (RSUD Sleman, stage 0), semua stage tampil sebagai "belum". */}
            <div className="simari-card mb-20">
              <div className="card-title">Progress Kematangan RME</div>
              {!hasEverDoneAudit && currentStage === 0 && (
                <div style={{ padding: '10px 14px', background: 'var(--accent-light)', borderRadius: '8px', marginTop: '8px', marginBottom: '4px', fontSize: '12px', color: 'var(--accent)', fontWeight: 600 }}>
                  ℹ Faskes ini belum pernah melakukan audit EMRAM. Klik "Audit RME" untuk memulai dari Stage 0.
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
                {[0,1,2,3,4,5,6,7].map(stage => {
                  const isCurrent = stage === currentStage;
                  const isPast    = stage < currentStage;
                  const isNext    = stage === currentStage + 1;
                  return (
                    <div key={stage} style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '10px 14px', borderRadius: '8px',
                      background: isCurrent ? 'var(--accent-light)' : isPast ? 'var(--surface2)' : 'transparent',
                      border: isCurrent ? '1px solid var(--accent)' : '1px solid transparent',
                    }}>
                      <div style={{
                        width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                        background: (isPast || isCurrent) ? 'var(--accent)' : 'var(--surface2)',
                        border: `2px solid ${(isPast || isCurrent) ? 'var(--accent)' : 'var(--border2)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontSize: '10px', fontWeight: 700,
                      }}>
                        {isPast ? '✓' : stage}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: isCurrent ? 700 : 500, color: isCurrent ? 'var(--accent)' : isPast ? 'var(--text2)' : 'var(--text3)' }}>
                          Stage {stage}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '1px' }}>
                          {stageDescriptions[stage]}
                        </div>
                      </div>
                      <div style={{ flexShrink: 0 }}>
                        {isPast    && <span className="status-badge status-done" style={{ fontSize: '10px' }}>✓ Tercapai</span>}
                        {isCurrent && <span className={`stage-badge ${getStageClass(stage)}`}>Stage Saat Ini</span>}
                        {isNext    && <span className="status-badge status-review" style={{ fontSize: '10px' }}>Target Berikutnya</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── INSTRUMENT ── */}
        {currentPage === 'instrument' && (
          <InstrumentEMRAM
            hospitalName={hospital?.name || user?.hospital || 'RSUD'}
            hospitalStage={currentStage}
            assessmentId={activeInstrumentId}
            onBack={() => setCurrentPage('audit')}
            onSaveDraft={handleSaveDraft}
            onSubmitToDinkes={handleSubmitToDinkes}
            initialAnswers={activeInstrumentId ? savedDrafts[activeInstrumentId]?.answers : undefined}
            initialStep={activeInstrumentId ? savedDrafts[activeInstrumentId]?.step : undefined}
          />
        )}

        {/* ── AUDIT BARU ──
            hasEverDoneAudit: jika false → hospitalStage dikirim 0 ke AuditBaruEMRAM
            sehingga panel kanan menampilkan "Stage 0 → Stage 1" */}
        {currentPage === 'audit' && (
          <AuditBaruEMRAM
            hospitalName={hospital?.name || user?.hospital || 'RSUD'}
            hospitalStage={hasEverDoneAudit ? currentStage : 0}
            onStartAudit={handleStartAudit}
          />
        )}

        {/* ── RIWAYAT ── */}
        {currentPage === 'riwayat' && (
          <RiwayatAssessment
            hospitalId={String(user?.id || '')}
            onContinueDraft={handleContinueDraft}
          />
        )}

        {/* ── PROFIL FASKES ── */}
        {currentPage === 'profil' && (
          <div className="page-content">
            <div className="page-header">
              <h1>Profil Faskes</h1>
              <p>Informasi lengkap tentang {hospital?.name || user?.hospital}</p>
            </div>
            <div className="simari-card">
              <div className="card-title" style={{ marginBottom: '16px' }}>Data Faskes</div>
              <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '14px 16px', alignItems: 'start' }}>

                <span style={{ fontSize: '13px', color: 'var(--text3)' }}>Nama Lengkap:</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>
                  {hospital?.name || user?.hospital || '—'}
                </span>

                <span style={{ fontSize: '13px', color: 'var(--text3)' }}>Tipe Faskes:</span>
                <span style={{ fontSize: '13px', color: 'var(--text)' }}>
                  {hospital?.type || '—'}
                </span>

                <span style={{ fontSize: '13px', color: 'var(--text3)' }}>Alamat Lengkap:</span>
                <span style={{ fontSize: '13px', color: 'var(--text)' }}>
                  {hospital?.address || 'Alamat belum diisi'}
                </span>

                <span style={{ fontSize: '13px', color: 'var(--text3)' }}>Kota/Kabupaten:</span>
                <span style={{ fontSize: '13px', color: 'var(--text)' }}>
                  {hospital?.city || '—'}
                </span>

                <span style={{ fontSize: '13px', color: 'var(--text3)' }}>Provinsi:</span>
                <span style={{ fontSize: '13px', color: 'var(--text)' }}>
                  {hospital?.province || '—'}
                </span>

                <span style={{ fontSize: '13px', color: 'var(--text3)' }}>Kapasitas Tempat Tidur:</span>
                <span style={{ fontSize: '13px', color: 'var(--text)' }}>
                  {hospital?.bed_capacity ? `${hospital.bed_capacity} tempat tidur` : '—'}
                </span>

                <span style={{ fontSize: '13px', color: 'var(--text3)' }}>Stage EMRAM Tervalidasi:</span>
                <span>
                  <span className={`stage-badge ${getStageClass(currentStage)}`} style={{ fontSize: '13px', padding: '4px 16px' }}>
                    Stage {currentStage}
                  </span>
                </span>

                <span style={{ fontSize: '13px', color: 'var(--text3)' }}>Penilaian Terakhir:</span>
                <span style={{ fontSize: '13px', color: 'var(--text)' }}>
                  {hospital?.last_assessment_date || '—'}
                </span>

                {/* Status audit */}
                <span style={{ fontSize: '13px', color: 'var(--text3)' }}>Status Audit:</span>
                <span style={{ fontSize: '13px', color: 'var(--text)' }}>
                  {!hasEverDoneAudit
                    ? <span style={{ color: 'var(--text3)', fontStyle: 'italic' }}>Belum pernah melakukan audit</span>
                    : <span style={{ color: 'var(--accent)', fontWeight: 600 }}>Sudah pernah audit</span>
                  }
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ── PENGATURAN ── */}
        {currentPage === 'pengaturan' && (
          <PengaturanAkses onLogout={logout} />
        )}
      </main>

      {/* ── TOAST: Draf Berhasil Disimpan ── */}
      {showSaveDraftToast && (
        <div style={{
          position: 'fixed', bottom: '28px', left: '50%', transform: 'translateX(-50%)',
          background: '#1a2535', color: 'white', borderRadius: '12px',
          padding: '14px 20px', boxShadow: '0 8px 32px rgba(0,0,0,0.22)',
          display: 'flex', alignItems: 'flex-start', gap: '12px',
          zIndex: 9999, minWidth: '320px', maxWidth: '460px',
          animation: 'fadeInUp 0.25s ease',
        }}>
          <div style={{
            width: '24px', height: '24px', borderRadius: '50%', background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '13px', fontWeight: 700, flexShrink: 0, marginTop: '1px',
          }}>✓</div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '3px' }}>
              Draf Audit RME berhasil disimpan
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>
              Pengisian dapat dilanjutkan kapan saja melalui Riwayat Penilaian.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}