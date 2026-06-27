import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft, Package, Leaf, Award, Lock, TrendingUp, Zap, Globe,
  Share2, Flame, Plane, RefreshCcw, Crown, TreePine,
  Download, X, Send, Sparkles, Check, Truck,
} from 'lucide-react';
import html2canvas from 'html2canvas';
import Wrapped, { type WrappedData } from './Wrapped';

const F = "'Inter','Kanit',sans-serif";
const YELLOW = '#FFCC00';
const GREEN  = '#059669';
const GRAY   = '#6b7280';

/* ── Censor phone ── */
const censorPhone = (p: string) => {
  const d = p.replace(/\D/g, '');
  if (d.length >= 8) return d.slice(0, 3) + '****' + d.slice(-2);
  return '***-***-****';
};

interface Badge {
  id: string;
  icon: React.ReactNode;
  name: string;
  desc: string;
  unlocked: boolean;
  color: string;
}

const BADGES: Badge[] = [
  { id:'first',   icon:<Leaf size={16}/>,   name:'First Step',      desc:'GoGreen ครั้งแรก',        unlocked:false, color:'#059669' },
  { id:'green5',  icon:<Award size={16}/>,       name:'GoGreen Sender',  desc:'GoGreen 5 ครั้ง',        unlocked:false, color:'#16a34a' },
  { id:'co2_10',  icon:<Globe size={16}/>,      name:'Carbon Saver',    desc:'ลด CO₂e 50 kg',           unlocked:false, color:'#0284c7' },
  { id:'tree10',  icon:<TreePine size={16}/>,   name:'Tree Planter',    desc:'ต้นไม้ 10 ต้น',          unlocked:false, color:'#15803d' },
  { id:'streak7', icon:<Flame size={16}/>,      name:'Weekend Sender',  desc:'ส่งของวันเสาร์ อาทิตย์', unlocked:false, color:'#dc2626' },
  { id:'intl',    icon:<Plane size={16}/>,      name:'Global Sender',   desc:'ส่ง 10 ประเทศ',          unlocked:false, color:'#7c3aed' },
  { id:'fast',    icon:<Zap size={16}/>,        name:'Early Bird',      desc:'ส่งก่อน 11 โมง',         unlocked:false, color:'#f59e0b' },
  { id:'eco100',  icon:<RefreshCcw size={16}/>, name:'GoGreen Hero',    desc:'GoGreen 100 ครั้ง',      unlocked:false, color:'#10b981' },
  { id:'legend',  icon:<Crown size={16}/>,      name:'DHL Legend',      desc:'ส่ง 500 ครั้ง',           unlocked:false, color:'#d97706' },
];

