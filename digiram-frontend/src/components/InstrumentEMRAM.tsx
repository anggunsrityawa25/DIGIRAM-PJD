import { useState, useRef, useEffect } from 'react';
import { uploadEvidenceFile, getEmramInstrument } from '../services/api';
import { FileText, Upload, Save } from 'lucide-react';

type AnswerValue = 'yes' | 'partial' | 'no' | null;

interface FileAttachment {
  name: string;
  url: string;       // object URL for preview / download
  type: string;      // MIME type
  size: number;
}

interface EvidenceData {
  notes: string;
  files: FileAttachment[];
}

interface Indicator {
  id: string;
  text: string;
}

interface StageData {
  stage: number;
  title: string;
  description: string;
  indicators: Indicator[];
}

// Data statis sebagai fallback jika API tidak tersedia
const STATIC_STAGES: StageData[] = [
  {
    stage: 0,
    title: 'Pra-Implementasi',
    description: 'Sistem laboratorium, farmasi, dan radiologi belum terimplementasi',
    indicators: [
      { id: 's0i1', text: 'Modul laboratorium tersedia dalam SIMRS' },
      { id: 's0i2', text: 'Modul farmasi tersedia dalam SIMRS' },
      { id: 's0i3', text: 'Modul radiologi tersedia dalam SIMRS' },
    ],
  },
  {
    stage: 1,
    title: 'Ancillary Systems',
    description: 'Sistem laboratorium, farmasi, dan radiologi sudah terimplementasi — belum menggunakan standar DICOM',
    indicators: [
      { id: 's1i1', text: 'Modul laboratorium sudah terimplementasi dan digunakan' },
      { id: 's1i2', text: 'Modul farmasi sudah terimplementasi dan digunakan' },
      { id: 's1i3', text: 'Modul radiologi sudah terimplementasi (belum wajib DICOM/PACS)' },
    ],
  },
  {
    stage: 2,
    title: 'CDR & Interoperabilitas Internal',
    description: 'Terdapat interoperabilitas internal; klinisi dapat mengakses permintaan, hasil, dan gambar radiologi; adanya kebijakan dan implementasi sistem keamanan dasar',
    indicators: [
      { id: 's2i1', text: 'Data pasien terintegrasi (lab, radiologi, obat dalam satu tampilan)' },
      { id: 's2i2', text: 'Riwayat pasien dapat ditelusuri lintas unit' },
      { id: 's2i3', text: 'Ada manajemen user dan hak akses' },
      { id: 's2i4', text: 'Ada fitur keamanan dasar (login, password)' },
      { id: 's2i5', text: 'Tersedia terminologi medis terkontrol (ICD-10/LOINC/SNOMED CT/DICOM)' },
      { id: 's2i6', text: 'Tersedia document imaging' },
    ],
  },
  {
    stage: 3,
    title: 'Dokumentasi Klinis & e-Prescribing',
    description: '50% dokumentasi keperawatan telah tersimpan dan terintegrasi secara elektronik; sistem peresepan elektronik telah terimplementasi',
    indicators: [
      { id: 's3i1', text: 'Dokumentasi asuhan keperawatan tersedia dalam sistem' },
      { id: 's3i2', text: 'Sistem peresepan elektronik (e-prescribing) terimplementasi' },
      { id: 's3i3', text: 'Dokumentasi asuhan keperawatan terisi' },
      { id: 's3i4', text: 'Tersedia Clinical Decision Support System (CDSS) meliputi sistem peringatan interaksi obat dengan obat, obat dengan makanan, dan obat dengan hasil lab' },
      { id: 's3i5', text: 'PACS tersedia di luar bagian radiologi (dapat diakses/dilihat petugas lain)' },
      { id: 's3i6', text: 'Terimplementasi sistem kontrol akses berbasis peran (RBAC)' },
    ],
  },
  {
    stage: 4,
    title: 'CPOE & Clinical Decision Support',
    description: '50% dari semua jenis permintaan pemeriksaan medis telah menggunakan sistem terkomputerisasi (CPOE) dan didukung dengan sistem pendukung keputusan klinis (CDS)',
    indicators: [
      { id: 's4i1', text: 'Dokter melakukan order atau permintaan pemeriksaan penunjang secara elektronik' },
      { id: 's4i2', text: 'Tersedianya sistem pendukung keputusan klinis (CDS) sederhana' },
      { id: 's4i3', text: 'Resep diinputkan dokter secara elektronik' },
      { id: 's4i4', text: 'Order pemeriksaan penunjang diinputkan secara elektronik' },
      { id: 's4i5', text: 'Tenaga kesehatan memiliki akses database pasien regional atau nasional untuk decision making pengobatan, medical imaging, imunisasi, dan hasil lab' },
    ],
  },
  {
    stage: 5,
    title: 'Dokumentasi Dokter & Keamanan Lanjutan',
    description: '50% dari catatan dokter terdokumentasi penuh secara elektronik menggunakan template yang terstruktur. Adanya sistem pencegahan intrusi.',
    indicators: [
      { id: 's5i1', text: 'Tersedia dokumentasi dokter (catatan perkembangan, konsultasi, ringkasan pulang, daftar diagnosis, dan lainnya) menggunakan template yang terstruktur dan data diskrit untuk 50% dari lingkup rumah sakit' },
      { id: 's5i2', text: 'Ada sistem pencegahan intrusi/keamanan akses tingkat lanjut (IDS/IPS)' },
      { id: 's5i3', text: 'Terimplementasi operasi di jaringan dan remote wiping (kemampuan penghapusan data jarak jauh) saat terjadi pencurian data' },
      { id: 's5i4', text: 'Terdapat fitur audit trail' },
    ],
  },
  {
    stage: 6,
    title: 'Closed-Loop Administration',
    description: '50% kegiatan pemberian obat, transfusi darah, dan ASI, serta pengumpulan dan pelacakan spesimen darah menggunakan closed-loop administration',
    indicators: [
      { id: 's6i1', text: 'Peresepan dan pemberian obat kepada pasien tercatat secara elektronik' },
      { id: 's6i2', text: 'Terdapat verifikasi identitas pasien dan obat yang diberikan secara elektronik' },
      { id: 's6i3', text: 'Permintaan transfusi darah diinputkan ke dalam sistem' },
      { id: 's6i4', text: 'Terdapat verifikasi identitas pasien dan kantong darah secara elektronik sebelum transfusi dilakukan' },
      { id: 's6i5', text: 'Instruksi pemberian ASI diinputkan ke dalam sistem' },
      { id: 's6i6', text: 'Terdapat verifikasi identitas bayi dan ibu secara elektronik sebelum ASI diberikan' },
      { id: 's6i7', text: 'Spesimen pemeriksaan penunjang memiliki identitas unik dan dapat dilacak statusnya (diambil, diproses, hasil)' },
    ],
  },
  {
    stage: 7,
    title: 'Paperless & HIE Penuh',
    description: 'Menggunakan sistem elektronik secara penuh. Dokumentasi klinis dan CPOE mencapai 90%. Closed-loop administration mencapai 95%. Kemampuan interoperabilitas eksternal (HIE). Disaster recovery.',
    indicators: [
      { id: 's7i1', text: 'Kelengkapan pengisian dokumentasi klinis secara elektronik mencapai 90%' },
      { id: 's7i2', text: 'Pelaksanaan CPOE melalui sistem elektronik mencapai 90%' },
      { id: 's7i3', text: 'Pelaksanaan closed-loop administration mencapai 95%' },
      { id: 's7i4', text: 'Sistem telah terintegrasi penuh dengan SATUSEHAT' },
      { id: 's7i5', text: 'Terdapat fitur disaster recovery/backup pada server terpisah' },
    ],
  },
];

