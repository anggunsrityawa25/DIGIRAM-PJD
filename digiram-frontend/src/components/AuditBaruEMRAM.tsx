import { useState } from 'react';
import { CheckCircle } from 'lucide-react';

interface AuditBaruEMRAMProps {
  hospitalName?: string;
  hospitalStage?: number;
  onStartAudit?: (data: {
    namaPIC: string;
    emailPIC: string;
    vendor: string;
    koordinatorRME: string;
    koordinatorEmail: string;
    namaSistemRME: string;
  }) => void;
}

const vendorOptions = [
  'Innosoft Fuse',
  'Medicus',
  'SIMRS GOS (Kemenkes)',
  'IHS — BPJS Kesehatan',
  'Digi — Telkom Indonesia',
  'Lainnya / In-house',
];

const periodeOptions = [
  'Q1 2026 (Januari – Maret 2026)',
  'Q2 2026 (April – Juni 2026)',
  'Q3 2026 (Juli – September 2026)',
  'Q4 2026 (Oktober – Desember 2026)',
];

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', borderRadius: '8px',
  border: '1px solid var(--border2)', background: 'var(--surface)',
  fontSize: '13px', color: 'var(--text)', fontFamily: "'Plus Jakarta Sans', sans-serif",
  outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s',
};

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text2)', marginBottom: '6px',
};

function InfoBadge({ label, sub }: { label: string; sub: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', background: 'var(--surface2)', borderRadius: '8px', marginBottom: '6px' }}>
      <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent)', background: 'var(--accent-light)', padding: '2px 8px', borderRadius: '20px', whiteSpace: 'nowrap' }}>
        {label}
      </span>
      <span style={{ fontSize: '11px', color: 'var(--text2)' }}>{sub}</span>
    </div>
  );
}

