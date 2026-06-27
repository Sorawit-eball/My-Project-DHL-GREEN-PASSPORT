import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';

/* ── Odometer digit ─────────────────────────────────────────── */
function Digit({ value, size }: { value: string; size: number }) {
  if (value === '.' || value === ',') {
    return (
      <span style={{
        display: 'inline-block', width: size * 0.32,
        textAlign: 'center', lineHeight: 1, color: 'inherit', opacity: 0.4,
      }}>{value}</span>
    );
  }
  const h = size * 1.1;
  return (
    <div style={{ display: 'inline-block', position: 'relative', width: size * 0.6, height: h, overflow: 'hidden', verticalAlign: 'bottom' }}>
      <div style={{
        position: 'absolute', inset: '0 0 auto',
        transition: 'transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)',
        transform: `translateY(-${Number(value) * h}px)`,
      }}>
        {[0,1,2,3,4,5,6,7,8,9].map(n => (
          <div key={n} style={{ height: h, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{n}</div>
        ))}
      </div>
    </div>
  );
}

function Roll({ value, decimals = 0, size = 32, color = '#fff' }: {
  value: number; decimals?: number; size?: number; color?: string;
}) {
  const s = value.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return (
    <span style={{ display: 'inline-flex', alignItems: 'flex-end', fontWeight: 800, fontSize: size, lineHeight: 1, color, fontFamily: "'Inter',sans-serif", letterSpacing: '-0.03em' }}>
      {s.split('').map((ch, i) => <Digit key={i} value={ch} size={size} />)}
    </span>
  );
}

/* ── Main component ─────────────────────────────────────────── */
export default function GlobalImpactWidget() {
  const widgetRef = useRef<HTMLDivElement>(null);
  const [position,   setPosition]   = useState({ x: 0, y: 80 });
  const [isDragging, setIsDragging] = useState(false);
  const [showModal,  setShowModal]  = useState(false);
  const [isVisible,  setIsVisible]  = useState(true);
  const [isLeftEdge, setIsLeftEdge] = useState(false);
  const [isMounted,  setIsMounted]  = useState(false);
  const [transition, setTransition] = useState('none');
  const drag = useRef({ sx: 0, sy: 0, ix: 0, iy: 0, moved: false });

  const [stats, setStats] = useState({
    shipments:     48_271,
    carbonKg:     1_250_430.50,
    passportUsers: 12_847,
    goGreenPlus:   31_509,
    trees:         57_622,
  });

  useEffect(() => {
    setIsMounted(true);
    const w = window.innerWidth;
    const x = w - 70;
    setPosition({ x, y: 100 });
    setIsLeftEdge(x < w / 2);
  }, []);

  useEffect(() => {
    if (!showModal) return;
    const id = setInterval(() => {
      setStats(p => ({
        shipments:     p.shipments     + Math.floor(Math.random() * 2),
        carbonKg:     p.carbonKg     + (Math.random() * 4 + 0.5),
        passportUsers: p.passportUsers + (Math.random() > 0.75 ? 1 : 0),
        goGreenPlus:   p.goGreenPlus   + Math.floor(Math.random() * 3),
        trees:         p.trees         + (Math.random() > 0.65 ? 1 : 0),
      }));
    }, 2000);
    return () => clearInterval(id);
  }, [showModal]);

  const onDown = (e: React.PointerEvent) => {
    if (showModal) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { sx: e.clientX, sy: e.clientY, ix: position.x, iy: position.y, moved: false };
    setIsDragging(true); setTransition('none');
  };
  const onMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - drag.current.sx, dy = e.clientY - drag.current.sy;
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) drag.current.moved = true;
    setPosition({ x: drag.current.ix + dx, y: drag.current.iy + dy });
  };
  const onUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
    if (widgetRef.current) {
      const sw = window.innerWidth, sh = window.innerHeight;
      const ww = widgetRef.current.offsetWidth, wh = widgetRef.current.offsetHeight;
      const left = (position.x + ww / 2) < sw / 2;
      setIsLeftEdge(left);
      setTransition('transform 0.4s cubic-bezier(0.25,0.8,0.25,1)');
      setPosition({ x: left ? 10 : sw - ww - 10, y: Math.max(20, Math.min(position.y, sh - wh - 20)) });
    }
    if (!drag.current.moved) setShowModal(true);
  };

  if (!isVisible || !isMounted) return null;
  const mapUrl = 'https://img.icons8.com/ios-filled/100/059669/thailand-map.png';

  return (
    <>
      {/* ── CSS ── */}
      <style>{`
        @keyframes gi-float  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes gi-in     { from{opacity:0;transform:scale(.96) translateY(12px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes gi-row    { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes gi-pulse  { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.3;transform:scale(.5)} }
        @keyframes gi-bob    { 0%,100%{transform:translateY(0) rotate(-1deg)} 50%{transform:translateY(-6px) rotate(1deg)} }
        @keyframes gi-shimmer{
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
      `}</style>

      {/* ── Floating icon ── */}
      <div
        ref={widgetRef}
        onPointerDown={onDown} onPointerMove={onMove}
        onPointerUp={onUp} onPointerCancel={onUp}
        style={{ position:'fixed', top:0, left:0, transform:`translate(${position.x}px,${position.y}px)`, transition, zIndex:8000, cursor: isDragging?'grabbing':'grab', touchAction:'none' }}
      >
        <button onClick={e=>{e.stopPropagation();setIsVisible(false);}} onPointerDown={e=>e.stopPropagation()}
          style={{ position:'absolute', top:-10, [isLeftEdge?'right':'left']:-10, width:22, height:22, borderRadius:11, background:'#fff', border:'1px solid #e5e7eb', boxShadow:'0 2px 5px rgba(0,0,0,0.2)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', zIndex:10 }}>
          <X size={12} color="#6b7280"/>
        </button>
        <div style={{ width:56, height:56, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', position:'relative', animation: isDragging?'none':'gi-float 3s ease-in-out infinite' }}>
          <img draggable={false} src={mapUrl} alt="TH" style={{ width:'100%', height:'100%', objectFit:'contain', pointerEvents:'none', filter:'drop-shadow(0 8px 12px rgba(5,150,105,0.45)) drop-shadow(0 0 4px rgba(255,255,255,0.8))' }}/>
          <div style={{ background:'rgba(255,255,255,0.95)', color:'#064e3b', fontSize:'0.53rem', fontWeight:800, padding:'2px 8px', borderRadius:12, position:'absolute', bottom:-20, boxShadow:'0 4px 12px rgba(0,0,0,0.15)', whiteSpace:'nowrap', border:'1px solid #d1fae5', backdropFilter:'blur(4px)' }}>
            GoGreen TH
          </div>
        </div>
      </div>

      {/* ── Modal ── */}
      {showModal && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}
          style={{
            position:'fixed', inset:0, zIndex:9999,
            background:'rgba(2,20,10,0.75)',
            backdropFilter:'blur(18px)',
            display:'flex', alignItems:'center', justifyContent:'center',
            padding:'20px 16px',
            animation:'gi-in 0.35s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          {/* Card */}
          <div style={{
            width:'100%', maxWidth:400,
            background:'linear-gradient(145deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)',
            border:'1px solid rgba(255,255,255,0.1)',
            borderRadius:28,
            overflow:'hidden',
            boxShadow:'0 32px 80px rgba(0,0,0,0.6), 0 0 0 0.5px rgba(255,255,255,0.08) inset',
            backdropFilter:'blur(20px)',
            position:'relative',
          }}>

            {/* Green glow top-left */}
            <div style={{ position:'absolute', top:-60, left:-40, width:220, height:220, borderRadius:'50%', background:'radial-gradient(circle, rgba(52,211,153,0.18) 0%, transparent 70%)', pointerEvents:'none' }}/>
            {/* Amber glow bottom-right */}
            <div style={{ position:'absolute', bottom:-50, right:-30, width:180, height:180, borderRadius:'50%', background:'radial-gradient(circle, rgba(251,191,36,0.12) 0%, transparent 70%)', pointerEvents:'none' }}/>

            {/* ─ Header ─ */}
            <div style={{ padding:'22px 22px 0', position:'relative', zIndex:2 }}>
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12 }}>

                {/* Map + titles */}
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ width:50, height:50, flexShrink:0, animation:'gi-bob 5s ease-in-out infinite' }}>
                    <img draggable={false} src={mapUrl} alt="TH"
                      style={{ width:'100%', height:'100%', objectFit:'contain', pointerEvents:'none', filter:'drop-shadow(0 4px 12px rgba(52,211,153,0.7))' }}/>
                  </div>
                  <div>
                    <div style={{ fontSize:'0.55rem', fontWeight:700, letterSpacing:'0.13em', color:'#34d399', textTransform:'uppercase', marginBottom:3 }}>
                      GoGreen · ประเทศไทย
                    </div>
                    <div style={{ fontSize:'1.05rem', fontWeight:900, color:'#fff', lineHeight:1.2, letterSpacing:'-0.01em' }}>
                      ร่วมใจลดคาร์บอน
                    </div>
                    {/* Live */}
                    <div style={{ display:'inline-flex', alignItems:'center', gap:5, marginTop:5, background:'rgba(52,211,153,0.12)', border:'1px solid rgba(52,211,153,0.25)', borderRadius:20, padding:'3px 9px' }}>
                      <span style={{ width:5, height:5, borderRadius:'50%', background:'#34d399', display:'inline-block', animation:'gi-pulse 1.6s ease-in-out infinite' }}/>
                      <span style={{ fontSize:'0.52rem', fontWeight:700, color:'#34d399', letterSpacing:'0.09em', textTransform:'uppercase' as const }}>Live · Real-time</span>
                    </div>
                  </div>
                </div>

                {/* Close */}
                <button onClick={e=>{e.stopPropagation();setShowModal(false);}}
                  style={{ width:34, height:34, borderRadius:17, background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.12)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 }}>
                  <X size={16} color="rgba(255,255,255,0.7)"/>
                </button>
              </div>
            </div>

            {/* ─ Divider ─ */}
            <div style={{ height:1, background:'linear-gradient(90deg, transparent, rgba(255,255,255,0.1) 30%, rgba(255,255,255,0.1) 70%, transparent)', margin:'18px 0 0' }}/>

            {/* ─ Metrics ─ */}
            <div style={{ padding:'4px 22px 20px', position:'relative', zIndex:2 }}>

              {/* Hero: Carbon — biggest, full-width spotlight */}
              <div style={{ textAlign:'center', padding:'18px 0 14px', animation:'gi-row 0.5s ease 0.1s both' }}>
                <div style={{ fontSize:'0.58rem', fontWeight:700, letterSpacing:'0.12em', color:'rgba(255,255,255,0.4)', textTransform:'uppercase', marginBottom:10 }}>
                  Carbon Contribution สะสม
                </div>
                <Roll value={stats.carbonKg} decimals={2} size={40} color="#fbbf24"/>
                <div style={{ fontSize:'0.65rem', fontWeight:700, color:'rgba(251,191,36,0.65)', letterSpacing:'0.08em', marginTop:6, textTransform:'uppercase' as const }}>kg CO₂e</div>
              </div>

              {/* Thin separator */}
              <div style={{ height:1, background:'rgba(255,255,255,0.06)', marginBottom:4 }}/>

              {/* 2×2 grid + 1 full */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1px', background:'rgba(255,255,255,0.06)', borderRadius:16, overflow:'hidden', marginTop:4 }}>
                {[
                  { label:'การจัดส่ง',     val:stats.shipments,     unit:'Shipments', accent:'#34d399', dec:0, delay:0.16 },
                  { label:'Green Passport', val:stats.passportUsers, unit:'Users',     accent:'#a78bfa', dec:0, delay:0.22 },
                  { label:'GoGreen Plus',   val:stats.goGreenPlus,   unit:'ครั้ง',     accent:'#38bdf8', dec:0, delay:0.28 },
                  { label:'ต้นไม้เทียบเท่า', val:stats.trees,       unit:'Trees',     accent:'#86efac', dec:0, delay:0.34 },
                ].map((m, i) => (
                  <div key={i} style={{
                    background:'rgba(255,255,255,0.03)',
                    padding:'14px 14px 12px',
                    display:'flex', flexDirection:'column', gap:4,
                    animation:`gi-row 0.5s ease ${m.delay}s both`,
                  }}>
                    <div style={{ fontSize:'0.56rem', fontWeight:700, color:'rgba(255,255,255,0.38)', letterSpacing:'0.09em', textTransform:'uppercase' as const }}>{m.label}</div>
                    <div style={{ display:'flex', alignItems:'baseline', gap:4 }}>
                      <Roll value={m.val} decimals={m.dec} size={26} color="#fff"/>
                      <span style={{ fontSize:'0.5rem', fontWeight:700, color:m.accent, letterSpacing:'0.06em', textTransform:'uppercase' as const }}>{m.unit}</span>
                    </div>
                    {/* Bottom accent line */}
                    <div style={{ height:2, width:24, borderRadius:2, background:m.accent, marginTop:2, boxShadow:`0 0 6px ${m.accent}88` }}/>
                  </div>
                ))}
              </div>
            </div>

            {/* ─ Footer ─ */}
            <div style={{ borderTop:'1px solid rgba(255,255,255,0.05)', padding:'10px 22px 16px', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
              <div style={{ width:5, height:5, borderRadius:'50%', background:'#34d399', opacity:0.5 }}/>
              <span style={{ fontSize:'0.54rem', fontWeight:600, color:'rgba(255,255,255,0.25)', letterSpacing:'0.07em' }}>DHL GoGreen Thailand Network</span>
              <div style={{ width:5, height:5, borderRadius:'50%', background:'#34d399', opacity:0.5 }}/>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
