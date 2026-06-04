// FILE: src/components/InstrumenManager.tsx
// Halaman manajemen instrumen EMRAM untuk Dinas Kesehatan.
// Dinkes dapat: lihat semua stage & indikator, tambah / edit / hapus indikator,
// edit judul stage, aktifkan/nonaktifkan indikator.

import { useState, useEffect, useCallback } from 'react';
import {
  Plus, Pencil, Trash2, ChevronDown, ChevronRight,
  CheckCircle2, XCircle, GripVertical, Save, X, RefreshCw,
  BookOpen, Info, DatabaseZap,
} from 'lucide-react';
import {
  getEmramInstrument,
  createEmramIndicator,
  updateEmramIndicator,
  deleteEmramIndicator,
  updateEmramStage,
  type EmramStageAPI,
  type EmramIndicatorAPI,
} from '../services/api';

// ─── Warna stage (konsisten dengan komponen lain) ─────────────────────────────
const STAGE_COLORS: Record<number, string> = {
  0: '#9CA3AF', 1: '#F9A8D4', 2: '#FCD34D', 3: '#FDE68A',
  4: '#BBF7D0', 5: '#6EE7B7', 6: '#34D399', 7: '#059669',
};

// ─── Tipe form indikator ───────────────────────────────────────────────────────
interface IndicatorForm {
  text: string;
  bukti_hint: string;
  indicator_code: string;
}

const emptyForm: IndicatorForm = { text: '', bukti_hint: '', indicator_code: '' };

// ─── Helper: generate kode otomatis ───────────────────────────────────────────
function genCode(stage: number, existingCodes: string[]): string {
  let n = existingCodes.length + 1;
  let code = `s${stage}i${n}`;
  while (existingCodes.includes(code)) { n++; code = `s${stage}i${n}`; }
  return code;
}

