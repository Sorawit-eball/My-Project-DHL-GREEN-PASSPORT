import { useState, useEffect, useMemo } from 'react';
import { X, Globe } from 'lucide-react';

const F = "'Inter','Kanit',sans-serif";
const GREEN  = '#059669';
const GREEN_DARK = '#065f46';

// Countries defined in the DHL app (ISO 2-letter → display info)
export const APP_COUNTRIES: Record<string, { name: string }> = {
  JP: { name:'ญี่ปุ่น' },
  CN: { name:'จีน' },
  US: { name:'สหรัฐฯ' },
  GB: { name:'อังกฤษ' },
  DE: { name:'เยอรมนี' },
  AU: { name:'ออสเตรเลีย' },
  SG: { name:'สิงคโปร์' },
  HK: { name:'ฮ่องกง' },
  KR: { name:'เกาหลีใต้' },
  FR: { name:'ฝรั่งเศส' },
  IN: { name:'อินเดีย' },
  AE: { name:'UAE' },
  MY: { name:'มาเลเซีย' },
  VN: { name:'เวียดนาม' },
  ID: { name:'อินโดนีเซีย' },
  NL: { name:'เนเธอร์แลนด์' },
  CA: { name:'แคนาดา' },
  IT: { name:'อิตาลี' },
  BR: { name:'บราซิล' },
  CH: { name:'สวิตเซอร์แลนด์' },
};

