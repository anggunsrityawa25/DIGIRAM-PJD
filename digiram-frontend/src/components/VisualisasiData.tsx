import { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as ReTooltip, ResponsiveContainer, Cell,
  LineChart, Line, PieChart, Pie, Legend,
} from 'recharts';
import {
  allFaskes, trendBulan,
  STAGE_COLORS,
  type FaskesRME,
} from '../data/visualisasiData';
import { PetaInteraktif } from './PetaInteraktif';

type FilterLevel = 'nasional' | 'provinsi' | 'kabupaten' | 'kecamatan';

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  'Tervalidasi':  { label: 'Tervalidasi',  cls: 'status-done'  },
  'Dalam Review': { label: 'Dalam Review', cls: 'status-review' },
  'Draft':        { label: 'Draft',        cls: 'status-draft'  },
  'Belum':        { label: 'Belum',        cls: 'status-draft'  },
};

const selectStyle: React.CSSProperties = {
  fontSize: '12px', padding: '6px 10px', borderRadius: '6px',
  border: '1px solid var(--border2)', background: 'var(--surface)',
  color: 'var(--text)', outline: 'none', fontFamily: "'Plus Jakarta Sans', sans-serif",
  cursor: 'pointer',
};

const PIE_COLORS = ['var(--accent)', '#6BAE8C', 'var(--warn)', '#9B6DCA', '#5B9BD5'];

