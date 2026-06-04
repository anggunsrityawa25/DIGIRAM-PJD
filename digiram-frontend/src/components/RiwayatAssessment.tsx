import { useState, useRef, useEffect } from 'react';
import { useAssessments } from '../contexts/AssessmentContext';
import type { Assessment } from '../types';
import { FileText, Pencil, Upload, Trash2, Clock, FileCheck, Eye } from 'lucide-react';
import { EMRAM_INDICATORS, isTerpenuhiFromAnswers, detectHighestFilledStage, toRSPYCode as toCode } from '../data/emramData';

// Hitung skor terverifikasi dari keputusan_per_stage (stage berurutan)
const STAGE_CUMUL: Record<number, number> = { 0:3, 1:6, 2:12, 3:18, 4:23, 5:27, 6:34, 7:39 };
function calcVerifiedScoreRA(kps: Record<number, string> | undefined | null, status: string): number | null {
  if (status !== 'reviewed' && status !== 'validated' && status !== 'rejected') return null;
  if (!kps || Object.keys(kps).length === 0) return null;
  let highest = -1;
  for (let s = 0; s <= 7; s++) {
    if (kps[s] === 'sesuai') highest = s; else break;
  }
  if (highest < 0) return 0;
  return Math.round(((STAGE_CUMUL[highest] ?? 0) / 39) * 100);
}

const categoryNames: Record<string, string> = {
  cat1: 'Ancillary Clinical Systems',
  cat2: 'Clinical Documentation',
  cat3: 'Order Entry & CPOE',
  cat4: 'Data Analytics & Reporting',
  cat5: 'Interoperability & HIE',
};

const statusConfig: Record<string, { label: string; cls: string }> = {
  draft:            { label: 'Draf',               cls: 'status-draft'  },
  submitted:        { label: 'Menunggu Tinjauan',  cls: 'status-review' },
  under_review:     { label: 'Sedang Ditinjau',    cls: 'status-review' },
  reviewed:         { label: 'Selesai Diverifikasi', cls: 'status-review' },
  under_validation: { label: 'Validasi Kemenkes',  cls: 'status-review' },
  validated:        { label: 'Tervalidasi',         cls: 'status-done'  },
  rejected:         { label: 'Dikembalikan',        cls: 'status-draft'  },
  revision_required: { label: 'Perlu Revisi',       cls: 'status-draft'  },
};