const STEP_IDENTITAS = 0;
const STEP_REVIEW = 9;

function stageStepIndex(stage: number) { return stage + 1; }

function calcStageScore(stageData: StageData, answers: Record<string, AnswerValue>) {
  const total = stageData.indicators.length;
  if (total === 0) return 0;
  const score = stageData.indicators.reduce((acc, ind) => {
    const a = answers[ind.id];
    if (a === 'yes') return acc + 1;
    if (a === 'partial') return acc + 0.5;
    return acc;
  }, 0);
  return Math.round((score / total) * 100);
}

function calcOverallScore(answers: Record<string, AnswerValue>, stages: StageData[]) {
  const totalInds = stages.reduce((a: number, s: StageData) => a + s.indicators.length, 0);
  const scored = stages.reduce((acc: number, s: StageData) => {
    return acc + s.indicators.reduce((a2: number, ind: Indicator) => {
      const v = answers[ind.id];
      if (v === 'yes') return a2 + 1;
      if (v === 'partial') return a2 + 0.5;
      return a2;
    }, 0);
  }, 0);
  return Math.round((scored / (totalInds || 1)) * 100);
}

function allAnswered(stageData: StageData, answers: Record<string, AnswerValue>) {
  return stageData.indicators.every(i => answers[i.id] != null);
}

// ── Sub-components ────────────────────────────────────────────────────────────
function ScoreGauge({ score }: { score: number }) {
  const R = 52;
  const circ = 2 * Math.PI * R;
  const offset = circ * (1 - score / 100);
  const estimatedStage = score >= 95 ? 7 : score >= 82 ? 6 : score >= 68 ? 5 : score >= 54 ? 4 : score >= 40 ? 3 : score >= 26 ? 2 : score >= 13 ? 1 : 0;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '18px 0 10px' }}>
      <svg width="130" height="130" viewBox="0 0 130 130">
        <circle cx="65" cy="65" r={R} fill="none" stroke="var(--surface2)" strokeWidth="10" />
        <circle cx="65" cy="65" r={R} fill="none" stroke="var(--accent)" strokeWidth="10"
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          transform="rotate(-90 65 65)" style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
        <text x="65" y="60" textAnchor="middle" dominantBaseline="middle"
          style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '30px', fontWeight: '700', fill: 'var(--text)' }}>
          {score}
        </text>
        <text x="65" y="83" textAnchor="middle"
          style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '10px', fill: 'var(--text3)' }}>
          dari 100
        </text>
      </svg>
      <div style={{ background: `var(--stage${estimatedStage})`, color: 'white', fontSize: '11px', fontWeight: 700, padding: '3px 12px', borderRadius: '20px', marginTop: '4px' }}>
        Estimasi: Stage {estimatedStage}
      </div>
    </div>
  );
}

