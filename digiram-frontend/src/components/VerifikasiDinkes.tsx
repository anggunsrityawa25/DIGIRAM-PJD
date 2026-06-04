// =============================================================
// src/components/VerifikasiDinkes.tsx
// Halaman Verifikasi Assessment untuk Admin Dinkes
// =============================================================
import { useEffect, useState } from 'react';
import { getAllAssessments, verifyAssessment, getAssessmentEvidence } from '../services/api';
import { calcEmramScoreByStage } from '../data/emramData';
import { SearchX, Building2, FileText, Image as ImageIcon, X } from 'lucide-react';

interface AssessmentItem {
  id: number;
  status: string;
  pic_name: string;
  pic_email: string;
  vendor_simrs: string;
  periode: string;
  submitted_at: string | null;
  verification_notes: string | null;
  stage_result: number | null;
  user?: {
    name: string;
    hospital?: { name: string; type?: string } | null;
  } | null;
  reviewer?: {
    name: string;
  } | null;
}

function fmt(dateStr?: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function VerifikasiDinkes() {
  const [assessments, setAssessments] = useState<AssessmentItem[]>([]);
  const [loading, setLoading]         = useState(true);
  const [verifying, setVerifying]     = useState<number | null>(null);
  const [notes, setNotes]             = useState<Record<number, string>>({});
  const [filterStatus, setFilterStatus] = useState<string>('submitted');
  const [error, setError]             = useState<string | null>(null);
  const [expandedAssessmentId, setExpandedAssessmentId] = useState<number | null>(null);
  const [evidence, setEvidence]       = useState<Record<number, any>>({});
  const [loadingEvidence, setLoadingEvidence] = useState<Record<number, boolean>>({});
  const [previewImage, setPreviewImage] = useState<{ url: string; name: string } | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllAssessments();
      setAssessments(data);
    } catch (err: any) {
      setError('Gagal memuat data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvidence = async (assessmentId: number) => {
    try {
      setLoadingEvidence(prev => ({ ...prev, [assessmentId]: true }));
      const evidenceData = await getAssessmentEvidence(assessmentId);
      setEvidence(prev => ({ ...prev, [assessmentId]: evidenceData }));
    } catch (err: any) {
      console.error('Gagal memuat bukti:', err);
    } finally {
      setLoadingEvidence(prev => ({ ...prev, [assessmentId]: false }));
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = assessments.filter(a => {
    if (filterStatus === 'all') return true;
    return a.status === filterStatus;
  });

  const handleVerify = async (id: number, status: 'reviewed' | 'rejected') => {
    const note = notes[id] ?? '';
    if (status === 'rejected' && !note.trim()) {
      alert('Harap isi catatan untuk assessment yang dikembalikan ke RS.');
      return;
    }
    if (!window.confirm(
      `Yakin ingin ${status === 'reviewed' ? 'MENYETUJUI' : 'MENGEMBALIKAN'} assessment ini?`
    )) return;

    try {
      setVerifying(id);
      await verifyAssessment(id, status, note);
      alert(status === 'reviewed'
        ? '✅ Assessment berhasil disetujui!'
        : '↩ Assessment dikembalikan ke Rumah Sakit.');
      await fetchData();
    } catch (err: any) {
      alert('Gagal verifikasi: ' + err.message);
    } finally {
      setVerifying(null);
    }
  };

  const toggleAssessmentExpand = (id: number) => {
    if (expandedAssessmentId === id) {
      setExpandedAssessmentId(null);
    } else {
      setExpandedAssessmentId(id);
      if (!evidence[id]) {
        fetchEvidence(id);
      }
    }
  };

  const filterLabels: Record<string, string> = {
    submitted: 'Menunggu Verifikasi',
    reviewed:  'Disetujui',
    rejected:  'Dikembalikan',
    all:       'Semua',
  };

  const statusStyle: Record<string, React.CSSProperties> = {
    submitted: { background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE' },
    reviewed:  { background: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0' },
    rejected:  { background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' },
  };

  if (loading) {
    return (
      <div className="page-content" style={{ textAlign: 'center', paddingTop: '60px' }}>
        <p style={{ color: 'var(--text3)', fontSize: '14px' }}>Memuat data assessment...</p>
      </div>
    );
  }

  return (
    <div className="page-content">
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '20px' }}>
        <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '22px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>
          Verifikasi Assessment RME
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text3)' }}>
          Tinjau dan verifikasi assessment yang dikirimkan oleh Rumah Sakit
        </p>
      </div>

      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', color: '#DC2626', fontSize: '13px' }}>
          ⚠️ {error}
          <button onClick={fetchData} style={{ marginLeft: '12px', textDecoration: 'underline', cursor: 'pointer', background: 'none', border: 'none', color: '#DC2626', fontSize: '13px' }}>
            Coba lagi
          </button>
        </div>
      )}

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {(['submitted', 'reviewed', 'rejected', 'all'] as const).map(s => {
          const count = s === 'all' ? assessments.length : assessments.filter(a => a.status === s).length;
          return (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              style={{
                padding: '7px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: filterStatus === s ? 700 : 400,
                border: '1px solid',
                borderColor: filterStatus === s ? 'var(--accent)' : 'var(--border2)',
                background: filterStatus === s ? 'var(--accent)' : 'var(--surface)',
                color: filterStatus === s ? 'white' : 'var(--text2)',
                cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif",
                display: 'inline-flex', alignItems: 'center', gap: '6px',
              }}
            >
              {filterLabels[s]}
              <span style={{
                fontSize: '11px', fontWeight: 700, minWidth: '18px', height: '18px',
                borderRadius: '9px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                background: filterStatus === s ? 'rgba(255,255,255,0.25)' : 'var(--surface2)',
                color: filterStatus === s ? 'white' : 'var(--text3)',
                padding: '0 4px',
              }}>
                {count}
              </span>
            </button>
          );
        })}
        <button
          onClick={fetchData}
          style={{
            marginLeft: 'auto', padding: '7px 14px', borderRadius: '8px', fontSize: '13px',
            border: '1px solid var(--border2)', background: 'var(--surface)', color: 'var(--text3)',
            cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          ↻ Refresh
        </button>
      </div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="simari-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px', display: 'flex', justifyContent: 'center' }}>
            <SearchX size={48} strokeWidth={1.5} color="var(--text3)" />
          </div>
          <p style={{ color: 'var(--text3)', fontSize: '14px', marginBottom: '8px' }}>
            Tidak ada assessment dengan status ini.
          </p>
          {filterStatus === 'submitted' && (
            <p style={{ color: 'var(--text3)', fontSize: '12px' }}>
              Assessment akan muncul di sini setelah Rumah Sakit menekan tombol "Kirim ke Dinkes"
            </p>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filtered.map(item => {
            const st = statusStyle[item.status] ?? statusStyle.submitted;
            // Hitung skor berdasarkan stage_result (stage terakhir yang diverifikasi/diisi)
            const stageResult = item.stage_result ?? 0;
            const emramScorePct = calcEmramScoreByStage(stageResult);
            return (
              <div
                key={item.id}
                className="simari-card"
                style={{ padding: '18px 20px' }}
              >
                {/* Card header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Building2 size={20} strokeWidth={2} color="var(--accent)" />
                      {item.user?.hospital?.name ?? 'Rumah Sakit Tidak Diketahui'}
                    </p>
                    <p style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '2px' }}>
                      Periode: <strong>{item.periode ?? '—'}</strong>
                      {item.vendor_simrs && ` · Vendor: ${item.vendor_simrs}`}
                    </p>
                    <p style={{ fontSize: '12px', color: 'var(--text3)' }}>
                      PIC: {item.pic_name ?? '—'}
                      {item.pic_email && ` (${item.pic_email})`}
                    </p>
                    <p style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '3px' }}>
                      Stage: <strong>Stage {stageResult}</strong>
                      {' · '}
                      Skor EMRAM:{' '}
                      <strong style={{ color: emramScorePct >= 70 ? '#16A34A' : emramScorePct >= 40 ? '#D97706' : '#DC2626' }}>
                        {emramScorePct}%
                      </strong>
                      <span style={{ fontSize: '11px', color: 'var(--text3)' }}>
                        {' '}({calcEmramScoreByStage(stageResult) > 0
                          ? `${[3,6,12,18,23,27,34,39][stageResult] ?? 0}/39 indikator`
                          : '0/39 indikator'})
                      </span>
                    </p>
                    {item.submitted_at && (
                      <p style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '4px' }}>
                        Dikirim: {fmt(item.submitted_at)}
                      </p>
                    )}
                  </div>
                  <span style={{
                    ...st, fontSize: '11px', fontWeight: 700,
                    padding: '4px 10px', borderRadius: '20px', whiteSpace: 'nowrap',
                  }}>
                    {item.status === 'submitted' ? '⏳ Menunggu Verifikasi'
                      : item.status === 'reviewed' ? '✅ Disetujui'
                      : '↩ Dikembalikan'}
                  </span>
                </div>

                {/* Catatan verifikasi sebelumnya */}
                {item.verification_notes && item.status !== 'submitted' && (
                  <div style={{
                    background: 'var(--surface2)', borderRadius: '8px', padding: '10px 14px',
                    marginBottom: '12px', fontSize: '12px', color: 'var(--text2)', lineHeight: 1.6,
                  }}>
                    <strong>Catatan Verifikasi:</strong> {item.verification_notes}
                    {item.reviewer && (
                      <span style={{ color: 'var(--text3)', marginLeft: '6px' }}>
                        — oleh {item.reviewer.name}
                      </span>
                    )}
                  </div>
                )}

                {/* Expand button to view evidence */}
                <button
                  onClick={() => toggleAssessmentExpand(item.id)}
                  style={{
                    padding: '7px 14px', borderRadius: '6px', fontSize: '12px',
                    border: '1px solid var(--border2)', background: 'var(--surface)',
                    color: 'var(--text2)', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif",
                    width: '100%', marginTop: '8px', marginBottom: expandedAssessmentId === item.id ? '12px' : '0',
                  }}
                >
                  {expandedAssessmentId === item.id ? '▼ Sembunyikan Bukti & Detail' : '▶ Lihat Bukti & Detail'}
                </button>

                {/* Evidence display section */}
                {expandedAssessmentId === item.id && (
                  <div style={{
                    borderTop: '1px solid var(--border)', paddingTop: '14px', marginTop: '12px', marginBottom: '12px',
                  }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text2)', marginBottom: '12px' }}>
                      📎 Bukti & Dokumentasi
                    </div>
                    {loadingEvidence[item.id] ? (
                      <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text3)', fontSize: '12px' }}>
                        Memuat bukti...
                      </div>
                    ) : evidence[item.id] && Object.keys(evidence[item.id]).length > 0 ? (
                      <div style={{ display: 'grid', gap: '12px' }}>
                        {Object.entries(evidence[item.id]).map(([indicatorId, files]: [string, any]) => (
                          <div key={indicatorId} style={{
                            background: 'var(--surface2)', borderRadius: '8px', padding: '12px',
                            border: '1px solid var(--border2)',
                          }}>
                            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text3)', marginBottom: '8px' }}>
                              Indikator {indicatorId}
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                              {Array.isArray(files) && files.map((file: any, idx: number) => {
                                const isImage = file.type?.startsWith('image/');
                                return (
                                  <div
                                    key={idx}
                                    style={{
                                      display: 'inline-flex', flexDirection: 'column', gap: '4px',
                                      background: 'var(--surface)', padding: '8px 12px', borderRadius: '6px',
                                      border: '1px solid var(--border2)', fontSize: '12px',
                                    }}
                                  >
                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                      {isImage ? (
                                        <>
                                          <ImageIcon size={16} />
                                          <button
                                            onClick={() => setPreviewImage({ url: file.url, name: file.name })}
                                            style={{
                                              background: 'none', border: 'none', cursor: 'pointer',
                                              color: 'var(--accent)', textDecoration: 'underline', fontSize: '12px',
                                              fontFamily: "'Plus Jakarta Sans', sans-serif",
                                              padding: '0',
                                              maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis',
                                              whiteSpace: 'nowrap',
                                            }}
                                            title={file.name}
                                          >
                                            {file.name}
                                          </button>
                                        </>
                                      ) : (
                                        <>
                                          <FileText size={16} />
                                          <a
                                            href={file.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                              color: 'var(--accent)', textDecoration: 'none', fontSize: '12px',
                                              overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px',
                                              whiteSpace: 'nowrap',
                                            }}
                                            title={file.name}
                                          >
                                            {file.name}
                                          </a>
                                        </>
                                      )}
                                    </div>
                                    {file.notes && (
                                      <div style={{ fontSize: '10px', color: 'var(--text3)', fontStyle: 'italic', marginLeft: '22px' }}>
                                        {file.notes}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ fontSize: '12px', color: 'var(--text3)', textAlign: 'center', padding: '20px' }}>
                        Tidak ada bukti yang diunggah untuk assessment ini.
                      </div>
                    )}
                  </div>
                )}

                {/* Form verifikasi — hanya untuk status submitted */}
                {item.status === 'submitted' && (
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: '14px', marginTop: '4px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text2)', marginBottom: '6px' }}>
                      Catatan Verifikasi <span style={{ fontWeight: 400, color: 'var(--text3)' }}>(wajib diisi jika dikembalikan)</span>:
                    </label>
                    <textarea
                      placeholder="Tulis catatan untuk Rumah Sakit tentang hasil verifikasi..."
                      rows={3}
                      value={notes[item.id] ?? ''}
                      onChange={e => setNotes(prev => ({ ...prev, [item.id]: e.target.value }))}
                      style={{
                        width: '100%', borderRadius: '8px', border: '1px solid var(--border2)',
                        padding: '9px 12px', fontSize: '13px', color: 'var(--text)',
                        background: 'var(--surface)', resize: 'vertical',
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        outline: 'none', boxSizing: 'border-box',
                      }}
                    />
                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                      <button
                        onClick={() => handleVerify(item.id, 'reviewed')}
                        disabled={verifying === item.id}
                        style={{
                          padding: '9px 20px', borderRadius: '8px', border: 'none',
                          background: verifying === item.id ? '#ccc' : '#16A34A',
                          color: 'white', fontSize: '13px', fontWeight: 700,
                          cursor: verifying === item.id ? 'not-allowed' : 'pointer',
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          display: 'inline-flex', alignItems: 'center', gap: '6px',
                        }}
                      >
                        {verifying === item.id ? 'Memproses...' : '✅ Setujui Assessment'}
                      </button>
                      <button
                        onClick={() => handleVerify(item.id, 'rejected')}
                        disabled={verifying === item.id}
                        style={{
                          padding: '9px 20px', borderRadius: '8px', border: '1px solid #DC2626',
                          background: 'transparent', color: '#DC2626', fontSize: '13px', fontWeight: 700,
                          cursor: verifying === item.id ? 'not-allowed' : 'pointer',
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          display: 'inline-flex', alignItems: 'center', gap: '6px',
                        }}
                      >
                        {verifying === item.id ? 'Memproses...' : '↩ Kembalikan ke RS'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Image preview modal */}
      {previewImage && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.85)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          padding: '20px',
        }}>
          <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
            <button
              onClick={() => setPreviewImage(null)}
              style={{
                position: 'absolute', top: '-30px', right: '0', background: 'none',
                border: 'none', color: 'white', fontSize: '24px', cursor: 'pointer',
                padding: '0', width: '30px', height: '30px', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              ✕
            </button>
            <img
              src={previewImage.url}
              alt={previewImage.name}
              style={{
                maxWidth: '100%', maxHeight: '100%', objectFit: 'contain',
                borderRadius: '8px',
              }}
            />
            <div style={{
              color: 'white', textAlign: 'center', marginTop: '12px',
              fontSize: '12px', opacity: 0.9,
            }}>
              {previewImage.name}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
