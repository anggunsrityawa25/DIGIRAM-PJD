import { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { FaskesRME } from '../data/visualisasiData';
import { STAGE_COLORS } from '../data/visualisasiData';

interface PetaProvinsiProps {
  faskes: FaskesRME[];
  provinsiLabel?: string;
}

interface TooltipData {
  faskes: FaskesRME;
  x: number;
  y: number;
}

export function PetaProvinsi({ faskes, provinsiLabel = 'DI Yogyakarta' }: PetaProvinsiProps) {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const outerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.CircleMarker[]>([]);

  const [filterKabupaten, setFilterKabupaten] = useState<string>('');
  const [filterStage, setFilterStage] = useState<number | null>(null);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [selected, setSelected] = useState<FaskesRME | null>(null);

  const faskesWithCoords = useMemo(
    () => faskes.filter(f => f.lat !== undefined && f.lng !== undefined),
    [faskes]
  );

  const kabupatenList = useMemo(() => {
    const s = new Set(faskesWithCoords.map(f => f.kabupaten));
    return Array.from(s).sort();
  }, [faskesWithCoords]);

  const filtered = useMemo(() => {
    let data = faskesWithCoords;
    if (filterKabupaten) data = data.filter(f => f.kabupaten === filterKabupaten);
    if (filterStage !== null) data = data.filter(f => f.stageEMRAM === filterStage);
    return data;
  }, [faskesWithCoords, filterKabupaten, filterStage]);

  // Keep refs in sync
  const filteredRef = useRef(filtered);
  const tooltipSetRef = useRef(setTooltip);
  const selectedSetRef = useRef(setSelected);
  useEffect(() => { filteredRef.current = filtered; }, [filtered]);

  // Init map once
  useEffect(() => {
    if (!mapDivRef.current || mapRef.current) return;

    const map = L.map(mapDivRef.current, {
      center: [-7.85, 110.36],
      zoom: 10,
      minZoom: 8,
      maxZoom: 15,
      zoomControl: false,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OSM &copy; CARTO',
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Redraw markers when filtered changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    filtered.forEach(f => {
      const marker = L.circleMarker([f.lat!, f.lng!], {
        radius: 8,
        fillColor: STAGE_COLORS[f.stageEMRAM],
        color: 'white',
        weight: 1.5,
        fillOpacity: 0.9,
      }).addTo(map);

      marker.on('mouseover', (e: L.LeafletMouseEvent) => {
        marker.setStyle({ radius: 11, weight: 2.5, color: '#333' });
        if (mapRef.current) {
          const pt = mapRef.current.latLngToContainerPoint(e.latlng);
          setTooltip({ faskes: f, x: pt.x, y: pt.y });
        }
      });

      marker.on('mouseout', () => {
        marker.setStyle({ radius: 8, weight: 1.5, color: 'white' });
        setTooltip(null);
      });

      marker.on('click', () => {
        setSelected(prev => prev?.id === f.id ? null : f);
      });

      markersRef.current.push(marker);
    });
  }, [filtered]);

  const statusColor: Record<string, string> = {
    'Tervalidasi': '#15804D',
    'Dalam Review': '#F59E0B',
    'Draft': '#6B7280',
    'Belum': '#EF4444',
  };

  const selectStyle: React.CSSProperties = {
    fontSize: '12px',
    padding: '5px 8px',
    borderRadius: '6px',
    border: '1px solid var(--border2)',
    background: 'var(--surface)',
    color: 'var(--text)',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    cursor: 'pointer',
    minWidth: '130px',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Filter bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '12px', color: 'var(--text3)', fontWeight: 500 }}>Filter:</span>
        <select
          value={filterKabupaten}
          onChange={e => setFilterKabupaten(e.target.value)}
          style={selectStyle}
        >
          <option value="">Semua Kab/Kota</option>
          {kabupatenList.map(k => (
            <option key={k} value={k}>{k}</option>
          ))}
        </select>

        <select
          value={filterStage ?? ''}
          onChange={e => setFilterStage(e.target.value === '' ? null : Number(e.target.value))}
          style={selectStyle}
        >
          <option value="">Semua Stage</option>
          {[0, 1, 2, 3, 4, 5, 6, 7].map(s => (
            <option key={s} value={s}>Stage {s}</option>
          ))}
        </select>

        <span style={{ fontSize: '12px', color: 'var(--text3)', marginLeft: 'auto' }}>
          {filtered.length} faskes ditampilkan
        </span>
      </div>

      {/* Map + detail panel */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        <div ref={outerRef} style={{ position: 'relative', flex: 1 }}>
          <div ref={mapDivRef} style={{ height: 380, borderRadius: 10, zIndex: 0 }} />

          {/* Tooltip */}
          {tooltip && (
            <div style={{
              position: 'absolute',
              left: Math.min(tooltip.x + 14, (outerRef.current?.clientWidth ?? 400) - 220),
              top: Math.max(tooltip.y - 100, 8),
              zIndex: 1000,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: '10px 14px',
              minWidth: 190,
              boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
              pointerEvents: 'none',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
                {tooltip.faskes.nama}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 11 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text3)' }}>Kabupaten</span>
                  <span style={{ fontWeight: 600 }}>{tooltip.faskes.kabupaten}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text3)' }}>Stage EMRAM</span>
                  <span style={{
                    padding: '1px 7px', borderRadius: 4, fontSize: 10, fontWeight: 700,
                    background: STAGE_COLORS[tooltip.faskes.stageEMRAM],
                    color: tooltip.faskes.stageEMRAM >= 5 ? '#fff' : '#1A1A1A',
                  }}>
                    Stage {tooltip.faskes.stageEMRAM}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text3)' }}>Jenis</span>
                  <span style={{ fontWeight: 600 }}>{tooltip.faskes.jenis}</span>
                </div>
              </div>
            </div>
          )}

          {/* Stage legend */}
          <div style={{
            position: 'absolute', bottom: 36, left: 10, zIndex: 500,
            background: 'rgba(255,255,255,0.92)', borderRadius: 8,
            padding: '7px 10px', boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            display: 'flex', flexDirection: 'column', gap: 3,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>
              Stage EMRAM
            </div>
            {[0, 1, 2, 3, 4, 5, 6, 7].map(s => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: STAGE_COLORS[s], border: '1px solid rgba(0,0,0,0.1)', flexShrink: 0 }} />
                <span style={{ fontSize: 9, color: '#555' }}>Stage {s}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Detail panel when a marker is selected */}
        {selected && (
          <div style={{
            width: 220, flexShrink: 0,
            background: 'var(--surface2)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            padding: '16px',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', lineHeight: 1.4, flex: 1, paddingRight: 8 }}>
                {selected.nama}
              </div>
              <button
                onClick={() => setSelected(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', fontSize: 14, padding: 0, lineHeight: 1 }}
              >
                ✕
              </button>
            </div>

            <div
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '3px 10px', borderRadius: 20,
                background: STAGE_COLORS[selected.stageEMRAM],
                color: selected.stageEMRAM >= 5 ? '#fff' : '#1A1A1A',
                fontSize: 11, fontWeight: 700, marginBottom: 12,
              }}
            >
              Stage {selected.stageEMRAM}
            </div>

            {[
              ['Jenis', selected.jenis],
              ['Kelas', `Kelas ${selected.kelas}`],
              ['Kabupaten', selected.kabupaten],
              ['Kecamatan', selected.kecamatan],
              ['Tempat Tidur', `${selected.tempatTidur} TT`],
            ].map(([label, val]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 8, fontSize: 11 }}>
                <span style={{ color: 'var(--text3)' }}>{label}</span>
                <span style={{ fontWeight: 600, color: 'var(--text)', textAlign: 'right' }}>{val}</span>
              </div>
            ))}

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 8, marginTop: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 11 }}>
                <span style={{ color: 'var(--text3)' }}>Status</span>
                <span style={{
                  fontWeight: 700,
                  color: statusColor[selected.statusAssessment] ?? 'var(--text)',
                }}>
                  {selected.statusAssessment}
                </span>
              </div>
              {selected.tanggalAssessment && (
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginTop: 6, fontSize: 11 }}>
                  <span style={{ color: 'var(--text3)' }}>Tgl Assessment</span>
                  <span style={{ fontWeight: 600, color: 'var(--text)' }}>
                    {new Date(selected.tanggalAssessment).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