export function AuditBaruEMRAM({ hospitalName = 'RSUD', hospitalStage: hospitalStageRaw = 0, onStartAudit }: AuditBaruEMRAMProps) {
  const hospitalStage = Math.min(7, Math.max(0, Number(hospitalStageRaw) || 0));
  const [kodeFaskes, setKodeFaskes]             = useState('RS01827');
  const [faskesFound, setFaskesFound]           = useState(true);
  const [koordinatorRME, setKoordinatorRME]     = useState('');
  const [koordinatorEmail, setKoordinatorEmail] = useState('');
  const [vendor, setVendor]                     = useState('');
  const [namaSistemRME, setNamaSistemRME]       = useState('');
  const [periode, setPeriode]                   = useState('Q2 2026 (April – Juni 2026)');

  const handleKodeChange = (val: string) => {
    setKodeFaskes(val);
    setFaskesFound(val.length >= 4);
  };

  const canSubmit = kodeFaskes && koordinatorRME && koordinatorEmail;

  return (
    <div>
      <div className="simari-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>Audit RME</span>
        </div>
        <div className="topbar-actions" />
      </div>

      <div className="page-content">
        <div style={{ marginBottom: '20px' }}>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '22px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>
            Audit RME
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text3)' }}>
            Daftarkan fasilitas kesehatan dan mulai proses penilaian EMRAM
          </p>
        </div>

        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
          {/* FORM */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>

              <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)', marginBottom: '20px' }}>
                Identifikasi Fasilitas
              </div>

              {/* Kode Faskes */}
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Kode Faskes SRS / ASPAK <span style={{ color: 'var(--danger)' }}>*</span></label>
                <input type="text" value={kodeFaskes} onChange={e => handleKodeChange(e.target.value)} style={inputStyle} placeholder="Contoh: RS01827" />
                <p style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '4px' }}>Ketik kode faskes untuk pengisian otomatis data dari ASPAK / SRS Online</p>
              </div>

              {faskesFound && (
                <div style={{ padding: '12px 16px', background: '#F0FBF5', border: '1px solid #9DDBBA', borderRadius: '8px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <CheckCircle size={16} color="var(--accent)" />
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent)' }}>Data faskes ditemukan di SRS Online</span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text2)', margin: 0, paddingLeft: '22px' }}>
                    {hospitalName} · Sekolah Vokasi UGM, Sleman, DIY
                  </p>
                </div>
              )}

              {/* Koordinator RME */}
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Nama Koordinator RME / Narahubung <span style={{ color: 'var(--danger)' }}>*</span></label>
                <input type="text" value={koordinatorRME} onChange={e => setKoordinatorRME(e.target.value)} placeholder="Nama lengkap koordinator RME" style={inputStyle} />
                <p style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '4px' }}>Nama penanggung jawab RME di faskes (boleh berbeda dengan akun login)</p>
              </div>

              {/* Email Koordinator */}
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Email Koordinator RME <span style={{ color: 'var(--danger)' }}>*</span></label>
                <input type="email" value={koordinatorEmail} onChange={e => setKoordinatorEmail(e.target.value)} placeholder="koordinator@faskes.go.id" style={inputStyle} />
              </div>

              {/* Vendor SIMRS */}
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Vendor / Sistem RME yang digunakan</label>
                <div style={{ position: 'relative' }}>
                  <select value={vendor} onChange={e => setVendor(e.target.value)} style={{ ...inputStyle, appearance: 'none', paddingRight: '32px', cursor: 'pointer', color: vendor ? 'var(--text)' : 'var(--text3)' }}>
                    <option value="">Pilih vendor...</option>
                    {vendorOptions.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                  <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)', pointerEvents: 'none', fontSize: '12px' }}>▾</span>
                </div>
              </div>

              {/* Nama Sistem RME */}
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Nama Sistem RME yang Digunakan</label>
                <input type="text" value={namaSistemRME} onChange={e => setNamaSistemRME(e.target.value)} placeholder="cth. SIMRS-WEB v3.2, e-RME RS, dll." style={inputStyle} />
                <p style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '4px' }}>Nama dan versi sistem RME yang aktif digunakan saat ini</p>
              </div>

              {/* Periode */}
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Periode Audit</label>
                <div style={{ position: 'relative' }}>
                  <select value={periode} onChange={e => setPeriode(e.target.value)} style={{ ...inputStyle, appearance: 'none', paddingRight: '32px', cursor: 'pointer' }}>
                    {periodeOptions.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                  <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)', pointerEvents: 'none', fontSize: '12px' }}>▾</span>
                </div>
              </div>

              <button
                onClick={canSubmit ? () => onStartAudit?.({ namaPIC: koordinatorRME, emailPIC: koordinatorEmail, vendor, koordinatorRME, koordinatorEmail, namaSistemRME }) : undefined}
                style={{ width: '100%', padding: '12px 20px', borderRadius: '8px', border: 'none', background: canSubmit ? 'var(--accent)' : 'var(--surface2)', color: canSubmit ? 'white' : 'var(--text3)', fontSize: '14px', fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif", cursor: canSubmit ? 'pointer' : 'not-allowed', transition: 'all 0.15s' }}
              >
                Mulai Audit
              </button>
            </div>
          </div>

          {/* RIGHT INFO */}
          <div style={{ width: '300px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '18px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', marginBottom: '10px' }}>Tentang Instrumen Hybrid</div>
              <p style={{ fontSize: '12px', color: 'var(--text2)', lineHeight: 1.65, marginBottom: '14px' }}>
                Sistem ini menggunakan <strong style={{ color: 'var(--accent)' }}>HIMSS EMRAM Stage 0–7</strong> yang dilokalisasi sebagai kerangka kematangan utama.
              </p>
              <InfoBadge label="7 Domain EMRAM" sub="Infrastruktur → Paperless" />
              <InfoBadge label="+1 Domain ID" sub="Integrasi Satu Sehat" />
            </div>

            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '18px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', marginBottom: '14px' }}>Riwayat Faskes Ini</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { label: 'Stage saat ini', badge: { text: `Stage ${hospitalStage}`, cls: `stage-badge stage-s${hospitalStage}` } },
                  { label: 'Target audit', badge: { text: `Stage ${hospitalStage + 1}`, cls: `stage-badge stage-s${hospitalStage + 1}` } },
                ].map((row, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '10px', borderBottom: i < 1 ? '1px solid var(--border)' : 'none' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text3)' }}>{row.label}</span>
                    <span className={row.badge.cls}>{row.badge.text}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '12px', padding: '8px 10px', background: 'var(--accent-light)', borderRadius: '6px', fontSize: '11px', color: 'var(--accent)', fontWeight: 600 }}>
                Target audit ini: Stage {hospitalStage} → Stage {hospitalStage + 1}
              </div>
            </div>

            <div style={{ background: 'var(--accent)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.7)', marginBottom: '8px' }}>Perkiraan Waktu</div>
              <div style={{ fontSize: '30px', fontWeight: 800, color: 'white', marginBottom: '8px' }}>45–90 mnt</div>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)', margin: 0, lineHeight: 1.55 }}>
                Bisa disimpan sebagai draf dan dilanjutkan kemudian
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}