// Helper: renders a circular flag image from flagcdn.com
export function FlagImg({ code, size = 24 }: { code: string; size?: number }) {
  const h = Math.round(size * 0.667);
  return (
    <img
      src={`https://flagcdn.com/w40/${code.toLowerCase()}.png`}
      alt={code}
      width={size}
      height={h}
      style={{ borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #e5e7eb', flexShrink: 0, display: 'inline-block', verticalAlign: 'middle' }}
    />
  );
}

// Primary flag colors per country (for Wrapped slide)
export const COUNTRY_COLORS: Record<string, string> = {
  JP: '#BC002D', CN: '#DE2910', US: '#3C3B6E', GB: '#CF142B',
  DE: '#FFCC00', AU: '#002868', SG: '#EF3340', HK: '#AE1328',
  KR: '#003478', FR: '#002395', IN: '#FF9933', AE: '#007A3D',
  MY: '#CC0001', VN: '#DA251D', ID: '#CE1126', NL: '#AE1C28',
  CA: '#FF0000', IT: '#009246', BR: '#009C3B', CH: '#FF0000',
};

const GEO_URL = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson';

const W = 560, H = 280;
const toX = (lon: number) => ((lon + 180) / 360 * W);
const toY = (lat: number) => ((90 - lat) / 180 * H);

function ringToD(ring: number[][]): string {
  return ring.map(([lon, lat], i) =>
    `${i === 0 ? 'M' : 'L'}${toX(lon).toFixed(1)},${toY(lat).toFixed(1)}`
  ).join(' ') + 'Z';
}

function geometryToD(geom: { type: string; coordinates: unknown }): string {
  if (geom.type === 'Polygon') {
    return (geom.coordinates as number[][][]).map(ringToD).join(' ');
  }
  if (geom.type === 'MultiPolygon') {
    return (geom.coordinates as number[][][][]).flatMap(p => p.map(ringToD)).join(' ');
  }
  return '';
}

interface Feature { properties: { ISO_A2: string }; geometry: { type: string; coordinates: unknown } }

export function saveVisitedCountry(code: string) {
  if (!code) return;
  try {
    const raw = localStorage.getItem('visited_countries');
    const existing: string[] = raw ? JSON.parse(raw) : [];
    const updated = [...new Set([...existing, code])];
    localStorage.setItem('visited_countries', JSON.stringify(updated));
  } catch {}
}

export function getVisitedCountries(): Set<string> {
  try {
    const raw = localStorage.getItem('visited_countries');
    return new Set(raw ? JSON.parse(raw) : []);
  } catch { return new Set(); }
}

export default function WorldMapPopup({ onClose }: { onClose: () => void }) {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading]   = useState(true);
  const [errored, setErrored]   = useState(false);
  const [visited, setVisited]   = useState<Set<string>>(new Set());

  useEffect(() => {
    setVisited(getVisitedCountries());

    const sessionData = sessionStorage.getItem('world_geo');
    if (sessionData) {
      try {
        setFeatures(JSON.parse(sessionData));
        setLoading(false);
        return;
      } catch {}
    }

    fetch(GEO_URL)
      .then(r => r.json())
      .then(data => {
        const feats: Feature[] = data.features || [];
        setFeatures(feats);
        try { sessionStorage.setItem('world_geo', JSON.stringify(feats)); } catch {}
        setLoading(false);
      })
      .catch(() => { setErrored(true); setLoading(false); });
  }, []);

  const visitedList   = useMemo(() => Object.entries(APP_COUNTRIES).filter(([c]) => visited.has(c)), [visited]);
  const featureByCode = useMemo(() => {
    const m: Record<string, Feature> = {};
    features.forEach(f => { m[f.properties.ISO_A2] = f; });
    return m;
  }, [features]);
  const pct = Math.round((visitedList.length / Object.keys(APP_COUNTRIES).length) * 100);

  /* Trigger colour-reveal transition once map is ready */
  const [animReady, setAnimReady] = useState(false);
  useEffect(() => {
    if (!loading) {
      const t = setTimeout(() => setAnimReady(true), 200);
      return () => clearTimeout(t);
    }
  }, [loading]);

  return (
    <div style={{ position:'fixed', inset:0, zIndex:4500, background:'rgba(0,0,0,0.45)', backdropFilter:'blur(6px)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:F, padding:'10px' }}>
      <style>{`
        @keyframes map-in    { from{transform:scale(0.94) translateY(12px);opacity:0} to{transform:scale(1) translateY(0);opacity:1} }
        @keyframes countryPop { from{opacity:0} to{opacity:1} }
        .map-popup { animation: map-in 0.4s cubic-bezier(0.22,1,0.36,1) both; }
      `}</style>

      <div className="map-popup" style={{ width:'100%', maxWidth:480, background:'#ffffff', borderRadius:24, overflow:'hidden', boxShadow:'0 24px 80px rgba(0,0,0,0.22)', maxHeight:'94vh', display:'flex', flexDirection:'column' }}>

        {/* ── Header ─────────────────────────── */}
        <div style={{ background:`linear-gradient(135deg,${GREEN},${GREEN_DARK})`, padding:'16px 18px', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:9 }}>
            <div style={{ width:34, height:34, borderRadius:17, background:'rgba(255,255,255,0.18)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Globe size={17} color="#fff"/>
            </div>
            <div>
              <div style={{ fontWeight:900, fontSize:'0.95rem', color:'#fff' }}>Green Passport Map</div>
              <div style={{ fontSize:'0.65rem', color:'rgba(255,255,255,0.75)' }}>
                {visitedList.length > 0
                  ? `ส่งแล้ว ${visitedList.length} / ${Object.keys(APP_COUNTRIES).length} ประเทศ`
                  : 'เริ่มส่งต่างประเทศแบบ GoGreen!'}
              </div>
            </div>
          </div>
          <button type="button" onClick={onClose}
            style={{ width:30, height:30, borderRadius:15, background:'rgba(255,255,255,0.2)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <X size={14} color="#fff"/>
          </button>
        </div>

        {/* ── SVG MAP — dominant, full width ─── */}
        <div style={{ flexShrink:0, background:'#e0f2fe', position:'relative' }}>
          {loading ? (
            <div style={{ height:200, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:10 }}>
              <Globe size={28} color={GREEN} style={{ animation:'spin-slow 2s linear infinite' }}/>
              <div style={{ fontSize:'0.75rem', color:'#6b7280' }}>กำลังโหลดแผนที่...</div>
            </div>
          ) : errored ? (
            <div style={{ height:140, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <div style={{ fontSize:'0.75rem', color:'#9ca3af', textAlign:'center' }}>
                โหลดแผนที่ไม่ได้<br/>ตรวจสอบอินเทอร์เน็ต
              </div>
            </div>
          ) : (
            <svg viewBox={`0 0 ${W} ${H}`} style={{ width:'100%', height:'auto', display:'block' }}>
              {/* Ocean */}
              <rect width={W} height={H} fill="#bfdbfe"/>
              {/* Base layer: all countries gray */}
              {features.map((f, i) => {
                const code = f.properties.ISO_A2;
                const isInApp = code in APP_COUNTRIES;
                return (
                  <path key={`b${i}`}
                    d={geometryToD(f.geometry)}
                    fill={isInApp ? '#c8d5de' : '#dde5eb'}
                    stroke="#e0f2fe" strokeWidth={0.4}
                  />
                );
              })}
              {/* Green pop-in layer: visited countries staggered */}
              {visitedList.map(([code], idx) => {
                const feat = featureByCode[code];
                if (!feat) return null;
                return (
                  <path key={`v${code}`}
                    d={geometryToD(feat.geometry)}
                    fill="#16a34a"
                    stroke="#e0f2fe" strokeWidth={0.4}
                    style={{
                      opacity: animReady ? 1 : 0,
                      transition: `opacity 0.55s ease ${0.2 + idx * 0.4}s`
                    }}
                  />
                );
              })}
              {/* Thailand home dot */}
              <circle cx={toX(100.5)} cy={toY(15)} r={4} fill="#d40511" stroke="#fff" strokeWidth={1.2} style={{ filter:'drop-shadow(0 0 3px rgba(212,5,17,0.6))' }}/>
            </svg>
          )}
          {/* Legend */}
          {!loading && !errored && (
            <div style={{ position:'absolute', bottom:7, right:10, display:'flex', gap:10 }}>
              <div style={{ display:'flex', alignItems:'center', gap:4, background:'rgba(255,255,255,0.85)', borderRadius:8, padding:'3px 7px', fontSize:'0.55rem', color:'#374151', fontWeight:600 }}>
                <div style={{ width:7, height:7, borderRadius:1, background:'#16a34a' }}/> ส่งแล้ว
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:4, background:'rgba(255,255,255,0.85)', borderRadius:8, padding:'3px 7px', fontSize:'0.55rem', color:'#374151', fontWeight:600 }}>
                <div style={{ width:7, height:7, borderRadius:'50%', background:'#d40511' }}/> ไทย
              </div>
            </div>
          )}
        </div>


          {/* Progress only — no chips */}
          <div style={{ padding:'10px 14px 6px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.62rem', color:'#9ca3af', marginBottom:5 }}>
              <span>ความคืบหน้า</span><span>{pct}%</span>
            </div>
            <div style={{ background:'#f3f4f6', borderRadius:6, height:5, overflow:'hidden' }}>
              <div style={{ height:'100%', background:`linear-gradient(90deg,${GREEN},#FFCC00)`, width:`${pct}%`, transition:'width 1s ease', borderRadius:6 }}/>
            </div>
          </div>

        {/* ── Close button ───────────────────── */}
        <div style={{ padding:'10px 14px 14px', flexShrink:0, borderTop:'1px solid #f3f4f6' }}>
          <button type="button" onClick={onClose}
            style={{ width:'100%', padding:'13px', borderRadius:14, border:'none', background:`linear-gradient(135deg,${GREEN},${GREEN_DARK})`, color:'#fff', fontSize:'0.95rem', fontWeight:800, cursor:'pointer', boxShadow:'0 4px 20px rgba(5,150,105,0.25)' }}>
            เรียบร้อย
          </button>
        </div>
      </div>
    </div>
  );
}