function fmt(dateStr?: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

const toRSPYCode = toCode;

function TimelineStep({ label, date, done, last }: { label: string; date?: string; done: boolean; last?: boolean }) {
  return (
    <div style={{ display: 'flex', gap: '12px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
        <div style={{
          width: '20px', height: '20px', borderRadius: '50%',
          background: done ? 'var(--accent)' : 'var(--surface2)',
          border: `2px solid ${done ? 'var(--accent)' : 'var(--border2)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontSize: '10px', fontWeight: 700, flexShrink: 0,
        }}>
          {done ? '✓' : ''}
        </div>
        {!last && <div style={{ width: '2px', flex: 1, background: done ? 'var(--accent-light)' : 'var(--border)', marginTop: '3px', minHeight: '20px' }} />}
      </div>
      <div style={{ paddingBottom: last ? 0 : '16px' }}>
        <div style={{ fontSize: '12px', fontWeight: 600, color: done ? 'var(--text)' : 'var(--text3)', marginBottom: '2px' }}>{label}</div>
        <div style={{ fontSize: '11px', color: 'var(--text3)' }}>{done ? fmt(date) : 'Belum'}</div>
      </div>
    </div>
  );
}

function AssessmentDetailPanel({ a, hideHeader }: { a: any; hideHeader?: boolean }) {
  const sc = statusConfig[a.status] ?? statusConfig.draft;
  const categories = Object.entries(a.categoryScores || {});
  const score = a.totalScore ?? 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {!hideHeader && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', fontFamily: 'monospace', background: 'var(--surface2)', padding: '4px 10px', borderRadius: '6px', letterSpacing: '0.05em' }}>{toRSPYCode(a.id)}</span>
              <span className={`status-badge ${sc.cls}`}>{sc.label}</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text3)' }}>Dibuat: {fmt(a.createdAt)}</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            {[
              { label: 'Stage Saat Ini', value: <span className={`stage-badge stage-s${a.currentStage}`}>Stage {a.currentStage}</span> },
              { label: 'Target Stage', value: <span className={`stage-badge stage-s${a.targetStage}`}>Stage {a.targetStage}</span> },
              { label: 'Skor', value: <span style={{ fontSize: '20px', fontWeight: 700, color: score >= 80 ? 'var(--accent)' : score >= 60 ? 'var(--warn)' : score > 0 ? 'var(--danger)' : 'var(--text3)' }}>{score > 0 ? `${score}%` : '—'}</span> },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: 'var(--surface2)', borderRadius: '8px', padding: '10px 12px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text3)', marginBottom: '4px' }}>{label}</div>
                {value}
              </div>
            ))}
          </div>
        </div>
      )}

      {categories.length > 0 && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', fontSize: '13px', fontWeight: 700 }}>Skor per Kategori</div>
          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {categories.map(([catId, score]) => {
              const pct = score as number;
              const color = pct >= 85 ? 'var(--accent)' : pct >= 65 ? 'var(--warn)' : 'var(--danger)';
              return (
                <div key={catId}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text2)' }}>{categoryNames[catId] || catId}</span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color }}>{pct}%</span>
                  </div>
                  <div className="progress-wrap">
                    <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', fontSize: '13px', fontWeight: 700 }}>Alur Status</div>
        <div style={{ padding: '16px 20px' }}>
          <TimelineStep label="Dibuat" date={a.createdAt} done={true} />
          <TimelineStep label="Dikirim ke Dinkes" date={a.submittedAt} done={!!a.submittedAt} />
          <TimelineStep label="Sedang Direview Dinkes" date={a.reviewedAt} done={a.status === 'under_review' || !!a.reviewedAt} />
          <TimelineStep label="Selesai Diverifikasi Dinkes" date={a.reviewedAt} done={!!a.reviewedAt} last />
        </div>
      </div>

      {(a.hospitalNotes || a.reviewerComments) && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', fontSize: '13px', fontWeight: 700 }}>Catatan & Tinjauan</div>
          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {a.hospitalNotes && (
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Catatan Faskes</div>
                <div style={{ fontSize: '13px', color: 'var(--text2)', background: 'var(--surface2)', borderRadius: '8px', padding: '10px 12px', lineHeight: 1.6 }}>{a.hospitalNotes}</div>
              </div>
            )}
            {a.reviewerComments && (
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Catatan Verifikasi Dinkes</div>
                <div style={{ fontSize: '13px', color: 'var(--text2)', background: 'var(--warn-light)', border: '1px solid #f5d48a', borderRadius: '8px', padding: '10px 12px', lineHeight: 1.6 }}>{a.reviewerComments}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function EMRAMPratinjau({ a }: { a: any }) {
  // Tampilkan stage yang benar-benar ada isian (emramAnswers), bukan berdasarkan targetStage
  const highestFilled = detectHighestFilledStage(a.emramAnswers);
  // Jika tidak ada isian sama sekali, fallback ke targetStage
  const maxStageToShow = highestFilled >= 0 ? highestFilled : (a.targetStage ?? 0);
  const stageRange = Array.from({ length: maxStageToShow + 1 }, (_, i) => i);
  const score = a.totalScore ?? 0;
  const totalIndicators = stageRange.reduce((s, st) => s + (EMRAM_INDICATORS[st]?.items.length ?? 0), 0);
  const terpenuhiCount = stageRange.reduce((s, st) =>
    s + (EMRAM_INDICATORS[st]?.items.filter((item, idx) => {
      const rawAnswer = a.emramAnswers?.[item.id];
      return rawAnswer === 'yes' || rawAnswer === 'partial';
    }).length ?? 0), 0);

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
      <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '13px', fontWeight: 700 }}>Pratinjau Instrumen EMRAM</span>
        <span style={{ fontSize: '12px', color: totalIndicators > 0 && terpenuhiCount / totalIndicators >= 0.7 ? 'var(--accent)' : 'var(--warn)', fontWeight: 700 }}>
          {terpenuhiCount}/{totalIndicators} indikator terpenuhi
        </span>
      </div>
      <div style={{ padding: '4px 0' }}>
        {stageRange.map(stageNum => {
          const stageData = EMRAM_INDICATORS[stageNum];
          if (!stageData) return null;
          const items = stageData.items;
          // Hitung terpenuhi berdasarkan jawaban langsung (bukan isTerpenuhiFromAnswers)
          const stageTerpenuhi = items.filter(item => {
            const rawAnswer = a.emramAnswers?.[item.id];
            return rawAnswer === 'yes' || rawAnswer === 'partial';
          }).length;
          const isAll = stageTerpenuhi === items.length;
          return (
            <div key={stageNum} style={{ borderTop: stageNum > 0 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ padding: '8px 20px', background: isAll ? 'var(--accent-light)' : 'var(--surface2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: isAll ? 'var(--accent)' : 'var(--text)' }}>{stageData.title}</span>
                <span style={{ fontSize: '11px', fontWeight: 600, color: isAll ? 'var(--accent)' : 'var(--text3)', background: isAll ? 'white' : 'transparent', padding: '2px 8px', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  {stageTerpenuhi}/{items.length} terpenuhi
                  <span style={{ fontWeight: 700, color: isAll ? 'var(--accent)' : Math.round(stageTerpenuhi / items.length * 100) >= 70 ? 'var(--accent)' : '#D97706' }}>
                    ({Math.round(stageTerpenuhi / items.length * 100)}%)
                  </span>
                </span>
              </div>
              {items.map((item) => {
                const rawAnswer = a.emramAnswers?.[item.id];
                const filled = rawAnswer != null;
                const fulfilled = rawAnswer === 'yes' || rawAnswer === 'partial';
                return (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 20px', borderTop: '1px solid var(--border)' }}>
                    <div style={{
                      width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0,
                      background: !filled ? 'var(--surface2)' : fulfilled ? 'var(--accent)' : 'var(--danger-light)',
                      border: `1.5px solid ${!filled ? 'var(--border2)' : fulfilled ? 'var(--accent)' : 'var(--danger)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: !filled ? 'var(--text3)' : fulfilled ? 'white' : 'var(--danger)', fontSize: '9px', fontWeight: 700,
                    }}>
                      {!filled ? '—' : fulfilled ? '✓' : '✗'}
                    </div>
                    <span style={{ flex: 1, fontSize: '12px', color: 'var(--text2)', lineHeight: 1.4 }}>{item.text}</span>
                    {rawAnswer && (
                      <span style={{
                        fontSize: '10px', fontWeight: 600, padding: '1px 7px', borderRadius: '20px', whiteSpace: 'nowrap',
                        background: rawAnswer === 'yes' ? 'var(--accent-light)' : rawAnswer === 'partial' ? '#FEF3C7' : 'var(--danger-light)',
                        color: rawAnswer === 'yes' ? 'var(--accent)' : rawAnswer === 'partial' ? '#D97706' : 'var(--danger)',
                      }}>
                        {rawAnswer === 'yes' ? 'Ya' : rawAnswer === 'partial' ? 'Sebagian' : 'Tidak'}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
        {stageRange.length === 0 && (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text3)', fontSize: '13px' }}>
            Belum ada jawaban yang diisi untuk assessment ini.
          </div>
        )}
      </div>
    </div>
  );
}

function PratinjauBAModal({ a, onClose }: { a: any; onClose: () => void }) {
  const selfScore = a.totalScore ?? 0;
  // Skor terverifikasi dari Dinkes (keputusan_per_stage)
  const kps = a.keputusan_per_stage ?? a.stageVerifications ?? {};
  const verifiedScore = calcVerifiedScoreRA(kps, a.status);
  // Tampilkan skor terverifikasi jika ada, fallback ke self-assessment
  const score = verifiedScore !== null ? verifiedScore : selfScore;
  const highestFilled = detectHighestFilledStage(a.emramAnswers);
  const maxStageToShow = highestFilled >= 0 ? highestFilled : (a.targetStage ?? 0);
  const stageRange = Array.from({ length: maxStageToShow + 1 }, (_, i) => i);
  const totalIndicators = stageRange.reduce((s, st) => s + (EMRAM_INDICATORS[st]?.items.length ?? 0), 0);
  const terpenuhiCount = stageRange.reduce((s, st) =>
    s + (EMRAM_INDICATORS[st]?.items.filter(item => {
      const raw = a.emramAnswers?.[item.id];
      return raw === 'yes' || raw === 'partial';
    }).length ?? 0), 0);
  const disetujui = a.status === 'reviewed' || a.status === 'validated' || a.status === 'under_validation';

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px' }} onClick={onClose}>
      <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '680px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-lg)', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text3)', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pratinjau Berita Acara & Hasil Verifikasi</div>
            <div style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text)', marginBottom: '6px' }}>{a.hospitalName}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span className={`stage-badge stage-s${a.currentStage}`}>Stage {a.currentStage}</span>
              <span style={{ fontSize: '11px', color: 'var(--text3)' }}>→</span>
              <span className={`stage-badge stage-s${a.targetStage}`}>Target Stage {a.targetStage}</span>
              <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '20px', background: disetujui ? 'var(--accent-light)' : 'var(--danger-light)', color: disetujui ? 'var(--accent)' : 'var(--danger)' }}>
                {disetujui ? '✓ Disetujui' : '✕ Dikembalikan'}
              </span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: 'var(--text3)', padding: '2px 8px', lineHeight: 1, flexShrink: 0 }}>×</button>
        </div>

        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
          {(a.reviewedBy || a.reviewedAt) && (
            <div style={{ margin: '16px 24px', border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ padding: '10px 16px', background: 'var(--surface2)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileCheck size={14} color="var(--text2)" />
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text2)' }}>Berita Acara Verifikasi</span>
              </div>
              <div style={{ padding: '16px', fontSize: '12px', color: 'var(--text2)', lineHeight: 1.8, fontFamily: 'Georgia, serif' }}>
                <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                  <div style={{ fontWeight: 700, fontSize: '13px', textTransform: 'uppercase' }}>BERITA ACARA VERIFIKASI KEMATANGAN RME</div>
                  <div>Nomor: BA-{String(parseInt(a.id.replace(/\D/g, ''), 10)).padStart(3, '0')}/{a.reviewedAt ? new Date(a.reviewedAt).getFullYear() : new Date().getFullYear()}/DINKES</div>
                </div>
                <p>Pada hari ini, {a.reviewedAt ? new Date(a.reviewedAt).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '—'}, telah dilakukan verifikasi kematangan Rekam Medis Elektronik (RME) terhadap:</p>
                <p><strong>Nama Faskes:</strong> {a.hospitalName}</p>
                <p><strong>Target Stage EMRAM:</strong> Stage {a.targetStage}</p>
                <p><strong>Skor Self-Assessment:</strong> {selfScore}% ({terpenuhiCount}/{totalIndicators} indikator terpenuhi)</p>
                {verifiedScore !== null && (
                  <p><strong>Skor Terverifikasi Dinkes:</strong> <span style={{ fontWeight: 700, color: verifiedScore >= 70 ? '#15804D' : '#D97706' }}>{verifiedScore}%</span></p>
                )}
                {a.reviewedBy && <p><strong>Koordinator Verifikator:</strong> {a.reviewedBy}</p>}
                {Object.keys(kps).length > 0 && (
                  <div style={{ marginBottom: '6px' }}>
                    <strong>Keputusan per Stage:</strong>
                    {stageRange.map(sNum => {
                      const dec = kps[sNum];
                      const temuan = (a.temuan_per_stage ?? a.fieldFindings ?? {})[sNum];
                      if (!dec) return null;
                      return (
                        <div key={sNum} style={{ marginLeft: '16px', marginTop: '3px' }}>
                          <em>{EMRAM_INDICATORS[sNum]?.title.split(' — ')[0]}:</em>{' '}
                          <span style={{ fontWeight: 700, color: dec === 'sesuai' ? '#15804D' : '#DC2626' }}>
                            {dec === 'sesuai' ? '✓ Sudah Sesuai' : '✕ Belum Memenuhi'}
                          </span>
                          {temuan && <div style={{ marginLeft: '16px', fontSize: '11px', color: 'var(--text3)' }}>{temuan}</div>}
                        </div>
                      );
                    })}
                  </div>
                )}
                {!Object.keys(kps).length && (a.stageVerifications || a.fieldFindings) && stageRange.some(s => a.stageVerifications?.[s] || a.fieldFindings?.[s]) && (
                  <div style={{ marginBottom: '6px' }}>
                    <strong>Temuan Kunjungan Lapangan:</strong>
                    {stageRange.map(sNum => {
                      const dec = a.stageVerifications?.[sNum];
                      const temuan = a.fieldFindings?.[sNum];
                      if (!dec && !temuan) return null;
                      return (
                        <div key={sNum} style={{ marginLeft: '16px', marginTop: '3px' }}>
                          <em>{EMRAM_INDICATORS[sNum]?.title.split(' — ')[0]}:</em>{' '}
                          {dec === 'sesuai' ? '✓ Sudah Sesuai' : dec === 'belum' ? '✕ Belum Memenuhi' : '—'}
                          {temuan && <div style={{ marginLeft: '16px', fontSize: '11px', color: 'var(--text3)' }}>{temuan}</div>}
                        </div>
                      );
                    })}
                  </div>
                )}
                {a.catatanKoordinasi && <p><strong>Catatan Koordinasi:</strong> {a.catatanKoordinasi}</p>}
                <p><strong>Keputusan:</strong> <span style={{ fontWeight: 700, color: disetujui ? '#15804D' : '#DC2626' }}>{disetujui ? 'DISETUJUI — Faskes memenuhi syarat kenaikan stage' : 'DIKEMBALIKAN — Faskes perlu melakukan perbaikan'}</span></p>
                {a.reviewerComments && <p><strong>Catatan Akhir:</strong> {a.reviewerComments}</p>}
              </div>
            </div>
          )}

          {(Object.keys(kps).length > 0 || a.stageVerifications || a.fieldFindings) && (
            <div style={{ margin: '0 24px 16px', border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ padding: '10px 16px', background: 'var(--surface2)', borderBottom: '1px solid var(--border)', fontSize: '12px', fontWeight: 700, color: 'var(--text2)' }}>
                Hasil Verifikasi Lapangan per Stage
              </div>
              {stageRange.map(sNum => {
                const dec = kps[sNum] ?? a.stageVerifications?.[sNum];
                const temuan = (a.temuan_per_stage ?? a.fieldFindings ?? {})[sNum];
                if (!dec && !temuan) return null;
                return (
                  <div key={sNum} style={{ borderTop: '1px solid var(--border)', padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: temuan ? '8px' : 0 }}>
                      <span style={{ fontSize: '12px', fontWeight: 700 }}>{EMRAM_INDICATORS[sNum]?.title}</span>
                      {dec && (
                        <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px', background: dec === 'sesuai' ? '#E8F7EF' : '#FEF2F2', color: dec === 'sesuai' ? '#15804D' : '#DC2626' }}>
                          {dec === 'sesuai' ? '✓ Sudah Sesuai' : '✕ Belum Memenuhi'}
                        </span>
                      )}
                    </div>
                    {temuan && (
                      <div style={{ fontSize: '12px', color: 'var(--text2)', background: 'var(--surface2)', borderRadius: '8px', padding: '8px 12px', lineHeight: 1.6 }}>{temuan}</div>
                    )}
                  </div>
                );
              })}
              {(a.catatanKoordinasi || a.catatan_kunjungan) && (
                <div style={{ borderTop: '1px solid var(--border)', padding: '12px 16px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Catatan Koordinasi</div>
                  <div style={{ fontSize: '12px', color: 'var(--text2)', background: 'var(--accent-light)', borderRadius: '8px', padding: '8px 12px', lineHeight: 1.6 }}>{a.catatanKoordinasi ?? a.catatan_kunjungan}</div>
                </div>
              )}
            </div>
          )}

          <div style={{ margin: '0 24px 16px' }}>
            <EMRAMPratinjau a={a} />
          </div>
        </div>

        <div style={{ padding: '12px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', flexShrink: 0 }}>
          <button onClick={onClose} style={{ padding: '8px 20px', borderRadius: '8px', border: '1px solid var(--border2)', background: 'var(--surface2)', color: 'var(--text)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Tutup</button>
        </div>
      </div>
    </div>
  );
}

function TabDraft({
  assessments,
  onContinueDraft,
  onSwitchTab,
}: {
  assessments: any[];
  onContinueDraft?: (id: string) => void;
  onSwitchTab?: (tab: 'draft' | 'proses' | 'hasil') => void;
}) {
  const { submitAssessment, deleteAssessment } = useAssessments();
  const [selectedId, setSelectedId] = useState<string | null>(assessments[0]?.id ?? null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showSubmitSuccess, setShowSubmitSuccess] = useState(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!assessments.find(a => a.id === selectedId)) {
      setSelectedId(assessments[0]?.id ?? null);
    }
  }, [assessments, selectedId]);

  const selected = assessments.find(a => a.id === selectedId);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setShowDeleteModal(false);
  };

  const handleDeleteConfirm = () => {
    if (!selected) return;
    deleteAssessment(selected.id);
    setShowDeleteModal(false);
    setShowDeleteSuccess(true);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setShowDeleteSuccess(false), 4000);
  };

  const handleSubmitToDinkes = async () => {
    if (!selected) return;
    try {
      setSubmitting(true);
      await submitAssessment(selected.id);
      setShowSubmitModal(false);
      setShowSubmitSuccess(true);
      setTimeout(() => {
        setShowSubmitSuccess(false);
        onSwitchTab?.('proses');
      }, 2200);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Terjadi kesalahan';
      alert('Gagal mengirim: ' + errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (assessments.length === 0) {
    return (
      <div className="simari-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <FileText size={40} color="var(--text3)" style={{ margin: '0 auto 12px' }} />
        <p style={{ color: 'var(--text3)', fontSize: '14px' }}>Belum ada draf. Mulai audit baru untuk membuat penilaian.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
      {assessments.length > 1 && (
        <div style={{ width: '260px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
            {assessments.length} Draf
          </div>
          {assessments.map((a) => {
            const isSelected = a.id === selectedId;
            return (
              <button
                key={a.id}
                onClick={() => handleSelect(a.id)}
                style={{
                  display: 'block', width: '100%', textAlign: 'left', padding: '14px 16px',
                  borderRadius: 'var(--radius)', border: `2px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                  background: isSelected ? 'var(--accent-light)' : 'var(--surface)',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: isSelected ? 'var(--accent)' : 'var(--text)', fontFamily: 'monospace', letterSpacing: '0.04em' }}>{toRSPYCode(a.id)}</span>
                  <span className="status-badge status-draft" style={{ fontSize: '10px' }}>Draf</span>
                </div>
                <span className={`stage-badge stage-s${a.targetStage}`} style={{ fontSize: '10px' }}>Target Stage {a.targetStage}</span>
                <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '6px' }}>Dibuat: {fmt(a.createdAt)}</div>
              </button>
            );
          })}
        </div>
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        {selected ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ background: 'var(--accent)', borderRadius: 'var(--radius-lg)', padding: '20px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: 'white', fontFamily: 'monospace', letterSpacing: '0.05em', background: 'rgba(255,255,255,0.15)', padding: '3px 10px', borderRadius: '6px' }}>
                  {toRSPYCode(selected.id)}
                </span>
                <span className={`stage-badge stage-s${selected.currentStage}`} style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: 'none' }}>
                  Stage {selected.currentStage}
                </span>
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>—</span>
                <span className={`stage-badge stage-s${selected.targetStage}`} style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: 'none' }}>
                  Target Stage {selected.targetStage}
                </span>
                <span style={{ marginLeft: 'auto', fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>Dibuat: {fmt(selected.createdAt)}</span>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'white', marginBottom: '4px' }}>Penilaian ini masih Draf</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.6 }}>
                  Lanjutkan pengisian instrumen EMRAM atau kirimkan ke Dinkes untuk proses verifikasi.
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  onClick={() => onContinueDraft?.(selected.id)}
                  style={{
                    padding: '8px 16px', borderRadius: '8px', border: '2px solid rgba(255,255,255,0.5)',
                    background: 'transparent', color: 'white', fontSize: '12px', fontWeight: 700,
                    cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif",
                    display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap',
                  }}>
                  <Pencil size={12} /> Lanjutkan Pengisian
                </button>
                <button
                  onClick={() => setShowSubmitModal(true)}
                  style={{
                    padding: '8px 16px', borderRadius: '8px', border: 'none',
                    background: 'white', color: 'var(--accent)', fontSize: '12px', fontWeight: 700,
                    cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif",
                    display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap',
                  }}>
                  <Upload size={12} /> Kirim ke Dinkes
                </button>
                <div style={{ marginLeft: 'auto' }}>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    style={{
                      padding: '7px 12px', borderRadius: '7px', border: '1px solid rgba(255,100,100,0.5)',
                      background: 'rgba(220,38,38,0.2)', color: '#fca5a5', fontSize: '12px', fontWeight: 600,
                      cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif",
                      display: 'inline-flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap',
                    }}
                  >
                    <Trash2 size={12} /> Hapus Draf
                  </button>
                </div>
              </div>
            </div>

            <AssessmentDetailPanel a={selected} hideHeader />
          </div>
        ) : (
          <div className="simari-card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text3)' }}>
            Pilih draft di sebelah kiri untuk melihat detail
          </div>
        )}
      </div>

      {showSubmitModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 9998,
        }}>
          <div style={{
            background: 'var(--surface)', borderRadius: '16px', padding: '32px 28px',
            width: '400px', maxWidth: '90vw', boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
            textAlign: 'center',
          }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%', background: 'var(--accent-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <Upload size={24} color="var(--accent)" />
            </div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>
              Kirim Penilaian ke Dinkes?
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text3)', lineHeight: 1.6, marginBottom: '24px' }}>
              Penilaian akan dikirimkan ke Dinkes DIY untuk proses verifikasi. Status akan berubah menjadi <strong>Menunggu Tinjauan</strong>.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={() => !submitting && setShowSubmitModal(false)}
                disabled={submitting}
                style={{
                  padding: '10px 24px', borderRadius: '8px', border: '1px solid var(--border2)',
                  background: 'var(--surface2)', color: 'var(--text)', fontSize: '13px', fontWeight: 600,
                  cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                Batal
              </button>
              <button
                onClick={handleSubmitToDinkes}
                disabled={submitting}
                style={{
                  padding: '10px 24px', borderRadius: '8px', border: 'none',
                  background: submitting ? 'var(--surface2)' : 'var(--accent)',
                  color: submitting ? 'var(--text3)' : 'white',
                  fontSize: '13px', fontWeight: 700,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                }}
              >
                {submitting ? 'Mengirim...' : <><Upload size={14} /> Ya, Kirim Sekarang</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 9998,
        }}>
          <div style={{
            background: 'var(--surface)', borderRadius: '16px', padding: '32px 28px',
            width: '380px', maxWidth: '90vw', boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
            textAlign: 'center',
          }}>
            <div style={{
              width: '52px', height: '52px', borderRadius: '50%', background: '#FEE2E2',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px', fontSize: '22px',
            }}>
              <Trash2 size={22} color="#DC2626" />
            </div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>Hapus Draf Penilaian?</div>
            <p style={{ fontSize: '13px', color: 'var(--text3)', lineHeight: 1.6, marginBottom: '24px' }}>
              Anda yakin ingin menghapus draf ini? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={() => setShowDeleteModal(false)}
                style={{
                  padding: '10px 24px', borderRadius: '8px', border: '1px solid var(--border2)',
                  background: 'var(--surface2)', color: 'var(--text)', fontSize: '13px', fontWeight: 600,
                  cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                Batal
              </button>
              <button
                onClick={handleDeleteConfirm}
                style={{
                  padding: '10px 24px', borderRadius: '8px', border: 'none',
                  background: '#DC2626', color: 'white', fontSize: '13px', fontWeight: 700,
                  cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {showSubmitSuccess && (
        <div style={{
          position: 'fixed', bottom: '28px', left: '50%', transform: 'translateX(-50%)',
          background: '#1a2535', color: 'white', borderRadius: '12px',
          padding: '14px 20px', boxShadow: '0 8px 32px rgba(0,0,0,0.22)',
          display: 'flex', alignItems: 'flex-start', gap: '12px',
          zIndex: 9999, minWidth: '320px', maxWidth: '460px',
        }}>
          <div style={{
            width: '22px', height: '22px', borderRadius: '50%', background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '12px', fontWeight: 700, flexShrink: 0, marginTop: '1px',
          }}>✓</div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '3px' }}>Audit RME berhasil dikirimkan ke Dinkes</div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>Silakan menunggu proses verifikasi dari petugas Dinkes.</div>
          </div>
        </div>
      )}

      {showDeleteSuccess && (
        <div style={{
          position: 'fixed', bottom: '28px', left: '50%', transform: 'translateX(-50%)',
          background: '#1a2535', color: 'white', borderRadius: '12px',
          padding: '14px 20px', boxShadow: '0 8px 32px rgba(0,0,0,0.22)',
          display: 'flex', alignItems: 'center', gap: '12px',
          zIndex: 9999, minWidth: '300px',
        }}>
          <div style={{
            width: '22px', height: '22px', borderRadius: '50%', background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '12px', fontWeight: 700, flexShrink: 0,
          }}>✓</div>
          <span style={{ fontSize: '13px', fontWeight: 600 }}>Draf Audit RME berhasil dihapus</span>
          <button
            onClick={() => setShowDeleteSuccess(false)}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '16px', padding: '0 0 0 8px' }}
          >×</button>
        </div>
      )}
    </div>
  );
}

function TabDalamProses({ assessments }: { assessments: any[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(assessments[0]?.id ?? null);
  const selected = assessments.find(a => a.id === selectedId);

  const statusInfo: Record<string, { label: string; color: string; bg: string; desc: string }> = {
    submitted:    { label: 'Menunggu Review Dinkes', color: '#D97706', bg: '#FEF3C7', desc: 'Assessment telah dikirim dan menunggu antrian review oleh Dinkes.' },
    under_review: { label: 'Sedang Direview Dinkes', color: '#2563EB', bg: '#EFF6FF', desc: 'Staf Dinkes sedang melakukan review assessment Anda.' },
  };

  if (assessments.length === 0) {
    return (
      <div className="simari-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <Clock size={40} color="var(--text3)" style={{ margin: '0 auto 12px' }} />
        <p style={{ color: 'var(--text3)', fontSize: '14px' }}>Tidak ada penilaian yang sedang dalam proses verifikasi.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
      {assessments.length > 1 && (
        <div style={{ width: '300px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
            {assessments.length} Dalam Proses
          </div>
          {assessments.map((a) => {
            const si = statusInfo[a.status] ?? statusInfo.submitted;
            const isSelected = a.id === selectedId;
            const aScore = a.totalScore ?? 0;
            return (
              <button
                key={a.id}
                onClick={() => setSelectedId(a.id)}
                style={{
                  display: 'block', width: '100%', textAlign: 'left', padding: '14px 16px',
                  borderRadius: 'var(--radius)', border: `1px solid ${isSelected ? si.color : 'var(--border)'}`,
                  background: isSelected ? si.bg : 'var(--surface)',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: isSelected ? si.color : 'var(--text)', fontFamily: 'monospace' }}>{toRSPYCode(a.id)}</span>
                  <span style={{ fontSize: '10px', fontWeight: 600, color: si.color, background: si.bg, padding: '2px 7px', borderRadius: '20px', border: `1px solid ${si.color}30` }}>
                    {si.label}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span className={`stage-badge stage-s${a.targetStage}`} style={{ fontSize: '10px' }}>Target Stage {a.targetStage}</span>
                  {aScore > 0 && <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text2)' }}>{aScore}%</span>}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text3)' }}>Dikirim: {fmt(a.submittedAt)}</div>
              </button>
            );
          })}
        </div>
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        {selected ? (
          <>
            {(() => {
              const si = statusInfo[selected.status] ?? statusInfo.submitted;
              return (
                <div style={{ background: si.bg, border: `1px solid ${si.color}40`, borderRadius: 'var(--radius-lg)', padding: '14px 18px', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '13px', color: si.color, background: 'rgba(255,255,255,0.7)', padding: '2px 10px', borderRadius: '6px', letterSpacing: '0.05em' }}>
                      {toRSPYCode(selected.id)}
                    </span>
                    <span className={`stage-badge stage-s${selected.targetStage}`}>Target Stage {selected.targetStage}</span>
                    {selected.vendorRME && (
                      <span style={{ fontSize: '11px', color: 'var(--text3)', background: 'rgba(255,255,255,0.6)', padding: '2px 8px', borderRadius: '20px' }}>
                        {selected.vendorRME}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: si.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                      <Clock size={14} color="white" />
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: si.color, marginBottom: '3px' }}>{si.label}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text2)', lineHeight: 1.6 }}>{si.desc}</div>
                      {selected.koordinatorName && (
                        <div style={{ marginTop: '4px', fontSize: '11px', color: 'var(--text3)' }}>
                          Koordinator: {selected.koordinatorName}
                          {selected.koordinatorEmail && ` · ${selected.koordinatorEmail}`}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}
            <AssessmentDetailPanel a={selected} hideHeader />
            {selected.emramAnswers && Object.keys(selected.emramAnswers).length > 0 && (
              <div style={{ marginTop: '14px' }}>
                <EMRAMPratinjau a={selected} />
              </div>
            )}
          </>
        ) : (
          <div className="simari-card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text3)' }}>
            Pilih assessment di sebelah kiri untuk melihat status
          </div>
        )}
      </div>
    </div>
  );
}

function TabHasilVerifikasi({ assessments }: { assessments: any[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(assessments[0]?.id ?? null);
  const [pratinjauAssessment, setPratinjauAssessment] = useState<any | null>(null);
  const selected = assessments.find(a => a.id === selectedId);

  if (assessments.length === 0) {
    return (
      <div className="simari-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>✓</div>
        <p style={{ color: 'var(--text3)', fontSize: '14px' }}>Belum ada penilaian yang telah diverifikasi Dinkes.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
      {assessments.length > 1 && (
        <div style={{ width: '300px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
            {assessments.length} Hasil Verifikasi
          </div>
          {assessments.map((a) => {
            const sc = statusConfig[a.status] ?? statusConfig.reviewed;
            const isSelected = a.id === selectedId;
            const aScore = a.totalScore ?? 0;
            return (
              <button
                key={a.id}
                onClick={() => setSelectedId(a.id)}
                style={{
                  display: 'block', width: '100%', textAlign: 'left', padding: '14px 16px',
                  borderRadius: 'var(--radius)', border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                  background: isSelected ? 'var(--accent-light)' : 'var(--surface)',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: isSelected ? 'var(--accent)' : 'var(--text)', fontFamily: 'monospace' }}>{toRSPYCode(a.id)}</span>
                  <span className={`status-badge ${sc.cls}`} style={{ fontSize: '10px' }}>{sc.label}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span className={`stage-badge stage-s${a.targetStage}`} style={{ fontSize: '10px' }}>Target Stage {a.targetStage}</span>
                  {aScore > 0 && (
                    <span style={{ fontSize: '12px', fontWeight: 700, color: aScore >= 80 ? 'var(--accent)' : aScore >= 60 ? 'var(--warn)' : 'var(--danger)' }}>
                      {aScore}%
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text3)' }}>
                  Diverifikasi: {fmt(a.reviewedAt)}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {pratinjauAssessment && <PratinjauBAModal a={pratinjauAssessment} onClose={() => setPratinjauAssessment(null)} />}

      <div style={{ flex: 1, minWidth: 0 }}>
        {selected ? (
          <>
            <div style={{
              background: selected.status === 'reviewed' || selected.status === 'validated' ? 'var(--accent-light)' : 'var(--warn-light)',
              border: `1px solid ${selected.status === 'reviewed' || selected.status === 'validated' ? 'var(--accent)' : '#f5d48a'}`,
              borderRadius: 'var(--radius-lg)', padding: '14px 18px', marginBottom: '14px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '13px', color: 'var(--accent)', background: 'white', padding: '2px 10px', borderRadius: '6px', letterSpacing: '0.05em' }}>
                  {toRSPYCode(selected.id)}
                </span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: selected.status === 'reviewed' || selected.status === 'validated' ? '#15804D' : '#92400E', background: 'white', padding: '2px 10px', borderRadius: '20px' }}>
                  {selected.status === 'reviewed' || selected.status === 'validated' ? '✓ Disetujui Dinkes' : '↩ Dikembalikan Dinkes'}
                </span>
                <button
                  onClick={() => setPratinjauAssessment(selected)}
                  style={{
                    marginLeft: 'auto', padding: '6px 14px', borderRadius: '8px', border: '1px solid var(--accent)',
                    background: 'white', color: 'var(--accent)', fontSize: '12px', fontWeight: 700,
                    cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif",
                    display: 'inline-flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap',
                  }}
                >
                  <Eye size={13} /> Lihat Pratinjau
                </button>
              </div>
              {selected.reviewerComments && (
                <div style={{ fontSize: '13px', color: 'var(--text2)', lineHeight: 1.65, marginBottom: '6px' }}>{selected.reviewerComments}</div>
              )}
              <div style={{ fontSize: '11px', color: 'var(--text3)' }}>
                Tanggal verifikasi: {fmt(selected.reviewedAt)} · Reviewer: {selected.reviewedBy ?? '—'}
                {selected.vendorRME && ` · Vendor: ${selected.vendorRME}`}
              </div>
            </div>
            <AssessmentDetailPanel a={selected} hideHeader />
          </>
        ) : (
          <div className="simari-card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text3)' }}>
            Pilih assessment di sebelah kiri untuk melihat hasil verifikasi
          </div>
        )}
      </div>
    </div>
  );
}

interface RiwayatAssessmentProps {
  hospitalId: string;
  onContinueDraft?: (assessmentId: string) => void;
}

export function RiwayatAssessment({ hospitalId, onContinueDraft }: RiwayatAssessmentProps) {
  const { getAssessmentsByHospital } = useAssessments();
  const allAssessments = getAssessmentsByHospital(hospitalId);
  const [activeTab, setActiveTab] = useState<'draft' | 'proses' | 'hasil'>('draft');

  const draftItems = allAssessments.filter(a => a.status === 'draft');
  const prosesItems = allAssessments.filter(a => a.status === 'submitted' || a.status === 'under_review');
  const hasilItems = allAssessments.filter(a =>
    a.status === 'reviewed' || a.status === 'under_validation' || a.status === 'validated' || a.status === 'rejected' || a.status === 'revision_required'
  );

  const tabs = [
    { id: 'draft' as const, label: 'Draf', count: draftItems.length, icon: <FileText size={14} /> },
    { id: 'proses' as const, label: 'Dalam Proses Verifikasi', count: prosesItems.length, icon: <Clock size={14} /> },
    { id: 'hasil' as const, label: 'Hasil Verifikasi', count: hasilItems.length, icon: '✓' },
  ];

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '22px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>
          Riwayat Penilaian
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text3)' }}>
          Kelola draf, pantau proses verifikasi, dan lihat hasil verifikasi Dinkes
        </p>
      </div>

      <div style={{ display: 'flex', gap: '2px', background: 'var(--surface2)', borderRadius: '10px', padding: '4px', marginBottom: '20px', width: 'fit-content' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 16px', borderRadius: '8px', border: 'none',
              background: activeTab === tab.id ? 'var(--surface)' : 'transparent',
              boxShadow: activeTab === tab.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              color: activeTab === tab.id ? 'var(--text)' : 'var(--text3)',
              fontSize: '13px', fontWeight: activeTab === tab.id ? 700 : 400,
              cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif",
              transition: 'all 0.15s',
            }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
            {tab.count > 0 && (
              <span style={{
                fontSize: '11px', fontWeight: 700, minWidth: '18px', height: '18px',
                borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: activeTab === tab.id ? 'var(--accent)' : 'var(--border2)',
                color: activeTab === tab.id ? 'white' : 'var(--text3)',
                padding: '0 5px',
              }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeTab === 'draft' && <TabDraft assessments={draftItems} onContinueDraft={onContinueDraft} />}
      {activeTab === 'proses' && <TabDalamProses assessments={prosesItems} />}
      {activeTab === 'hasil' && <TabHasilVerifikasi assessments={hasilItems} />}
    </div>
  );
}