function AnswerBtn({
  label, value, current, onSelect, disabled,
}: {
  label: string;
  value: Exclude<AnswerValue, null>;
  current: AnswerValue;
  onSelect: () => void;
  disabled?: boolean;
}) {
  const colors = {
    yes:     { bg: 'var(--accent-light)',  border: 'var(--accent)',  text: 'var(--accent)'  },
    partial: { bg: 'var(--warn-light)',    border: 'var(--warn)',    text: 'var(--warn)'    },
    no:      { bg: 'var(--danger-light)',  border: 'var(--danger)',  text: 'var(--danger)'  },
  };
  const sel = current === value;
  const c = colors[value];
  return (
    <button
      onClick={disabled ? undefined : onSelect}
      style={{
        padding: '4px 12px', borderRadius: '6px', fontSize: '12px',
        fontWeight: sel ? 600 : 400,
        border: `1px solid ${sel ? c.border : 'var(--border2)'}`,
        background: sel ? c.bg : 'var(--surface)',
        color: sel ? c.text : 'var(--text3)',
        cursor: disabled ? 'default' : 'pointer',
        transition: 'all 0.12s',
        opacity: disabled ? 0.8 : 1,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      {label}
    </button>
  );
}

function EvidencePanel({
  indId,
  evidence,
  onNotesChange,
  onFileAdd,
  onFileRemove,
  assessmentId,
}: {
  indId: string;
  evidence: EvidenceData;
  onNotesChange: (notes: string) => void;
  onFileAdd: (attachment: FileAttachment) => void;
  onFileRemove: (idx: number) => void;
  assessmentId?: string | null;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState(evidence.notes);
  const isDirty = draft !== evidence.notes;
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    e.target.value = '';
    setUploadError(null);

    for (const f of files) {
      // Always add with local object URL for immediate preview
      const localUrl = URL.createObjectURL(f);
      const localAttachment: FileAttachment = { name: f.name, url: localUrl, type: f.type, size: f.size };

      if (assessmentId) {
        // Upload to server
        setUploading(true);
        try {
          const uploaded = await uploadEvidenceFile(assessmentId, indId, f);
          // Replace local URL with server URL
          onFileAdd({ name: uploaded.name, url: uploaded.url, type: uploaded.type, size: uploaded.size });
        } catch (err: any) {
          setUploadError('Gagal unggah: ' + err.message);
          // Still add locally so user doesn't lose the file
          onFileAdd(localAttachment);
        } finally {
          setUploading(false);
        }
      } else {
        // No assessment yet — store locally (will be sent on save)
        onFileAdd(localAttachment);
      }
    }
  };

  const fileIconStyle: React.CSSProperties = {
    fontSize: '10px', padding: '2px 8px', borderRadius: '4px',
    background: 'var(--surface2)', color: 'var(--text2)', border: '1px solid var(--border2)',
    display: 'inline-flex', alignItems: 'center', gap: '4px',
  };

  return (
    <div style={{ marginTop: '10px', borderTop: '1px dashed var(--border2)', paddingTop: '10px' }}>
      <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
        Bukti Validasi
      </div>

      {/* Notes with Save/Cancel */}
      <textarea
        value={draft}
        onChange={e => setDraft(e.target.value)}
        placeholder="Tuliskan keterangan bukti, nomor dokumen, atau link referensi..."
        rows={2}
        style={{
          width: '100%', resize: 'vertical', fontSize: '12px', padding: '8px 10px',
          borderRadius: '6px', border: `1px solid ${isDirty ? 'var(--accent)' : 'var(--border2)'}`,
          background: 'var(--surface2)', color: 'var(--text)', lineHeight: 1.5,
          outline: 'none', boxSizing: 'border-box',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      />
      {isDirty && (
        <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
          <button
            onClick={() => { onNotesChange(draft); }}
            style={{
              padding: '5px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 600,
              background: 'var(--accent)', color: 'white', border: 'none', cursor: 'pointer',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            Simpan
          </button>
          <button
            onClick={() => setDraft(evidence.notes)}
            style={{
              padding: '5px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 500,
              background: 'var(--surface)', color: 'var(--text2)', border: '1px solid var(--border2)',
              cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            Batal
          </button>
        </div>
      )}

      {/* Saved notes display */}
      {evidence.notes && !isDirty && (
        <div style={{ marginTop: '4px', fontSize: '11px', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          ✓ Keterangan tersimpan
        </div>
      )}

      {/* File list */}
      {evidence.files.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
          {evidence.files.map((att, idx) => (
            <span key={idx} style={{ ...fileIconStyle, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <FileText size={11} />
              <a href={att.url} target="_blank" rel="noopener noreferrer"
                style={{ color: 'inherit', textDecoration: 'none', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                title={att.name}
              >
                {att.name}
              </a>
              <button
                onClick={() => onFileRemove(idx)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: '0', fontSize: '10px', lineHeight: 1 }}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Upload button */}
      <input
        ref={fileRef}
        type="file"
        multiple
        style={{ display: 'none' }}
        onChange={handleFileChange}
        aria-label={`Upload bukti untuk ${indId}`}
      />
      {uploadError && (
        <div style={{ fontSize: '11px', color: 'var(--danger)', marginTop: '4px' }}>{uploadError}</div>
      )}
      <button
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        style={{
          marginTop: '8px', display: 'inline-flex', alignItems: 'center', gap: '5px',
          fontSize: '11px', padding: '5px 12px', borderRadius: '6px',
          border: '1px dashed var(--border2)', background: 'transparent',
          color: uploading ? 'var(--text3)' : 'var(--text2)', cursor: uploading ? 'default' : 'pointer',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          opacity: uploading ? 0.6 : 1,
        }}
      >
        {uploading ? '⟳ Mengunggah...' : '↑ Unggah Dokumen Bukti'}
      </button>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
interface InstrumentEMRAMProps {
  hospitalName?: string;
  hospitalStage?: number;
  assessmentId?: string | null;  // ID assessment aktif (untuk upload file ke server)
  onBack?: () => void;
  onSaveDraft?: (answers: Record<string, AnswerValue>, step: number, evidenceNotes?: Record<string, string>) => void;
  onSubmitToDinkes?: (answers: Record<string, AnswerValue>, step: number, evidenceNotes?: Record<string, string>) => void;
  initialAnswers?: Record<string, AnswerValue>;
  initialStep?: number;
}

export function InstrumentEMRAM({
  hospitalName = 'RSUD Central General',
  hospitalStage: hospitalStageRaw = 4,
  assessmentId = null,
  onBack,
  onSaveDraft,
  onSubmitToDinkes,
  initialAnswers,
  initialStep,
}: InstrumentEMRAMProps) {
  // Clamp hospitalStage to valid range 0-7
  const hospitalStage = Math.min(7, Math.max(0, Number(hospitalStageRaw) || 0));

  // ── Live instrument: fetch dari API, fallback ke data statis ─────────────
  const [allStages, setAllStages] = useState<StageData[]>(STATIC_STAGES);

  useEffect(() => {
    getEmramInstrument(true) // active_only=true: hanya tampilkan indikator aktif
      .then(apiStages => {
        if (!apiStages || apiStages.length === 0) return; // fallback jika kosong
        const mapped: StageData[] = apiStages.map(s => ({
          stage: s.stage,
          // Ambil bagian setelah "— " dari title, atau gunakan title penuh
          title: s.title.includes('—') ? s.title.split('—')[1].trim() : s.title,
          description: s.description ?? '',
          indicators: s.indicators.map(i => ({ id: i.indicator_code, text: i.text })),
        }));
        setAllStages(mapped);
      })
      .catch(() => { /* tetap pakai STATIC_STAGES */ });
  }, []);

  // Pre-fill all stages below hospitalStage as 'yes' (already validated)
  const initAnswers = (): Record<string, AnswerValue> => {
    const init: Record<string, AnswerValue> = {};
    allStages.forEach(sd => {
      if (sd.stage < hospitalStage) {
        sd.indicators.forEach(ind => { init[ind.id] = 'yes'; });
      }
    });
    return init;
  };

  // Start on the current hospital stage (the one being assessed)
  const [currentStep, setCurrentStep] = useState(initialStep ?? stageStepIndex(hospitalStage));
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>(() => initialAnswers ?? initAnswers());
  const [evidences, setEvidences] = useState<Record<string, EvidenceData>>({});
  const [openEvidence, setOpenEvidence] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; sub?: string } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showSaveDraftModal, setShowSaveDraftModal] = useState(false);

  const showToast = (msg: string | null, sub?: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    if (msg === null) {
      setToast(null);
      return;
    }
    setToast({ msg, sub });
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  };

  const getEvidence = (indId: string): EvidenceData =>
    evidences[indId] ?? { notes: '', files: [] };

  const setNotes = (indId: string, notes: string) =>
    setEvidences(prev => ({ ...prev, [indId]: { ...getEvidence(indId), notes } }));

  const addFile = (indId: string, attachment: FileAttachment) =>
    setEvidences(prev => {
      const e = getEvidence(indId);
      return { ...prev, [indId]: { ...e, files: [...e.files, attachment] } };
    });

  const removeFile = (indId: string, idx: number) =>
    setEvidences(prev => {
      const e = getEvidence(indId);
      return { ...prev, [indId]: { ...e, files: e.files.filter((_, i) => i !== idx) } };
    });

  const hasEvidence = (indId: string) => {
    const e = evidences[indId];
    return e && (e.notes.trim() !== '' || e.files.length > 0);
  };

  const setAnswer = (id: string, val: AnswerValue) =>
    setAnswers(prev => ({ ...prev, [id]: prev[id] === val ? null : val }));

  const overallScore = calcOverallScore(answers, allStages);
  const currentStageData = currentStep >= 1 && currentStep <= 8 ? allStages[currentStep - 1] : null;
  const isLocked = currentStageData ? currentStageData.stage < hospitalStage : false;

  const stepDone = (step: number) => {
    if (step === STEP_IDENTITAS) return true;
    if (step >= 1 && step <= 8) {
      const sd = allStages[step - 1];
      // Locked stages are always "done"
      if (sd.stage < hospitalStage) return true;
      return allAnswered(sd, answers);
    }
    return false;
  };

  const stepLabel = (step: number) => {
    if (step === STEP_IDENTITAS) return 'Identitas';
    if (step === STEP_REVIEW) return 'Review';
    return `Stage ${step - 1}`;
  };

  const totalSteps = 10;

  // =====================================================================
  // SIMPAN DRAF — buka modal konfirmasi dulu
  // =====================================================================
  const handleSaveToDatabase = () => {
    setShowSaveDraftModal(true);
  };

  // Dipanggil setelah user klik "Ya, Simpan" di modal
  const handleConfirmSaveDraft = () => {
    setShowSaveDraftModal(false);
    const evNotes: Record<string, string> = {};
    Object.entries(evidences).forEach(([k, v]) => { if (v.notes.trim()) evNotes[k] = v.notes.trim(); });
    onSaveDraft?.(answers, currentStep, evNotes);
    showToast('Selamat, data Anda berhasil direkam sebagai draf!', 'Pengisian dapat dilanjutkan kapan saja melalui Riwayat Penilaian.');
  };
  
  return (
    <div>
      {/* Topbar */}
      <div className="simari-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '14px', fontWeight: 400, color: 'var(--text2)' }}>Instrumen EMRAM</span>
          <span style={{ color: 'var(--text3)' }}>—</span>
          <span className="topbar-title" style={{ fontSize: '14px' }}>{hospitalName}</span>
        </div>
        <div className="topbar-actions" />
      </div>

      <div className="page-content">
        <div style={{ marginBottom: '16px' }}>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '22px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>
            Instrumen Audit EMRAM
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text3)' }}>
            Penilaian kematangan RME berbasis HIMSS EMRAM — {hospitalName}
          </p>
        </div>

        {/* Wizard step bar */}
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', padding: '14px 20px',
          marginBottom: '20px', overflowX: 'auto',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', minWidth: 'max-content', gap: '0' }}>
            {Array.from({ length: totalSteps }, (_, i) => {
              const done = stepDone(i);
              const isCurrent = i === currentStep;
              const isLockedStep = i >= 1 && i <= 8 && allStages[i - 1].stage < hospitalStage;
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', flex: i < totalSteps - 1 ? '1' : 'none' }}>
                  <button
                    onClick={() => setCurrentStep(i)}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', background: 'none', border: 'none', cursor: 'pointer', padding: '0 4px' }}
                  >
                    <div style={{
                      width: '26px', height: '26px', borderRadius: '50%', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '11px', fontWeight: 700,
                      background: isCurrent ? 'var(--accent)' : done ? (isLockedStep ? '#6BAE8C' : 'var(--accent)') : 'var(--surface2)',
                      color: done || isCurrent ? 'white' : 'var(--text3)',
                      boxShadow: isCurrent ? '0 0 0 3px var(--accent-light)' : 'none',
                      transition: 'all 0.15s',
                    }}>
                      {done && !isCurrent ? '✓' : i === STEP_IDENTITAS ? 'ID' : i === STEP_REVIEW ? '✦' : i - 1}
                    </div>
                    <span style={{
                      fontSize: '9px', fontWeight: isCurrent ? 700 : 400,
                      color: isCurrent ? 'var(--accent)' : done ? 'var(--text2)' : 'var(--text3)',
                      whiteSpace: 'nowrap',
                    }}>
                      {stepLabel(i)}
                    </span>
                  </button>
                  {i < totalSteps - 1 && (
                    <div style={{
                      flex: 1, height: '2px', marginTop: '12px',
                      background: done ? (isLockedStep ? '#6BAE8C' : 'var(--accent)') : 'var(--border)',
                      borderRadius: '1px', minWidth: '16px',
                    }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Two-column main layout */}
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
          {/* LEFT */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Identitas step */}
            {currentStep === STEP_IDENTITAS && (
              <div className="simari-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>⊞</div>
                <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>Identitas Faskes</div>
                <p style={{ fontSize: '13px', color: 'var(--text3)', marginBottom: '20px' }}>
                  Data identitas faskes sudah terisi dari halaman Mulai Audit Baru
                </p>
                <button className="simari-btn simari-btn-primary" onClick={() => setCurrentStep(1)}>
                  Mulai Penilaian Stage 0 →
                </button>
              </div>
            )}

            {/* Stage steps */}
            {currentStageData && (
              <>
                {/* Validated banner */}
                {isLocked && (
                  <div style={{
                    background: '#EAF7F0', border: '1px solid #6BAE8C',
                    borderRadius: 'var(--radius)', padding: '12px 16px', marginBottom: '14px',
                    display: 'flex', alignItems: 'flex-start', gap: '12px',
                  }}>
                    <div style={{
                      width: '22px', height: '22px', borderRadius: '50%', background: '#6BAE8C',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontSize: '11px', fontWeight: 700, flexShrink: 0, marginTop: '1px',
                    }}>✓</div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#3D8B63', marginBottom: '2px' }}>
                        Stage Sudah Tervalidasi
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text2)', lineHeight: 1.6 }}>
                        Stage ini sudah dicapai. Semua indikator dikunci sebagai <strong>Terpenuhi</strong>.
                        Anda masih dapat membuka setiap indikator untuk menambahkan dokumentasi bukti.
                      </div>
                    </div>
                  </div>
                )}

                {/* Stage info card */}
                <div style={{
                  background: 'var(--surface)', border: `1px solid ${isLocked ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-lg)', padding: '16px 20px', marginBottom: '14px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <span className={`stage-badge stage-s${currentStageData.stage}`}>
                          Stage {currentStageData.stage}
                        </span>
                        <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)' }}>
                          {currentStageData.title}
                        </span>
                        {isLocked && (
                          <span style={{ fontSize: '11px', background: '#6BAE8C', color: 'white', padding: '2px 8px', borderRadius: '20px', fontWeight: 600 }}>
                            ✓ Tervalidasi
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: '12px', color: 'var(--text3)', lineHeight: 1.65, margin: 0 }}>
                        {currentStageData.description}
                      </p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0 }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, background: 'var(--accent-light)', color: 'var(--accent)', padding: '3px 10px', borderRadius: '6px' }}>
                        {currentStageData.indicators.filter(i => answers[i.id] != null).length}/{currentStageData.indicators.length} Indikator
                      </span>
                      <span style={{ fontSize: '11px', fontWeight: 600, background: 'var(--surface2)', color: 'var(--text3)', padding: '3px 10px', borderRadius: '6px' }}>
                        {calcStageScore(currentStageData, answers)}% Terpenuhi
                      </span>
                    </div>
                  </div>
                </div>

                {/* Indicators list */}
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                  <div style={{
                    padding: '12px 20px', borderBottom: '1px solid var(--border)',
                    background: isLocked ? '#EAF7F0' : 'var(--accent-light)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: isLocked ? '#3D8B63' : 'var(--accent)' }}>
                        Indikator Stage {currentStageData.stage}
                      </span>
                      <span style={{ fontSize: '11px', background: 'var(--surface)', color: 'var(--text2)', border: '1px solid var(--border2)', padding: '2px 8px', borderRadius: '20px' }}>
                        {currentStageData.indicators.length} indikator
                      </span>
                    </div>
                    {allAnswered(currentStageData, answers) && (
                      <span className="status-badge status-done" style={{ fontSize: '11px' }}>✓ Lengkap</span>
                    )}
                  </div>

                  {currentStageData.indicators.map((ind, idx) => {
                    const ans = answers[ind.id] ?? null;
                    const isAnswered = ans != null;
                    const evidenceOpen = openEvidence === ind.id;
                    const evidenceData = getEvidence(ind.id);
                    const evidenceCount = evidenceData.files.length + (evidenceData.notes.trim() ? 1 : 0);

                    return (
                      <div key={ind.id} style={{
                        padding: '16px 20px',
                        borderBottom: idx < currentStageData.indicators.length - 1 ? '1px solid var(--border)' : 'none',
                        background: isLocked ? 'var(--surface)' : 'var(--surface)',
                      }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                          {/* Status dot */}
                          <div style={{
                            width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0, marginTop: '1px',
                            background: isLocked ? '#6BAE8C' : ans === 'yes' ? 'var(--accent)' : ans === 'partial' ? 'var(--warn)' : ans === 'no' ? 'var(--danger)' : 'var(--surface2)',
                            border: `2px solid ${isLocked || isAnswered ? 'transparent' : 'var(--border2)'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', fontSize: '10px', fontWeight: 700,
                          }}>
                            {isLocked ? '✓' : ans === 'yes' ? '✓' : ans === 'partial' ? '◑' : ans === 'no' ? '✕' : ''}
                          </div>

                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text3)', marginBottom: '4px', letterSpacing: '0.04em' }}>
                              INDIKATOR {idx + 1}
                            </div>
                            <p style={{ fontSize: '13px', color: isLocked ? 'var(--text2)' : 'var(--text)', lineHeight: 1.6, margin: '0 0 10px' }}>
                              {ind.text}
                            </p>

                            {/* Answer buttons — read-only if locked */}
                            {isLocked ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{
                                  fontSize: '12px', fontWeight: 600, padding: '4px 12px', borderRadius: '6px',
                                  background: '#EAF7F0', color: '#3D8B63', border: '1px solid #6BAE8C',
                                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                                }}>
                                  ✓ Terpenuhi — Tervalidasi
                                </span>
                              </div>
                            ) : (
                              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                <AnswerBtn label="✓ Terpenuhi"  value="yes"     current={ans} onSelect={() => setAnswer(ind.id, 'yes')}     />
                                <AnswerBtn label="◑ Sebagian"   value="partial" current={ans} onSelect={() => setAnswer(ind.id, 'partial')} />
                                <AnswerBtn label="✕ Belum Ada"  value="no"      current={ans} onSelect={() => setAnswer(ind.id, 'no')}      />
                                {!isAnswered && <span style={{ fontSize: '11px', color: 'var(--text3)', alignSelf: 'center', marginLeft: '2px' }}>Belum diisi</span>}
                              </div>
                            )}

                            {/* Evidence toggle */}
                            <button
                              onClick={() => setOpenEvidence(prev => prev === ind.id ? null : ind.id)}
                              style={{
                                marginTop: '10px', display: 'inline-flex', alignItems: 'center', gap: '5px',
                                fontSize: '11px', padding: '4px 10px', borderRadius: '6px',
                                border: `1px solid ${evidenceCount > 0 ? 'var(--accent)' : 'var(--border2)'}`,
                                background: evidenceCount > 0 ? 'var(--accent-light)' : 'transparent',
                                color: evidenceCount > 0 ? 'var(--accent)' : 'var(--text3)',
                                cursor: 'pointer',
                                fontFamily: "'Plus Jakarta Sans', sans-serif",
                              }}
                            >
                              📎 {evidenceCount > 0 ? `${evidenceCount} Bukti` : 'Tambah Bukti'}
                              <span style={{ fontSize: '9px' }}>{evidenceOpen ? '▲' : '▼'}</span>
                            </button>

                            {/* Evidence panel */}
                            {evidenceOpen && (
                              <EvidencePanel
                                indId={ind.id}
                                evidence={evidenceData}
                                onNotesChange={notes => setNotes(ind.id, notes)}
                                onFileAdd={att => addFile(ind.id, att)}
                                onFileRemove={idx2 => removeFile(ind.id, idx2)}
                                assessmentId={assessmentId}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* Review step */}
            {currentStep === STEP_REVIEW && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="simari-card">
                  <div className="card-title">Ringkasan Hasil Audit</div>

                  {/* Legend */}
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text3)' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6BAE8C', display: 'inline-block' }} />
                      Stage Sudah Tervalidasi
                    </span>
                    <span style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text3)' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
                      Stage Dinilai
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '16px' }}>
                    {allStages.map(sd => {
                      const score = calcStageScore(sd, answers);
                      const done = allAnswered(sd, answers);
                      const locked = sd.stage < hospitalStage;
                      return (
                        <button key={sd.stage} onClick={() => setCurrentStep(stageStepIndex(sd.stage))}
                          style={{
                            padding: '12px', borderRadius: '8px',
                            border: `1px solid ${locked ? 'var(--accent)' : 'var(--border)'}`,
                            background: locked ? 'var(--accent-light)' : 'var(--surface)',
                            cursor: 'pointer', textAlign: 'center',
                          }}>
                          <span className={`stage-badge stage-s${sd.stage}`} style={{ marginBottom: '6px', display: 'inline-flex' }}>
                            Stage {sd.stage}
                          </span>
                          <div style={{ fontSize: '18px', fontWeight: 700, color: locked ? 'var(--accent)' : score >= 80 ? 'var(--accent)' : score >= 50 ? 'var(--warn)' : 'var(--text3)' }}>
                            {score}%
                          </div>
                          <div style={{ fontSize: '10px', color: locked ? '#3D8B63' : done ? 'var(--text2)' : 'var(--text3)', marginTop: '2px' }}>
                            {locked ? '✓ Tervalidasi' : done ? '✓ Lengkap' : 'Belum selesai'}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {/* Simpan opsi */}
                  <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                    <button
                      onClick={() => setShowSaveDraftModal(true)}
                      className="simari-btn simari-btn-outline"
                      style={{ flex: 1, padding: '12px 16px', fontSize: '13px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}
                    >
                      <Save size={14} /> Simpan sebagai Draf
                    </button>
                    <button
                      onClick={() => { const evN: Record<string, string> = {}; Object.entries(evidences).forEach(([k, v]) => { if (v.notes.trim()) evN[k] = v.notes.trim(); }); onSubmitToDinkes?.(answers, STEP_REVIEW, evN); showToast('Audit RME berhasil dikirimkan ke Dinkes', 'Silakan menunggu proses verifikasi lebih lanjut dari petugas Dinkes.'); }}
                      className="simari-btn simari-btn-primary"
                      style={{ flex: 1, padding: '12px 16px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}
                    >
                      <Upload size={14} /> Kirim ke Dinkes →
                    </button>
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--text3)', textAlign: 'center', marginTop: '8px' }}>
                    Draf tersimpan di Riwayat Penilaian. Kirim ke Dinkes untuk proses verifikasi.
                  </p>
                </div>
              </div>
            )}

            {/* Bottom nav */}
            {currentStep !== STEP_REVIEW && currentStep !== STEP_IDENTITAS && (
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)', alignItems: 'center' }}>
                <button className="simari-btn simari-btn-outline"
                  onClick={() => setCurrentStep(s => s - 1)}
                  style={{ flexShrink: 0 }}>
                  ← {currentStep === 1 ? 'Identitas Faskes' : `Stage ${currentStep - 2}`}
                </button>
                <button className="simari-btn simari-btn-outline"
                  onClick={handleSaveToDatabase} // <--- Panggil fungsi backend di sini juga
                  style={{ flex: 1, display: 'inline-flex', alignItems: 'center', gap: '5px', justifyContent: 'center' }}>
                  <Save size={13} /> Simpan Draf
                </button>
                <button className="simari-btn simari-btn-primary"
                  onClick={() => setCurrentStep(s => s + 1)}
                  style={{ flexShrink: 0 }}>
                  {currentStep === 8 ? 'Tinjau & Kirim →' : `Lanjutkan ke Stage ${currentStep} →`}
                </button>
              </div>
            )}
            {currentStep === STEP_IDENTITAS && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                <button className="simari-btn simari-btn-outline" onClick={() => onBack?.()}>← Kembali</button>
                <button className="simari-btn simari-btn-primary" onClick={() => setCurrentStep(1)}>Mulai Stage 0 →</button>
              </div>
            )}
          </div>

          {/* RIGHT: score panel */}
          <div style={{ width: '272px', flexShrink: 0 }}>
            {/* Score gauge */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', marginBottom: '14px', overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>
                Skor Sementara
              </div>
              <ScoreGauge score={overallScore} />

              {/* Progress per stage */}
              <div style={{ padding: '0 16px 16px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text3)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '10px' }}>
                  Progress per Stage
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                  {allStages.map(sd => {
                    const score = calcStageScore(sd, answers);
                    const isCurrent = currentStep === stageStepIndex(sd.stage);
                    const locked = sd.stage < hospitalStage;
                    return (
                      <div key={sd.stage}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span style={{
                              fontSize: '10px', fontWeight: 700,
                              color: isCurrent ? 'var(--accent)' : 'var(--text3)',
                              background: isCurrent ? 'var(--accent-light)' : 'var(--surface2)',
                              padding: '1px 6px', borderRadius: '4px',
                            }}>S{sd.stage}</span>
                            <span style={{ fontSize: '11px', color: isCurrent ? 'var(--text)' : 'var(--text2)', fontWeight: isCurrent ? 600 : 400 }}>
                              {sd.title.split(' ').slice(0, 2).join(' ')}
                            </span>
                            {locked && <span style={{ fontSize: '9px', color: '#6BAE8C' }}>✓</span>}
                          </div>
                          <span style={{ fontSize: '11px', fontWeight: 600, color: locked ? 'var(--accent)' : 'var(--text)' }}>
                            {score}%
                          </span>
                        </div>
                        <div className="progress-wrap">
                          <div className="progress-fill" style={{
                            width: `${score}%`,
                            background: locked ? '#6BAE8C' : score >= 80 ? 'var(--accent)' : score >= 50 ? 'var(--warn)' : 'var(--danger)',
                          }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Stage quick-nav */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>
                Navigasi Cepat
              </div>
              <div style={{ padding: '8px' }}>
                {allStages.map(sd => {
                  const score = calcStageScore(sd, answers);
                  const done = allAnswered(sd, answers);
                  const isCurrent = currentStep === stageStepIndex(sd.stage);
                  const locked = sd.stage < hospitalStage;
                  return (
                    <button key={sd.stage} onClick={() => setCurrentStep(stageStepIndex(sd.stage))}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        width: '100%', padding: '7px 10px', borderRadius: '6px',
                        border: 'none', cursor: 'pointer', textAlign: 'left',
                        background: isCurrent ? 'var(--accent-light)' : 'transparent',
                        transition: 'background 0.12s',
                      }}>
                      <div style={{
                        width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0,
                        background: locked ? '#6BAE8C' : isCurrent ? 'var(--accent)' : done ? 'var(--accent)' : 'var(--surface2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '9px', fontWeight: 700,
                        color: (locked || done || isCurrent) ? 'white' : 'var(--text3)',
                      }}>
                        {done && !isCurrent ? '✓' : sd.stage}
                      </div>
                      <span style={{ flex: 1, fontSize: '11px', color: isCurrent ? 'var(--accent)' : locked ? 'var(--text2)' : 'var(--text2)', fontWeight: isCurrent ? 600 : 400 }}>
                        Stage {sd.stage} — {sd.title}
                      </span>
                      <span style={{ fontSize: '10px', color: locked ? '#6BAE8C' : 'var(--accent)', fontWeight: 700 }}>
                        {score}%
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modal Konfirmasi Simpan Draf ── */}
      {showSaveDraftModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9998,
        }}>
          <div style={{
            background: 'var(--surface)', borderRadius: '16px', padding: '32px 28px',
            width: '420px', maxWidth: '90vw', boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
            textAlign: 'center',
          }}>
            {/* Ikon */}
            <div style={{
              width: '60px', height: '60px', borderRadius: '50%', background: 'var(--accent-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 18px',
            }}>
              <Save size={26} color="var(--accent)" />
            </div>

            <div style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text)', marginBottom: '10px' }}>
              Simpan sebagai Draf?
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text3)', lineHeight: 1.7, marginBottom: '26px' }}>
              Pengisian Anda akan disimpan sebagai draf dan dapat dilanjutkan kapan saja melalui menu{' '}
              <strong style={{ color: 'var(--text2)' }}>Riwayat Penilaian</strong>.
            </p>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={() => setShowSaveDraftModal(false)}
                style={{
                  padding: '10px 26px', borderRadius: '8px', border: '1px solid var(--border2)',
                  background: 'var(--surface2)', color: 'var(--text)', fontSize: '13px', fontWeight: 600,
                  cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                Batal
              </button>
              <button
                onClick={handleConfirmSaveDraft}
                style={{
                  padding: '10px 26px', borderRadius: '8px', border: 'none',
                  background: 'var(--accent)', color: 'white', fontSize: '13px', fontWeight: 700,
                  cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif",
                  display: 'inline-flex', alignItems: 'center', gap: '7px',
                }}
              >
                <Save size={14} /> Ya, Simpan Draf
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast notification */}
      {toast && (
        <div
          style={{
            position: 'fixed', bottom: '28px', left: '50%', transform: 'translateX(-50%)',
            background: '#1a2535', color: 'white', borderRadius: '12px',
            padding: '14px 20px', boxShadow: '0 8px 32px rgba(0,0,0,0.22)',
            display: 'flex', alignItems: 'flex-start', gap: '12px',
            zIndex: 9999, minWidth: '320px', maxWidth: '460px',
          }}
        >
          <div style={{
            width: '22px', height: '22px', borderRadius: '50%', background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '12px', fontWeight: 700, flexShrink: 0, marginTop: '1px',
          }}>✓</div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: toast.sub ? '3px' : 0 }}>{toast.msg}</div>
            {toast.sub && <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>{toast.sub}</div>}
          </div>
          <button
            onClick={() => showToast(null)}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '16px', padding: '0 0 0 8px', flexShrink: 0 }}
          >×</button>
        </div>
      )}
    </div>
  );
}