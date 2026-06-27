import { useState, useEffect, useMemo } from 'react';
import {
  Globe, Award, Package, Leaf, TreePine,
  Sparkles, Send, Truck,
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { APP_COUNTRIES, getVisitedCountries } from './WorldMapPopup';


const F = "'Nunito','Inter',sans-serif";
const YEAR = new Date().getFullYear();
const SBG    = 'linear-gradient(180deg, #0c0c0a 0%, #15140f 60%, #1c1810 100%)';
const YELLOW = '#FFCC00';
const G80    = '#4ade80';

export interface WrappedData {
  totalShipments: number;
  greenShipments: number;
  greenPct: number;
  totalCo2: number;
  totalTrees: number;
  intlCount: number;
  domesticCount: number;
  topDest: string;
  topDestFlag: string;
  topDestCount: number;
  badgeCount: number;
  totalBadges: number;
  userName: string;
}

/* ───────────────── GLOBAL CSS ───────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&display=swap');

  @keyframes flyIn   { from{transform:translateY(22px);opacity:0} to{transform:translateY(0);opacity:1} }
  @keyframes pop     { 0%{transform:scale(0.6);opacity:0} 70%{transform:scale(1.07)} 100%{transform:scale(1);opacity:1} }
  @keyframes bar-fill{ from{transform:scaleX(0);transform-origin:left} to{transform:scaleX(1);transform-origin:left} }
  @keyframes wobble  { 0%,100%{transform:rotate(-4deg)} 50%{transform:rotate(4deg)} }

  @keyframes truck-drive     { from{transform:translateX(-180px)} to{transform:translateX(130vw)} }
  @keyframes truck-drive-rev  { from{transform:translateX(130vw)}  to{transform:translateX(-180px)} }
  @keyframes road-scroll { from{transform:translateX(0)} to{transform:translateX(-52px)} }
  @keyframes pkg-float   { 0%,100%{transform:translateY(0) rotate(-5deg)} 50%{transform:translateY(-18px) rotate(5deg)} }
  @keyframes speed-line  { 0%{opacity:0;transform:scaleX(0) translateX(-10px)} 30%{opacity:1} 100%{opacity:0;transform:scaleX(1) translateX(10px)} }

  .fly-in   { animation: flyIn  0.5s cubic-bezier(0.22,1,0.36,1) both; }
  .scale-in { animation: pop    0.55s cubic-bezier(0.34,1.4,0.64,1) both; }
  .d0{animation-delay:0s}   .d1{animation-delay:0.1s}  .d2{animation-delay:0.22s}
  .d3{animation-delay:0.36s} .d4{animation-delay:0.5s} .d5{animation-delay:0.65s}
  .badge-btn { transition: transform 0.15s; cursor:pointer; }
  .badge-btn:hover { transform: scale(1.08); }
`;

/* ───── LOGISTICS BACKGROUND ───── */
function LogisticsBg() {
  return (
    <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none' }}>
      {/* Subtle grid */}
      <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize:'32px 32px' }}/>

      {/* Road lane lines */}
      <div style={{ position:'absolute', left:0, right:-52, top:'60%', height:2,
        background:'repeating-linear-gradient(90deg, rgba(255,204,0,0.28) 0, rgba(255,204,0,0.28) 24px, transparent 24px, transparent 52px)',
        animation:'road-scroll 1.0s linear infinite', willChange:'transform' }}/>
      <div style={{ position:'absolute', left:0, right:-52, top:'68%', height:1,
        background:'repeating-linear-gradient(90deg, rgba(255,204,0,0.12) 0, rgba(255,204,0,0.12) 18px, transparent 18px, transparent 52px)',
        animation:'road-scroll 1.6s linear infinite', willChange:'transform' }}/>
      <div style={{ position:'absolute', left:0, right:-52, top:'76%', height:1,
        background:'repeating-linear-gradient(90deg, rgba(255,255,255,0.05) 0, rgba(255,255,255,0.05) 14px, transparent 14px, transparent 52px)',
        animation:'road-scroll 2.2s linear infinite', willChange:'transform' }}/>

      {/* Forward trucks — 3 staggered with negative delays = seamless continuous flow */}
      {([0, -4, -8] as number[]).map((del, i) => (
        <div key={`tf${i}`} style={{ position:'absolute', top:`${52 + i * 5}%`, color:YELLOW,
          animation:`truck-drive 12s linear ${del}s infinite`, opacity:0.22 - i * 0.05 }}>
          <Truck size={52 - i * 8}/>
        </div>
      ))}

      {/* Reverse trucks — 2 staggered */}
      {([0, -6] as number[]).map((del, i) => (
        <div key={`tr${i}`} style={{ position:'absolute', top:`${57 + i * 10}%`,
          animation:`truck-drive-rev 12s linear ${del}s infinite`, opacity:0.17 - i * 0.06 }}>
          <div style={{ transform:'scaleX(-1)', color:YELLOW }}><Truck size={46 - i * 14}/></div>
        </div>
      ))}

      {/* Floating packages */}
      <div style={{ position:'absolute', top:'14%', right:'8%', color:YELLOW, opacity:0.14, animation:'pkg-float 4.5s ease-in-out 0s infinite' }}>
        <Package size={30}/>
      </div>
      <div style={{ position:'absolute', top:'28%', left:'6%', color:'rgba(255,255,255,0.4)', opacity:0.08, animation:'pkg-float 3.8s ease-in-out 2s infinite' }}>
        <Package size={22}/>
      </div>
      <div style={{ position:'absolute', top:'42%', right:'12%', color:YELLOW, opacity:0.06, animation:'pkg-float 5.2s ease-in-out 1s infinite' }}>
        <Package size={16}/>
      </div>
    </div>
  );
}


