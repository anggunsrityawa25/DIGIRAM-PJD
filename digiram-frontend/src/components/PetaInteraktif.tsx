import { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { STAGE_COLORS, stageAvgColor, stageAvgTextColor } from '../data/visualisasiData';

const GEO_URL =
  'https://raw.githubusercontent.com/superpikar/indonesia-geojson/master/indonesia-province-simple.json';

export interface ProvinsiStats {
  count: number;
  sumStage: number;
  stages: number[];
}

interface PetaInteraktifProps {
  provinsiStats: Record<string, ProvinsiStats>;
  selectedProvinsi: string | null;
  onProvinsiClick: (nama: string) => void;
}

interface TooltipData {
  name: string;
  stats: ProvinsiStats;
  x: number;
  y: number;
}

function norm(name: string) {
  return name.toUpperCase().trim();
}

function buildLookup(stats: Record<string, ProvinsiStats>) {
  const map: Record<string, { stats: ProvinsiStats; origName: string }> = {};
  Object.entries(stats).forEach(([name, s]) => {
    map[norm(name)] = { stats: s, origName: name };
  });
  return map;
}

function getGeoName(feature: any): string {
  return (
    feature.properties?.Propinsi ||
    feature.properties?.NAME_1 ||
    feature.properties?.PROVINSI ||
    feature.properties?.name ||
    ''
  );
}

function computeStyle(
  feature: any,
  lookup: Record<string, { stats: ProvinsiStats; origName: string }>,
  selected: string | null
): L.PathOptions {
  const rawName = getGeoName(feature);
  const entry = lookup[norm(rawName)];
  const isSelected = selected ? norm(selected) === norm(rawName) : false;
  if (!entry) return { fillColor: '#E8E8E8', fillOpacity: 0.6, color: 'white', weight: 1 };
  const avg = entry.stats.sumStage / entry.stats.count;
  return {
    fillColor: stageAvgColor(avg),
    fillOpacity: isSelected ? 1 : 0.78,
    color: isSelected ? '#0D5C35' : 'white',
    weight: isSelected ? 2.5 : 1,
  };
}

export function PetaInteraktif({ provinsiStats, selectedProvinsi, onProvinsiClick }: PetaInteraktifProps) {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const outerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const geoLayerRef = useRef<L.GeoJSON | null>(null);

  // Keep mutable refs in sync so Leaflet callbacks always see latest values
  const selectedRef = useRef(selectedProvinsi);
  const onClickRef = useRef(onProvinsiClick);
  const lookup = useMemo(() => buildLookup(provinsiStats), [provinsiStats]);
  const lookupRef = useRef(lookup);

  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Sync refs
  useEffect(() => { onClickRef.current = onProvinsiClick; }, [onProvinsiClick]);
  useEffect(() => { lookupRef.current = lookup; }, [lookup]);

  // Re-style map when selection changes
  useEffect(() => {
    selectedRef.current = selectedProvinsi;
    if (geoLayerRef.current) {
      geoLayerRef.current.setStyle((feature) =>
        computeStyle(feature, lookupRef.current, selectedProvinsi)
      );
    }
  }, [selectedProvinsi]);

  // Initialize Leaflet once
  useEffect(() => {
    if (!mapDivRef.current || mapRef.current) return;

    const map = L.map(mapDivRef.current, {
      center: [-2.5, 118],
      zoom: 4,
      minZoom: 3,
      maxZoom: 10,
      zoomControl: false,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OSM &copy; CARTO',
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);
    mapRef.current = map;

    fetch(GEO_URL)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(data => {
        const geo = L.geoJSON(data, {
          style: (feature) => computeStyle(feature, lookupRef.current, selectedRef.current),
          onEachFeature: (feature, layer) => {
            const path = layer as L.Path;
            path.on({
              mouseover: (e: L.LeafletMouseEvent) => {
                const entry = lookupRef.current[norm(getGeoName(feature))];
                path.setStyle({ fillOpacity: 1, weight: 2, color: '#444' });
                if (entry && mapRef.current) {
                  const pt = mapRef.current.latLngToContainerPoint(e.latlng);
                  setTooltip({ name: entry.origName, stats: entry.stats, x: pt.x, y: pt.y });
                }
              },
              mouseout: () => {
                if (geoLayerRef.current) geoLayerRef.current.resetStyle(path);
                setTooltip(null);
              },
              click: () => {
                const entry = lookupRef.current[norm(getGeoName(feature))];
                if (entry) onClickRef.current(entry.origName);
              },
            });
          },
        }).addTo(map);
        geoLayerRef.current = geo;
        setLoading(false);
      })
      .catch(() => { setLoading(false); setError(true); });

    return () => {
      map.remove();
      mapRef.current = null;
      geoLayerRef.current = null;
    };
  }, []);

  if (error) {
    return (
      <div style={{ height: 440, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface2)', borderRadius: 10, color: 'var(--text3)', fontSize: 13 }}>
        Gagal memuat peta. Periksa koneksi internet.
      </div>
    );
  }

  return (
    <div ref={outerRef} style={{ position: 'relative' }}>
      {loading && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--surface2)', borderRadius: 10, gap: 10 }}>
          <div style={{ width: 32, height: 32, border: '3px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'pi-spin 0.8s linear infinite' }} />
          <div style={{ color: 'var(--text3)', fontSize: 13 }}>Memuat peta Indonesia…</div>
          <style>{`@keyframes pi-spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      <div ref={mapDivRef} style={{ height: 440, borderRadius: 10 }} />

      {tooltip && (
        <div style={{
          position: 'absolute',
          left: Math.min(tooltip.x + 14, (outerRef.current?.clientWidth ?? 500) - 220),
          top: Math.max(tooltip.y - 155, 8),
          zIndex: 1000,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          padding: '12px 16px',
          minWidth: 200,
          boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
          pointerEvents: 'none',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>{tooltip.name}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text3)' }}>Total Faskes</span>
              <span style={{ fontWeight: 700 }}>{tooltip.stats.count}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text3)' }}>Avg Stage</span>
              <span style={{
                padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700,
                background: stageAvgColor(tooltip.stats.sumStage / tooltip.stats.count),
                color: stageAvgTextColor(tooltip.stats.sumStage / tooltip.stats.count),
              }}>
                {(tooltip.stats.sumStage / tooltip.stats.count).toFixed(1)}
              </span>
            </div>
            <div style={{ marginTop: 6 }}>
              <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 4 }}>Sebaran Stage</div>
              <div style={{ display: 'flex', gap: 2, height: 28, alignItems: 'flex-end' }}>
                {[0,1,2,3,4,5,6,7].map(s => {
                  const cnt = tooltip.stats.stages.filter(x => x === s).length;
                  const h = cnt > 0 ? Math.max(5, (cnt / tooltip.stats.count) * 26) : 3;
                  return <div key={s} style={{ flex: 1, height: h, background: cnt > 0 ? STAGE_COLORS[s] : 'var(--surface2)', borderRadius: '2px 2px 0 0' }} />;
                })}
              </div>
              <div style={{ display: 'flex', gap: 2 }}>
                {[0,1,2,3,4,5,6,7].map(s => (
                  <div key={s} style={{ flex: 1, textAlign: 'center', fontSize: 8, color: 'var(--text3)' }}>{s}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div style={{
        position: 'absolute', bottom: 36, left: 10, zIndex: 500,
        background: 'rgba(255,255,255,0.92)', borderRadius: 8,
        padding: '7px 10px', boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
        display: 'flex', flexDirection: 'column', gap: 3,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>
          Avg Stage EMRAM
        </div>
        {[0,1,2,3,4,5,6,7].map(s => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 14, height: 10, borderRadius: 2, background: STAGE_COLORS[s], border: '1px solid rgba(0,0,0,0.08)', flexShrink: 0 }} />
            <span style={{ fontSize: 10, color: '#555' }}>Stage {s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