export default function Profile() {
  const navigate = useNavigate();
  const [history, setHistory]     = useState<any[]>([]);
  const [sharing, setSharing]     = useState(false);
  const [preview, setPreview]     = useState<{ url: string; blob: Blob } | null>(null);
  const [showWrapped, setShowWrapped] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);

  /* ── Claimed badges (persist ‘seen’ state to localStorage) ── */
  const [claimedBadges, setClaimedBadges] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem('claimed_badges');
      return raw ? new Set(JSON.parse(raw)) : new Set<string>();
    } catch { return new Set<string>(); }
  });
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [isNewUnlock, setIsNewUnlock]     = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem('shipment_history');
    if (raw) try { setHistory(JSON.parse(raw)); } catch {}
  }, []);

  const userName  = localStorage.getItem('user_name')  || 'อิ้ง';
  const userPhone = censorPhone(localStorage.getItem('user_phone') || '0812345678');

  const totalShipments = history.length;
  const greenShipments = history.filter(s => s.co2saved > 0).length;
  const totalCo2       = history.reduce((a, s) => a + (s.co2saved || 0), 0);
  const totalTrees     = history.reduce((a, s) => a + (s.trees    || 0), 0);
  const domesticCount  = history.filter(s => s.type === 'domestic').length;
  const intlCount      = history.filter(s => s.type !== 'domestic').length;
  const greenPct       = totalShipments > 0 ? Math.round((greenShipments / totalShipments) * 100) : 0;

  /* ── Compute badge unlocked state from real stats ── */
  const computedBadges: Badge[] = BADGES.map(b => ({
    ...b,
    unlocked: (() => {
      switch (b.id) {
        case 'first':   return greenShipments >= 1;
        case 'green5':  return greenShipments >= 5;
        case 'co2_10':  return totalCo2 >= 50;
        case 'tree10':  return totalTrees >= 10;
        case 'streak7': return totalShipments >= 7;
        case 'intl':    return intlCount >= 10;
        case 'fast':    return totalShipments >= 10;
        case 'eco100':  return greenShipments >= 100;
        case 'legend':  return totalShipments >= 500;
        default:        return false;
      }
    })()
  }));

  /* ── Badge tap handler ── */
  const handleBadgeClick = (b: Badge) => {
    const isNew = b.unlocked && !claimedBadges.has(b.id);
    setSelectedBadge(b);
    setIsNewUnlock(isNew);
    if (isNew) {
      const next = new Set([...claimedBadges, b.id]);
      setClaimedBadges(next);
      localStorage.setItem('claimed_badges', JSON.stringify([...next]));
    }
  };

  /* ── Wrapped data ── */
  const destCounts = history.reduce((acc: Record<string, number>, s) => {
    const d = s.destName || s.dest || '';
    if (d) acc[d] = (acc[d] || 0) + 1;
    return acc;
  }, {});
  const topDestEntry = Object.entries(destCounts).sort((a, b) => (b[1] as number) - (a[1] as number))[0];
  const topDest      = topDestEntry?.[0] || 'ยังไม่มี';
  const topDestCount = (topDestEntry?.[1] as number) || 0;
  const topDestFlag  = (() => {
    const destStr = history.find(s => (s.destName || s.dest || '') === topDest)?.dest || '';
    return [...destStr].slice(0, 2).join(''); // flag = 2 Regional Indicator Symbols
  })();

  const wrappedData: WrappedData = {
    totalShipments, greenShipments, greenPct, totalCo2, totalTrees,
    intlCount, domesticCount,
    topDest, topDestFlag, topDestCount,
    badgeCount: computedBadges.filter(b => b.unlocked).length,
    totalBadges: computedBadges.length,
    userName,
  };

  /* ── Step 1: Capture → show preview modal ── */
  const handleCaptureShare = async () => {
    if (!summaryRef.current || sharing) return;
    setSharing(true);
    try {
      const canvas = await html2canvas(summaryRef.current, {
        scale: 2, useCORS: true, backgroundColor: '#ffffff',
      });
      const url = canvas.toDataURL('image/png');
      canvas.toBlob((blob) => {
        if (blob) setPreview({ url, blob });
        setSharing(false);
      }, 'image/png');
    } catch { setSharing(false); }
  };

  /* ── Step 2a: Save to device ── */
  const handleSave = () => {
    if (!preview) return;
    const a = document.createElement('a');
    a.href = preview.url;
    a.download = 'dhl-green-passport.png';
    a.click();
  };

  /* ── Step 2b: Share via system sheet ── */
  const handleSystemShare = async () => {
    if (!preview) return;
    const file = new File([preview.blob], 'dhl-green-passport.png', { type: 'image/png' });
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        title: 'DHL Green Passport',
        text: `${userName} — ส่ง ${totalShipments} ครั้ง · ลด CO₂ ${totalCo2.toFixed(2)} kg`,
        files: [file],
      });
    } else {
      handleSave();
    }
    setPreview(null);
  };

  const SUMMARY_ROWS = [
    { icon:<Package size={14} color={GRAY}/>,     label:'ส่งทั้งหมด',      val:`${totalShipments} ครั้ง` },
    { icon:<Leaf size={14} color={GRAY}/>,         label:'GoGreen Plus',     val:`${greenShipments} ครั้ง` },
    { icon:<TrendingUp size={14} color={GRAY}/>,   label:'CO₂ ที่ลดได้',    val:`${totalCo2.toFixed(2)} kg` },
    { icon:<TreePine size={14} color={GRAY}/>,     label:'ต้นไม้เทียบเท่า', val:`${totalTrees.toFixed(2)} ต้น` },
    { icon:<Globe size={14} color={GRAY}/>,        label:'ส่งต่างประเทศ',   val:`${intlCount} ครั้ง` },
    { icon:<Package size={14} color={GRAY}/>,      label:'ส่งในประเทศ',     val:`${domesticCount} ครั้ง` },
    { icon:<Zap size={14} color={GRAY}/>,          label:'% GoGreen',        val:`${greenPct}%` },
    { icon:<Award size={14} color={GRAY}/>,        label:'เหรียญที่ปลดล็อก', val:`${computedBadges.filter(b=>b.unlocked).length}/${computedBadges.length}` },
  ];

  return (
    <div className="profile-page" style={{ fontFamily:F, background:'#f0f4f8', minHeight:'100vh', paddingBottom:20 }}>
      <style>{`
        .badge-item { transition: transform 0.18s ease; cursor: pointer; }
        .badge-item:hover { transform: scale(1.08) translateY(-2px); }
        @keyframes sheet-up    { from{transform:translateY(100%);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes badgeUnlock { 0%{transform:scale(0.2);opacity:0} 65%{transform:scale(1.18)} 100%{transform:scale(1);opacity:1} }
        @keyframes redDotPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.4)} }
        @keyframes p-truck     { from{transform:translateX(-70px)} to{transform:translateX(calc(100vw + 70px))} }
        @keyframes p-truck-rev { from{transform:translateX(calc(100vw + 70px))} to{transform:translateX(-70px)} }
        @keyframes p-road      { from{transform:translateX(0)} to{transform:translateX(-52px)} }
        .share-sheet { animation: sheet-up 0.32s cubic-bezier(0.4,0,0.2,1); }
      `}</style>

      {/* Wrapped overlay — full screen fixed */}
      {showWrapped && (
        <div style={{ position:'fixed', inset:0, zIndex:6000, background:'#000' }}>
          <Wrapped data={wrappedData} onClose={() => setShowWrapped(false)}/>
        </div>
      )}

      {/* ── Badge popup ── */}
      {selectedBadge && (() => {
        const isUnlocked = selectedBadge.unlocked;
        return (
          <div style={{ position:'fixed', inset:0, zIndex:9999, background:'rgba(0,0,0,0.55)', backdropFilter:'blur(5px)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}
            onClick={() => setSelectedBadge(null)}>
            <div style={{ background:'#fff', borderRadius:26, padding:'30px 22px 24px', maxWidth:290, width:'100%', textAlign:'center', boxShadow:'0 24px 70px rgba(0,0,0,0.22)' }}
              onClick={e => e.stopPropagation()}>

              {/* Icon */}
              <div style={{
                width:72, height:72, borderRadius:36, margin:'0 auto 14px',
                background: isUnlocked ? `${selectedBadge.color}18` : '#f3f4f6',
                border: `3px solid ${isUnlocked ? selectedBadge.color : '#e5e7eb'}`,
                display:'flex', alignItems:'center', justifyContent:'center',
                color: isUnlocked ? selectedBadge.color : '#9ca3af',
                animation: isNewUnlock ? 'badgeUnlock 0.55s cubic-bezier(0.34,1.5,0.64,1) both' : 'none',
                boxShadow: isUnlocked ? `0 0 24px ${selectedBadge.color}44` : 'none',
              }}>
                <div style={{ transform:'scale(2)' }}>
                  {isUnlocked ? selectedBadge.icon : <Lock size={16} color="#9ca3af"/>}
                </div>
              </div>

              {/* Status badge */}
              {isNewUnlock && (
                <div style={{ fontSize:'1.1rem', marginBottom:8, animation:'badgeUnlock 0.6s 0.15s both', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Sparkles size={22} color="#f59e0b"/>
                </div>
              )}
              <div style={{ display:'inline-flex', alignItems:'center', gap:5,
                background: isUnlocked ? `${selectedBadge.color}15` : '#f3f4f6',
                border: `1px solid ${isUnlocked ? selectedBadge.color+'40' : '#e5e7eb'}`,
                borderRadius:20, padding:'4px 14px', marginBottom:12,
                fontSize:'0.65rem', fontWeight:700,
                color: isUnlocked ? selectedBadge.color : '#9ca3af' }}>
                {isUnlocked
                  ? (isNewUnlock
                    ? <><Check size={10}/> ปลดล็อกแล้ว! ยินดีด้วย!</>
                    : <><Check size={10}/> ปลดล็อกแล้ว</>)
                  : <><Lock size={10}/> ยังไม่ปลดล็อก</>}
              </div>

              <div style={{ fontSize:'1.05rem', fontWeight:900, color:'#111', marginBottom:6 }}>{selectedBadge.name}</div>
              <div style={{ fontSize:'0.78rem', color:'#6b7280', lineHeight:1.7, marginBottom:16 }}>{selectedBadge.desc}</div>

              <button type="button" onClick={() => setSelectedBadge(null)}
                style={{ width:'100%', padding:'12px', borderRadius:14, border:'none',
                  background: isUnlocked ? selectedBadge.color : '#f3f4f6',
                  color: isUnlocked ? '#fff' : '#9ca3af',
                  fontWeight:700, fontSize:'0.85rem', cursor:'pointer',
                  fontFamily:F }}>
                เข้าใจแล้ว!
              </button>
            </div>
          </div>
        );
      })()}

      {/* ══ Share Preview Modal ══ */}
      {preview && (
        <div style={{ position:'fixed', inset:0, zIndex:3000, background:'rgba(0,0,0,0.75)', backdropFilter:'blur(6px)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'flex-end' }}
          onClick={() => setPreview(null)}>
          <div className="share-sheet" onClick={e => e.stopPropagation()}
            style={{ width:'100%', maxWidth:520, background:'#fff', borderRadius:'24px 24px 0 0', padding:'20px 20px 36px', boxShadow:'0 -8px 40px rgba(0,0,0,0.25)' }}>

            {/* Handle bar */}
            <div style={{ width:36, height:4, borderRadius:2, background:'#e5e7eb', margin:'0 auto 16px' }}/>

            {/* Title row */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
              <span style={{ fontWeight:800, fontSize:'1rem', color:'#111' }}>แชร์สรุปผล</span>
              <button type="button" onClick={() => setPreview(null)} style={{ width:32, height:32, borderRadius:16, background:'#f3f4f6', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <X size={16} color="#6b7280"/>
              </button>
            </div>

            {/* Image Preview */}
            <div style={{ borderRadius:14, overflow:'hidden', border:'1px solid #e5e7eb', marginBottom:20, boxShadow:'0 4px 16px rgba(0,0,0,0.1)' }}>
              <img src={preview.url} alt="preview" style={{ width:'100%', display:'block' }}/>
            </div>

            {/* Action buttons */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              <button type="button" onClick={handleSave}
                style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8, padding:'16px 12px', borderRadius:14, border:'1.5px solid #e5e7eb', background:'#f9fafb', cursor:'pointer' }}>
                <div style={{ width:44, height:44, borderRadius:22, background:'#f3f4f6', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Download size={20} color="#374151"/>
                </div>
                <span style={{ fontSize:'0.78rem', fontWeight:700, color:'#374151' }}>บันทึกลงเครื่อง</span>
              </button>

              <button type="button" onClick={handleSystemShare}
                style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8, padding:'16px 12px', borderRadius:14, border:'1.5px solid #bbf7d0', background:'#f0fdf4', cursor:'pointer' }}>
                <div style={{ width:44, height:44, borderRadius:22, background:'#059669', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Send size={20} color="#fff"/>
                </div>
                <span style={{ fontSize:'0.78rem', fontWeight:700, color:'#059669' }}>แชร์ไปยัง...</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div style={{ background:YELLOW, padding:'62px 20px 28px', position:'relative', overflow:'hidden' }}>
        {/* Road dashes at bottom of header */}
        <div style={{ position:'absolute', bottom:0, left:0, right:-52, height:2,
          background:'repeating-linear-gradient(90deg,rgba(0,0,0,0.18) 0,rgba(0,0,0,0.18) 20px,transparent 20px,transparent 52px)',
          animation:'p-road 1s linear infinite', willChange:'transform' }}/>
        {/* Truck left → right */}
        <div style={{ position:'absolute', bottom:5, left:0, animation:'p-truck 9s linear 0s infinite', opacity:0.2 }}>
          <Truck size={20} color="#111"/>
        </div>
        {/* Truck right → left */}
        <div style={{ position:'absolute', bottom:7, animation:'p-truck-rev 14s linear 5s infinite', opacity:0.12 }}>
          <div style={{ transform:'scaleX(-1)' }}><Truck size={15} color="#111"/></div>
        </div>

        <button type="button" onClick={() => navigate(-1)}
          style={{ position:'absolute', top:14, left:14, width:36, height:36, borderRadius:18, background:'rgba(0,0,0,0.1)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <ChevronLeft size={20} color="#333"/>
        </button>

        <button type="button" onClick={handleCaptureShare} disabled={sharing}
          style={{ position:'absolute', top:14, right:14, display:'flex', alignItems:'center', gap:5, background:'rgba(0,0,0,0.1)', border:'none', borderRadius:20, padding:'7px 13px', cursor:'pointer', fontSize:'0.72rem', fontWeight:700, color:'#111', opacity:sharing?0.6:1 }}>
          <Share2 size={14} color="#111"/>
          {sharing ? 'กำลังสร้าง...' : 'แชร์'}
        </button>

        {/* Wrapped button */}
        <button type="button" onClick={() => setShowWrapped(true)}
          style={{ position:'absolute', top:52, right:14, display:'flex', alignItems:'center', gap:5, background:'rgba(0,0,0,0.85)', border:'none', borderRadius:20, padding:'7px 13px', cursor:'pointer', fontSize:'0.72rem', fontWeight:700, color:'#FFCC00' }}>
          <Sparkles size={13} color="#FFCC00"/>
          {new Date().getFullYear()} Wrapped
        </button>

        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <div style={{ width:64, height:64, borderRadius:32, background:'#fde68a', border:'3px solid #fff', boxShadow:'0 4px 12px rgba(0,0,0,0.15)', flexShrink:0, overflow:'hidden', display:'flex', alignItems:'flex-end', justifyContent:'center' }}>
            <svg viewBox="0 0 64 72" style={{ width:64, height:72 }}>
              {/* Body / shirt */}
              <path d="M8 72 C8 55 20 48 32 48 C44 48 56 55 56 72 Z" fill="#D97706"/>
              {/* Neck */}
              <rect x="27" y="36" width="10" height="14" rx="5" fill="#FBBF6B"/>
              {/* Head */}
              <circle cx="32" cy="26" r="14" fill="#FBBF6B"/>
              {/* Hair */}
              <path d="M18 22 Q18 8 32 8 Q46 8 46 22 Q46 16 32 14 Q18 16 18 22 Z" fill="#78350F"/>
              {/* Eyes */}
              <circle cx="26" cy="25" r="1.8" fill="#1a1a1a"/>
              <circle cx="38" cy="25" r="1.8" fill="#1a1a1a"/>
              {/* Smile */}
              <path d="M26 32 Q32 37 38 32" stroke="#92400E" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <div style={{ fontWeight:900, fontSize:'1.15rem', color:'#1a1a1a' }}>{userName}</div>
            <div style={{ fontSize:'0.78rem', color:'#4b4b4b', marginTop:2 }}>{userPhone}</div>
            <div style={{ display:'inline-flex', alignItems:'center', gap:4, background:'rgba(0,0,0,0.08)', borderRadius:20, padding:'2px 10px', marginTop:5, fontSize:'0.62rem', fontWeight:700, color:'#1a1a1a' }}>
              <Leaf size={9} color={GREEN}/> GoGreen Member
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding:'14px 14px 0' }}>

        {/* ── Two-column: Stats + Badges ── */}
        <div style={{ display:'flex', gap:12, alignItems:'stretch', marginBottom:12 }}>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              {[
                { icon:<Package size={18} color={GRAY}/>,     val:totalShipments,        unit:'ครั้ง', label:'ส่งทั้งหมด',  bg:'#f9f9f9', border:'#e5e7eb', valColor:'#111' },
                { icon:<Leaf size={18} color={GREEN}/>,       val:greenShipments,        unit:'ครั้ง', label:'GoGreen',      bg:'#f0fdf4', border:'#bbf7d0', valColor:GREEN },
                { icon:<TrendingUp size={18} color={GRAY}/>,  val:totalCo2.toFixed(2),   unit:'kg',    label:'ลด CO₂',      bg:'#f9f9f9', border:'#e5e7eb', valColor:'#111' },
                { icon:<TreePine size={18} color={GREEN}/>,   val:totalTrees.toFixed(2), unit:'ต้น',   label:'ต้นไม้เทียบ', bg:'#f0fdf4', border:'#bbf7d0', valColor:GREEN },
              ].map(({ icon, val, unit, label, bg, border, valColor }) => (
                <div key={label} style={{ background:bg, border:`1.5px solid ${border}`, borderRadius:12, padding:'12px 10px' }}>
                  <div style={{ marginBottom:6 }}>{icon}</div>
                  <div style={{ fontWeight:900, fontSize:'1.4rem', color:valColor, lineHeight:1 }}>{val}</div>
                  <div style={{ fontSize:'0.6rem', color:'#9ca3af', fontWeight:700 }}>{unit}</div>
                  <div style={{ fontSize:'0.65rem', color:'#374151', fontWeight:600, marginTop:2 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ flex:1 }}>
            <div style={{ background:'#fff', borderRadius:14, padding:'10px 8px 12px', border:'1px solid #f3f4f6', boxShadow:'0 1px 4px rgba(0,0,0,0.04)', height:'100%', boxSizing:'border-box' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8, padding:'0 4px' }}>
                <div style={{ fontSize:'0.72rem', fontWeight:800, color:'#111', display:'flex', alignItems:'center', gap:4 }}>
                  <Award size={13} color="#d97706"/> เหรียญ
                </div>
                <div style={{ fontSize:'0.55rem', color:'#9ca3af', fontWeight:600 }}>
                  {computedBadges.filter(b => b.unlocked).length}/{computedBadges.length}
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:6 }}>
                {computedBadges.map(b => {
                const hasNotif    = b.unlocked && !claimedBadges.has(b.id);
                  return (
                    <div key={b.id} className="badge-item"
                      style={{ textAlign:'center' }}
                      onClick={() => handleBadgeClick(b)}>

                      {/* Circle wrapper — dot anchored here */}
                      <div style={{ position:'relative', width:42, height:42, margin:'0 auto 4px' }}>
                        {hasNotif && (
                          <div style={{ position:'absolute', top:-3, right:-3, width:10, height:10, borderRadius:'50%', background:'#ef4444', border:'2px solid #fffbea', zIndex:10, animation:'redDotPulse 1s ease-in-out infinite' }}/>
                        )}
                        <div style={{ width:'100%', height:'100%', borderRadius:21, background:b.unlocked?`${b.color}18`:'#f3f4f6', border:`2px solid ${b.unlocked?b.color:'#e5e7eb'}`, display:'flex', alignItems:'center', justifyContent:'center', color:b.unlocked?b.color:'#9ca3af' }}>
                          {b.unlocked ? b.icon : <Lock size={14} color="#9ca3af"/>}
                        </div>
                      </div>
                      <div style={{ fontSize:'0.52rem', fontWeight:700, color:b.unlocked?'#111':'#9ca3af', lineHeight:1.2 }}>{b.name}</div>
                      <div style={{ fontSize:'0.48rem', color:'#9ca3af', marginTop:2, lineHeight:1.2 }}>{b.desc}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ── Summary Table (captured for share) ── */}
        <div ref={summaryRef} style={{ background:'#fff', borderRadius:14, border:'1px solid #f3f4f6', boxShadow:'0 1px 4px rgba(0,0,0,0.04)', overflow:'hidden', marginBottom:14 }}>
          <div style={{ background:YELLOW, padding:'10px 16px', display:'flex', alignItems:'center', gap:6 }}>
            <TrendingUp size={14} color="#111"/>
            <span style={{ fontSize:'0.82rem', fontWeight:800, color:'#111' }}>สรุปผลการส่งพัสดุ</span>
            <span style={{ marginLeft:'auto', fontSize:'0.65rem', color:'rgba(0,0,0,0.5)', fontWeight:600 }}>{userName}</span>
          </div>
          <div>
            {SUMMARY_ROWS.map((row, i) => (
              <div key={row.label} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 16px', borderBottom:i<SUMMARY_ROWS.length-1?'1px solid #f3f4f6':'none', background:i%2===1?'#fafafa':'#fff' }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  {row.icon}
                  <span style={{ fontSize:'0.8rem', color:'#374151', fontWeight:600 }}>{row.label}</span>
                </div>
                <span style={{ fontSize:'0.82rem', fontWeight:800, color:'#111' }}>{row.val}</span>
              </div>
            ))}
          </div>
          <div style={{ padding:'10px 16px', background:'#fffbeb', borderTop:'1px solid #fde68a', display:'flex', alignItems:'center', gap:6 }}>
            <Lock size={12} color="#92400e"/>
            <div style={{ fontSize:'0.68rem', color:'#92400e', fontWeight:600 }}>
              เหรียญจะปลดล็อกเมื่อถึงเป้าหมาย — เริ่มส่งพัสดุเพื่อสะสมเหรียญ!
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
