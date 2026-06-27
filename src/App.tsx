import { useState, useEffect } from 'react';
import {
  Search, Calculator, Store, ChevronDown, Globe, ChevronUp,
  ScanBarcode, Truck, Leaf, ArrowRight, X, Menu, Package, Check, User,
  Award, Sparkles, TreePine, Flame, Plane, Zap, RefreshCcw, Crown,
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import { saveVisitedCountry } from './WorldMapPopup';
import GlobalImpactWidget from './components/GlobalImpactWidget';
import './index.css';


/* ─── Drawer styles injected inline ─────────────────────────── */
const DRAWER_CSS = `
  @keyframes backdrop-in  { from{opacity:0} to{opacity:1} }
  @keyframes drawer-slide  { from{transform:translateX(-100%)} to{transform:translateX(0)} }
  @keyframes popup-bounce  { 0%{transform:translate(-50%,-50%) scale(.7);opacity:0} 60%{transform:translate(-50%,-50%) scale(1.05)} 100%{transform:translate(-50%,-50%) scale(1);opacity:1} }
  @keyframes badge-pop     { 0%{transform:scale(0.2);opacity:0} 65%{transform:scale(1.15)} 100%{transform:scale(1);opacity:1} }
  @keyframes confetti-fall { 0%{transform:translateY(-16px);opacity:0} 100%{transform:translateY(0);opacity:1} }
  .drawer-item:hover { background: #f9fafb !important; }
  .drawer-item:active { background: #f3f4f6 !important; }
`;

/* ── Badge definitions for unlock detection ── */
const APP_BADGE_DEFS = [
  { id: 'first', name: 'First Step', desc: 'GoGreen ครั้งแรก', color: '#059669' },
  { id: 'green5', name: 'Green Sender', desc: 'GoGreen 5 ครั้ง', color: '#16a34a' },
  { id: 'co2_10', name: 'Carbon Saver', desc: 'ลด CO₂e 50 kg', color: '#0284c7' },
  { id: 'tree10', name: 'Tree Planter', desc: 'ต้นไม้ 10 ต้น', color: '#15803d' },
  { id: 'streak7', name: '7-Day Streak', desc: '7 วันติดต่อกัน', color: '#dc2626' },
  { id: 'intl', name: 'Global Sender', desc: 'ส่ง 10 ประเทศ', color: '#7c3aed' },
  { id: 'fast', name: 'Speed King', desc: 'ส่งภายใน 1 ชม.', color: '#f59e0b' },
  { id: 'eco100', name: 'Eco Warrior', desc: 'GoGreen 100 ครั้ง', color: '#10b981' },
  { id: 'legend', name: 'DHL Legend', desc: 'ส่ง 500 ครั้ง', color: '#d97706' },
];

function getBadgeIcon(id: string, size = 28, color = '#fff') {
  switch (id) {
    case 'first': return <Leaf size={size} color={color} />;
    case 'green5': return <Award size={size} color={color} />;
    case 'co2_10': return <Globe size={size} color={color} />;
    case 'tree10': return <TreePine size={size} color={color} />;
    case 'streak7': return <Flame size={size} color={color} />;
    case 'intl': return <Plane size={size} color={color} />;
    case 'fast': return <Zap size={size} color={color} />;
    case 'eco100': return <RefreshCcw size={size} color={color} />;
    case 'legend': return <Crown size={size} color={color} />;
    default: return <Award size={size} color={color} />;
  }
}

function detectNewBadge() {
  try {
    const raw = localStorage.getItem('shipment_history');
    const history: any[] = raw ? JSON.parse(raw) : [];
    const claimed = new Set<string>(JSON.parse(localStorage.getItem('claimed_badges') || '[]'));
    const totalShipments = history.length;
    const greenShipments = history.filter((s: any) => s.co2saved > 0).length;
    const totalCo2 = history.reduce((a: number, s: any) => a + (s.co2saved || 0), 0);
    const totalTrees = history.reduce((a: number, s: any) => a + (s.trees || 0), 0);
    const intlCount = history.filter((s: any) => s.type !== 'domestic').length;
    const checks: Record<string, boolean> = {
      first: greenShipments >= 1,
      green5: greenShipments >= 5,
      co2_10: totalCo2 >= 10,
      tree10: totalTrees >= 10,
      streak7: totalShipments >= 7,
      intl: intlCount >= 1,
      fast: totalShipments >= 10,
      eco100: greenShipments >= 100,
      legend: totalShipments >= 500,
    };
    return APP_BADGE_DEFS.find(b => checks[b.id] && !claimed.has(b.id)) || null;
  } catch { return null; }
}

export default function App() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [drawerOpen, setDrawer] = useState(false);
  const [co2Popup, setCo2Popup] = useState<any>(null);
  const [shipNotif, setShipNotif] = useState<any>(null);
  const [newBadge, setNewBadge] = useState<typeof APP_BADGE_DEFS[0] | null>(null);
  const [pendingNotifData, setPendingNotifData] = useState<any>(null);


  const [trackInput, setTrackInput] = useState('');
  const [trackResult, setTrackResult] = useState<any>(null);
  const [trackNotFound, setTrackNotFound] = useState(false);

  useEffect(() => {
    const pending = localStorage.getItem('pending_co2');
    if (pending) {
      try {
        const data = JSON.parse(pending);
        localStorage.removeItem('pending_co2');
        // Show CO2 popup directly — SMS banner will appear after WorldMap closes
        setTimeout(() => setCo2Popup(data), 500);
        setPendingNotifData(data);
      } catch { }
    }
  }, []);

  const handleViewImpact = (data: any) => {
    setShipNotif(null);
    setTimeout(() => setCo2Popup(data), 300);
  };

  const handleCo2Next = () => {
    if (co2Popup?.destCode) saveVisitedCountry(co2Popup.destCode);
    setCo2Popup(null);
    const badge = detectNewBadge();
    if (badge) {
      setTimeout(() => setNewBadge(badge), 300);
    } else {
      // No new badge — show SMS banner directly
      if (pendingNotifData) {
        setTimeout(() => {
          setShipNotif(pendingNotifData);
          setTimeout(() => setShipNotif(null), 5000);
        }, 400);
        setPendingNotifData(null);
      }
    }
  };

  const handleBadgePopupClose = (goProfile = false) => {
    setNewBadge(null);
    if (goProfile) {
      navigate('/profile');
    }
    if (pendingNotifData) {
      setTimeout(() => {
        setShipNotif(pendingNotifData);
        setTimeout(() => setShipNotif(null), 5000);
      }, 400);
      setPendingNotifData(null);
    }
  };

  const handleTrack = () => {
    const q = trackInput.trim().toUpperCase();
    if (!q) return;
    const raw = localStorage.getItem('shipment_history');
    if (raw) {
      try {
        const list = JSON.parse(raw);
        const found = list.find((s: any) => s.tracking.toUpperCase() === q);
        if (found) { setTrackResult(found); setTrackNotFound(false); return; }
      } catch { }
    }
    setTrackNotFound(true); setTrackResult(null);
  };

  const fmt = (ts: number) =>
    new Date(ts).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const toggleFaq = (index: number) => {
    if (openFaq === index) setOpenFaq(null);
    else setOpenFaq(index);
  };

  const faqs = [
    { q: "หมายเลขตรวจสอบสถานะการจัดส่งคืออะไร และฉันสามารถดูได้ที่ไหน", a: "หมายเลขตรวจสอบสถานะการจัดส่ง (Tracking Number) คือรหัสตัวอักษรและตัวเลขที่คุณได้รับเมื่อพัสดุถูกส่งเข้าระบบ คุณสามารถค้นหาได้ในอีเมลยืนยัน หรือใบเสร็จการจัดส่งพัสดุ" },
    { q: "ข้อมูลการตรวจสอบสถานะการจัดส่งของฉันจะปรากฏขึ้นเมื่อใด", a: "ข้อมูลการตรวจสอบสถานะการจัดส่งจะปรากฏขึ้นหลังจากที่พัสดุถูกสแกนเข้าระบบที่ศูนย์กระจายสินค้าของเรา ซึ่งอาจใช้เวลา 1-2 ชั่วโมงหลังจากการจัดส่งที่สาขา" },
    { q: "ทำไมหมายเลข/รหัสตรวจสอบสถานะการจัดส่งของฉันใช้ไม่ได้", a: "อาจเกิดจากการที่หมายเลขยังไม่ถูกบันทึกเข้าระบบหลัก หรือหมายเลขที่กรอกอาจไม่ถูกต้อง โปรดตรวจสอบหมายเลขอีกครั้ง หรือรอสักครู่แล้วลองใหม่" },
    { q: "หากฉันไม่มีหมายเลขตรวจสอบสถานะการจัดส่ง ฉันยังสามารถตรวจสอบชิปเมนต์ได้หรือไม่", a: "หากไม่มีหมายเลขตรวจสอบสถานะ คุณอาจสามารถตรวจสอบได้โดยติดต่อฝ่ายบริการลูกค้าและแจ้งข้อมูลผู้รับ-ผู้ส่ง หรือหมายเลขอ้างอิงอื่นๆ (ถ้ามี)" }
  ];



  return (
    <div className="dhl-layout">
      <style>{DRAWER_CSS}</style>

      {/* ══════════════════════════════════════════
           SHIP NOTIFICATION BANNER — drops from top
       ══════════════════════════════════════════ */}
      {shipNotif && (
        <>
          <style>{`
            @keyframes notif-drop { from { transform:translateY(-110%); opacity:0; } to { transform:translateY(0); opacity:1; } }
            @keyframes notif-out  { from { transform:translateY(0); opacity:1; } to { transform:translateY(-110%); opacity:0; } }
            .notif-banner { animation: notif-drop 0.45s cubic-bezier(0.34,1.3,0.64,1) forwards; }
          `}</style>
          {/* Blur overlay */}
          <div onClick={() => setShipNotif(null)}
            style={{ position: 'fixed', inset: 0, zIndex: 4000, background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }} />
          {/* Banner card */}
          <div className="notif-banner"
            style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 4001, padding: '12px 12px 0' }}>
            <div style={{ background: 'rgba(255,255,255,0.96)', borderRadius: 20, padding: '14px 16px', boxShadow: '0 8px 40px rgba(0,0,0,0.22)', backdropFilter: 'blur(10px)' }}>
              {/* Header row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 9 }}>
                <div style={{ background: '#d40511', borderRadius: 5, padding: '2px 7px', fontSize: '0.58rem', fontWeight: 900, color: '#fff', letterSpacing: '1px' }}>DHL</div>
                <span style={{ fontSize: '0.6rem', fontWeight: 700, color: '#9ca3af', letterSpacing: '1.5px' }}>GREEN PASSPORT</span>
                <span style={{ marginLeft: 'auto', fontSize: '0.6rem', color: '#9ca3af' }}>เมื่อกี้</span>
              </div>
              {/* Title */}
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#111', marginBottom: 3 }}>
                Your shipment is on its way!
              </div>
              {/* Sub */}
              <div style={{ fontSize: '0.78rem', color: '#374151', marginBottom: 9 }}>
                {shipNotif.origin} → {shipNotif.dest} &nbsp;·&nbsp;
                <span style={{ fontFamily: 'monospace', fontSize: '0.72rem' }}>{shipNotif.tracking}</span>
              </div>
              {/* Stats + CTA row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 9, borderTop: '1px solid #f3f4f6' }}>
                <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700 }}>
                  CO₂ ลดได้ {shipNotif.co2saved} kg &nbsp;·&nbsp; ต้นไม้ {shipNotif.trees} ต้น
                </div>
                <button type="button" onClick={() => handleViewImpact(shipNotif)}
                  style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '5px 10px', fontSize: '0.7rem', fontWeight: 800, color: '#059669', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                  View Impact →
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ══════════════════════════════════════════
          CO₂ POPUP — shows after returning from IntlShipping
      ══════════════════════════════════════════ */}
      {co2Popup && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', padding: '16px' }}>
          <div style={{ position: 'relative', width: 'min(380px,92vw)', background: 'linear-gradient(180deg,#051a05 0%,#082808 30%,#0a3410 55%,#0c3f10 75%,#103d10 100%)', borderRadius: 28, overflow: 'hidden', boxShadow: '0 28px 80px rgba(0,0,0,0.65)', animation: 'popup-bounce .45s cubic-bezier(0.4,0,0.2,1)' }}>

            {/* Radial glow */}
            <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(74,222,128,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

            {/* Main text content */}
            <div style={{ padding: '48px 28px 20px', textAlign: 'center', position: 'relative', zIndex: 1 }}>

              {/* DHL label */}
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.55rem', fontWeight: 700, letterSpacing: '3px', marginBottom: 20 }}>DHL GREEN PASSPORT</div>

              {/* Heading */}
              <div style={{ color: '#fff', fontSize: '1.7rem', fontWeight: 900, lineHeight: 1.25, marginBottom: 14 }}>
                ขอบคุณที่ร่วม<br />สร้างอนาคตที่ดีกว่า
              </div>

              {/* Subtitle */}
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.88rem', lineHeight: 1.65, marginBottom: 28 }}>
                การส่งออกครั้งนี้<br />ช่วยลดการปล่อยคาร์บอน
              </div>

              {/* Big number */}
              <div style={{ fontSize: '5.8rem', fontWeight: 900, color: '#fff', lineHeight: 0.85, letterSpacing: '-3px', textShadow: '0 0 40px rgba(74,222,128,0.5)' }}>
                {co2Popup.co2saved}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '1rem', fontWeight: 600, marginTop: 10, letterSpacing: '1px' }}>
                kgCO₂e
              </div>

              {/* Route pill */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 20, padding: '5px 14px', fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', marginTop: 18 }}>
                {co2Popup.origin} → {co2Popup.dest}
                <span style={{ color: 'rgba(255,255,255,0.3)' }}>·</span>
                <span style={{ color: 'rgba(74,222,128,0.8)', fontWeight: 700 }}>{co2Popup.tracking}</span>
              </div>

              {/* Confirm button */}
              <button type="button" onClick={handleCo2Next}
                style={{ width: '100%', marginTop: 22, padding: '14px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#064e3b,#059669)', color: '#fff', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                ถัดไป →
              </button>

            </div>

            {/* Forest silhouette SVG */}
            <svg viewBox="0 0 400 130" style={{ width: '100%', display: 'block', marginTop: -10 }} preserveAspectRatio="xMidYMax slice">
              {/* Far background trees */}
              {([[15, 112, 18], [50, 98, 22], [88, 106, 20], [128, 93, 24], [168, 101, 22], [210, 89, 26], [252, 98, 22], [293, 92, 24], [334, 103, 20], [376, 110, 18]] as [number, number, number][]).map(([cx, py, hw], i) => (
                <polygon key={`a${i}`} points={`${cx - hw},130 ${cx},${py} ${cx + hw},130`} fill="#071c07" />
              ))}
              {/* Mid trees */}
              {([[28, 86, 20], [68, 70, 24], [112, 78, 26], [155, 65, 28], [200, 72, 26], [245, 62, 30], [288, 70, 26], [332, 65, 28], [375, 78, 22]] as [number, number, number][]).map(([cx, py, hw], i) => (
                <polygon key={`b${i}`} points={`${cx - hw},130 ${cx},${py} ${cx + hw},130`} fill="#091f09" />
              ))}
              {/* Front trees - slightly lighter for depth */}
              {([[0, 98, 20], [42, 60, 26], [92, 50, 30], [145, 58, 28], [200, 44, 32], [255, 53, 30], [308, 60, 28], [358, 50, 26], [400, 72, 20]] as [number, number, number][]).map(([cx, py, hw], i) => (
                <polygon key={`c${i}`} points={`${cx - hw},130 ${cx},${py} ${cx + hw},130`} fill="#0b260b" />
              ))}
              {/* Ground fill */}
              <rect x="0" y="120" width="400" height="10" fill="#061506" />
            </svg>

          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════
          BADGE UNLOCK POPUP
      ════════════════════════════════════════════ */}
      {newBadge && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 4500, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 28, padding: '36px 24px 28px', maxWidth: 300, width: '100%', textAlign: 'center', boxShadow: '0 32px 80px rgba(0,0,0,0.35)' }}>

            {/* Sparkles header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14, animation: 'confetti-fall 0.45s ease both' }}>
              <Sparkles size={28} color="#f59e0b" />
            </div>

            {/* Badge icon circle */}
            <div style={{
              width: 84, height: 84, borderRadius: 42, margin: '0 auto 16px',
              background: newBadge.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: 'badge-pop 0.55s cubic-bezier(0.34,1.5,0.64,1) 0.1s both',
              boxShadow: `0 8px 32px ${newBadge.color}66`,
            }}>
              {getBadgeIcon(newBadge.id, 32, '#fff')}
            </div>

            {/* Status chip */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: `${newBadge.color}15`, border: `1px solid ${newBadge.color}40`, borderRadius: 20, padding: '4px 14px', marginBottom: 12, fontSize: '0.65rem', fontWeight: 700, color: newBadge.color }}>
              <Award size={10} /> เหรียญใหม่! ปลดล็อกแล้ว
            </div>

            <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#111', marginBottom: 6 }}>{newBadge.name}</div>
            <div style={{ fontSize: '0.82rem', color: '#6b7280', lineHeight: 1.65, marginBottom: 8 }}>{newBadge.desc}</div>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: 24 }}>
              ไปดูเหรียญทั้งหมดได้ที่หน้าโปรไฟล์
            </div>

            <button type="button"
              onClick={() => handleBadgePopupClose(true)}
              style={{ width: '100%', padding: '14px', borderRadius: 14, border: 'none', background: newBadge.color, color: '#fff', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', marginBottom: 10, fontFamily: 'Inter,Kanit,sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <User size={16} /> ดูเหรียญในโปรไฟล์ →
            </button>

            <button type="button"
              onClick={() => handleBadgePopupClose(false)}
              style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'Inter,Kanit,sans-serif' }}>
              ไว้ก่อน
            </button>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          LEFT DRAWER — overlay, slides in from the left
      ════════════════════════════════════════════════════ */}

      {/* Backdrop */}
      {drawerOpen && (
        <div
          onClick={() => setDrawer(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 900,
            background: 'rgba(0,0,0,0.45)',
            animation: 'backdrop-in .22s ease',
          }}
        />
      )}

      {/* Drawer panel */}
      <div style={{
        position: 'fixed', top: 0, left: 0, height: '100vh',
        width: 340, zIndex: 1000,
        background: '#fff',
        boxShadow: '4px 0 32px rgba(0,0,0,0.18)',
        display: 'flex', flexDirection: 'column',
        transform: drawerOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
        overflowY: 'auto',
      }}>
        {/* Drawer header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 20px 16px', borderBottom: '1px solid #f3f4f6', flexShrink: 0 }}>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#d40511', fontStyle: 'italic', letterSpacing: '-0.5px' }}>
            DHL Express
            <div style={{ height: '2px', background: '#d40511', marginTop: '2px' }} />
          </div>
          <button
            type="button"
            onClick={() => setDrawer(false)}
            style={{ width: 36, height: 36, borderRadius: 18, background: '#f3f4f6', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={18} color="#374151" />
          </button>
        </div>

        {/* Drawer body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 32px' }}>

          {/* ── บริการหลัก ── */}
          <h3 style={{ marginBottom: 12, borderBottom: '1px solid #eaeaea', paddingBottom: 8, fontSize: '1rem', color: '#111' }}>บริการอื่นๆ</h3>
          <div className="sidebar-action-grid" style={{ marginBottom: 20 }}>
            {[
              { icon: <Calculator size={22} color="var(--primary-accent)" />, label: 'ตรวจสอบค่าบริการ', sub: 'คำนวณราคาพัสดุ', path: '/calculate' },
              { icon: <Truck size={22} color="var(--primary-accent)" />, label: 'ลงทะเบียนพัสดุ', sub: 'เริ่มการจัดส่งใหม่', path: '/register-package' },
              { icon: <Store size={22} color="var(--primary-accent)" />, label: 'จุดรับพัสดุใกล้ฉัน', sub: 'ค้นหาสาขา DHL', path: '/map' },
              { icon: <Package size={22} color="var(--primary-accent)" />, label: 'ประวัติการจัดส่ง', sub: 'ดูรายการที่ผ่านมา', path: '/history' },
            ].map(({ icon, label, sub, path }) => (
              <div
                key={label}
                className="circle-btn-container sidebar-action-item"
                onClick={() => { navigate(path); setDrawer(false); }}
                style={{ cursor: 'pointer' }}
              >
                <div className="circle-btn sidebar-circle">
                  {icon}
                </div>
                <div>
                  <span className="sidebar-action-text" style={{ display: 'block' }}>{label}</span>
                  <span style={{ fontSize: '0.72rem', color: '#9ca3af' }}>{sub}</span>
                </div>
              </div>
            ))}
          </div>

          {/* ── Green Passport promo card ── */}
          <div
            onClick={() => { navigate('/green-passport'); setDrawer(false); }}
            style={{
              borderRadius: 16, marginBottom: 16,
              background: 'linear-gradient(135deg, #003d20 0%, #007a40 55%, #00c472 100%)',
              padding: '18px 20px', cursor: 'pointer', position: 'relative', overflow: 'hidden',
              boxShadow: '0 6px 24px rgba(0,196,114,0.2)',
            }}
          >
            <div style={{ position: 'absolute', top: -18, right: -18, width: 70, height: 70, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
            <div style={{ border: '1px solid rgba(255,255,255,0.3)', borderRadius: 20, padding: '2px 10px', fontSize: '0.6rem', color: 'rgba(255,255,255,0.75)', letterSpacing: '1.5px', marginBottom: 8, display: 'inline-block', fontWeight: 600 }}>DHL GREEN PASSPORT</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fff', lineHeight: 1.2, marginBottom: 4 }}>Green Passport</div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#ffcc00', marginBottom: 12 }}>เครือข่ายความยั่งยืนข้ามทวีป</div>
            <div style={{ background: '#ffcc00', borderRadius: 20, padding: '7px 16px', fontSize: '0.78rem', fontWeight: 700, color: '#111', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              เริ่มจำลองเลย <ArrowRight size={13} />
            </div>
          </div>



          {/* ── GoGreen Tips ── */}
          <div className="card" style={{ padding: '16px 18px', marginBottom: 16, background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
            <h3 style={{ color: '#059669', marginBottom: 10, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Leaf size={15} color="#059669" /> GoGreen Plus Tips
            </h3>
            {[
              '♻️ ใช้กล่องรีไซเคิลช่วยลด CO₂ ได้ถึง 12%',
              '- SAF เชื้อเพลิงอากาศยานยั่งยืน ลดคาร์บอน 80%',
              '- แพ็คสินค้าให้กระชับ ลดพื้นที่ขนส่ง ลดก๊าซ',
            ].map((tip, i) => (
              <p key={i} style={{ fontSize: '0.82rem', color: '#065f46', marginBottom: i < 2 ? 6 : 0 }}>{tip}</p>
            ))}
          </div>

        </div>
      </div>

      {/* ════════════════════════════════════════════════════
          TOP HEADER
      ════════════════════════════════════════════════════ */}
      <header className="dhl-top-header">
        <div className="dhl-container dhl-header-flex">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* Hamburger button */}
            <button
              type="button"
              onClick={() => setDrawer(true)}
              style={{ width: 40, height: 40, borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
              title="เมนูบริการ"
            >
              <Menu size={24} color="#333" />
            </button>

            {/* Logo */}
            <div className="dhl-logo">
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--primary-accent)', fontStyle: 'italic', letterSpacing: '-1px', lineHeight: 1 }}>
                DHL Express
                <div style={{ height: '3px', width: '100%', background: 'var(--primary-accent)', marginTop: '2px' }}></div>
              </div>
            </div>
          </div>

          <div className="dhl-top-actions hide-mobile">
            <div className="dhl-action-item">
              <Search size={16} /> ค้นหา
            </div>
            <div className="dhl-action-item">
              <Globe size={16} /> ไทย &nbsp;<span style={{ color: '#666', fontWeight: 'normal' }}>EN</span> &nbsp;<strong>TH</strong>
            </div>
            {/* Profile button desktop */}
            <button type="button" onClick={() => navigate('/profile')}
              style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#d40511', border: 'none', borderRadius: 20, padding: '6px 14px', cursor: 'pointer', color: '#fff', fontWeight: 700, fontSize: '0.78rem' }}>
              <div style={{ width: 22, height: 22, borderRadius: 11, background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={12} color="#fff" />
              </div>
              โปรไฟล์
            </button>
          </div>
          {/* Mobile Right Action */}
          <div className="hide-desktop" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img
              src="https://flagcdn.com/w40/th.png"
              width="28" height="20"
              alt="TH"
              style={{ borderRadius: 4, objectFit: 'cover', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}
            />
            <ChevronDown size={16} />
            <button type="button" onClick={() => navigate('/profile')}
              style={{ width: 34, height: 34, borderRadius: 17, background: '#d40511', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={16} color="#fff" />
            </button>
          </div>
        </div>
      </header>

      {/* Secondary Header (Desktop Only) */}
      <nav className="dhl-sec-header hide-mobile">
        <div className="dhl-container dhl-sec-flex">
          <div className="dhl-nav-links">
            <a href="#" className="dhl-nav-link active">ตรวจสอบสถานะการจัดส่ง</a>
            <a href="#" className="dhl-nav-link">การจัดส่ง <ChevronDown size={14} /></a>
            <a href="#" className="dhl-nav-link">บริการโลจิสติกส์สำหรับวิสาหกิจขนาดใหญ่ <ChevronDown size={14} /></a>
            <a href="#" className="dhl-nav-link">ฝ่ายบริการลูกค้า</a>
          </div>
          <div className="dhl-nav-links">
            <a href="#" className="dhl-nav-link">การเข้าสู่ระบบพอร์ทัลของลูกค้า <ChevronDown size={14} /></a>
          </div>
        </div>
      </nav>

      {/* Main Layout Area — no static sidebar anymore */}
      <div className="dhl-container" style={{ paddingTop: 50, paddingBottom: 80 }}>

        {/* Main Content Area */}
        <main>
          <div className="hide-mobile">
            <h1 className="dhl-page-title">ติดตามสถานะการจัดส่ง</h1>

            <div className="dhl-track-box-bg">
              <div className="dhl-track-box">
                <input
                  type="text"
                  placeholder="กรอกหมายเลขติดตาม (เช่น GP-XXXXXX-TH)"
                  className="dhl-track-input"
                  value={trackInput}
                  onChange={e => setTrackInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleTrack()}
                />
                <button className="dhl-track-btn" onClick={handleTrack}>ติดตาม</button>
              </div>
            </div>

            {/* Track Result */}
            {trackNotFound && (
              <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 10, padding: '12px 16px', marginTop: 12, fontSize: '0.82rem', color: '#9a3412' }}>
                ⚠️ ไม่พบหมายเลข <strong>{trackInput}</strong> ในระบบ
              </div>
            )}
            {trackResult && (
              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, marginTop: 14, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <div style={{ background: 'linear-gradient(135deg,#b91c1c,#d40511)', padding: '14px 16px' }}>
                  <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '1.5px' }}>หมายเลขติดตาม</div>
                  <div style={{ color: '#fff', fontWeight: 900, fontSize: '1.1rem', letterSpacing: '1px' }}>{trackResult.tracking}</div>
                  <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.72rem', marginTop: 2 }}>📅 {fmt(trackResult.ts)}</div>
                </div>
                <div style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                    <div style={{ flex: 1, background: '#f9fafb', borderRadius: 10, padding: '10px 12px' }}>
                      <div style={{ fontSize: '0.6rem', color: '#9ca3af', fontWeight: 700, marginBottom: 2 }}>ต้นทาง</div>
                      <div style={{ fontWeight: 700, fontSize: '0.82rem' }}><img src="https://flagcdn.com/w40/th.png" alt="TH" width={16} height={11} style={{ borderRadius: 2, objectFit: 'cover', verticalAlign: 'middle', marginRight: 3 }} /> {trackResult.origin}</div>
                    </div>
                    <div style={{ flex: 1, background: '#f9fafb', borderRadius: 10, padding: '10px 12px' }}>
                      <div style={{ fontSize: '0.6rem', color: '#9ca3af', fontWeight: 700, marginBottom: 2 }}>ปลายทาง</div>
                      <div style={{ fontWeight: 700, fontSize: '0.82rem' }}>{trackResult.dest}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                    {[
                      { label: 'น้ำหนัก', val: `${trackResult.weight} kg`, bg: '#f9fafb', color: '#374151' },
                      { label: 'CO₂ ลดได้', val: `${trackResult.co2saved} kg`, bg: '#f0fdf4', color: '#059669' },
                      { label: 'เทียบเท่า', val: `${trackResult.trees} ต้นไม้`, bg: '#f0fdf4', color: '#059669' },
                    ].map(({ label, val, bg, color }) => (
                      <div key={label} style={{ flex: 1, background: bg, borderRadius: 10, padding: '8px', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.55rem', color: '#9ca3af', fontWeight: 700 }}>{label}</div>
                        <div style={{ fontWeight: 800, fontSize: '0.82rem', color, marginTop: 2 }}>{val}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {[
                      { label: 'รับพัสดุแล้ว', done: true },
                      { label: 'กำลังเตรียมจัดส่ง', done: true },
                      { label: 'ส่งให้ผู้ให้บริการขนส่ง', done: false },
                      { label: 'ขนส่งระหว่างประเทศ', done: false },
                    ].map((t, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 14, height: 14, borderRadius: 7, background: t.done ? '#d40511' : '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {t.done && <Check size={8} color="#fff" strokeWidth={3} />}
                        </div>
                        <span style={{ fontSize: '0.78rem', color: t.done ? '#111' : '#9ca3af', fontWeight: t.done ? 600 : 400 }}>{t.label}</span>
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={() => { setTrackResult(null); setTrackInput(''); }}
                    style={{ width: '100%', marginTop: 14, padding: '10px', borderRadius: 10, border: '1px solid #e5e7eb', background: '#f9fafb', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, color: '#6b7280' }}>
                    ปิด
                  </button>
                </div>
              </div>
            )}

            {/* FAQ Section */}
            <div className="dhl-faq-section">
              <h2 className="dhl-faq-title">คำถามที่พบบ่อย</h2>
              <div className="dhl-faq-list">
                {faqs.map((faq, index) => (
                  <div key={index} className="dhl-faq-item">
                    <div className="dhl-faq-question" onClick={() => toggleFaq(index)}>
                      <span>{faq.q}</span>
                      {openFaq === index ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                    {openFaq === index && (
                      <div className="dhl-faq-answer">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile only content */}
          <div className="hide-desktop mobile-extra-content">
            <div className="dhl-search-box" style={{ background: '#fff', borderRadius: '4px', padding: '12px 16px', display: 'flex', alignItems: 'center', margin: '0 20px', gap: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <Search size={20} color="var(--primary-accent)" />
              <input
                type="text"
                placeholder="ระบุหมายเลขติดตามสถานะพัสดุ"
                value={trackInput}
                onChange={e => setTrackInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleTrack()}
                style={{ border: 'none', outline: 'none', width: '100%', fontSize: '1rem', color: '#333' }}
              />
              <ScanBarcode color="var(--primary-accent)" size={24} onClick={handleTrack} style={{ cursor: 'pointer' }} />
            </div>

            {/* Mobile Track Result */}
            {trackNotFound && (
              <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 10, padding: '12px 16px', margin: '8px 20px 0', fontSize: '0.82rem', color: '#9a3412' }}>
                ⚠️ ไม่พบหมายเลข <strong>{trackInput}</strong> ในระบบ
              </div>
            )}
            {trackResult && (
              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, margin: '10px 20px 0', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <div style={{ background: 'linear-gradient(135deg,#b91c1c,#d40511)', padding: '14px 16px' }}>
                  <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '1.5px' }}>หมายเลขติดตาม</div>
                  <div style={{ color: '#fff', fontWeight: 900, fontSize: '1.1rem', letterSpacing: '1px' }}>{trackResult.tracking}</div>
                  <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.72rem', marginTop: 2 }}>📅 {fmt(trackResult.ts)}</div>
                </div>
                <div style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                    <div style={{ flex: 1, background: '#f9fafb', borderRadius: 10, padding: '10px 12px' }}>
                      <div style={{ fontSize: '0.6rem', color: '#9ca3af', fontWeight: 700, marginBottom: 2 }}>ต้นทาง</div>
                      <div style={{ fontWeight: 700, fontSize: '0.82rem' }}><img src="https://flagcdn.com/w40/th.png" alt="TH" width={16} height={11} style={{ borderRadius: 2, objectFit: 'cover', verticalAlign: 'middle', marginRight: 3 }} /> {trackResult.origin}</div>
                    </div>
                    <div style={{ flex: 1, background: '#f9fafb', borderRadius: 10, padding: '10px 12px' }}>
                      <div style={{ fontSize: '0.6rem', color: '#9ca3af', fontWeight: 700, marginBottom: 2 }}>ปลายทาง</div>
                      <div style={{ fontWeight: 700, fontSize: '0.82rem' }}>{trackResult.dest}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[
                      { label: 'น้ำหนัก', val: `${trackResult.weight} kg`, bg: '#f9fafb', color: '#374151' },
                      { label: 'CO₂ ลดได้', val: `${trackResult.co2saved} kg`, bg: '#f0fdf4', color: '#059669' },
                      { label: 'เทียบเท่า', val: `${trackResult.trees} ต้นไม้`, bg: '#f0fdf4', color: '#059669' },
                    ].map(({ label, val, bg, color }) => (
                      <div key={label} style={{ flex: 1, background: bg, borderRadius: 10, padding: '8px', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.55rem', color: '#9ca3af', fontWeight: 700 }}>{label}</div>
                        <div style={{ fontWeight: 800, fontSize: '0.82rem', color, marginTop: 2 }}>{val}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Action Grid — 3 items row */}
            <div className="action-grid" style={{ marginTop: '20px' }}>
              <div className="circle-btn-container" onClick={() => navigate('/calculate')}>
                <div className="circle-btn">
                  <Calculator size={32} color="var(--primary-accent)" />
                </div>
                <span className="circle-btn-text">ตรวจสอบค่าบริการ</span>
              </div>
              <div className="circle-btn-container" onClick={() => navigate('/register-package')}>
                <div className="circle-btn">
                  <Truck size={32} color="var(--primary-accent)" />
                </div>
                <span className="circle-btn-text">ลงทะเบียนพัสดุ</span>
              </div>
              <div className="circle-btn-container" onClick={() => navigate('/map')}>
                <div className="circle-btn">
                  <Store size={32} color="var(--primary-accent)" />
                </div>
                <span className="circle-btn-text">จุดรับพัสดุ</span>
              </div>
            </div>

            {/* Green Passport — full-width hero card */}
            <div
              onClick={() => navigate('/green-passport')}
              style={{
                margin: '24px 10px 0',
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #003d20 0%, #007a40 50%, #00c472 100%)',
                padding: '24px 24px 20px',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 8px 32px rgba(0,196,114,0.25)',
              }}>
              <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
              <div style={{ position: 'absolute', bottom: '-20px', right: '60px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
              <div style={{ display: 'inline-block', border: '1px solid rgba(255,255,255,0.35)', borderRadius: '20px', padding: '3px 12px', fontSize: '0.7rem', color: 'rgba(255,255,255,0.8)', letterSpacing: '1.5px', marginBottom: '14px', fontWeight: 600 }}>
                DHL GREEN PASSPORT
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff', lineHeight: 1.15, marginBottom: '6px' }}>
                Green Passport
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#ffcc00', marginBottom: '12px', lineHeight: 1.3 }}>
                เครือข่ายความยั่งยืน<br />ข้ามทวีป
              </div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, marginBottom: '20px', maxWidth: '240px' }}>
                จำลองเส้นทางพัสดุ คำนวณคาร์บอน และรับ Wrapped Poster ที่แชร์ได้
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ background: '#ffcc00', borderRadius: '30px', padding: '10px 22px', fontSize: '0.9rem', fontWeight: 700, color: '#111', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  เริ่มจำลองเลย <ArrowRight size={16} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                  <Leaf size={32} color="rgba(255,255,255,0.2)" strokeWidth={1.5} />
                </div>
              </div>
            </div>

            <div className="card" style={{ marginTop: '40px', textAlign: 'center', marginBottom: '80px' }}>
              <h3 style={{ color: 'var(--primary-accent)', marginBottom: '10px', fontSize: '1.2rem' }}>ประกาศสำคัญ</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '15px' }}>
                ยินดีต้อนรับสู่แอปพลิเคชัน Antigravity Delivery ต้นแบบ<br />
                ขณะนี้ระบบกำลังอยู่ในระหว่างการพัฒนาและทดสอบฟังก์ชันต่างๆ
              </p>
            </div>
          </div>
        </main>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
      <GlobalImpactWidget />
    </div>
  );
}
