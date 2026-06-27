import React, { useState, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  ArrowLeft, ArrowRight, Leaf, RotateCcw, Home,
  TrendingUp, Award, Globe, BarChart3, Sparkles,
  MapPin, Zap, BookOpen, ChevronRight, Check, ChevronLeft,
  Camera, X, Download, MoreHorizontal,
} from 'lucide-react';

/* ─── Global CSS ──────────────────────────────────────────────── */
const G = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
  * { box-sizing:border-box; -webkit-tap-highlight-color:transparent; }
  @keyframes gp-up   { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes gp-rIn  { from{opacity:0;transform:translateX(24px)} to{opacity:1;transform:translateX(0)} }
  @keyframes gp-lIn  { from{opacity:0;transform:translateX(-24px)} to{opacity:1;transform:translateX(0)} }
  @keyframes gp-float{ 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
  @keyframes gp-dash  { from{stroke-dashoffset:var(--len)} to{stroke-dashoffset:0} }
  @keyframes gp-pulse { 0%,100%{transform:scale(1);opacity:.7} 50%{transform:scale(1.4);opacity:1} }
  @keyframes gp-num   { from{opacity:0;transform:scale(.7)} to{opacity:1;transform:scale(1)} }
  @keyframes gp-countup{ from{opacity:0} to{opacity:1} }
  @keyframes gp-modal-in { from{opacity:0;transform:scale(.94)} to{opacity:1;transform:scale(1)} }
  @keyframes gp-share-draw { from{stroke-dashoffset:800} to{stroke-dashoffset:0} }

  .gp-btn {
    cursor:pointer; border:none; outline:none; font-family:inherit;
    transition:transform .13s cubic-bezier(.34,1.56,.64,1), opacity .15s ease, box-shadow .15s ease;
    user-select:none;
  }
  .gp-btn:hover  { transform:scale(1.025); }
  .gp-btn:active { transform:scale(.95) !important; opacity:.88; }
  .gp-ghost {
    cursor:pointer; border:none; outline:none; font-family:inherit;
    transition:opacity .15s ease, transform .13s ease;
    user-select:none; background:none;
  }
  .gp-ghost:hover  { opacity:.7; transform:scale(1.02); }
  .gp-ghost:active { opacity:.5; transform:scale(.97) !important; }
  .gp-card { transition:transform .15s ease; }
  .gp-card:active { transform:scale(.983); }
  .gp-scroll::-webkit-scrollbar { display:none; }
  .gp-scroll { scrollbar-width:none; -ms-overflow-style:none; }
`;

const F = "'Inter', 'Kanit', sans-serif";
const GREEN = '#16a34a';
const GREEN_LIGHT = '#22c55e';
const GREEN_BG = '#f0fdf4';
/* Dark card palette — deep forest green instead of pure black */
const D1 = '#0d2318';  /* main card bg   */
const D2 = '#071b0f';  /* secondary bg   */
const D3 = '#051209';  /* footer/close   */
const D_BORDER = 'rgba(34,197,94,.12)'; /* subtle green border */

/* ─── Palette ──────────────────────────────────────────────────── */
const C = {
  bg: C_bg(), border: '#e5e7eb', text: '#111827', text2: '#6b7280', text3: '#9ca3af',
  tag: '#f3f4f6', accent: '#111827', accentFg: '#ffffff',
  green: GREEN, greenLight: GREEN_LIGHT, greenBg: GREEN_BG,
};
function C_bg() { return '#ffffff'; }

/* ─── Leaflet ──────────────────────────────────────────────────── */
const userIcon = L.divIcon({
  className: '',
  html: `<div style="width:14px;height:14px;background:#111;border-radius:50%;border:3px solid #fff;box-shadow:0 0 0 3px rgba(0, 0, 0, 0.12)"></div>`,
  iconSize: [14, 14], iconAnchor: [7, 7],
});
const spotIcon = (sel: boolean) => L.divIcon({
  className: '',
  html: `<div style="width:34px;height:34px;border-radius:50%;background:${sel ? GREEN : '#fff'};border:2px solid ${sel ? GREEN : '#ddd'};display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,.14)">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" fill="${sel ? '#fff' : '#999'}"/>
    </svg>
  </div>`,
  iconSize: [34, 34], iconAnchor: [17, 17],
});

/* ─── Data ──────────────────────────────────────────────────────── */
const DHL_SPOTS = [
  { id: 1, name: 'DHL พญาไท', lat: 13.770, lng: 100.530, address: 'ถ.พญาไท แขวงพญาไท' },
  { id: 2, name: 'DHL อโศก', lat: 13.736, lng: 100.560, address: 'ถ.สุขุมวิท 21 (อโศก)' },
  { id: 3, name: 'DHL ลาดพร้าว', lat: 13.783, lng: 100.575, address: 'ถ.ลาดพร้าว แขวงจตุจักร' },
  { id: 4, name: 'DHL สีลม', lat: 13.725, lng: 100.529, address: 'ถ.สีลม แขวงสีลม' },
  { id: 5, name: 'DHL บางนา', lat: 13.680, lng: 100.605, address: 'ถ.บางนา-ตราด' },
];
const USER_POS: [number, number] = [13.754, 100.540];


/* ─── Primitives ───────────────────────────────────────────────── */
function Btn({ onClick, children, style = {}, ghost = false, disabled = false }: {
  onClick?: () => void; children: React.ReactNode; style?: React.CSSProperties; ghost?: boolean; disabled?: boolean;
}) {
  return (
    <button onClick={onClick} disabled={disabled}
      className={ghost ? 'gp-ghost' : 'gp-btn'}
      style={{ fontFamily: F, padding: 0, background: 'none', border: 'none', cursor: disabled ? 'not-allowed' : 'pointer', ...style }}>
      {children}
    </button>
  );
}
function Card({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div className="gp-card" style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 16, padding: 18, ...style }}>
      {children}
    </div>
  );
}
function Tag({ children }: { children: React.ReactNode }) {
  return <span style={{ display: 'inline-block', background: C.tag, borderRadius: 6, padding: '3px 10px', fontSize: '0.67rem', fontWeight: 600, color: C.text2, letterSpacing: '0.8px', textTransform: 'uppercase' as const }}>{children}</span>;
}



/* ─── Route SVG (Strava-style delivery path) ──────────────────── */
/* Map background — absolutely fills hero, decorative country shapes */
function MapBg() {
  return (
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' } as React.CSSProperties}
      viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice">
      {/* Mainland China */}
      <path d="M 90 12 C 128 4, 202 6, 260 20 C 294 28, 310 44, 304 64 C 298 80, 276 90, 253 96 C 230 102, 196 108, 170 110 C 146 112, 120 106, 100 94 C 80 82, 76 62, 82 42 C 86 26, 88 16, 90 12 Z"
        fill="rgba(255,255,255,0.14)" stroke="rgba(255,255,255,0.28)" strokeWidth="1.2" />
      {/* Indochina */}
      <path d="M 98 108 C 116 114, 126 124, 120 142 C 114 160, 102 174, 90 184 C 78 194, 64 198, 56 190 C 48 182, 48 170, 52 156 C 56 142, 66 130, 74 120 C 82 110, 88 106, 98 108 Z"
        fill="rgba(255,255,255,0.14)" stroke="rgba(255,255,255,0.28)" strokeWidth="1.2" />
      {/* Korea */}
      <path d="M 247 44 C 259 38, 272 42, 278 54 C 284 66, 280 80, 268 86 C 256 92, 244 84, 240 72 C 236 60, 238 50, 247 44 Z"
        fill="rgba(255,255,255,0.16)" stroke="rgba(255,255,255,0.32)" strokeWidth="1.2" />
      {/* Japan Honshu */}
      <path d="M 306 64 C 326 56, 350 54, 372 58 C 390 62, 398 72, 392 82 C 386 90, 364 90, 344 86 C 324 82, 308 76, 306 70 Z"
        fill="rgba(255,255,255,0.16)" stroke="rgba(255,255,255,0.32)" strokeWidth="1.2" />
      {/* Taiwan */}
      <path d="M 267 108 C 273 104, 279 108, 280 116 C 281 124, 276 132, 269 132 C 263 132, 261 124, 263 116 Z"
        fill="rgba(255,255,255,0.10)" stroke="rgba(255,255,255,0.22)" strokeWidth="1" />
      {/* Philippines */}
      <ellipse cx="192" cy="164" rx="6" ry="10" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.16)" strokeWidth="1" />
      <ellipse cx="202" cy="178" rx="5" ry="8" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
      {/* Grid lines (latitude-like) */}
      <line x1="0" y1="110" x2="400" y2="110" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      <line x1="0" y1="55" x2="400" y2="55" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      <line x1="0" y1="165" x2="400" y2="165" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
    </svg>
  );
}

/* Route animation only — compact horizontal, upper-positioned */
function RouteViz({ animate = false }: { animate?: boolean }) {
  const stops = [
    { cx: 22, cy: 22, label: 'BKK', done: true },
    { cx: 118, cy: 14, label: 'HKG', done: true },
    { cx: 210, cy: 11, label: 'ICN', done: true },
    { cx: 300, cy: 8, label: 'NRT', done: false },
    { cx: 378, cy: 5, label: 'TYO', done: false },
  ];
  const pathD = `M 22 22 C 55 8, 82 18, 118 14 C 154 10, 172 14, 210 11 C 248 8, 268 9, 300 8 C 332 7, 354 6, 378 5`;
  const len = 400;

  return (
    <svg viewBox="0 0 400 60" width="100%"
      style={{ display: 'block', overflow: 'visible' }}>
      {/* Shadow glow */}
      <path d={pathD} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="10" strokeLinecap="round" />
      {/* Dashed track */}
      <path d={pathD} fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="2" strokeLinecap="round" strokeDasharray="6 5" />
      {/* Animated progress line — uses --len CSS var for keyframe */}
      {animate && (
        <path d={pathD} fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"
          style={{
            strokeDasharray: len,
            strokeDashoffset: len,
            ['--len' as string]: len,
            animation: `gp-dash 2.4s cubic-bezier(.4,0,.2,1) .4s forwards`,
            filter: 'drop-shadow(0 0 5px rgba(255,255,255,0.7))',
          } as React.CSSProperties} />
      )}
      {!animate && <path d={pathD} fill="none" stroke="rgba(255,255,255,.5)" strokeWidth="2.5" strokeLinecap="round" />}
      {/* Stops */}
      {stops.map((s, i) => (
        <g key={i}>
          {i === stops.filter(x => x.done).length - 1 && animate && (
            <circle cx={s.cx} cy={s.cy} r="12" fill="rgba(255,255,255,.12)"
              style={{ animation: 'gp-pulse 1.8s ease-in-out infinite' }} />
          )}
          <circle cx={s.cx} cy={s.cy} r={s.done ? 8 : 5.5}
            fill={s.done ? 'rgba(255,255,255,.22)' : 'rgba(255,255,255,.1)'} />
          <circle cx={s.cx} cy={s.cy} r={s.done ? 4.5 : 3}
            fill={s.done ? '#fff' : 'rgba(255,255,255,.4)'} />
          <text x={s.cx} y={s.cy - 13} textAnchor="middle"
            fontSize="9" fontWeight="800" fill={s.done ? '#fff' : 'rgba(255,255,255,.45)'}
            fontFamily="Inter,sans-serif" letterSpacing="0.5">
            {s.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   LANDING
═══════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════
   LANDING = Phone Login Page (full screen)
═══════════════════════════════════════════════════════════════ */
function LandingScreen({ onStart }: { onStart: () => void }) {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const valid = phone.length >= 1;

  const handleLogin = () => {
    if (!valid) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); onStart(); }, 900);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: F, background: '#fff' }}>
      <style>{G}</style>

      {/* Top green strip — brand identity */}
      <div style={{ background: `linear-gradient(135deg,${D1} 0%,${GREEN} 100%)`, padding: '0', flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
        <div style={{ opacity: 0.25, position: 'absolute', inset: 0 }}><MapBg /></div>
        <div style={{ position: 'relative', zIndex: 1, padding: '56px 28px 44px' }}>
          {/* Back */}
          <Btn ghost onClick={() => navigate('/home')} style={{ color: 'rgba(255,255,255,.75)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 32 }}>
            <ArrowLeft size={16} /> กลับ
          </Btn>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Leaf size={28} color="#fff" strokeWidth={2} />
            </div>
            <div>
              <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' as const }}>DHL GoGreen Plus</div>
              <div style={{ color: '#fff', fontSize: '1.6rem', fontWeight: 900, letterSpacing: '-0.5px', lineHeight: 1.1 }}>Green Passport</div>
            </div>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.88rem', margin: 0, lineHeight: 1.6 }}>
            เข้าสู่ระบบด้วยเบอร์โทรศัพท์ที่ลงทะเบียนไว้กับ DHL
          </p>
        </div>
      </div>

      {/* White form area */}
      <div style={{ flex: 1, padding: '36px 28px 40px', display: 'flex', flexDirection: 'column' }}>

        {/* Phone input */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#374151', marginBottom: 10, display: 'block' }}>
            เบอร์โทรศัพท์
          </label>
          <div style={{
            display: 'flex',
            border: `2px solid ${phone.length > 0 ? GREEN : '#e5e7eb'}`,
            borderRadius: 14,
            overflow: 'hidden',
            transition: 'border-color .2s',
            background: '#fff',
            boxShadow: phone.length > 0 ? `0 0 0 4px ${GREEN}15` : 'none',
          }}>
            <div style={{ background: '#f8fafc', padding: '16px 16px', fontSize: '1rem', fontWeight: 600, color: '#374151', borderRight: '1.5px solid #e5e7eb', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
              <img src="https://flagcdn.com/w40/th.png" alt="TH" width={20} height={14} style={{ borderRadius: 3, objectFit: 'cover', verticalAlign: 'middle' }} /> <span style={{ fontSize: '0.9rem' }}>+66</span>
            </div>
            <input
              type="tel"
              placeholder="0XX-XXX-XXXX"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              style={{ flex: 1, border: 'none', outline: 'none', padding: '16px 16px', fontSize: '1.05rem', fontFamily: F, background: 'transparent', color: '#111' }}
              autoFocus
            />
          </div>
          <p style={{ margin: '8px 0 0', fontSize: '0.75rem', color: '#9ca3af' }}>ใส่เบอร์ที่ลงทะเบียนกับ DHL Express</p>
        </div>

        {/* Login button */}
        <Btn onClick={handleLogin} disabled={!valid || loading} style={{
          width: '100%', padding: '17px', borderRadius: 14,
          background: valid ? GREEN : '#e5e7eb',
          color: valid ? '#fff' : '#9ca3af',
          fontSize: '1.05rem', fontWeight: 800,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          boxShadow: valid ? `0 8px 24px ${GREEN}40` : 'none',
          transition: 'all .25s ease',
          opacity: loading ? 0.8 : 1,
        }}>
          {loading
            ? <><div style={{ width: 18, height: 18, border: '2.5px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: 9, animation: 'spin .7s linear infinite' }} /> กำลังตรวจสอบ...</>
            : <>เข้าสู่ระบบ <ArrowRight size={20} /></>
          }
        </Btn>

        {/* Spacer + info */}
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginTop: 32 }}>
          <Check size={14} color={GREEN} />
          <span style={{ color: '#9ca3af', fontSize: '0.75rem' }}>ข้อมูลปลอดภัย · เข้ารหัสตามมาตรฐาน GHG Protocol</span>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TUTORIAL
═══════════════════════════════════════════════════════════════ */
/* ─── Tutorial redesign: eco-themed device mockup ─────── */
function TutorialScreen({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [step, setStep] = useState(0);
  const [isWide, setIsWide] = useState(false);
  const TOTAL = 3;


  useEffect(() => {
    const check = () => setIsWide(window.innerWidth >= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const steps = [
    {
      title: 'เลือกสาขาและปลายทาง',
      sub: 'สาขาร่วม 36 แห่งทั่วไทย',
      color: '#059669',
      desc: 'เลือกสาขา DHL ที่เข้าร่วมโครงการ GoGreen Plus ใกล้บ้านคุณ แล้วระบุประเทศที่ต้องการส่งพัสดุ ง่ายแค่แตะแผนที่',
      screen: (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' }}>
          <svg viewBox="0 0 160 290" preserveAspectRatio="none"
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>

            {/* ── FULL-SCREEN MAP ── */}
            <rect width="160" height="290" fill="#ddeef7" />
            {/* Horizontal roads */}
            <rect x="0" y="115" width="160" height="7" fill="#fff" opacity="0.85" />
            <rect x="0" y="160" width="160" height="6" fill="#fff" opacity="0.75" />
            <rect x="0" y="205" width="160" height="6" fill="#fff" opacity="0.65" />
            <rect x="0" y="248" width="160" height="5" fill="#fff" opacity="0.55" />
            {/* Vertical roads */}
            <rect x="40" y="55" width="7" height="235" fill="#fff" opacity="0.85" />
            <rect x="90" y="55" width="6" height="235" fill="#fff" opacity="0.75" />
            <rect x="135" y="55" width="5" height="235" fill="#fff" opacity="0.6" />
            {/* Park blocks */}
            <rect x="4" y="123" width="30" height="28" rx="4" fill="#c8e6c9" opacity="0.5" />
            <rect x="48" y="123" width="36" height="28" rx="4" fill="#b2dfdb" opacity="0.65" />
            <rect x="97" y="123" width="32" height="28" rx="4" fill="#c8e6c9" opacity="0.5" />
            <rect x="4" y="168" width="30" height="28" rx="4" fill="#b2dfdb" opacity="0.4" />
            <rect x="48" y="168" width="36" height="28" rx="4" fill="#c8e6c9" opacity="0.4" />
            <rect x="97" y="168" width="32" height="28" rx="4" fill="#c8e6c9" opacity="0.35" />
            <rect x="48" y="213" width="36" height="26" rx="4" fill="#b2dfdb" opacity="0.35" />

            {/* ── DASHED LINE connecting pins ── */}
            <path d="M 36 200 Q 85 130 126 100"
              fill="none" stroke="#059669" strokeWidth="2.5" strokeDasharray="6 4" strokeLinecap="round" />

            {/* Origin pin — จุดส่ง (bottom-left) */}
            <circle cx="36" cy="200" r="16" fill="rgba(5,150,105,0.15)" />
            <circle cx="36" cy="200" r="10" fill="rgba(5,150,105,0.3)" />
            <circle cx="36" cy="200" r="6" fill="#059669" />
            <circle cx="36" cy="200" r="2.5" fill="#fff" />


            {/* Destination pin — จุดรับ (top-right) */}
            <circle cx="126" cy="100" r="16" fill="rgba(212,5,17,0.12)" />
            <circle cx="126" cy="100" r="10" fill="rgba(212,5,17,0.25)" />
            <circle cx="126" cy="100" r="6" fill="#d40511" />
            <text x="126" y="104" textAnchor="middle" fontSize="7" fill="#fff" fontWeight="900" fontFamily="Inter,sans-serif">?</text>


            {/* ── TWO BOXES (shifted down with white gap) ── */}
            {/* White strip gap */}
            <rect x="0" y="0" width="160" height="15" fill="#fff" />
            {/* Panel */}
            <rect x="0" y="15" width="160" height="42" fill="rgba(255,255,255,0.97)"
              style={{ filter: 'drop-shadow(0 3px 12px rgba(0,0,0,0.18))' } as React.CSSProperties} />

            {/* Box 1 — จุดส่ง */}
            <rect x="4" y="20" width="73" height="32" rx="7" fill="#f0fdf4" stroke="#6ee7b7" strokeWidth="1.5" />
            <circle cx="15" cy="32" r="4.5" fill="#059669" />
            <circle cx="15" cy="32" r="2" fill="#fff" />
            <text x="23" y="29.5" fontSize="4.5" fill="#6b7280" fontWeight="600" fontFamily="Inter,sans-serif">จุดส่ง</text>
            <text x="23" y="39" fontSize="7" fill="#059669" fontWeight="800" fontFamily="Inter,sans-serif">ไทย (TH)</text>
            <rect x="7" y="43" width="67" height="7" rx="3" fill="#d1fae5" />
            <text x="40" y="49" textAnchor="middle" fontSize="4.5" fill="#065f46" fontWeight="700" fontFamily="Inter,sans-serif">✓ ยืนยันแล้ว</text>

            {/* Box 2 — จุดรับ */}
            <rect x="83" y="20" width="73" height="32" rx="7" fill="#fff5f5" stroke="#fca5a5" strokeWidth="1.5" />
            <circle cx="94" cy="32" r="4.5" fill="#d40511" />
            <text x="94" y="36" textAnchor="middle" fontSize="6" fill="#fff" fontWeight="900" fontFamily="Inter,sans-serif">?</text>
            <text x="102" y="29.5" fontSize="4.5" fill="#6b7280" fontWeight="600" fontFamily="Inter,sans-serif">จุดรับ</text>
            <text x="102" y="39" fontSize="6.5" fill="#9ca3af" fontWeight="700" fontFamily="Inter,sans-serif">เลือกประเทศ</text>
            <rect x="86" y="43" width="67" height="7" rx="3" fill="#fee2e2" />
            <text x="119" y="49" textAnchor="middle" fontSize="4.5" fill="#b91c1c" fontWeight="700" fontFamily="Inter,sans-serif">กดเพื่อเลือก →</text>

            {/* ── BOTTOM ACTION BUTTON ── */}
            <rect x="0" y="228" width="160" height="34" fill="rgba(255,255,255,0.95)"
              style={{ filter: 'drop-shadow(0 -2px 10px rgba(0,0,0,0.1))' } as React.CSSProperties} />
            <rect x="10" y="232" width="140" height="24" rx="8" fill="#059669"
              style={{ filter: 'drop-shadow(0 3px 10px rgba(5,150,105,0.4))' } as React.CSSProperties} />
            <text x="80" y="248" textAnchor="middle" fontSize="8" fill="#fff" fontWeight="800" fontFamily="Inter,sans-serif">ดำเนินการต่อ →</text>


          </svg>
        </div>
      ),
    },
    {
      title: 'กรอกข้อมูลพัสดุ',
      sub: 'ง่าย แม่นยำ ใน 3 ขั้นตอน',
      color: '#059669',
      desc: 'กรอกน้ำหนัก ถ่ายภาพกล่องพัสดุ และกรอกข้อมูลผู้รับให้ถูกต้อง — ระบบจะคำนวณ CO₂ ที่คุณช่วยโลกประหยัดได้ทันที',
      screen: (
        <div key="s1" style={{ padding: '6px 4px' }}>
          {/* Step indicators */}
          <div style={{ display: 'flex', gap: 3, marginBottom: 8 }}>
            {['น้ำหนัก', 'ภาพกล่อง', 'ข้อมูลผู้รับ'].map((l, i) => (
              <div key={i} style={{ flex: 1, textAlign: 'center' as const }}>
                <div style={{ width: 20, height: 20, borderRadius: 10, background: i === 0 ? '#059669' : i === 1 ? '#fbbf24' : '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 3px' }}>
                  <span style={{ fontSize: '0.45rem', fontWeight: 900, color: i < 2 ? '#fff' : '#9ca3af' }}>{i + 1}</span>
                </div>
                <div style={{ fontSize: '0.4rem', color: i === 0 ? '#059669' : i === 1 ? '#f59e0b' : '#9ca3af', fontWeight: 700 }}>{l}</div>
              </div>
            ))}
          </div>
          {/* Weight input mockup */}
          <div style={{ background: '#f0fdf4', borderRadius: 8, padding: '7px 8px', marginBottom: 6, border: '1.5px solid #059669' }}>
            <div style={{ fontSize: '0.42rem', color: '#059669', fontWeight: 700, marginBottom: 3 }}>น้ำหนักพัสดุ (กก.)</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ flex: 1, background: '#fff', borderRadius: 5, padding: '4px 7px', border: '1px solid #6ee7b7' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 900, color: '#111' }}>2.5</span>
              </div>
              <span style={{ fontSize: '0.42rem', color: '#6b7280' }}>กก.</span>
            </div>
          </div>
          {/* Camera mockup — white bg, gray border */}
          <div style={{ background: '#f9fafb', border: '1.5px solid #e5e7eb', borderRadius: 8, padding: '12px 10px', marginBottom: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 26, height: 26, borderRadius: 13, background: '#fff', border: '2px solid #d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
              <div style={{ width: 12, height: 12, borderRadius: 6, background: '#9ca3af' }} />
            </div>
            <span style={{ fontSize: '0.42rem', color: '#6b7280', fontWeight: 600 }}>ถ่ายภาพกล่องพัสดุ</span>
          </div>
          {/* Receiver form */}
          <div style={{ background: '#fff', borderRadius: 8, padding: '7px 8px', border: '1px solid #e5e7eb' }}>
            <div style={{ fontSize: '0.42rem', color: '#9ca3af', fontWeight: 700, marginBottom: 5 }}>ข้อมูลผู้รับ</div>
            {['ชื่อผู้รับ', 'ที่อยู่', 'รหัสไปรษณีย์'].map((ph, i) => (
              <div key={i} style={{ background: '#f9fafb', borderRadius: 5, padding: '4px 6px', marginBottom: i < 2 ? 4 : 0, border: '1px solid #f0f0f0' }}>
                <span style={{ fontSize: '0.42rem', color: '#d1d5db' }}>{ph}</span>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: 'รับใบยืนยันและติดตามพัสดุ',
      sub: 'ครบ ทุกขั้นตอน ในชั่วเดียว',
      color: '#059669',
      desc: 'ระบบจะออกรหัสติดตามพัสดุ และคำนวณคาร์บอนที่คุณช่วยโลกประหยัดได้ทันที — เพราะทุกแพ็คเกจที่คุณส่ง คือครั้งที่โลกดีขึ้นอีกนิด',
      screen: (
        <div style={{ padding: '8px 6px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, paddingTop: 6 }}>
            <div style={{ width: 42, height: 42, borderRadius: 21, background: 'linear-gradient(135deg,#059669,#34d399)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(5,150,105,0.4)' }}>
              <svg viewBox="0 0 24 24" width="22" height="22"><polyline points="5,12 10,17 19,7" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <div style={{ fontSize: '0.6rem', fontWeight: 900, color: '#059669', textAlign: 'center' as const }}>ดำเนินการเสร็จสมบูรณ์!</div>
          </div>
          {/* Tracking number — no inline arrow, annotation is outside phone */}
          <div style={{ background: '#f0fdf4', border: '1.5px solid #6ee7b7', borderRadius: 10, padding: '7px 10px', textAlign: 'center' as const }}>
            <div style={{ fontSize: '0.4rem', color: '#059669', fontWeight: 700, marginBottom: 3, letterSpacing: '1px' }}>TRACKING NUMBER</div>
            <div style={{ fontSize: '0.72rem', fontWeight: 900, color: '#111', letterSpacing: '1.5px', fontFamily: 'monospace' }}>DHL-TH-7829044</div>
          </div>
          <div style={{ background: 'linear-gradient(135deg,#064e3b,#059669)', borderRadius: 10, padding: '8px 10px', textAlign: 'center' as const }}>
            <div style={{ fontSize: '0.38rem', color: 'rgba(255,255,255,0.7)', marginBottom: 2 }}>CO₂ ที่คุณช่วยโลกประหยัดได้</div>
            <div style={{ fontSize: '1rem', fontWeight: 900, color: '#fff', lineHeight: 1 }}>2.4 kg</div>
            <div style={{ fontSize: '0.36rem', color: 'rgba(255,255,255,0.65)', marginTop: 2 }}>เทียบเท่าต้นไม้ 0.4 ต้น</div>
          </div>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '7px 8px' }}>
            {[{ l: 'รับพัสดุแล้ว', c: '#059669', t: 'สาขา BKK' }, { l: 'อยู่ระหว่างขนส่ง', c: '#f59e0b', t: 'HKG Hub' }, { l: 'รอเดลิเวอรี่', c: '#d1d5db', t: 'ปลายทาง' }].map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, paddingBottom: i < 2 ? 4 : 0 }}>
                <div style={{ width: 6, height: 6, borderRadius: 3, background: s.c, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.42rem', fontWeight: 700, color: i === 2 ? '#9ca3af' : '#111' }}>{s.l}</div>
                  <div style={{ fontSize: '0.36rem', color: '#9ca3af' }}>{s.t}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
  ];

  const cur = steps[step];
  const frameW = isWide ? 290 : 185;
  const frameH = isWide ? 420 : 370;
  const frameRadius = isWide ? 28 : 38;
  const borderW = isWide ? 7 : 5;

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: F, background: 'linear-gradient(160deg,#022c22 0%,#064e3b 45%,#065f46 80%,#047857 100%)', overflow: 'hidden' }}>
      <style>{G}</style>

      {/* Top bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px 0', flexShrink: 0 }}>
        <Btn ghost onClick={onBack} style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 10, padding: '7px 16px', fontSize: '0.85rem', fontWeight: 700, color: 'rgba(255,255,255,0.9)', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}>
          ข้าม
        </Btn>
        <div style={{ display: 'flex', gap: 6 }}>
          {Array.from({ length: TOTAL }).map((_, i) => (
            <div key={i} style={{ width: i === step ? 18 : 7, height: 7, borderRadius: 4, background: i === step ? '#34d399' : 'rgba(255,255,255,0.3)', transition: 'all .25s ease' }} />
          ))}
        </div>
      </div>

      {/* Title + desc */}
      <div key={`desc-${step}`} style={{ padding: '14px 24px 8px', flexShrink: 0, animation: 'gp-up .3s ease' }}>
        <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '1.5px', textTransform: 'uppercase' as const, marginBottom: 4 }}>{cur.sub}</div>
        <div style={{ color: '#ffffff', fontSize: '1.2rem', fontWeight: 900, lineHeight: 1.2, marginBottom: 6 }}>
          {cur.title}
        </div>
        <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.82rem', lineHeight: 1.6 }}>{cur.desc}</div>
      </div>

      {/* Device mockup */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 20px 6px', overflow: 'hidden', position: 'relative' }}>
        <div style={{
          width: frameW,
          height: frameH,
          maxHeight: 'calc(100vh - 280px)',
          background: '#111',
          borderRadius: frameRadius,
          boxShadow: '0 24px 64px rgba(0,0,0,0.40), 0 4px 16px rgba(0,0,0,0.25), inset 0 0 0 1px rgba(255,255,255,0.08)',
          border: `${borderW}px solid #222`,
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden', flexShrink: 0,
        }}>
          {/* Notch only */}
          <div style={{ background: '#0a0a0a', padding: '6px 0 4px', display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
            <div style={{ width: isWide ? 70 : 48, height: isWide ? 10 : 8, borderRadius: 8, background: '#1a1a1a', border: '1px solid #2a2a2a' }} />
          </div>
          {/* Green top bar — all steps */}
          <div style={{ background: '#059669', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
            <div style={{ width: 5, height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.7)' }} />
            <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.52rem', fontWeight: 700 }}>
              {step === 0 ? 'เลือกจุดส่ง / จุดรับ' : step === 1 ? 'กรอกข้อมูลพัสดุ' : 'สำเร็จแล้ว'}
            </span>
          </div>
          {/* Content */}
          <div key={`phone-${step}`} style={{ flex: 1, padding: step === 0 ? 0 : '10px', background: step === 0 ? '#022c22' : '#fff', overflowY: step === 0 ? 'hidden' : 'auto', animation: 'gp-up .25s ease', position: 'relative' }}>
            {cur.screen}
          </div>
          {/* Home indicator */}
          <div style={{ background: '#111', padding: '5px 0', display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
            <div style={{ width: isWide ? 56 : 36, height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.25)' }} />
          </div>
        </div>
      </div>
      {/* External annotation for step 2 — label + arrow pointing into phone */}
      {step === 2 && (
        <div style={{
          position: 'absolute',
          right: isWide ? 'calc(50% - 210px)' : '8px',
          top: isWide ? '46%' : '48%',
          display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2,
          pointerEvents: 'none', zIndex: 10,
        }}>
          <div style={{ background: 'rgba(5,150,105,0.95)', backdropFilter: 'blur(8px)', color: '#fff', fontSize: '0.75rem', fontWeight: 800, borderRadius: 10, padding: '6px 10px', boxShadow: '0 4px 16px rgba(5,150,105,0.35)', whiteSpace: 'nowrap' as const, border: '1px solid rgba(52,211,153,0.4)' }}>รหัสติดตามพัสดุ</div>
          <svg width="30" height="28" viewBox="0 0 30 28" style={{ display: 'block', alignSelf: 'flex-start', marginLeft: 6 }}>
            <path d="M28,2 C28,16 10,16 4,24" fill="none" stroke="#34d399" strokeWidth="2.2" strokeLinecap="round" />
            <polygon points="4,24 10,20 2,20" fill="#34d399" />
          </svg>
        </div>
      )}

      {/* Bottom card */}
      <div style={{ background: 'rgba(2,44,34,0.85)', backdropFilter: 'blur(16px)', borderTop: '1px solid rgba(52,211,153,0.2)', padding: '18px 20px 40px', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <Btn ghost onClick={() => { if (step === 0) onBack(); else setStep(s => s - 1); }} style={{ flex: 1, padding: '13px 0', border: '1.5px solid rgba(52,211,153,0.5)', borderRadius: 12, color: 'rgba(255,255,255,0.85)', fontSize: '0.92rem', fontWeight: 700, textAlign: 'center' as const }}>
            ย้อนกลับ
          </Btn>
          {step < TOTAL - 1 ? (
            <Btn onClick={() => setStep(s => s + 1)} style={{ flex: 2, padding: '13px 0', background: 'linear-gradient(135deg,#059669,#34d399)', borderRadius: 12, color: '#fff', fontSize: '0.92rem', fontWeight: 700, textAlign: 'center' as const, boxShadow: '0 4px 20px rgba(5,150,105,0.5)' }}>
              ต่อไป
            </Btn>
          ) : (
            <Btn onClick={onNext} style={{ flex: 2, padding: '13px 0', background: 'linear-gradient(135deg,#059669,#34d399)', borderRadius: 12, color: '#fff', fontSize: '0.92rem', fontWeight: 700, textAlign: 'center' as const, boxShadow: '0 4px 20px rgba(5,150,105,0.5)' }}>
              เริ่มเลย
            </Btn>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STATS SCREEN
═══════════════════════════════════════════════════════════════ */
// eslint-disable-next-line
export function StatsScreen({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [anim, setAnim] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnim(true), 100); return () => clearTimeout(t); }, []);

  const stats = [
    { label: 'ส่งของทั้งหมด', value: '47', unit: 'ครั้ง', icon: '📦', color: '#1d4ed8' },
    { label: 'ใช้ Green Passport', value: '12', unit: 'ครั้ง', icon: '🌿', color: GREEN },
    { label: 'ประเทศที่ส่งถึง', value: '8', unit: 'ประเทศ', icon: '✈️', color: '#7c3aed' },
    { label: 'CO₂ ที่ลดได้', value: '24.6', unit: 'kg', icon: '🌍', color: '#059669' },
  ];

  const badges = [
    { id: 1, icon: '🌱', bg: '#dcfce7', name: 'First Green', desc: 'ส่งด้วย Green Passport ครั้งแรก', locked: false },
    { id: 2, icon: '✈️', bg: '#ede9fe', name: 'World Sender', desc: 'ส่งไป 5 ประเทศขึ้นไป', locked: false },
    { id: 3, icon: '🏆', bg: '#fef9c3', name: 'Top 10%', desc: 'ติด Top 10% ในไทย', locked: true },
    { id: 4, icon: '🌍', bg: '#dbeafe', name: 'Carbon Hero', desc: 'ลด CO₂ ได้ 50 kg+', locked: true },
  ];

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: F, background: '#f8fafc', overflow: 'hidden' }}>
      <style>{G}</style>

      {/* Header */}
      <div style={{ background: `linear-gradient(135deg,${D1} 0%,${GREEN} 100%)`, padding: '20px 20px 32px', flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
        <div style={{ opacity: 0.3, position: 'absolute', inset: 0 }}><MapBg /></div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Btn ghost onClick={onBack} style={{ color: 'rgba(255,255,255,.8)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 16 }}>
            <ArrowLeft size={15} /> ย้อนกลับ
          </Btn>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,.6)', letterSpacing: '1.5px', textTransform: 'uppercase' as const, marginBottom: 6 }}>GoGreen Plus</div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', margin: '0 0 4px', letterSpacing: '-0.5px' }}>สถิติของคุณ</h1>
          <p style={{ color: 'rgba(255,255,255,.7)', fontSize: '0.85rem', margin: 0 }}>ข้อมูลการส่งพัสดุและผลกระทบต่อสิ่งแวดล้อม</p>
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px 0' }} className="gp-scroll">

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          {stats.map((s, i) => (
            <div key={i} style={{
              background: '#fff', borderRadius: 18, padding: '18px 16px',
              border: '1px solid #f0f0f0',
              boxShadow: '0 2px 12px rgba(0,0,0,.05)',
              opacity: anim ? 1 : 0,
              transform: anim ? 'translateY(0)' : 'translateY(16px)',
              transition: `all .5s ease ${i * 0.08}s`,
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: 10 }}>{s.icon}</div>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: s.color, lineHeight: 1, letterSpacing: '-1px' }}>{s.value}</div>
              <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: 2, fontWeight: 600 }}>{s.unit}</div>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#374151', marginTop: 6 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Leaderboard card */}
        <div style={{
          background: `linear-gradient(135deg,${GREEN} 0%,#34d399 100%)`,
          borderRadius: 18, padding: '20px', marginBottom: 16,
          opacity: anim ? 1 : 0, transform: anim ? 'translateY(0)' : 'translateY(16px)',
          transition: 'all .5s ease .35s', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', right: -10, top: -10, fontSize: '4rem', opacity: 0.15 }}>🏆</div>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,.75)', letterSpacing: '1.5px', textTransform: 'uppercase' as const, marginBottom: 6 }}>Thailand Ranking</div>
          <div style={{ fontSize: '2.8rem', fontWeight: 900, color: '#fff', lineHeight: 1, marginBottom: 4 }}>Top 8%</div>
          <div style={{ color: 'rgba(255,255,255,.85)', fontSize: '0.88rem' }}>คุณอยู่ใน Top 8% ของผู้ใช้ Green Passport<br />ในประเทศไทย <img src="https://flagcdn.com/w40/th.png" alt="TH" width={16} height={11} style={{ borderRadius: 2, objectFit: 'cover', verticalAlign: 'middle' }} /></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14 }}>
            <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,.2)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: '92%', height: '100%', background: '#fff', borderRadius: 3, opacity: 0.9 }} />
            </div>
            <span style={{ color: 'rgba(255,255,255,.8)', fontSize: '0.72rem', fontWeight: 700, whiteSpace: 'nowrap' as const }}>92/100</span>
          </div>
        </div>

        {/* Monthly carbon trend */}
        <div style={{
          background: '#fff', borderRadius: 18, padding: '18px 16px', marginBottom: 16,
          border: '1px solid #f0f0f0', boxShadow: '0 2px 12px rgba(0,0,0,.05)',
          opacity: anim ? 1 : 0, transform: anim ? 'translateY(0)' : 'translateY(16px)',
          transition: 'all .5s ease .45s',
        }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9ca3af', letterSpacing: '1px', textTransform: 'uppercase' as const, marginBottom: 12 }}>CO₂ ที่ลดได้รายเดือน</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 60 }}>
            {[3.2, 5.1, 2.8, 7.4, 6.0, 24.6].map((v, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ width: '100%', background: i === 5 ? GREEN : `${GREEN}30`, borderRadius: 4, height: `${(v / 24.6) * 52}px`, transition: `height .6s ease ${.5 + i * .08}s` }} />
                <div style={{ fontSize: '0.55rem', color: '#9ca3af' }}>{['ม.ค', 'ก.พ', 'มี.ค', 'เม.ย', 'พ.ค', 'มิ.ย'][i]}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Badges section */}
        <div style={{
          background: '#fff', borderRadius: 18, padding: '18px 16px', marginBottom: 24,
          border: '1px solid #f0f0f0', boxShadow: '0 2px 12px rgba(0,0,0,.05)',
          opacity: anim ? 1 : 0, transform: anim ? 'translateY(0)' : 'translateY(16px)',
          transition: 'all .5s ease .55s',
        }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#9ca3af', letterSpacing: '1.5px', textTransform: 'uppercase' as const, marginBottom: 4 }}>ACHIEVEMENTS</div>
          <div style={{ fontSize: '1rem', fontWeight: 800, color: '#111', marginBottom: 14 }}>Badges ของคุณ</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {badges.map(badge => (
              <div key={badge.id} style={{
                borderRadius: 14, border: '1.5px solid #f3f4f6', padding: '14px 12px',
                display: 'flex', flexDirection: 'column', gap: 8,
                opacity: badge.locked ? 0.5 : 1,
                background: badge.locked ? '#fafafa' : '#fff',
                position: 'relative',
              }}>
                <div style={{ position: 'absolute', top: 10, right: 10 }}>
                  {badge.locked
                    ? <span style={{ fontSize: '0.6rem', color: '#d1d5db' }}>🔒</span>
                    : <span style={{ background: '#111', color: '#fff', fontSize: '0.6rem', fontWeight: 700, padding: '2px 7px', borderRadius: 20 }}>OPEN</span>
                  }
                </div>
                <div style={{ width: 40, height: 40, borderRadius: 11, background: badge.locked ? '#e5e7eb' : badge.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', opacity: badge.locked ? 0.45 : 1 }}>
                  {badge.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.82rem', color: badge.locked ? '#9ca3af' : '#111', marginBottom: 2 }}>{badge.name}</div>
                  <div style={{ fontSize: '0.68rem', color: '#9ca3af', lineHeight: 1.4 }}>{badge.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* CTA */}
      <div style={{ padding: '16px 20px 40px', background: '#fff', borderTop: '1px solid #f0f0f0', flexShrink: 0 }}>
        <Btn onClick={onNext} style={{
          width: '100%', padding: '16px', borderRadius: 14, background: GREEN, color: '#fff',
          fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          boxShadow: `0 6px 20px ${GREEN}40`,
        }}>
          จำลองเส้นทางใหม่ <ArrowRight size={18} />
        </Btn>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAP
═══════════════════════════════════════════════════════════════ */
export function MapScreen({
  // eslint-disable-next-line
  senderSpot, setSenderSpot, receiverSpot, setReceiverSpot,
  pickingFor, setPickingFor, onBack, onNext,
}: {
  senderSpot: number | null; setSenderSpot: (id: number) => void;
  receiverSpot: number | null; setReceiverSpot: (id: number) => void;
  pickingFor: 'sender' | 'receiver'; setPickingFor: (v: 'sender' | 'receiver') => void;
  onBack: () => void; onNext: () => void;
}) {
  const selId = pickingFor === 'sender' ? senderSpot : receiverSpot;
  const setSel = (id: number) => pickingFor === 'sender' ? setSenderSpot(id) : setReceiverSpot(id);
  const canGo = selId !== null;
  const doNext = () => pickingFor === 'sender' ? setPickingFor('receiver') : onNext();

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: F }}>
      <style>{G}</style>

      {/* Header */}
      <div style={{ background: '#fff', padding: '14px 20px', borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <Btn ghost onClick={onBack} style={{ background: '#f3f4f6', border: `1px solid ${C.border}`, borderRadius: 10, padding: '8px 10px', display: 'flex', alignItems: 'center' }}>
            <ArrowLeft size={18} color={C.text} />
          </Btn>
          <div>
            <div style={{ fontSize: '0.63rem', color: C.text3, letterSpacing: '1px', fontWeight: 600 }}>ขั้นตอน {pickingFor === 'sender' ? '1' : '2'} / 2</div>
            <div style={{ color: C.text, fontWeight: 700, fontSize: '0.96rem' }}>{pickingFor === 'sender' ? 'เลือกสาขาต้นทาง' : 'เลือกสาขาปลายทาง'}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['sender', 'receiver'] as const).map(type => {
            const id = type === 'sender' ? senderSpot : receiverSpot;
            const spot = DHL_SPOTS.find(s => s.id === id);
            const isAct = pickingFor === type;
            return (
              <Btn ghost key={type} onClick={() => setPickingFor(type)} style={{ flex: 1, padding: '8px 12px', borderRadius: 10, textAlign: 'left' as const, border: `1.5px solid ${isAct ? GREEN : C.border}`, background: isAct ? GREEN_BG : '#f9fafb' }}>
                <div style={{ fontSize: '0.58rem', color: isAct ? GREEN : C.text3, fontWeight: 700, letterSpacing: '.5px' }}>{type === 'sender' ? 'ต้นทาง' : 'ปลายทาง'}</div>
                <div style={{ fontSize: '0.8rem', color: spot ? C.text : C.text3, fontWeight: 600, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{spot ? spot.name : 'ยังไม่เลือก'}</div>
              </Btn>
            );
          })}
        </div>
      </div>

      {/* Map flex-1 */}
      <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
        <MapContainer center={USER_POS} zoom={12} style={{ height: '100%', width: '100%' }} zoomControl={false}>
          <TileLayer attribution='&copy; CartoDB' url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
          <Marker position={USER_POS} icon={userIcon}><Popup>คุณอยู่ที่นี่</Popup></Marker>
          {DHL_SPOTS.map(s => (
            <Marker key={s.id} position={[s.lat, s.lng]} icon={spotIcon(selId === s.id)} eventHandlers={{ click: () => setSel(s.id) }}>
              <Popup>{s.name}</Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* List */}
      <div style={{ background: '#fff', borderTop: `1px solid ${C.border}`, maxHeight: 180, overflowY: 'auto', flexShrink: 0 }} className="gp-scroll">
        {DHL_SPOTS.map(s => {
          const sel = selId === s.id;
          return (
            <div key={s.id} onClick={() => setSel(s.id)} className="gp-card" style={{ display: 'flex', alignItems: 'center', padding: '12px 20px', borderBottom: `1px solid ${C.border}`, background: sel ? GREEN_BG : '#fff', cursor: 'pointer' }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: sel ? GREEN : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 14, flexShrink: 0 }}>
                <MapPin size={16} color={sel ? '#fff' : '#aaa'} strokeWidth={1.8} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: C.text }}>{s.name}</div>
                <div style={{ fontSize: '0.72rem', color: C.text3, marginTop: 2 }}>{s.address}</div>
              </div>
              {sel && <Check size={18} color={GREEN} strokeWidth={2.5} />}
            </div>
          );
        })}
      </div>

      {/* Fixed CTA */}
      <div style={{ padding: '12px 20px 32px', background: '#fff', borderTop: `1px solid ${C.border}`, flexShrink: 0 }}>
        <Btn onClick={doNext} disabled={!canGo} style={{
          width: '100%', padding: 16, borderRadius: 14,
          background: canGo ? GREEN : '#f3f4f6', color: canGo ? '#fff' : C.text3,
          fontSize: '0.96rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          boxShadow: canGo ? `0 4px 16px ${GREEN}35` : 'none', transition: 'all .25s ease',
        }}>
          {pickingFor === 'sender' ? 'ถัดไป — เลือกปลายทาง' : 'คำนวณ CO₂'} <ArrowRight size={18} />
        </Btn>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SHARE MODAL MAP BACKGROUND
═══════════════════════════════════════════════════════════════ */
function ModalMapBg() {
  return (
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      viewBox="0 30 300 215" preserveAspectRatio="xMidYMid slice">
      {/* Asia Landmass */}
      <path d="M 0 30 L 0 245 L 80 245 C 90 230, 85 210, 100 190 C 110 170, 130 150, 140 130 C 150 110, 165 100, 180 90 C 190 80, 195 70, 185 50 C 180 40, 170 30, 160 30 Z"
        fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      {/* Korea Peninsula */}
      <path d="M 180 90 C 190 95, 200 100, 195 105 C 190 100, 180 95, 180 90 Z"
        fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
      {/* Japan */}
      <path d="M 200 30 C 215 35, 225 50, 215 60 C 205 55, 195 40, 200 30 Z"
        fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
      {/* Taiwan / Islands */}
      <path d="M 160 120 C 165 125, 160 130, 155 125 Z"
        fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SHARE MODAL — Strava-style delivery route card
═══════════════════════════════════════════════════════════════ */
function ShareModal({
  co2, routes, score, senderName, onClose,
}: { co2: number; routes: number; score: number; senderName: string; onClose: () => void; }) {
  const [drawn, setDrawn] = useState(false);
  useEffect(() => { const t = setTimeout(() => setDrawn(true), 120); return () => clearTimeout(t); }, []);

  const path1 = "M 90 230 C 105 205, 125 210, 138 188 C 150 168, 142 150, 155 130 C 168 110, 185 118, 195 96 C 205 76, 198 58, 212 42";
  const path2 = "M 90 230 C 115 218, 128 222, 148 205 C 165 190, 158 172, 172 152 C 184 134, 200 138, 212 118 C 222 100, 215 82, 228 66 C 238 52, 248 56, 258 42";
  const LEN = 480;

  /* Helper to generate image on canvas */
  const generateCanvas = (transparent: boolean) => {
    const canvas = document.createElement('canvas');
    canvas.width = 640; canvas.height = 800;
    const ctx = canvas.getContext('2d')!;
    /* Background - transparent for camera, dark green for normal */
    if (transparent) {
      ctx.clearRect(0, 0, 640, 800);
    } else {
      ctx.fillStyle = '#0d2418';
      ctx.roundRect(0, 0, 640, 800, 32);
      ctx.fill();
    }
    /* Draw Routes and Map on canvas */
    ctx.save();
    // The route SVG uses viewBox="0 30 300 215".
    // Let's place it on the canvas around x: 300, y: 150, width: 300, height: 215 (scaled up)
    // Scale by 1.8 to fit nicely in the right/bottom area
    const scale = 1.8;
    const dx = 280;
    const dy = 320;
    ctx.translate(dx, dy);
    ctx.scale(scale, scale);
    ctx.translate(0, -30); // Offset viewBox Y

    // Draw Map Coastlines
    ctx.fillStyle = transparent ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)';
    ctx.strokeStyle = transparent ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    const mapPaths = [
      "M 0 30 L 0 245 L 80 245 C 90 230, 85 210, 100 190 C 110 170, 130 150, 140 130 C 150 110, 165 100, 180 90 C 190 80, 195 70, 185 50 C 180 40, 170 30, 160 30 Z",
      "M 180 90 C 190 95, 200 100, 195 105 C 190 100, 180 95, 180 90 Z",
      "M 200 30 C 215 35, 225 50, 215 60 C 205 55, 195 40, 200 30 Z",
      "M 160 120 C 165 125, 160 130, 155 125 Z"
    ];
    mapPaths.forEach(p => {
      const path2d = new Path2D(p);
      ctx.fill(path2d);
      ctx.stroke(path2d);
    });

    // Draw Routes
    ctx.lineCap = 'round';

    // Path 1 Glow
    ctx.strokeStyle = `${GREEN}40`;
    ctx.lineWidth = 7;
    ctx.stroke(new Path2D(path1));
    // Path 2 Glow
    ctx.strokeStyle = `${GREEN}30`;
    ctx.stroke(new Path2D(path2));

    // Path 1 Line
    ctx.strokeStyle = GREEN_LIGHT;
    ctx.lineWidth = 2.5;
    ctx.stroke(new Path2D(path1));
    // Path 2 Line
    ctx.strokeStyle = GREEN;
    ctx.lineWidth = 2;
    ctx.stroke(new Path2D(path2));

    // Draw Dots
    const dots = [
      { cx: 90, cy: 230, l: 'BKK' },
      { cx: 155, cy: 130, l: 'HKG' },
      { cx: 195, cy: 96, l: 'ICN' },
      { cx: 212, cy: 42, l: 'NRT' },
    ];

    dots.forEach(c => {
      // Glow dot
      ctx.beginPath();
      ctx.arc(c.cx, c.cy, 5, 0, Math.PI * 2);
      ctx.fillStyle = GREEN_LIGHT;
      ctx.fill();

      // White inner dot
      ctx.beginPath();
      ctx.arc(c.cx, c.cy, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();

      // Label
      if (transparent) {
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 4;
      }
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.font = '700 8px Inter, sans-serif';
      ctx.fillText(c.l, c.cx + 9, c.cy + 4);
      if (transparent) ctx.shadowBlur = 0;
    });

    ctx.restore();

    /* Header text */
    ctx.fillStyle = transparent ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.35)';
    ctx.font = '500 22px Inter, sans-serif';
    ctx.fillText('CO₂ Saved', 48, 80);
    // Draw text with shadow for better visibility on camera
    if (transparent) {
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 2;
    }
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 96px Inter, sans-serif';
    ctx.fillText(`${co2} kg`, 48, 170);

    ctx.shadowBlur = 0;
    ctx.fillStyle = transparent ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.35)';
    ctx.font = '500 22px Inter, sans-serif';
    ctx.fillText('Routes', 48, 230);

    if (transparent) {
      ctx.shadowBlur = 10;
    }
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 72px Inter, sans-serif';
    ctx.fillText(`${routes} trips`, 48, 306);

    ctx.shadowBlur = 0;
    ctx.fillStyle = transparent ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.35)';
    ctx.font = '500 22px Inter, sans-serif';
    ctx.fillText('Eco Score', 48, 360);

    if (transparent) {
      ctx.shadowBlur = 10;
    }
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 72px Inter, sans-serif';
    ctx.fillText(`${score.toLocaleString()} pts`, 48, 436);

    ctx.shadowBlur = 0;
    /* Brand */
    ctx.fillStyle = '#4ade80';
    ctx.font = '700 28px Inter, sans-serif';
    ctx.fillText('DHL GoGreen Plus', 48, 740);
    ctx.fillStyle = transparent ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.25)';
    ctx.font = '500 20px Inter, sans-serif';
    ctx.fillText(`#${senderName.slice(-6).replace(' ', '')}-ECO`, 48, 775);

    return canvas;
  };

  /* Save image to device using canvas */
  const handleSaveImage = () => {
    const canvas = generateCanvas(false);
    /* Download */
    const link = document.createElement('a');
    link.download = 'gogreen-wrapped.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  /* Native Share (Instagram, Facebook, etc.) */
  const handleNativeShare = async () => {
    try {
      const canvas = generateCanvas(false);
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], 'gogreen-wrapped.png', { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'My Green Passport',
            text: 'ดูเส้นทางรักษ์โลกของฉันกับ DHL GoGreen Plus!',
            files: [file],
          });
        } else {
          // Fallback if browser doesn't support sharing files
          alert('เบราว์เซอร์ของคุณไม่รองรับการแชร์รูปภาพโดยตรง กรุณากด "บันทึกรูปภาพ" แล้วนำไปโพสต์ต่อ');
        }
      }, 'image/png');
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  // Camera Overlay Mode
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    if (showCamera) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(s => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }
        })
        .catch(() => {
          alert('ไม่สามารถเข้าถึงกล้องได้ กรุณาอนุญาตให้ใช้งานกล้อง');
          setShowCamera(false);
        });
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
    };
  }, [showCamera]);

  const handleCapture = () => {
    if (!videoRef.current) return;
    const v = videoRef.current;

    // Create final combined canvas
    const canvas = document.createElement('canvas');
    canvas.width = v.videoWidth;
    canvas.height = v.videoHeight;
    const ctx = canvas.getContext('2d')!;

    // Draw camera frame
    ctx.drawImage(v, 0, 0, canvas.width, canvas.height);

    // Generate transparent stats overlay and draw over camera
    // Calculate aspect ratio to fit the stats nicely
    const overlay = generateCanvas(true);

    // Draw overlay on bottom half or centered, here we scale it to fit
    const targetWidth = canvas.width * 0.85;
    const targetHeight = (overlay.height / overlay.width) * targetWidth;
    const x = (canvas.width - targetWidth) / 2;
    const y = canvas.height - targetHeight - 40; // 40px from bottom

    ctx.drawImage(overlay, x, y, targetWidth, targetHeight);

    // Download
    const link = document.createElement('a');
    link.download = 'gogreen-ar-wrapped.png';
    link.href = canvas.toDataURL('image/png');
    link.click();

    // Close camera
    setShowCamera(false);
  };

  if (showCamera) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#000', display: 'flex', flexDirection: 'column' }}>
        {/* Fullscreen Video */}
        <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />

        {/* Transparent Overlay Preview (simulating what gets captured) */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '40px 20px 140px' }}>
          <div style={{ transformOrigin: 'bottom left', transform: 'scale(0.8)' }}>
            <div style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.8)', fontWeight: 500, textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>CO₂ Saved</div>
            <div style={{ fontSize: '4.2rem', fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: '-1px', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>{co2} kg</div>

            <div style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.8)', fontWeight: 500, textShadow: '0 2px 8px rgba(0,0,0,0.5)', marginTop: 14 }}>Routes</div>
            <div style={{ fontSize: '3.2rem', fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: '-1px', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>{routes} trips</div>

            <div style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.8)', fontWeight: 500, textShadow: '0 2px 8px rgba(0,0,0,0.5)', marginTop: 14 }}>Eco Score</div>
            <div style={{ fontSize: '3.2rem', fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: '-1px', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>{score.toLocaleString()} pts</div>

            <div style={{ marginTop: 40, color: '#4ade80', fontSize: '1.4rem', fontWeight: 700, textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>DHL GoGreen Plus</div>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1rem', fontWeight: 500, textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>#{senderName.slice(-6).replace(' ', '')}-ECO</div>
          </div>
        </div>

        {/* Camera Controls */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 120, background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 30px' }}>
          <button onClick={() => setShowCamera(false)} style={{ width: 50, height: 50, borderRadius: 25, background: 'rgba(255,255,255,.15)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
            <X size={24} color="#fff" />
          </button>

          {/* Shutter Button */}
          <button onClick={handleCapture} style={{ width: 76, height: 76, borderRadius: 38, background: 'rgba(255,255,255,0.3)', border: '4px solid #fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: 28, background: '#fff' }} />
          </button>

          <div style={{ width: 50 }} /> {/* Spacer */}
        </div>
      </div>
    );
  }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,.78)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', gap: 14 }}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 340, borderRadius: 24, overflow: 'hidden', animation: 'gp-modal-in .3s cubic-bezier(.34,1.4,.64,1)' }}>

        {/* Dark card */}
        <div style={{ background: D1, padding: '24px 22px 0', position: 'relative' }}>

          {/* Stats — compact horizontal */}
          <div style={{ display: 'flex', gap: 0, marginBottom: 20 }}>
            {[
              { label: 'CO₂ Saved', value: `${co2}`, unit: 'kg' },
              { label: 'Routes', value: `${routes}`, unit: 'trips' },
              { label: 'Eco Score', value: `${score.toLocaleString()}`, unit: 'pts' },
            ].map((s, i) => (
              <div key={i} style={{ flex: 1, borderRight: i < 2 ? '1px solid rgba(255,255,255,.07)' : 'none', paddingRight: i < 2 ? 10 : 0, paddingLeft: i > 0 ? 10 : 0 }}>
                <div style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,.4)', fontWeight: 500, marginBottom: 2 }}>{s.label}</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: '-1px' }}>{s.value}</div>
                <div style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,.35)', marginTop: 1 }}>{s.unit}</div>
              </div>
            ))}
          </div>

          {/* Route SVG art — viewBox covers y:30–y:245 so BKK(230) and NRT(42) both visible */}
          <div style={{ display: 'flex', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
            <ModalMapBg />
            <svg viewBox="0 30 300 215" width="100%" style={{ display: 'block', maxHeight: 155, position: 'relative', zIndex: 1 }}>
              <path d={path1} fill="none" stroke={`${GREEN}40`} strokeWidth="7" strokeLinecap="round" />
              <path d={path2} fill="none" stroke={`${GREEN}30`} strokeWidth="7" strokeLinecap="round" />
              <path d={path1} fill="none" stroke={GREEN_LIGHT} strokeWidth="2.5" strokeLinecap="round"
                style={{ strokeDasharray: LEN, strokeDashoffset: drawn ? 0 : LEN, transition: 'stroke-dashoffset 1.8s cubic-bezier(.4,0,.2,1) .1s' }} />
              <path d={path2} fill="none" stroke={GREEN} strokeWidth="2" strokeLinecap="round"
                style={{ strokeDasharray: LEN, strokeDashoffset: drawn ? 0 : LEN, transition: 'stroke-dashoffset 1.8s cubic-bezier(.4,0,.2,1) .4s' }} />
              {/* City dots match actual path coords */}
              {[
                { cx: 90, cy: 230, l: 'BKK' },
                { cx: 155, cy: 130, l: 'HKG' },
                { cx: 195, cy: 96, l: 'ICN' },
                { cx: 212, cy: 42, l: 'NRT' },
              ].map((c, i) => (
                <g key={i}>
                  <circle cx={c.cx} cy={c.cy} r="5" fill={GREEN_LIGHT} opacity={drawn ? 1 : 0} style={{ transition: `opacity .3s ease ${.3 + i * .15}s` }} />
                  <circle cx={c.cx} cy={c.cy} r="2.5" fill="#fff" opacity={drawn ? 1 : 0} style={{ transition: `opacity .3s ease ${.3 + i * .15}s` }} />
                  <text x={c.cx + 9} y={c.cy + 4} fontSize="8" fill="rgba(255,255,255,.5)" fontFamily="Inter,sans-serif" fontWeight="700">{c.l}</text>
                </g>
              ))}
            </svg>
          </div>

          {/* Brand bar */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,.08)', padding: '10px 0 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              {/* DHL Logo placeholder — leaf icon + text */}
              <div style={{ width: 24, height: 24, borderRadius: 6, background: GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Leaf size={12} color="#fff" strokeWidth={2.5} />
              </div>
              <span style={{ fontSize: '0.82rem', fontWeight: 900, color: '#fff', letterSpacing: '.3px' }}>DHL GoGreen Plus</span>
            </div>
            <span style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,.25)' }}>#{senderName.slice(-6).replace(' ', '')}-ECO</span>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ background: D2, padding: '12px 16px 14px', display: 'flex', gap: 8 }}>
          <Btn onClick={handleSaveImage} style={{ flex: 1, padding: '10px 0', borderRadius: 12, background: 'rgba(255,255,255,.06)', border: `1px solid ${D_BORDER}`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <Download size={18} color="rgba(255,255,255,.75)" />
            <span style={{ color: 'rgba(255,255,255,.42)', fontSize: '0.6rem', fontWeight: 500 }}>บันทึกรูปภาพ</span>
          </Btn>
          <Btn onClick={() => setShowCamera(true)} style={{ flex: 1, padding: '10px 0', borderRadius: 12, background: 'rgba(255,255,255,.06)', border: `1px solid ${D_BORDER}`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <Camera size={18} color="rgba(255,255,255,.75)" />
            <span style={{ color: 'rgba(255,255,255,.42)', fontSize: '0.6rem', fontWeight: 500 }}>กล้อง</span>
          </Btn>
          <Btn onClick={handleNativeShare} style={{ flex: 1, padding: '10px 0', borderRadius: 12, background: 'rgba(255,255,255,.06)', border: `1px solid ${D_BORDER}`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <MoreHorizontal size={18} color="rgba(255,255,255,.75)" />
            <span style={{ color: 'rgba(255,255,255,.42)', fontSize: '0.6rem', fontWeight: 500 }}>อื่นๆ</span>
          </Btn>
        </div>

        {/* Tap backdrop hint */}
        <div style={{ background: D3, padding: '10px', textAlign: 'center' }}>
          <span style={{ color: 'rgba(255,255,255,.28)', fontSize: '0.62rem' }}>แตะพื้นหลังเพื่อปิด</span>
        </div>
      </div>

      {/* Floating close button — below card */}
      <button onClick={onClose} style={{ width: 44, height: 44, borderRadius: 22, background: 'rgba(255,255,255,.15)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <X size={20} color="rgba(255,255,255,.8)" />
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   RESULT — Green hero top half + fixed bottom bar
═══════════════════════════════════════════════════════════════ */
const SECTIONS = [
  { id: 'impact', label: 'Real-Time Impact', Icon: TrendingUp },
  { id: 'co2', label: 'CO₂ Metric', Icon: BarChart3 },
  { id: 'passport', label: 'Green Passport', Icon: BookOpen },
  { id: 'badges', label: 'Badges', Icon: Award },
  { id: 'community', label: 'Community', Icon: Globe },
  { id: 'wrapped', label: 'Wrapped Poster', Icon: Sparkles },
];

/* Route stats shown in the green hero */
function HeroStats({ co2, trees, shipments }: { co2: number; trees: number; shipments: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
      {[
        { val: `${co2}`, unit: 'kg CO₂', label: 'ประหยัดได้' },
        { val: `${trees}`, unit: 'ต้นไม้', label: 'เทียบเท่า' },
        { val: `${shipments}`, unit: 'ครั้ง', label: 'ส่งแล้ว' },
      ].map((s, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: '-0.5px' }}>{s.val}</div>
          <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,.65)', fontWeight: 600 }}>{s.unit}</div>
          <div style={{ fontSize: '0.57rem', color: 'rgba(255,255,255,.4)', marginLeft: 'auto' }}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}

export function ResultScreen({
  sender, onHome, onRestart,
  // eslint-disable-next-line
}: {
  sender: typeof DHL_SPOTS[number] | undefined;
  onHome: () => void; onRestart: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState<'r' | 'l'>('r');
  const [heroAnim, setHeroAnim] = useState(false);
  const [showShare, setShowShare] = useState(false);
  useEffect(() => { const t = setTimeout(() => setHeroAnim(true), 100); return () => clearTimeout(t); }, []);

  const co2Saved = 117.8, ecoScore = 1240, totalShipments = 32, treesEq = 8;

  const goTo = (next: number) => {
    if (next < 0 || next >= SECTIONS.length) return;
    setDir(next > idx ? 'r' : 'l'); setIdx(next);
  };
  const isLast = idx === SECTIONS.length - 1;

  /* ── ROUTE HERO PANEL ── */
  const Hero = () => (
    <div style={{ flex: 'none', height: 150, background: `linear-gradient(150deg,${GREEN} 0%,${GREEN_LIGHT} 100%)`, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
      {/* top bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px 4px', flexShrink: 0 }}>
        <Btn ghost onClick={onHome} style={{ background: 'rgba(255,255,255,.18)', borderRadius: 10, padding: '6px 8px', display: 'flex', alignItems: 'center' }}>
          <Home size={14} color="#fff" />
        </Btn>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,.65)', fontWeight: 600, letterSpacing: '1px' }}>DELIVERY ROUTE</div>
          <div style={{ fontSize: '0.8rem', color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>{sender?.name ?? '—'} → <img src="https://flagcdn.com/w40/jp.png" alt="JP" width={16} height={11} style={{ borderRadius: 2, objectFit: 'cover' }} /> Japan</div>
        </div>
        <div style={{ width: 32 }} />
      </div>

      {/* Route viz + stats — horizontal layout to save height */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 16px 4px', gap: 12, opacity: heroAnim ? 1 : 0, transition: 'opacity .6s ease', minHeight: 0, overflow: 'hidden' }}>
        <div style={{ width: 90, flexShrink: 0 }}>
          <RouteViz animate={heroAnim} />
        </div>
        <HeroStats co2={co2Saved} trees={treesEq} shipments={totalShipments} />
      </div>

      {/* Progress dots */}
      <div style={{ display: 'flex', gap: 5, padding: '0 16px 10px' }}>
        {SECTIONS.map((_, i) => (
          <Btn ghost key={i} onClick={() => goTo(i)} style={{ flex: 1, padding: 0 }}>
            <div style={{ height: 3, borderRadius: 2, background: i <= idx ? 'rgba(255,255,255,.9)' : 'rgba(255,255,255,.25)', transition: 'background .25s ease' }} />
          </Btn>
        ))}
      </div>

      {/* Fade bottom to white */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 32, background: 'linear-gradient(to top,#fff,transparent)', pointerEvents: 'none' }} />
    </div>
  );

  /* ── SECTION CARD ── */
  const renderSection = () => {
    switch (idx) {

      /* 0 — IMPACT */
      case 0: return (
        <div style={{ padding: '16px 20px 0' }}>
          <Tag>Real-Time Impact</Tag>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: C.text, margin: '10px 0 6px', letterSpacing: '-1px', lineHeight: 1.1 }}>การปล่อย<br />คาร์บอน</h2>
          <p style={{ color: C.text2, fontSize: '0.84rem', lineHeight: 1.65 }}>วิเคราะห์ผ่านเครือข่าย GoGreen Plus</p>

          <Card style={{ marginTop: 16, textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', fontWeight: 900, color: GREEN, lineHeight: 1, letterSpacing: '-2px' }}>{co2Saved}</div>
            <div style={{ color: C.text3, fontSize: '0.65rem', letterSpacing: '2px', marginTop: 6 }}>KG CO₂E SAVED</div>
          </Card>
          <Card style={{ marginTop: 12 }}>
            <div style={{ fontSize: '0.6rem', color: C.text3, letterSpacing: '1px', marginBottom: 8, fontWeight: 600 }}>STANDARD</div>
            <div style={{ color: C.text2, fontSize: '0.8rem', lineHeight: 1.65 }}>ISO 14067:2018 · GHG Protocol · TGO Emission Factor</div>
          </Card>
        </div>
      );

      /* 1 — CO₂ */
      case 1: {
        const bars = [
          { label: 'CO₂ จากเที่ยวบิน', value: `+${(co2Saved * 1.42).toFixed(1)} kg`, w: 100 },
          { label: 'ชดเชย SAF', value: `-${(co2Saved * 0.58).toFixed(1)} kg`, w: 58 },
          { label: 'ชดเชยป่าไม้', value: `-${(co2Saved * 0.38).toFixed(1)} kg`, w: 38 },
        ];
        return (
          <div style={{ padding: '16px 20px 0' }}>
            <Tag>CO₂ Breakdown</Tag>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: C.text, margin: '10px 0 16px', letterSpacing: '-1px', lineHeight: 1.1 }}>Carbon Metric</h2>
            {bars.map((b, i) => (
              <Card key={i} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ color: C.text2, fontSize: '0.84rem' }}>{b.label}</span>
                  <span style={{ color: C.text, fontWeight: 700, fontSize: '0.9rem' }}>{b.value}</span>
                </div>
                <div style={{ height: 5, background: '#f3f4f6', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${b.w}%`, background: GREEN, borderRadius: 3 }} />
                </div>
              </Card>
            ))}
            <Card style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ fontSize: '2rem' }}>🌳</span>
              <div>
                <div style={{ color: C.text, fontWeight: 800, fontSize: '1.1rem' }}>= {treesEq} ต้นไม้</div>
                <div style={{ color: C.text3, fontSize: '0.72rem', marginTop: 2 }}>ตลอดอายุการดูดซับ 20 ปี</div>
              </div>
            </Card>
          </div>
        );
      }

      /* 2 — PASSPORT */
      case 2: {
        const stats = [
          { Icon: Zap, label: 'Eco Score', value: `${ecoScore.toLocaleString()}`, unit: 'pts' },
          { Icon: MapPin, label: 'Shipments', value: `${totalShipments}`, unit: 'logs' },
          { Icon: Globe, label: 'Network', value: '220', unit: 'ctries' },
          { Icon: Leaf, label: 'CO₂ Saved', value: `${co2Saved}`, unit: 'kg' },
        ];
        return (
          <div style={{ padding: '16px 20px 0' }}>
            <Tag>Digital Passport</Tag>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: C.text, margin: '10px 0 16px', letterSpacing: '-1px', lineHeight: 1.1 }}>Green Passport</h2>
            <div style={{ borderRadius: 18, background: D1, padding: 22, position: 'relative', overflow: 'hidden', border: `1px solid ${D_BORDER}` }}>
              <div style={{ position: 'absolute', top: -50, right: -50, width: 160, height: 160, borderRadius: '50%', border: '1px solid rgba(255,255,255,.05)', pointerEvents: 'none' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Leaf size={16} color="rgba(255,255,255,.85)" strokeWidth={1.8} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,.35)', letterSpacing: '1px', fontWeight: 600 }}>ISSUED TO</div>
                    <div style={{ fontSize: '0.94rem', fontWeight: 700, color: '#fff' }}>DHL Member</div>
                  </div>
                </div>
                <div style={{ background: 'rgba(255,255,255,.1)', borderRadius: 8, padding: '4px 10px', fontSize: '0.58rem', color: 'rgba(255,255,255,.75)', fontWeight: 700, letterSpacing: '1px' }}>VERIFIED ✓</div>
              </div>
              <div style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,.3)', letterSpacing: '1px', marginBottom: 4, fontWeight: 600 }}>ROUTE</div>
              <div style={{ fontSize: '0.84rem', color: 'rgba(255,255,255,.85)', fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 4 }}>{sender?.name ?? '—'} → <img src="https://flagcdn.com/w40/jp.png" alt="JP" width={16} height={11} style={{ borderRadius: 2, objectFit: 'cover' }} /> Japan</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {stats.map((s, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,.06)', borderRadius: 10, padding: 10 }}>
                    <s.Icon size={13} color="rgba(255,255,255,.4)" style={{ marginBottom: 5 }} strokeWidth={1.8} />
                    <div style={{ color: 'rgba(255,255,255,.3)', fontSize: '0.56rem', letterSpacing: '.5px', fontWeight: 600 }}>{s.label}</div>
                    <div style={{ color: '#fff', fontWeight: 800, fontSize: '0.96rem', marginTop: 2 }}>{s.value} <span style={{ fontSize: '0.58rem', opacity: .4 }}>{s.unit}</span></div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,.08)', display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '0.56rem', color: 'rgba(255,255,255,.2)' }}>ID: #DHL-9844-ECO</div>
                <div style={{ fontSize: '0.56rem', color: 'rgba(255,255,255,.4)', fontWeight: 600 }}>GoGreen Plus</div>
              </div>
            </div>
          </div>
        );
      }

      /* 3 — BADGES */
      case 3: {
        const badges = [
          { Icon: Leaf, title: 'Green Starter', sub: 'ส่งมอบกรีนพัสดุขั้นแรก', unlocked: true },
          { Icon: Zap, title: 'SAF Supporter', sub: 'หนุนพลังงานทางเลือก', unlocked: true },
          { Icon: Globe, title: '220 Connector', sub: 'เชื่อมโยงโครงข่ายทั่วโลก', unlocked: true },
          { Icon: TrendingUp, title: 'Global Eco Sender', sub: 'ผู้ใช้นิเวศระดับท็อป', unlocked: false },
        ];
        return (
          <div style={{ padding: '16px 20px 0' }}>
            <Tag>Achievements</Tag>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: C.text, margin: '10px 0 16px', letterSpacing: '-1px', lineHeight: 1.1 }}>Badges ของคุณ</h2>
            {badges.map((b, i) => (
              <Card key={i} style={{ marginBottom: 10, opacity: b.unlocked ? 1 : .35 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 46, height: 46, borderRadius: 12, background: b.unlocked ? '#111' : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <b.Icon size={20} color={b.unlocked ? '#fff' : '#ccc'} strokeWidth={1.8} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: C.text, fontWeight: 700, fontSize: '0.9rem' }}>{b.title}</div>
                    <div style={{ color: C.text3, fontSize: '0.74rem', marginTop: 2 }}>{b.sub}</div>
                  </div>
                  {b.unlocked ? (
                    <Btn ghost style={{ background: '#f3f4f6', border: `1px solid ${C.border}`, borderRadius: 10, padding: '6px 12px', fontSize: '0.68rem', color: C.text, fontWeight: 700 }}>OPEN</Btn>
                  ) : <span style={{ fontSize: '0.72rem', color: C.text3 }}>🔒</span>}
                </div>
              </Card>
            ))}
          </div>
        );
      }

      /* 4 — COMMUNITY */
      case 4: {
        const hubs = [
          { medal: '🥇', name: 'Head Office / Siam Paragon', co2: '841,320 kg' },
          { medal: '🥈', name: 'Chiang Mai / CentralWorld', co2: '623,180 kg' },
          { medal: '🥉', name: 'ICONSIAM / Phuket', co2: '487,050 kg' },
        ];
        return (
          <div style={{ padding: '16px 20px 0' }}>
            <Tag>Community</Tag>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: C.text, margin: '10px 0 16px', letterSpacing: '-1px', lineHeight: 1.1 }}>ผลรวมชุมชน</h2>
            <Card style={{ textAlign: 'center', marginBottom: 14 }}>
              <div style={{ fontSize: '0.58rem', color: C.text3, letterSpacing: '2px', marginBottom: 6, fontWeight: 600 }}>TOTAL CO₂e SAVED</div>
              <div style={{ fontSize: '2.8rem', fontWeight: 900, color: C.text, letterSpacing: '-2px' }}>2,451,550</div>
              <div style={{ color: C.text3, fontSize: '0.7rem', marginTop: 4 }}>KG · เครือข่ายไทยและอาเซียน</div>
            </Card>
            <div style={{ fontSize: '0.58rem', color: C.text3, letterSpacing: '1.5px', fontWeight: 600, marginBottom: 10 }}>TOP ECO HUBS</div>
            {hubs.map((h, i) => (
              <Card key={i} style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: '1.4rem' }}>{h.medal}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ color: C.text, fontWeight: 700, fontSize: '0.84rem' }}>{h.name}</div>
                  <div style={{ color: GREEN, fontSize: '0.7rem', marginTop: 2, fontWeight: 600 }}>{h.co2} saved</div>
                </div>
              </Card>
            ))}
          </div>
        );
      }

      /* 5 — WRAPPED */
      default: return (
        <div style={{ padding: '16px 20px 0' }}>
          <Tag>Year In Review</Tag>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: C.text, margin: '10px 0 4px', letterSpacing: '-1px', lineHeight: 1.1 }}>Your Wrapped</h2>
          <p style={{ color: C.text2, fontSize: '0.82rem', marginBottom: 16 }}>สรุปเส้นทางการขนส่ง · กดแชร์ได้เลย ✨</p>

          {/* Preview card — Strava style */}
          <div style={{ borderRadius: 20, background: D1, overflow: 'hidden', boxShadow: `0 8px 32px rgba(0,0,0,.22), 0 0 0 1px ${D_BORDER}`, marginBottom: 14 }}>
            {/* Stats top */}
            <div style={{ padding: '20px 20px 0', borderBottom: `1px solid ${D_BORDER}` }}>
              <div style={{ display: 'flex', gap: 0, marginBottom: 16 }}>
                {[
                  { label: 'CO₂ Saved', value: `${co2Saved}`, unit: 'kg' },
                  { label: 'Routes', value: `${totalShipments}`, unit: 'trips' },
                  { label: 'Eco Score', value: `${ecoScore.toLocaleString()}`, unit: 'pts' },
                ].map((s, i) => (
                  <div key={i} style={{ flex: 1, borderRight: i < 2 ? '1px solid rgba(255,255,255,.07)' : 'none', paddingRight: i < 2 ? 12 : 0, paddingLeft: i > 0 ? 12 : 0 }}>
                    <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,.4)', fontWeight: 500, marginBottom: 2 }}>{s.label}</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: '-1px' }}>{s.value}</div>
                    <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,.35)', marginTop: 2 }}>{s.unit}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Route SVG preview — viewBox "0 18 300 148" → shows y:18–y:166, BKK(155) and ICN(26) both within */}
            <div style={{ padding: '0 22px', display: 'flex', justifyContent: 'center', overflow: 'hidden' }}>
              <svg viewBox="0 18 300 148" width="100%" style={{ display: 'block', maxHeight: 118 }}>
                {/* Paths trimmed to ICN — no extension above viewBox */}
                <path d="M 90 155 C 105 135, 125 140, 138 118 C 150 98, 142 80, 155 60 C 168 40, 185 48, 195 26"
                  fill="none" stroke={`${GREEN}35`} strokeWidth="6" strokeLinecap="round" />
                <path d="M 90 155 C 115 143, 128 147, 148 130 C 165 115, 158 97, 172 77 C 184 59, 200 63, 212 43"
                  fill="none" stroke={`${GREEN}25`} strokeWidth="5" strokeLinecap="round" />
                <path d="M 90 155 C 105 135, 125 140, 138 118 C 150 98, 142 80, 155 60 C 168 40, 185 48, 195 26"
                  fill="none" stroke={GREEN_LIGHT} strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 90 155 C 115 143, 128 147, 148 130 C 165 115, 158 97, 172 77 C 184 59, 200 63, 212 43"
                  fill="none" stroke={GREEN} strokeWidth="2" strokeLinecap="round" />
                {[{ cx: 90, cy: 155, l: 'BKK' }, { cx: 155, cy: 60, l: 'HKG' }, { cx: 195, cy: 26, l: 'ICN' }].map((c, i) => (
                  <g key={i}>
                    <circle cx={c.cx} cy={c.cy} r="5" fill={GREEN_LIGHT} />
                    <circle cx={c.cx} cy={c.cy} r="2.5" fill="#fff" />
                    <text x={c.cx + 9} y={c.cy + 3.5} fontSize="8" fill="rgba(255,255,255,.45)" fontFamily="Inter,sans-serif" fontWeight="700">{c.l}</text>
                  </g>
                ))}
              </svg>
            </div>


            {/* Route label + inline share button */}
            <div style={{ padding: '10px 18px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: `1px solid ${D_BORDER}` }}>
              <div>
                <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,.3)', marginBottom: 2 }}>ROUTE</div>
                <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,.8)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>{sender?.name ?? '—'} → <img src="https://flagcdn.com/w40/jp.png" alt="JP" width={16} height={11} style={{ borderRadius: 2, objectFit: 'cover' }} /> Japan</div>
              </div>
              <Btn onClick={() => setShowShare(true)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', borderRadius: 10, background: GREEN, color: '#fff', fontSize: '0.72rem', fontWeight: 700 }}>
                <Sparkles size={13} /> แชร์
              </Btn>
            </div>
          </div>

          <p style={{ textAlign: 'center', color: C.text3, fontSize: '0.68rem', marginBottom: 4 }}>แคปหน้าจอหรือกด แชร์ โพสลง IG / TikTok ได้เลย</p>
        </div>
      );
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: F, overflow: 'hidden' }}>
      <style>{G}</style>

      {/* Share modal */}
      {showShare && (
        <ShareModal
          co2={co2Saved} routes={totalShipments} score={ecoScore}
          senderName={sender?.name ?? 'DHL'}
          onClose={() => setShowShare(false)}
        />
      )}

      {/* GREEN HERO — fixed 48% */}
      <Hero />

      {/* SCROLLABLE CONTENT */}
      <div key={idx} style={{ flex: 1, overflowY: 'auto', background: '#fff', animation: `${dir === 'r' ? 'gp-rIn' : 'gp-lIn'} .28s ease`, minHeight: 0 }} className="gp-scroll">
        {renderSection()}
        <div style={{ height: 16 }} />
      </div>

      {/* FIXED BOTTOM BAR */}
      <div style={{ background: '#fff', borderTop: `1px solid ${C.border}`, padding: '12px 20px 32px', flexShrink: 0 }}>
        {isLast ? (
          <div style={{ display: 'flex', gap: 10 }}>
            <Btn ghost onClick={onHome} style={{ flex: 1, padding: 14, borderRadius: 14, border: `1px solid ${C.border}`, background: '#f9fafb', color: C.text, fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Home size={16} /> หน้าหลัก
            </Btn>
            <Btn onClick={onRestart} style={{ flex: 1, padding: 14, borderRadius: 14, background: D1, color: '#fff', fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, boxShadow: '0 4px 20px rgba(0,0,0,.28)' }}>
              <RotateCcw size={16} /> จำลองใหม่
            </Btn>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 10 }}>
            {idx > 0 && (
              <Btn ghost onClick={() => goTo(idx - 1)} style={{ padding: '14px 16px', borderRadius: 14, border: `1px solid ${C.border}`, background: '#f9fafb', color: C.text, display: 'flex', alignItems: 'center' }}>
                <ChevronLeft size={18} />
              </Btn>
            )}
            <Btn onClick={() => goTo(idx + 1)} style={{
              flex: 1, padding: 14, borderRadius: 14, background: GREEN, color: '#fff',
              fontSize: '0.92rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              boxShadow: `0 4px 16px ${GREEN}40`,
            }}>
              ถัดไป — {SECTIONS[idx + 1].label} <ChevronRight size={16} />
            </Btn>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ROOT
═══════════════════════════════════════════════════════════════ */
export default function GreenPassport() {
  const navigate = useNavigate();
  const [screen, setScreen] = useState<'landing' | 'tutorial'>('landing');

  if (screen === 'landing') return <LandingScreen onStart={() => setScreen('tutorial')} />;
  return (
    <TutorialScreen
      onNext={() => navigate('/green-passport/ship')}
      onBack={() => setScreen('landing')}
    />
  );
}