/* ─────────────── COUNT-UP HOOK ─────────────── */
function useCountUp(target: number, active: boolean, duration = 1500) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) { setVal(0); return; }
    let cur = 0;
    const step = Math.max(target / (duration / 16), 0.01);
    const t = setInterval(() => {
      cur = Math.min(cur + step, target);
      setVal(Math.round(cur * 100) / 100);
      if (cur >= target) clearInterval(t);
    }, 16);
    return () => clearInterval(t);
  }, [target, active, duration]);
  return val;
}

/* ─────────────── SLIDE BASE STYLE ─────────────── */
const sb: React.CSSProperties = {
  position:'absolute', inset:0,
  display:'flex', alignItems:'center', justifyContent:'center',
  fontFamily:F, overflow:'hidden',
};

/* ───────────────── CLEAN CARD ───────────────── */
function GlassCard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background:'rgba(255,255,255,0.16)',
      border:'2px solid rgba(255,255,255,0.25)',
      borderRadius:22,
      boxShadow:'0 4px 20px rgba(0,0,0,0.12), 0 1px 0 rgba(255,255,255,0.25) inset',
      ...style,
    }}>
      {children}
    </div>
  );
}

/* ─────────────── NUMBER DISPLAY ─────────────── */
function BigNum({ val, unit, color = '#fff' }: { val: string | number; unit: string; color?: string }) {
  return (
    <div style={{ textAlign:'center' }}>
      <div style={{ fontSize:'6rem', fontWeight:900, color, lineHeight:1, letterSpacing:'-2px', textShadow:'0 5px 0 rgba(0,0,0,0.18)' }}>
        {val}
      </div>
      <div style={{ display:'inline-block', background:'rgba(255,255,255,0.18)', borderRadius:30, padding:'3px 16px', fontSize:'1.05rem', fontWeight:800, color:'rgba(255,255,255,0.9)', marginTop:10 }}>{unit}</div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   SLIDE 1 — INTRO
══════════════════════════════════════════════ */
function SlideIntro({ data, active }: { data: WrappedData; active: boolean }) {
  return (
    <div style={{ ...sb, background:SBG }}>
      <LogisticsBg/>

      <div style={{ textAlign:'center', padding:'0 40px', position:'relative', zIndex:2 }}>
        <div className={active ? 'fly-in d0' : ''} style={{ fontSize:'0.62rem', fontWeight:800, letterSpacing:'5px', color:'rgba(255,255,255,0.4)', marginBottom:24 }}>
          DHL GREEN PASSPORT
        </div>
        <div className={active ? 'scale-in d1' : ''} style={{ fontSize:'7.5rem', fontWeight:900, lineHeight:1, letterSpacing:'-4px', color:YELLOW, textShadow:'0 5px 0 rgba(0,0,0,0.2)' }}>
          {YEAR}
        </div>
        <div className={active ? 'fly-in d2' : ''} style={{ fontSize:'2.4rem', fontWeight:900, color:'#fff', marginTop:8, letterSpacing:'-1px' }}>
          Wrapped
        </div>
        <div className={active ? 'fly-in d3' : ''} style={{ fontSize:'0.9rem', color:'rgba(255,255,255,0.55)', marginTop:16, lineHeight:1.6 }}>
          {data.userName}
        </div>
        <div className={active ? 'fly-in d4' : ''} style={{ marginTop:36 }}>
          <GlassCard style={{ padding:'8px 20px', fontSize:'0.78rem', color:'rgba(255,255,255,0.7)', display:'inline-flex', alignItems:'center', gap:6 }}>
            <Sparkles size={13} color="#fde68a"/> แตะเพื่อดูต่อ
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   SLIDE 2 — SHIPMENTS
══════════════════════════════════════════════ */
function SlideShipments({ data, active }: { data: WrappedData; active: boolean }) {
  const count = useCountUp(data.totalShipments, active);
  return (
    <div style={{ ...sb, background:SBG }}>
      <LogisticsBg/>
      <div style={{ textAlign:'center', padding:'0 40px', position:'relative', zIndex:2 }}>
        <div className={active ? 'fly-in d0' : ''} style={{ fontSize:'0.8rem', fontWeight:800, color:'rgba(255,255,255,0.55)', marginBottom:20, letterSpacing:'1px' }}>
          ในปี {YEAR} คุณส่งพัสดุ
        </div>
        <div className={active ? 'scale-in d1' : ''}>
          <BigNum val={count} unit="ครั้ง" color="#fff"/>
        </div>
        <div className={active ? 'fly-in d3' : ''} style={{ marginTop:32, display:'flex', justifyContent:'center', gap:12 }}>
          <GlassCard style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 18px' }}>
            <Package size={14} color="#fde68a"/>
            <div>
              <div style={{ fontSize:'1.1rem', fontWeight:900, color:'#fff' }}>{data.domesticCount}</div>
              <div style={{ fontSize:'0.6rem', color:'rgba(255,255,255,0.55)', fontWeight:700 }}>ในประเทศ</div>
            </div>
          </GlassCard>
          <GlassCard style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 18px' }}>
            <Globe size={14} color="#bae6fd"/>
            <div>
              <div style={{ fontSize:'1.1rem', fontWeight:900, color:'#fff' }}>{data.intlCount}</div>
              <div style={{ fontSize:'0.6rem', color:'rgba(255,255,255,0.55)', fontWeight:700 }}>ต่างประเทศ</div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   SLIDE 3 — GOGREEN
══════════════════════════════════════════════ */
function SlideGreen({ data, active }: { data: WrappedData; active: boolean }) {
  const count = useCountUp(data.greenShipments, active);
  const pct   = useCountUp(data.greenPct, active, 1800);
  return (
    <div style={{ ...sb, background:SBG }}>
      <LogisticsBg/>
      <div style={{ textAlign:'center', padding:'0 40px', position:'relative', zIndex:2 }}>
        <div className={active ? 'scale-in d0' : ''} style={{ marginBottom:16 }}>
          <Leaf size={40} color={G80}/>
        </div>
        <div className={active ? 'fly-in d1' : ''} style={{ fontSize:'0.8rem', fontWeight:800, color:'rgba(255,255,255,0.55)', marginBottom:18, letterSpacing:'1px' }}>
          คุณเลือก GoGreen
        </div>
        <div className={active ? 'scale-in d2' : ''}>
          <BigNum val={count} unit="ครั้ง" color={G80}/>
        </div>
        <div className={active ? 'fly-in d3' : ''} style={{ fontSize:'0.9rem', color:'rgba(255,255,255,0.6)', marginTop:20 }}>
          คิดเป็น <span style={{ color:G80, fontSize:'1.4rem', fontWeight:900 }}>{Math.round(pct)}%</span> ของการส่งทั้งหมด
        </div>
        <div className={active ? 'fly-in d4' : ''} style={{ marginTop:18 }}>
          <GlassCard style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'8px 18px' }}>
            <span style={{ fontSize:'0.8rem', color:'rgba(255,255,255,0.75)', fontWeight:800 }}>Top สายรักษ์โลก!</span>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   SLIDE 4 — CO2
══════════════════════════════════════════════ */
function SlideCO2({ data, active }: { data: WrappedData; active: boolean }) {
  const co2 = useCountUp(data.totalCo2, active, 1700);
  return (
    <div style={{ ...sb, background:SBG }}>
      <LogisticsBg/>
      <div style={{ textAlign:'center', padding:'0 40px', position:'relative', zIndex:2 }}>
        <div className={active ? 'scale-in d0' : ''} style={{ marginBottom:16 }}>
          <Globe size={40} color="#a7f3d0"/>
        </div>
        <div className={active ? 'fly-in d1' : ''} style={{ fontSize:'0.8rem', fontWeight:800, color:'rgba(255,255,255,0.55)', marginBottom:22, letterSpacing:'1px' }}>
          คุณช่วยลดการปล่อยคาร์บอน
        </div>
        <div className={active ? 'scale-in d2' : ''}>
          <BigNum val={co2.toFixed(2)} unit="kgCO₂e" color="#a7f3d0"/>
        </div>
        <div className={active ? 'fly-in d3' : ''} style={{ marginTop:28 }}>
          <GlassCard style={{ display:'inline-block', textAlign:'center', padding:'12px 24px' }}>
            <div style={{ fontSize:'0.82rem', color:'rgba(255,255,255,0.65)', lineHeight:1.85, fontWeight:700 }}>
              เทียบเท่าชาร์จโทรศัพท์<br/>
              <strong style={{ color:'#fef08a', fontSize:'1.1rem' }}>
                {Math.round(data.totalCo2 / 0.006).toLocaleString()}
              </strong> ครั้ง
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   SLIDE 5 — TREES
══════════════════════════════════════════════ */
function SlideTrees({ data, active }: { data: WrappedData; active: boolean }) {
  const trees = useCountUp(data.totalTrees, active, 1900);
  return (
    <div style={{ ...sb, background:SBG }}>
      <LogisticsBg/>
      <div style={{ textAlign:'center', padding:'0 40px', position:'relative', zIndex:2 }}>
        <div className={active ? 'scale-in d0' : ''} style={{ marginBottom:16 }}>
          <TreePine size={40} color="#d9f99d"/>
        </div>
        <div className={active ? 'fly-in d1' : ''} style={{ fontSize:'0.8rem', fontWeight:800, color:'rgba(255,255,255,0.55)', marginBottom:18, letterSpacing:'1px' }}>
          ต้นไม้เทียบเท่าที่คุณปลูก
        </div>
        <div className={active ? 'scale-in d2' : ''}>
          <BigNum val={trees.toFixed(2)} unit="ต้น" color="#d9f99d"/>
        </div>
        <div className={active ? 'fly-in d3' : ''} style={{ marginTop:24 }}>
          <GlassCard style={{ display:'inline-block', padding:'10px 22px' }}>
            <span style={{ fontSize:'0.82rem', color:'rgba(255,255,255,0.65)', fontWeight:700 }}>
              หากเรียงต่อกัน ยาวถึง{' '}
              <strong style={{ color:'#d9f99d' }}>{(data.totalTrees * 5).toFixed(0)} ม.</strong>
            </span>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   SLIDE 6 — TOP DESTINATION
══════════════════════════════════════════════ */
function SlideTopDest({ data, active }: { data: WrappedData; active: boolean }) {
  const cnt = useCountUp(data.topDestCount, active);
  return (
    <div style={{ ...sb, background:SBG }}>
      <LogisticsBg/>
      <div style={{ textAlign:'center', padding:'0 40px', position:'relative', zIndex:2 }}>
        <div className={active ? 'fly-in d0' : ''} style={{ fontSize:'0.8rem', fontWeight:800, color:'rgba(255,255,255,0.55)', marginBottom:22, letterSpacing:'1px' }}>
          ปลายทางที่คุณส่งบ่อยที่สุด
        </div>
        <div className={active ? 'scale-in d1' : ''} style={{ marginBottom:14 }}>
          {data.topDestFlag
            ? <span style={{ fontSize:'5.5rem', lineHeight:1, filter:'drop-shadow(0 4px 12px rgba(0,0,0,0.3))' }}>{data.topDestFlag}</span>
            : <Globe size={56} color={G80}/>
          }
        </div>
        <div className={active ? 'fly-in d2' : ''} style={{ fontSize:'2rem', fontWeight:900, color:'#fff', marginBottom:16, textShadow:'0 3px 0 rgba(0,0,0,0.15)' }}>
          {data.topDest}
        </div>
        <div className={active ? 'scale-in d3' : ''}>
          <BigNum val={cnt} unit="ครั้ง" color="#fef08a"/>
        </div>
      </div>
    </div>
  );
}

/* geometry helpers for SlideCountries map */
const W_MAP = 560, H_MAP = 280;
const toMapX = (lon: number) => ((lon + 180) / 360 * W_MAP);
const toMapY = (lat: number) => ((90 - lat) / 180 * H_MAP);
function mapRingToD(ring: number[][]): string {
  return ring.map(([lon, lat], i) =>
    `${i === 0 ? 'M' : 'L'}${toMapX(lon).toFixed(1)},${toMapY(lat).toFixed(1)}`
  ).join(' ') + 'Z';
}
function mapGeomToD(geom: { type: string; coordinates: unknown }): string {
  if (geom.type === 'Polygon')      return (geom.coordinates as number[][][]).map(mapRingToD).join(' ');
  if (geom.type === 'MultiPolygon') return (geom.coordinates as number[][][][]).flatMap(p => p.map(mapRingToD)).join(' ');
  return '';
}
const GEO_URL_WRAPPED = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson';

/* ══════════════════════════════════════════════
   SLIDE 6.5 — COUNTRIES VISITED
══════════════════════════════════════════════ */
function SlideCountries({ active }: { active: boolean }) {
  const [features, setFeatures] = useState<any[]>([]);
  const [mapLoading, setMapLoading] = useState(true);
  const [animReady, setAnimReady] = useState(false);
  const visited      = useMemo(() => getVisitedCountries(), []);
  const visitedList  = Object.entries(APP_COUNTRIES).filter(([c]) => visited.has(c));
  const pct          = Math.round((visitedList.length / Object.keys(APP_COUNTRIES).length) * 100);
  const featureByCode = useMemo(() => {
    const m: Record<string, any> = {};
    features.forEach((f: any) => { m[f.properties?.ISO_A2] = f; });
    return m;
  }, [features]);

  const visitedCentroids = useMemo(() => {
    if (!features.length) return [];
    return visitedList.map(([code]) => {
      const feat = featureByCode[code];
      if (!feat) return null;
      const pts: [number,number][] = [];
      const walk = (arr: any): void => {
        if (!Array.isArray(arr) || !arr.length) return;
        if (typeof arr[0] === 'number') { pts.push([arr[0] as number, arr[1] as number]); return; }
        arr.forEach(walk);
      };
      walk(feat.geometry.coordinates);
      if (!pts.length) return null;
      const lon = pts.reduce((a,p) => a + p[0], 0) / pts.length;
      const lat = pts.reduce((a,p) => a + p[1], 0) / pts.length;
      const name = (APP_COUNTRIES as Record<string,{flag:string;name:string}>)[code]?.name || code;
      return { code, cx: toMapX(lon), cy: toMapY(lat), name };
    }).filter((x): x is {code:string;cx:number;cy:number;name:string} => x !== null);
  }, [features, visitedList, featureByCode]);

  /* Trigger staggered colour-reveal when slide is active & map is loaded */
  useEffect(() => {
    if (active && !mapLoading) {
      const t = setTimeout(() => setAnimReady(true), 150);
      return () => clearTimeout(t);
    }
    if (!active) setAnimReady(false);
  }, [active, mapLoading]);

  useEffect(() => {
    const cached = sessionStorage.getItem('world_geo');
    if (cached) {
      try { setFeatures(JSON.parse(cached)); setMapLoading(false); return; } catch {}
    }
    fetch(GEO_URL_WRAPPED)
      .then(r => r.json())
      .then(data => {
        const feats = data.features || [];
        setFeatures(feats);
        try { sessionStorage.setItem('world_geo', JSON.stringify(feats)); } catch {}
        setMapLoading(false);
      })
      .catch(() => setMapLoading(false));
  }, []);

  return (
    <div style={{ ...sb, background:SBG }}>
      <LogisticsBg/>

      <div style={{ width:'100%', position:'relative', zIndex:2, display:'flex', flexDirection:'column', height:'100%' }}>

        {/* Label */}
        <div className={active ? 'fly-in d1' : ''}
          style={{ padding:'52px 20px 10px', textAlign:'center', fontSize:'0.72rem', fontWeight:700, color:'rgba(255,255,255,0.45)', letterSpacing:'2.5px' }}>
          ประเทศที่คุณส่งแล้ว
        </div>

        {/* Map — natural aspect ratio, no explicit height */}
        <div className={active ? 'fly-in d2' : ''} style={{ padding:'0 12px' }}>
          {mapLoading ? (
            <div style={{ textAlign:'center', width:'100%' }}>
              <Globe size={32} color="rgba(74,222,128,0.3)" style={{ animation:'float 2s ease-in-out infinite', margin:'0 auto' }}/>
            </div>
          ) : (
            <div style={{ width:'100%', borderRadius:16, overflow:'hidden', boxShadow:'0 8px 40px rgba(0,0,0,0.5)' }}>
              <svg viewBox={`0 0 ${W_MAP} ${H_MAP}`} style={{ width:'100%', display:'block' }}>
                <defs>
                  <style>{`@keyframes pdot{0%{opacity:0.85;transform:scale(1)}75%{opacity:0;transform:scale(3.2)}100%{opacity:0;transform:scale(3.2)}}`}</style>
                </defs>
                {/* Ocean */}
                <rect width={W_MAP} height={H_MAP} fill="#0a1628"/>
                {/* Base countries */}
                {features.map((f: any, i: number) => {
                  const code = f.properties?.ISO_A2 as string;
                  const isInApp = code in APP_COUNTRIES;
                  return (
                    <path key={`b${i}`}
                      d={mapGeomToD(f.geometry)}
                      fill={isInApp ? '#1e3854' : '#162c44'}
                      stroke="#0a1628" strokeWidth={0.4}
                    />
                  );
                })}
                {/* Visited countries */}
                {visitedList.map(([code], idx) => {
                  const feat = featureByCode[code];
                  if (!feat) return null;
                  return (
                    <path key={`v${code}`}
                      d={mapGeomToD(feat.geometry)}
                      fill="#16a34a"
                      stroke="#0a1628" strokeWidth={0.4}
                      style={{ opacity: animReady ? 1 : 0, transition: `opacity 0.55s ease ${idx * 0.4}s` }}
                    />
                  );
                })}
                {/* Numbered dots */}
                {animReady && visitedCentroids.map((item, idx) => {
                  const { cx, cy } = item;
                  return (
                    <g key={`n${item.code}`}>
                      <circle cx={cx} cy={cy} r={7} fill="none" stroke={YELLOW} strokeWidth={1.4}
                        style={{ animation:`pdot 1.8s ease-out ${idx*0.35}s infinite`, transformOrigin:`${cx}px ${cy}px` }}/>
                      <circle cx={cx} cy={cy} r={5.5} fill={YELLOW}/>
                      <text x={cx} y={cy+2.2} textAnchor="middle" fontSize={5.5} fontWeight="900" fill="#111">
                        {idx+1}
                      </text>
                    </g>
                  );
                })}
                {/* Thailand origin */}
                <circle cx={toMapX(100.5)} cy={toMapY(15)} r={3.5} fill="#d40511" stroke="#fff" strokeWidth={1.2}
                  style={{ filter:'drop-shadow(0 0 3px rgba(212,5,17,0.7))' }}/>
              </svg>
            </div>
          )}
        </div>

        {/* Country legend */}
        {visitedCentroids.length > 0 && (
          <div className={active ? 'fly-in d3' : ''} style={{ padding:'6px 14px 2px', display:'flex', flexWrap:'wrap', gap:'3px 10px' }}>
            {visitedCentroids.map((item, idx) => (
              <div key={item.code} style={{ display:'flex', alignItems:'center', gap:4, fontSize:'0.6rem', fontWeight:700, color:'rgba(255,255,255,0.8)' }}>
                <span style={{ background:YELLOW, color:'#111', borderRadius:'50%', width:13, height:13, display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:'0.5rem', fontWeight:900, flexShrink:0 }}>{idx+1}</span>
                {item.name}
              </div>
            ))}
          </div>
        )}
        {/* Pct */}
        <div className={active ? 'fly-in d4' : ''} style={{ padding:'4px 24px 24px', textAlign:'center' }}>
          <div style={{ fontSize:'3.5rem', fontWeight:900, color:'#fff', lineHeight:1, letterSpacing:'-2px', textShadow:'0 0 30px rgba(74,222,128,0.5)' }}>
            {pct}%
          </div>
          <div style={{ fontSize:'0.72rem', color:'rgba(255,255,255,0.4)', marginTop:6 }}>
            {visitedList.length} ใน {Object.keys(APP_COUNTRIES).length} ประเทศ
          </div>
        </div>

      </div>
    </div>
  );
}

/* ══ Badge definitions ═════════════════════════════════════════════ */
interface BadgeDef { id:string; icon:React.FC<{size?:number;color?:string}>; name:string; need:string; full:string; condition:(d:WrappedData)=>boolean; color:string; }
const BADGE_DEFS: BadgeDef[] = [
  { id:'first',  icon:Sparkles, name:'First Step',     need:'ส่งพัสดุครั้งแรก',       full:'เริ่มต้นการเดินทางสีเขียว ด้วยการส่งพัสดุครั้งแรก!',      condition:d=>d.totalShipments>=1,   color:'#059669' },
  { id:'green5', icon:Leaf,     name:'GoGreen Sender', need:'GoGreen 5 ครั้ง',        full:'ส่งพัสดุแบบ GoGreen อย่างน้อย 5 ครั้ง',             condition:d=>d.greenShipments>=5,   color:'#16a34a' },
  { id:'co2',    icon:Globe,    name:'Carbon Basher',  need:'ลด CO₂ รวม 10 kg',       full:'สะสมการลด CO₂ จากการส่ง GoGreen ให้ครบ 10 kg',      condition:d=>d.totalCo2>=10,        color:'#0284c7' },
  { id:'tree',   icon:TreePine, name:'Tree Planter',   need:'เทียบเท่า 10 ต้นไม้',    full:'ส่ง GoGreen จนมีต้นไม้เทียบเท่ากัน 10 ต้น',            condition:d=>d.totalTrees>=10,      color:'#15803d' },
  { id:'intl',   icon:Send,     name:'Global Sender',  need:'ส่งต่างประเทศ 1 ครั้ง', full:'เปิดประตูสู่โลก! ส่งพัสดุไปต่างประเทศสำเร็จ',   condition:d=>d.intlCount>=1,        color:'#7c3aed' },
  { id:'eco100', icon:Leaf,     name:'GoGreen Hero',   need:'GoGreen 100 ครั้ง',      full:'นักรบสิ่งแวดล้อม — ส่งพัสดุแบบ GoGreen ถึง 100 ครั้ง', condition:d=>d.greenShipments>=100, color:'#10b981' },
  { id:'legend', icon:Award,    name:'DHL Legend',     need:'ส่ง 500 ครั้ง',           full:'ตำนาน DHL — ส่งพัสดุสะสมถึง 500 ครั้ง!',           condition:d=>d.totalShipments>=500, color:'#d97706' },
];

/* ══════════════════════════════════════════════
   SLIDE 7 — BADGES
══════════════════════════════════════════════ */
function SlideBadges({ data, active }: { data: WrappedData; active: boolean }) {
  const [selected, setSelected] = useState<BadgeDef & { isUnlocked:boolean } | null>(null);
  const badges = BADGE_DEFS.map(b => ({ ...b, isUnlocked: b.condition(data) }));
  const unlockedCount = badges.filter(b => b.isUnlocked).length;

  return (
    <div style={{ ...sb, background:SBG }}>
      <LogisticsBg/>

      {/* Badge detail popup */}
      {selected && (
        <div style={{ position:'absolute', inset:0, zIndex:10, background:'rgba(0,0,0,0.78)', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}
          onClick={() => setSelected(null)}>
          <div style={{ background:'#141418', border:`2px solid ${selected.isUnlocked ? selected.color+'55' : 'rgba(255,255,255,0.1)'}`, borderRadius:24, padding:'28px 22px', maxWidth:280, width:'100%', textAlign:'center', boxShadow:'0 24px 60px rgba(0,0,0,0.8)' }}
            onClick={e => e.stopPropagation()}>

            {/* Big circle icon */}
            <div style={{
              width:90, height:90, borderRadius:'50%', margin:'0 auto 18px',
              background: selected.isUnlocked ? `${selected.color}22` : 'rgba(255,255,255,0.05)',
              border: `3px solid ${selected.isUnlocked ? selected.color : 'rgba(255,255,255,0.12)'}`,
              display:'flex', alignItems:'center', justifyContent:'center',
              boxShadow: selected.isUnlocked ? `0 0 28px ${selected.color}44` : 'none',
              opacity: selected.isUnlocked ? 1 : 0.4,
            }}>
              <selected.icon size={38} color={selected.isUnlocked ? selected.color : 'rgba(255,255,255,0.3)'}/>
            </div>

            <div style={{ display:'inline-flex', alignItems:'center', gap:5,
              background: selected.isUnlocked ? `${selected.color}22` : 'rgba(255,255,255,0.06)',
              border:`1px solid ${selected.isUnlocked ? selected.color+'44' : 'rgba(255,255,255,0.08)'}`,
              borderRadius:20, padding:'4px 14px', marginBottom:12,
              fontSize:'0.65rem', fontWeight:700,
              color: selected.isUnlocked ? selected.color : 'rgba(255,255,255,0.3)' }}>
              {selected.isUnlocked ? '✓ ปลดล็อกแล้ว!' : 'ยังไม่ปลดล็อก'}
            </div>

            <div style={{ fontSize:'1.05rem', fontWeight:900, color:'#fff', marginBottom:8 }}>{selected.name}</div>
            <div style={{ fontSize:'0.78rem', color:'rgba(255,255,255,0.5)', lineHeight:1.75, marginBottom:16 }}>{selected.full}</div>

            <div style={{ background:'rgba(255,255,255,0.05)', borderRadius:12, padding:'10px 14px', marginBottom:18 }}>
              <div style={{ fontSize:'0.58rem', color:'rgba(255,255,255,0.28)', letterSpacing:'1.5px', marginBottom:4 }}>เงื่อนไข</div>
              <div style={{ fontSize:'0.8rem', fontWeight:700, color: selected.isUnlocked ? selected.color : 'rgba(255,255,255,0.45)' }}>{selected.need}</div>
            </div>

            <button type="button" onClick={() => setSelected(null)}
              style={{ width:'100%', padding:'11px', borderRadius:14, border:'none', background: selected.isUnlocked ? selected.color : 'rgba(255,255,255,0.1)', color: selected.isUnlocked ? '#000' : '#fff', fontWeight:800, fontSize:'0.85rem', cursor:'pointer' }}>
              ปิด
            </button>
          </div>
        </div>
      )}

      {/* Main content */}
      <div style={{ textAlign:'center', padding:'0 20px', position:'relative', zIndex:2, width:'100%' }}>
        <div className={active ? 'scale-in d0' : ''} style={{ paddingTop:48, marginBottom:6 }}>
          <Award size={32} color={YELLOW}/>
        </div>
        <div className={active ? 'fly-in d1' : ''} style={{ fontSize:'0.72rem', fontWeight:700, color:'rgba(255,255,255,0.45)', letterSpacing:'2px', marginBottom:18 }}>
          เหรียญปลดล็อก — {unlockedCount}/{BADGE_DEFS.length}
        </div>

        {/* Badge circles */}
        <div style={{ display:'flex', flexWrap:'wrap', justifyContent:'center', gap:14, marginBottom:16, padding:'0 8px' }}>
          {badges.map((b, i) => (
            <button key={b.id} type="button" className={`badge-btn${active ? ` scale-in d${Math.min(i,5)}` : ''}`}
              onClick={() => setSelected(b)}
              style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6, background:'none', border:'none', cursor:'pointer', padding:0 }}>
              <div style={{
                width:62, height:62, borderRadius:'50%',
                background: b.isUnlocked ? `${b.color}22` : 'rgba(255,255,255,0.04)',
                border: `2.5px solid ${b.isUnlocked ? b.color : 'rgba(255,255,255,0.1)'}`,
                display:'flex', alignItems:'center', justifyContent:'center',
                boxShadow: b.isUnlocked ? `0 0 18px ${b.color}44, 0 4px 12px rgba(0,0,0,0.3)` : 'none',
                opacity: b.isUnlocked ? 1 : 0.35,
              }}>
                <b.icon size={24} color={b.isUnlocked ? b.color : 'rgba(255,255,255,0.25)'}/>
              </div>
              <span style={{ fontSize:'0.47rem', color: b.isUnlocked ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.2)', fontWeight:700, textAlign:'center', lineHeight:1.3, maxWidth:64 }}>
                {b.name}
              </span>
            </button>
          ))}
        </div>

        <div className={active ? 'fly-in d5' : ''}>
          <GlassCard style={{ display:'inline-block', padding:'7px 18px' }}>
            <span style={{ fontSize:'0.7rem', color:'rgba(255,255,255,0.4)' }}>แตะเหรียญเพื่อดูรายละเอียด</span>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   SLIDE 8 — FINAL
══════════════════════════════════════════════ */
function SlideFinal({ active, onShare, onClose, sharing }: {
  active: boolean; sharing: boolean;
  onShare: () => void; onClose: () => void;
}) {
  return (
    <div id="wrapped-final-card" style={{ ...sb, background:SBG }}>
      <LogisticsBg/>
      <div style={{ textAlign:'center', padding:'0 32px', width:'100%', position:'relative', zIndex:2, display:'flex', flexDirection:'column', alignItems:'center' }}>

        {/* Year badge */}
        <div className={active ? 'scale-in d0' : ''} style={{ display:'inline-flex', alignItems:'center',
          background:'rgba(255,204,0,0.12)', border:'1px solid rgba(255,204,0,0.35)',
          borderRadius:50, padding:'5px 20px', marginBottom:20 }}>
          <span style={{ fontSize:'0.6rem', fontWeight:900, color:YELLOW, letterSpacing:'2px' }}>
            DHL GOGREEN {YEAR}
          </span>
        </div>

        {/* THANK YOU */}
        <div className={active ? 'fly-in d1' : ''} style={{ fontSize:'0.65rem', fontWeight:800, color:'rgba(255,255,255,0.38)', letterSpacing:'4px', marginBottom:10 }}>
          THANK YOU
        </div>
        <div className={active ? 'fly-in d1' : ''} style={{ fontSize:'2.2rem', fontWeight:900, color:'#fff', lineHeight:1.2, marginBottom:18 }}>
          ขอบคุณที่<br/>ส่งด้วยใจ
        </div>

        {/* Quote card */}
        <div className={active ? 'fly-in d2' : ''} style={{ background:'rgba(255,255,255,0.07)', borderRadius:22, padding:'20px 24px', marginBottom:26, maxWidth:300, width:'100%', border:'1px solid rgba(255,255,255,0.12)' }}>
          <div style={{ fontSize:'0.92rem', color:'rgba(255,255,255,0.88)', lineHeight:1.75, fontStyle:'italic', fontWeight:500 }}>
            "Every package you send<br/>carries a greener future."
          </div>
          <div style={{ fontSize:'0.6rem', color:YELLOW, fontWeight:800, marginTop:12, letterSpacing:'1.5px' }}>
            — DHL GoGreen
          </div>
        </div>

        {/* Buttons */}
        <div className={active ? 'fly-in d3' : ''} style={{ display:'flex', flexDirection:'column', gap:8, width:'100%', maxWidth:280 }}>
          <button type="button" onClick={onShare} disabled={sharing}
            style={{ width:'100%', padding:'14px', borderRadius:22, border:'none', background:'linear-gradient(135deg,#c89a00,#FFCC00)', color:'#111', fontSize:'0.9rem', fontWeight:900, cursor:sharing?'not-allowed':'pointer', opacity:sharing?0.7:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow:'0 4px 20px rgba(255,204,0,0.35)' }}>
            <Send size={16}/> {sharing ? 'กำลังสร้าง...' : 'แชร์ Wrapped ของฉัน'}
          </button>
          <button type="button" onClick={onClose}
            style={{ width:'100%', padding:'11px', borderRadius:22, border:'2px solid rgba(255,255,255,0.2)', background:'rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.8)', fontSize:'0.85rem', fontWeight:700, cursor:'pointer' }}>
            ปิด
          </button>
        </div>
        <div style={{ marginTop:14, fontSize:'0.55rem', color:'rgba(255,255,255,0.2)', letterSpacing:'3px' }}>
          DHL GREEN PASSPORT · {YEAR} WRAPPED
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN WRAPPED COMPONENT
══════════════════════════════════════════════ */
export default function Wrapped({ data, onClose }: { data: WrappedData; onClose: () => void }) {
  const TOTAL = 9;
  const [slide, setSlide]     = useState(0);
  const [sharing, setSharing] = useState(false);

  const prev = () => setSlide(s => Math.max(0, s - 1));
  const next = () => setSlide(s => Math.min(TOTAL - 1, s + 1));

  const handleShare = async () => {
    setSharing(true);
    try {
      const el = document.getElementById('wrapped-final-card');
      if (!el) return;
      const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: null });
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = `dhl-wrapped-${YEAR}.png`;
      link.click();
    } catch (e) { console.error(e); }
    finally { setSharing(false); }
  };

  const slides = [
    (a: boolean) => <SlideIntro     data={data} active={a} />,
    (a: boolean) => <SlideShipments data={data} active={a} />,
    (a: boolean) => <SlideGreen     data={data} active={a} />,
    (a: boolean) => <SlideCO2       data={data} active={a} />,
    (a: boolean) => <SlideTrees     data={data} active={a} />,
    (a: boolean) => <SlideTopDest   data={data} active={a} />,
    (a: boolean) => <SlideCountries active={a} />,
    (a: boolean) => <SlideBadges    data={data} active={a} />,
    (a: boolean) => <SlideFinal     active={a} onShare={handleShare} onClose={onClose} sharing={sharing} />,
  ];

  return (
    <div style={{ position:'relative', width:'100%', height:'100%', fontFamily:F }}>
      <style>{GLOBAL_CSS}</style>

      {/* Slides */}
      <div style={{ position:'relative', width:'100%', height:'100%', overflow:'hidden' }}>
        {slides.map((renderSlide, i) => (
          <div key={i} style={{
            position:'absolute', inset:0,
            opacity: i === slide ? 1 : 0,
            transform: i === slide ? 'scale(1)' : 'scale(0.96)',
            transition:'opacity 0.45s ease, transform 0.45s ease',
            pointerEvents: i === slide ? 'auto' : 'none',
          }}>
            {renderSlide(i === slide)}
          </div>
        ))}
      </div>

      {/* Tap: left = prev, right = next */}
      {slide > 0 && (
        <button type="button" onClick={prev}
          style={{ position:'absolute', left:0, top:0, bottom:0, width:'28%', background:'transparent', border:'none', cursor:'pointer', zIndex:10 }}/>
      )}
      {slide < TOTAL - 1 && (
        <button type="button" onClick={next}
          style={{ position:'absolute', right:0, top:0, bottom:0, width:'40%', background:'transparent', border:'none', cursor:'pointer', zIndex:10 }}/>
      )}

      {/* Progress dots */}
      <div style={{ position:'absolute', bottom:14, left:0, right:0, display:'flex', justifyContent:'center', gap:5, zIndex:20, pointerEvents:'none' }}>
        {Array.from({ length: TOTAL }).map((_, i) => (
          <div key={i} style={{
            width: i === slide ? 18 : 6, height:6, borderRadius:3,
            background: i === slide ? YELLOW : 'rgba(255,255,255,0.3)',
            transition:'all 0.3s ease',
          }}/>
        ))}
      </div>
    </div>
  );
}