export function VisualisasiData() {
  const [filterLevel, setFilterLevel] = useState<FilterLevel>('nasional');
  const [selectedProvinsi, setSelectedProvinsi] = useState<string | null>(null);
  const [selectedKabupaten, setSelectedKabupaten] = useState<string | null>(null);
  const [selectedKecamatan, setSelectedKecamatan] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'stage' | 'nama'>('stage');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Province stats map for tile coloring
  const provinsiStats = useMemo(() => {
    const stats: Record<string, { count: number; sumStage: number; stages: number[] }> = {};
    allFaskes.forEach(f => {
      if (!stats[f.provinsi]) stats[f.provinsi] = { count: 0, sumStage: 0, stages: [] };
      stats[f.provinsi].count++;
      stats[f.provinsi].sumStage += f.stageEMRAM;
      stats[f.provinsi].stages.push(f.stageEMRAM);
    });
    return stats;
  }, []);

  // Cascade filter options
  const allProvinsiList = useMemo(() => [...new Set(allFaskes.map(f => f.provinsi))].sort(), []);
  const kabupatenList = useMemo(() =>
    selectedProvinsi ? [...new Set(allFaskes.filter(f => f.provinsi === selectedProvinsi).map(f => f.kabupaten))].sort() : [],
    [selectedProvinsi]);
  const kecamatanList = useMemo(() =>
    selectedKabupaten ? [...new Set(allFaskes.filter(f => f.kabupaten === selectedKabupaten).map(f => f.kecamatan))].sort() : [],
    [selectedKabupaten]);

  // Filtered faskes dataset
  const filteredFaskes = useMemo(() => {
    let data: FaskesRME[] = allFaskes;
    if (selectedProvinsi) data = data.filter(f => f.provinsi === selectedProvinsi);
    if (selectedKabupaten) data = data.filter(f => f.kabupaten === selectedKabupaten);
    if (selectedKecamatan) data = data.filter(f => f.kecamatan === selectedKecamatan);
    return data;
  }, [selectedProvinsi, selectedKabupaten, selectedKecamatan]);

  // Charts data
  const stageDistData = useMemo(() =>
    [0, 1, 2, 3, 4, 5, 6, 7].map(s => ({
      stage: `S${s}`,
      count: filteredFaskes.filter(f => f.stageEMRAM === s).length,
      fill: STAGE_COLORS[s],
    })), [filteredFaskes]);

  const jenisData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredFaskes.forEach(f => { map[f.jenis] = (map[f.jenis] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filteredFaskes]);

  // Summary stats
  const avgStage = filteredFaskes.length > 0
    ? (filteredFaskes.reduce((s, f) => s + f.stageEMRAM, 0) / filteredFaskes.length).toFixed(1)
    : '0';
  const validated = filteredFaskes.filter(f => f.statusAssessment === 'Tervalidasi').length;
  const inProgress = filteredFaskes.filter(f => f.statusAssessment === 'Dalam Review').length;
  const belum = filteredFaskes.filter(f => f.statusAssessment === 'Belum').length;

  // Handle level change
  const changeLevel = (level: FilterLevel) => {
    setFilterLevel(level);
    if (level === 'nasional') { setSelectedProvinsi(null); setSelectedKabupaten(null); setSelectedKecamatan(null); }
    else if (level === 'provinsi') { setSelectedKabupaten(null); setSelectedKecamatan(null); }
    else if (level === 'kabupaten') { setSelectedKecamatan(null); }
  };

  const handleTileClick = (namaProv: string) => {
    if (!provinsiStats[namaProv]) return;
    setSelectedProvinsi(namaProv);
    setFilterLevel('provinsi');
    setSelectedKabupaten(null);
    setSelectedKecamatan(null);
  };

  // Sorted table
  const sortedFaskes = useMemo(() =>
    [...filteredFaskes].sort((a, b) => {
      const cmp = sortBy === 'stage' ? a.stageEMRAM - b.stageEMRAM : a.nama.localeCompare(b.nama);
      return sortDir === 'desc' ? -cmp : cmp;
    }), [filteredFaskes, sortBy, sortDir]);

  const activeLabel = selectedKecamatan || selectedKabupaten || selectedProvinsi || 'Nasional';

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '22px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>
          Visualisasi & Pelaporan
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text3)' }}>
          Peta persebaran kematangan digital dan statistik EMRAM — {activeLabel}
        </p>
      </div>

      {/* Filter Bar */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', padding: '12px 16px', marginBottom: '20px',
        display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center',
      }}>
        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Tampilkan:
        </span>
        {(['nasional', 'provinsi', 'kabupaten', 'kecamatan'] as FilterLevel[]).map(lvl => (
          <button
            key={lvl}
            onClick={() => changeLevel(lvl)}
            style={{
              padding: '5px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
              border: `1px solid ${filterLevel === lvl ? 'var(--accent)' : 'var(--border2)'}`,
              background: filterLevel === lvl ? 'var(--accent)' : 'var(--surface)',
              color: filterLevel === lvl ? 'white' : 'var(--text2)',
              cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif",
              textTransform: 'capitalize',
            }}
          >
            {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
          </button>
        ))}

        <div style={{ display: 'flex', gap: '6px', marginLeft: '4px', flexWrap: 'wrap' }}>
          {filterLevel !== 'nasional' && (
            <select
              value={selectedProvinsi || ''}
              onChange={e => { setSelectedProvinsi(e.target.value || null); setSelectedKabupaten(null); setSelectedKecamatan(null); }}
              style={selectStyle}
            >
              <option value="">— Pilih Provinsi —</option>
              {allProvinsiList.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          )}
          {(filterLevel === 'kabupaten' || filterLevel === 'kecamatan') && selectedProvinsi && (
            <select
              value={selectedKabupaten || ''}
              onChange={e => { setSelectedKabupaten(e.target.value || null); setSelectedKecamatan(null); }}
              style={selectStyle}
            >
              <option value="">— Pilih Kabupaten —</option>
              {kabupatenList.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          )}
          {filterLevel === 'kecamatan' && selectedKabupaten && (
            <select
              value={selectedKecamatan || ''}
              onChange={e => setSelectedKecamatan(e.target.value || null)}
              style={selectStyle}
            >
              <option value="">— Pilih Kecamatan —</option>
              {kecamatanList.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          )}
          {(selectedProvinsi || selectedKabupaten || selectedKecamatan) && (
            <button
              onClick={() => changeLevel('nasional')}
              style={{
                padding: '5px 10px', borderRadius: '20px', fontSize: '11px',
                border: '1px solid var(--danger)', background: 'var(--danger-light)',
                color: 'var(--danger)', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              × Reset
            </button>
          )}
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid-4 mb-20">
        <div className="metric-card">
          <div className="metric-label">Total Faskes</div>
          <div className="metric-value">{filteredFaskes.length}</div>
          <div className="metric-change text-muted">{activeLabel}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Rata-rata Stage</div>
          <div className="metric-value">{avgStage}</div>
          <div className="metric-change">
            <span className={`stage-badge stage-s${Math.round(parseFloat(avgStage))}`}>Stage {Math.round(parseFloat(avgStage))}</span>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Tervalidasi</div>
          <div className="metric-value">{validated}</div>
          <div className="metric-change text-muted">Assessment sah</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Belum Assessment</div>
          <div className="metric-value">{belum}</div>
          <div className="metric-change text-muted">Perlu tindakan</div>
        </div>
      </div>

      {/* Interactive Geographic Map */}
      <div className="simari-card" style={{ marginBottom: '20px' }}>
        <div style={{ marginBottom: '12px' }}>
          <div className="card-title">Peta Kematangan Digital — Persebaran Provinsi</div>
          <p style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '2px' }}>
            Klik provinsi untuk filter data. Warna menunjukkan rata-rata Stage EMRAM. Scroll untuk zoom.
          </p>
        </div>
        <PetaInteraktif
          provinsiStats={provinsiStats}
          selectedProvinsi={selectedProvinsi}
          onProvinsiClick={handleTileClick}
        />
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
        {/* Stage Distribution Bar */}
        <div className="simari-card">
          <div className="card-title">Distribusi Stage</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={stageDistData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <CartesianGrid key="vd-bar-grid" strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis key="vd-bar-xaxis" dataKey="stage" tick={{ fontSize: 10 }} />
              <YAxis key="vd-bar-yaxis" tick={{ fontSize: 10 }} />
              <ReTooltip key="vd-bar-tooltip"
                formatter={(val) => [`${val} faskes`, 'Jumlah']}
                contentStyle={{ fontSize: '11px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              />
              <Bar key="vd-bar-count" dataKey="count" radius={[3, 3, 0, 0]}>
                {stageDistData.map((entry) => <Cell key={`vd-bar-stage-${entry.stage}`} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Jenis Faskes Pie */}
        <div className="simari-card">
          <div className="card-title">Jenis Faskes</div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie key="vd-pie"
                data={jenisData} dataKey="value" nameKey="name"
                cx="50%" cy="45%" outerRadius={60}
                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {jenisData.map((entry, i) => <Cell key={`vd-pie-jenis-${entry.name}`} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Legend key="vd-pie-legend" iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
              <ReTooltip key="vd-pie-tooltip" contentStyle={{ fontSize: '11px', fontFamily: "'Plus Jakarta Sans', sans-serif" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Status Breakdown */}
        <div className="simari-card">
          <div className="card-title">Status Assessment</div>
          <div style={{ padding: '12px 0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { label: 'Tervalidasi', count: validated, color: 'var(--accent)' },
              { label: 'Dalam Review', count: inProgress, color: 'var(--warn)' },
              { label: 'Draft', count: filteredFaskes.filter(f => f.statusAssessment === 'Draft').length, color: 'var(--text3)' },
              { label: 'Belum', count: belum, color: 'var(--danger)' },
            ].map(item => {
              const pct = filteredFaskes.length > 0 ? (item.count / filteredFaskes.length) * 100 : 0;
              return (
                <div key={item.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px', fontSize: '11px' }}>
                    <span style={{ color: 'var(--text2)' }}>{item.label}</span>
                    <span style={{ fontWeight: 700, color: item.color }}>{item.count}</span>
                  </div>
                  <div className="progress-wrap">
                    <div className="progress-fill" style={{ width: `${pct}%`, background: item.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* National Trend Line Chart */}
      <div className="simari-card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div className="card-title">Tren Kematangan RME Nasional</div>
          <span style={{ fontSize: '11px', color: 'var(--text3)' }}>Rata-rata Stage EMRAM seluruh Indonesia</span>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={trendBulan} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
            <CartesianGrid key="vd-line-grid" strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis key="vd-line-xaxis" dataKey="bulan" tick={{ fontSize: 10, fontFamily: "'Plus Jakarta Sans', sans-serif" }} />
            <YAxis key="vd-line-yaxis" domain={[2, 5]} tick={{ fontSize: 10 }} />
            <ReTooltip key="vd-line-tooltip"
              formatter={(val, name) => [val, name === 'avgStage' ? 'Avg Stage' : 'RS Aktif']}
              contentStyle={{ fontSize: '11px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            />
            <Line key="vd-line-avgstage" type="monotone" dataKey="avgStage" stroke="var(--accent)" strokeWidth={2.5}
              dot={{ r: 4, fill: 'var(--accent)', stroke: 'white', strokeWidth: 2 }} name="avgStage" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Hospital Table */}
      <div className="simari-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <div className="card-title">
            Daftar Faskes — {activeLabel}
            <span style={{ marginLeft: '8px', fontSize: '11px', fontWeight: 400, color: 'var(--text3)' }}>
              ({sortedFaskes.length} faskes)
            </span>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <select
              value={`${sortBy}-${sortDir}`}
              onChange={e => {
                const [col, dir] = e.target.value.split('-') as ['stage' | 'nama', 'asc' | 'desc'];
                setSortBy(col); setSortDir(dir);
              }}
              style={selectStyle}
            >
              <option value="stage-desc">Stage ↓</option>
              <option value="stage-asc">Stage ↑</option>
              <option value="nama-asc">Nama A–Z</option>
              <option value="nama-desc">Nama Z–A</option>
            </select>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="simari-table">
            <thead>
              <tr>
                <th>Nama Faskes</th>
                <th>Jenis / Kelas</th>
                <th>Kecamatan</th>
                <th>Kabupaten</th>
                <th>Provinsi</th>
                <th>Stage</th>
                <th>Status</th>
                <th>Assessment Terakhir</th>
              </tr>
            </thead>
            <tbody>
              {sortedFaskes.map(f => {
                const sc = STATUS_CONFIG[f.statusAssessment] ?? STATUS_CONFIG['Belum'];
                return (
                  <tr key={f.id}>
                    <td style={{ fontWeight: 600, fontSize: '13px' }}>{f.nama}</td>
                    <td>
                      <span style={{ fontSize: '12px' }}>{f.jenis}</span>
                      {f.kelas !== '-' && (
                        <span style={{ marginLeft: '4px', fontSize: '10px', background: 'var(--surface2)', padding: '1px 5px', borderRadius: '4px', color: 'var(--text3)' }}>
                          Kelas {f.kelas}
                        </span>
                      )}
                    </td>
                    <td style={{ fontSize: '12px' }}>{f.kecamatan}</td>
                    <td style={{ fontSize: '12px' }}>{f.kabupaten}</td>
                    <td style={{ fontSize: '12px' }}>{f.provinsi}</td>
                    <td>
                      <span className={`stage-badge stage-s${f.stageEMRAM}`}>Stage {f.stageEMRAM}</span>
                    </td>
                    <td>
                      <span className={`status-badge ${sc.cls}`} style={{ fontSize: '10px' }}>{sc.label}</span>
                    </td>
                    <td style={{ fontSize: '11px', color: 'var(--text3)' }}>
                      {f.tanggalAssessment
                        ? new Date(f.tanggalAssessment).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                        : '—'}
                    </td>
                  </tr>
                );
              })}
              {sortedFaskes.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text3)' }}>
                    Tidak ada faskes untuk wilayah ini
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