// ═════════════════════════════════════════════════════════════════════════════
export function InstrumenManager() {
  const [stages, setStages]           = useState<EmramStageAPI[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [expandedStages, setExpanded] = useState<Set<number>>(new Set([0]));

  // Edit stage title
  const [editingStageNum, setEditingStageNum] = useState<number | null>(null);
  const [stageTitleDraft, setStageTitleDraft] = useState('');

  // Add / Edit indikator
  const [addingToStage, setAddingToStage]       = useState<number | null>(null);
  const [editingIndicator, setEditingIndicator] = useState<EmramIndicatorAPI | null>(null);
  const [form, setForm]                         = useState<IndicatorForm>(emptyForm);
  const [saving, setSaving]                     = useState(false);
  const [toast, setToast]                       = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);

  // ── Load data ────────────────────────────────────────────────────────────
  const loadInstrument = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getEmramInstrument(false); // false = semua, termasuk nonaktif
      setStages(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadInstrument(); }, [loadInstrument]);

  // ── Toast helper ─────────────────────────────────────────────────────────
  const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Toggle expand stage ───────────────────────────────────────────────────
  const toggleExpand = (s: number) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(s) ? next.delete(s) : next.add(s);
      return next;
    });
  };

  // ── Edit judul stage ──────────────────────────────────────────────────────
  const startEditStage = (stage: EmramStageAPI) => {
    setEditingStageNum(stage.stage);
    setStageTitleDraft(stage.title);
  };

  const saveStageTitle = async (stageNum: number) => {
    if (!stageTitleDraft.trim()) return;
    try {
      setSaving(true);
      await updateEmramStage(stageNum, { title: stageTitleDraft.trim() });
      setStages(prev => prev.map(s => s.stage === stageNum ? { ...s, title: stageTitleDraft.trim() } : s));
      setEditingStageNum(null);
      showToast('Judul stage berhasil disimpan.');
    } catch (e: any) {
      showToast(e.message, 'err');
    } finally {
      setSaving(false);
    }
  };

  // ── Toggle aktif/nonaktif indikator ──────────────────────────────────────
  const toggleIndicatorActive = async (indicator: EmramIndicatorAPI) => {
    try {
      const updated = await updateEmramIndicator(indicator.id, { is_active: !indicator.is_active });
      setStages(prev => prev.map(s =>
        s.stage === indicator.stage
          ? { ...s, indicators: s.indicators.map(i => i.id === indicator.id ? { ...i, is_active: updated.is_active } : i) }
          : s
      ));
      showToast(updated.is_active ? 'Indikator diaktifkan.' : 'Indikator dinonaktifkan.');
    } catch (e: any) {
      showToast(e.message, 'err');
    }
  };

  // ── Buka form tambah ─────────────────────────────────────────────────────
  const openAddForm = (stageNum: number) => {
    const stage = stages.find(s => s.stage === stageNum);
    const existingCodes = stage?.indicators.map(i => i.indicator_code) ?? [];
    setForm({ ...emptyForm, indicator_code: genCode(stageNum, existingCodes) });
    setAddingToStage(stageNum);
    setEditingIndicator(null);
    // Expand stage jika belum
    setExpanded(prev => new Set([...prev, stageNum]));
  };

  // ── Buka form edit ───────────────────────────────────────────────────────
  const openEditForm = (indicator: EmramIndicatorAPI) => {
    setForm({
      text: indicator.text,
      bukti_hint: indicator.bukti_hint ?? '',
      indicator_code: indicator.indicator_code,
    });
    setEditingIndicator(indicator);
    setAddingToStage(null);
  };

  // ── Tutup form ───────────────────────────────────────────────────────────
  const closeForm = () => {
    setAddingToStage(null);
    setEditingIndicator(null);
    setForm(emptyForm);
  };

  // ── Simpan form (tambah/edit) ─────────────────────────────────────────────
  const saveForm = async () => {
    if (!form.text.trim()) { showToast('Teks indikator wajib diisi.', 'err'); return; }

    setSaving(true);
    try {
      if (editingIndicator) {
        // Edit
        const updated = await updateEmramIndicator(editingIndicator.id, {
          text: form.text.trim(),
          bukti_hint: form.bukti_hint.trim() || undefined,
        });
        setStages(prev => prev.map(s =>
          s.stage === editingIndicator.stage
            ? { ...s, indicators: s.indicators.map(i => i.id === editingIndicator.id ? { ...i, ...updated } : i) }
            : s
        ));
        showToast('Indikator berhasil diperbarui.');
      } else if (addingToStage !== null) {
        // Tambah
        const stage = stages.find(s => s.stage === addingToStage)!;
        const created = await createEmramIndicator({
          stage: addingToStage,
          indicator_code: form.indicator_code.trim(),
          text: form.text.trim(),
          bukti_hint: form.bukti_hint.trim() || undefined,
          sort_order: stage.indicators.length + 1,
        });
        setStages(prev => prev.map(s =>
          s.stage === addingToStage
            ? { ...s, indicators: [...s.indicators, created] }
            : s
        ));
        showToast('Indikator berhasil ditambahkan.');
      }
      closeForm();
    } catch (e: any) {
      showToast(e.message, 'err');
    } finally {
      setSaving(false);
    }
  };

  // ── Hapus indikator ───────────────────────────────────────────────────────
  const handleDelete = async (indicator: EmramIndicatorAPI) => {
    if (!confirm(`Hapus indikator "${indicator.indicator_code}"?\n\n"${indicator.text}"\n\nData ini tidak dapat dipulihkan.`)) return;
    try {
      await deleteEmramIndicator(indicator.id);
      setStages(prev => prev.map(s =>
        s.stage === indicator.stage
          ? { ...s, indicators: s.indicators.filter(i => i.id !== indicator.id) }
          : s
      ));
      showToast('Indikator berhasil dihapus.');
    } catch (e: any) {
      showToast(e.message, 'err');
    }
  };

  // ─── Render: Loading ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
        <div style={{ textAlign: 'center', color: 'var(--text3)' }}>
          <RefreshCw size={28} style={{ animation: 'spin 1s linear infinite', marginBottom: 8 }} />
          <p style={{ fontSize: 13 }}>Memuat instrumen EMRAM…</p>
        </div>
      </div>
    );
  }

  // ─── Render: Error ────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="page-content">
        <div className="simari-card" style={{ textAlign: 'center', padding: 40 }}>
          <XCircle size={36} color="var(--danger)" style={{ marginBottom: 8 }} />
          <p style={{ color: 'var(--danger)', fontWeight: 600 }}>Gagal memuat instrumen</p>
          <p style={{ color: 'var(--text3)', fontSize: 12, marginBottom: 16 }}>{error}</p>
          <button className="btn-primary" onClick={loadInstrument}>Coba Lagi</button>
        </div>
      </div>
    );
  }

  const totalActive = stages.reduce((n, s) => n + s.indicators.filter(i => i.is_active).length, 0);
  const totalAll    = stages.reduce((n, s) => n + s.indicators.length, 0);

  // ─── Render: Kosong (seeder belum dijalankan) ─────────────────────────────
  if (stages.length === 0) {
    return (
      <div className="page-content">
        {/* Header tetap ditampilkan */}
        <div className="page-header">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <div>
              <h1 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <BookOpen size={20} color="var(--accent)" />
                Manajemen Instrumen EMRAM
              </h1>
              <p>Kelola stage dan indikator penilaian EMRAM. Perubahan berlaku langsung untuk seluruh rumah sakit.</p>
            </div>
            <button
              className="btn-secondary"
              onClick={loadInstrument}
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}
            >
              <RefreshCw size={13} /> Muat Ulang
            </button>
          </div>
        </div>

        {/* State kosong — petunjuk untuk administrator */}
        <div className="simari-card" style={{ textAlign: 'center', padding: '48px 32px' }}>
          <DatabaseZap size={44} color="var(--text3)" style={{ marginBottom: 14, opacity: 0.5 }} />
          <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)', marginBottom: 6 }}>
            Instrumen EMRAM Belum Tersedia
          </p>
          <p style={{ fontSize: 12, color: 'var(--text3)', maxWidth: 420, margin: '0 auto 20px', lineHeight: 1.7 }}>
            Data stage dan indikator EMRAM belum ada di database. Administrator perlu menjalankan
            seeder di server backend terlebih dahulu.
          </p>

          {/* Panduan perintah */}
          <div style={{
            display: 'inline-block', textAlign: 'left',
            background: 'var(--surface2)', border: '1px solid var(--border2)',
            borderRadius: 8, padding: '12px 18px', marginBottom: 20,
          }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
              Perintah yang perlu dijalankan di server backend
            </p>
            <code style={{ display: 'block', fontSize: 12, color: 'var(--accent)', fontFamily: 'monospace', marginBottom: 4 }}>
              php artisan db:seed --class=EmramInstrumentSeeder
            </code>
            <p style={{ fontSize: 10, color: 'var(--text3)', margin: '6px 0 0' }}>
              atau jika ingin reset penuh:&nbsp;
              <code style={{ fontFamily: 'monospace', color: 'var(--text2)' }}>php artisan migrate:fresh --seed</code>
            </p>
          </div>

          <div>
            <button
              className="btn-primary"
              onClick={loadInstrument}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12 }}
            >
              <RefreshCw size={13} /> Cek Ulang
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Render: Normal ───────────────────────────────────────────────────────
  return (
    <div className="page-content">
      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          background: toast.type === 'ok' ? 'var(--accent)' : 'var(--danger)',
          color: '#fff', padding: '10px 18px', borderRadius: 8,
          fontSize: 13, fontWeight: 600, boxShadow: '0 4px 16px rgba(0,0,0,.18)',
          display: 'flex', alignItems: 'center', gap: 8,
          animation: 'fadeIn .2s ease',
        }}>
          {toast.type === 'ok' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* ── Header ── */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <BookOpen size={20} color="var(--accent)" />
              Manajemen Instrumen EMRAM
            </h1>
            <p>Kelola stage dan indikator penilaian EMRAM. Perubahan berlaku langsung untuk seluruh rumah sakit.</p>
          </div>
          <button
            className="btn-secondary"
            onClick={loadInstrument}
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}
          >
            <RefreshCw size={13} /> Muat Ulang
          </button>
        </div>
      </div>

      {/* ── Info banner ── */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px',
        background: 'var(--accent-light)', borderRadius: 8, marginBottom: 20,
        border: '1px solid var(--accent-border, var(--border2))',
      }}>
        <Info size={15} color="var(--accent)" style={{ flexShrink: 0, marginTop: 1 }} />
        <p style={{ fontSize: 12, color: 'var(--text2)', margin: 0, lineHeight: 1.6 }}>
          Total <strong>{totalActive}</strong> indikator aktif dari <strong>{totalAll}</strong> indikator.
          Indikator yang <strong>dinonaktifkan</strong> tidak akan muncul di formulir penilaian rumah sakit,
          namun jawaban lama tetap tersimpan.
          Indikator yang <strong>dihapus</strong> bersifat permanen.
        </p>
      </div>

      {/* ── Daftar Stage ── */}
      {stages.map(stage => {
        const isExpanded = expandedStages.has(stage.stage);
        const color      = STAGE_COLORS[stage.stage];
        const activeCount = stage.indicators.filter(i => i.is_active).length;

        return (
          <div
            key={stage.stage}
            className="simari-card"
            style={{ marginBottom: 12, padding: 0, overflow: 'hidden', border: `1px solid var(--border2)` }}
          >
            {/* Stage header row */}
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '12px 16px', cursor: 'pointer',
                borderLeft: `4px solid ${color}`,
                background: isExpanded ? 'var(--surface2)' : 'var(--surface)',
                transition: 'background 0.15s',
              }}
              onClick={() => toggleExpand(stage.stage)}
            >
              {isExpanded
                ? <ChevronDown size={16} color="var(--text3)" />
                : <ChevronRight size={16} color="var(--text3)" />
              }

              {/* Stage badge */}
              <span style={{
                minWidth: 56, padding: '2px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                background: color, color: stage.stage >= 5 ? '#fff' : '#1a1a1a',
                textAlign: 'center', flexShrink: 0,
              }}>
                Stage {stage.stage}
              </span>

              {/* Title (editable inline) */}
              {editingStageNum === stage.stage ? (
                <input
                  value={stageTitleDraft}
                  onChange={e => setStageTitleDraft(e.target.value)}
                  onClick={e => e.stopPropagation()}
                  onKeyDown={e => {
                    if (e.key === 'Enter') saveStageTitle(stage.stage);
                    if (e.key === 'Escape') setEditingStageNum(null);
                  }}
                  style={{
                    flex: 1, fontSize: 13, fontWeight: 600,
                    border: '1px solid var(--accent)', borderRadius: 6,
                    padding: '3px 8px', background: 'var(--surface)',
                    color: 'var(--text)', fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                  autoFocus
                />
              ) : (
                <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                  {stage.title}
                </span>
              )}

              {/* Indicator count badge */}
              <span style={{ fontSize: 11, color: 'var(--text3)', flexShrink: 0 }}>
                {activeCount}/{stage.indicators.length} aktif
              </span>

              {/* Stage action buttons */}
              <div style={{ display: 'flex', gap: 4 }} onClick={e => e.stopPropagation()}>
                {editingStageNum === stage.stage ? (
                  <>
                    <button
                      className="btn-icon"
                      title="Simpan judul"
                      disabled={saving}
                      onClick={() => saveStageTitle(stage.stage)}
                      style={{ color: 'var(--accent)' }}
                    >
                      <Save size={14} />
                    </button>
                    <button
                      className="btn-icon"
                      title="Batal"
                      onClick={() => setEditingStageNum(null)}
                    >
                      <X size={14} />
                    </button>
                  </>
                ) : (
                  <button
                    className="btn-icon"
                    title="Edit judul stage"
                    onClick={() => startEditStage(stage)}
                  >
                    <Pencil size={13} />
                  </button>
                )}
                <button
                  className="btn-icon"
                  title="Tambah indikator"
                  onClick={() => openAddForm(stage.stage)}
                  style={{ color: 'var(--accent)' }}
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Expanded: daftar indikator + form tambah */}
            {isExpanded && (
              <div style={{ padding: '8px 16px 14px' }}>

                {/* Form tambah/edit indikator */}
                {(addingToStage === stage.stage || editingIndicator?.stage === stage.stage) && (
                  <IndicatorFormPanel
                    form={form}
                    setForm={setForm}
                    onSave={saveForm}
                    onCancel={closeForm}
                    saving={saving}
                    isEdit={editingIndicator !== null}
                    stageNum={stage.stage}
                  />
                )}

                {stage.indicators.length === 0 && addingToStage !== stage.stage ? (
                  <p style={{ fontSize: 12, color: 'var(--text3)', textAlign: 'center', padding: '12px 0' }}>
                    Belum ada indikator. Klik&nbsp;
                    <strong style={{ color: 'var(--accent)', cursor: 'pointer' }}
                      onClick={() => openAddForm(stage.stage)}>
                      + Tambah Indikator
                    </strong>
                    &nbsp;untuk memulai.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
                    {stage.indicators.map((ind, idx) => (
                      <IndicatorRow
                        key={ind.id}
                        indicator={ind}
                        idx={idx}
                        isEditingThis={editingIndicator?.id === ind.id}
                        onEdit={() => openEditForm(ind)}
                        onDelete={() => handleDelete(ind)}
                        onToggleActive={() => toggleIndicatorActive(ind)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── IndicatorRow ──────────────────────────────────────────────────────────────
function IndicatorRow({
  indicator, idx, isEditingThis, onEdit, onDelete, onToggleActive,
}: {
  indicator: EmramIndicatorAPI;
  idx: number;
  isEditingThis: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 8,
      padding: '8px 10px', borderRadius: 6,
      background: isEditingThis
        ? 'var(--accent-light)'
        : indicator.is_active
          ? 'var(--surface)'
          : 'rgba(0,0,0,.03)',
      border: `1px solid ${isEditingThis ? 'var(--accent)' : 'var(--border2)'}`,
      opacity: indicator.is_active ? 1 : 0.55,
      transition: 'all .15s',
    }}>
      <GripVertical size={13} color="var(--text3)" style={{ flexShrink: 0, marginTop: 3 }} />
      <span style={{
        minWidth: 40, fontSize: 10, fontWeight: 700,
        color: 'var(--text3)', flexShrink: 0, paddingTop: 2,
        fontFamily: 'monospace',
      }}>
        {indicator.indicator_code}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          margin: 0, fontSize: 12, fontWeight: 500, color: 'var(--text)',
          textDecoration: indicator.is_active ? 'none' : 'line-through',
        }}>
          {indicator.text}
        </p>
        {indicator.bukti_hint && (
          <p style={{ margin: '2px 0 0', fontSize: 10, color: 'var(--text3)' }}>
            💡 {indicator.bukti_hint}
          </p>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
        <button
          className="btn-icon"
          title={indicator.is_active ? 'Nonaktifkan' : 'Aktifkan'}
          onClick={onToggleActive}
          style={{ color: indicator.is_active ? 'var(--accent)' : 'var(--text3)' }}
        >
          {indicator.is_active
            ? <CheckCircle2 size={14} />
            : <XCircle size={14} />
          }
        </button>
        <button className="btn-icon" title="Edit" onClick={onEdit}>
          <Pencil size={13} />
        </button>
        <button
          className="btn-icon"
          title="Hapus"
          onClick={onDelete}
          style={{ color: 'var(--danger)' }}
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

// ─── IndicatorFormPanel ────────────────────────────────────────────────────────
// (Diganti nama dari IndicatorForm agar tidak bentrok dengan interface IndicatorForm)
function IndicatorFormPanel({
  form, setForm, onSave, onCancel, saving, isEdit, stageNum,
}: {
  form: IndicatorForm;
  setForm: (f: IndicatorForm) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
  isEdit: boolean;
  stageNum: number;
}) {
  return (
    <div style={{
      padding: '12px 14px', marginBottom: 8, borderRadius: 8,
      border: '1.5px dashed var(--accent)',
      background: 'var(--accent-light)',
    }}>
      <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', margin: '0 0 10px' }}>
        {isEdit ? '✏️ Edit Indikator' : `➕ Tambah Indikator — Stage ${stageNum}`}
      </p>

      {!isEdit && (
        <div style={{ marginBottom: 8 }}>
          <label style={labelStyle}>Kode Indikator</label>
          <input
            value={form.indicator_code}
            onChange={e => setForm({ ...form, indicator_code: e.target.value })}
            placeholder="cth: s3i7"
            style={inputStyle}
          />
        </div>
      )}

      <div style={{ marginBottom: 8 }}>
        <label style={labelStyle}>Teks Indikator <span style={{ color: 'var(--danger)' }}>*</span></label>
        <textarea
          value={form.text}
          onChange={e => setForm({ ...form, text: e.target.value })}
          placeholder="Tuliskan indikator secara lengkap dan jelas…"
          rows={3}
          style={{ ...inputStyle, resize: 'vertical' }}
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={labelStyle}>Petunjuk Bukti</label>
        <input
          value={form.bukti_hint}
          onChange={e => setForm({ ...form, bukti_hint: e.target.value })}
          placeholder="cth: Screenshot modul di SIMRS, Laporan penggunaan…"
          style={inputStyle}
        />
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button
          className="btn-primary"
          onClick={onSave}
          disabled={saving || !form.text.trim()}
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}
        >
          <Save size={13} />
          {saving ? 'Menyimpan…' : isEdit ? 'Simpan Perubahan' : 'Tambah Indikator'}
        </button>
        <button
          className="btn-secondary"
          onClick={onCancel}
          disabled={saving}
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}
        >
          <X size={13} /> Batal
        </button>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 600,
  color: 'var(--text2)', marginBottom: 4,
};
const inputStyle: React.CSSProperties = {
  width: '100%', fontSize: 12, padding: '6px 10px',
  borderRadius: 6, border: '1px solid var(--border2)',
  background: 'var(--surface)', color: 'var(--text)',
  fontFamily: "'Plus Jakarta Sans', sans-serif", outline: 'none',
  boxSizing: 'border-box',
};