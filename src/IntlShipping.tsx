import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  ArrowLeft, ArrowRight, Check, ChevronDown, X, Camera,
  MapPin, Copy, User, Home, Package, RefreshCw,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const F = "'Inter','Kanit',sans-serif";
const GREEN = '#059669';
const DARK_GREEN = '#064e3b';


delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const bkkIcon = L.divIcon({ className: '', html: `<div style="width:14px;height:14px;background:#FFCC00;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.4)"></div>`, iconSize:[14,14], iconAnchor:[7,7] });
const destIcon = L.divIcon({ className: '', html: `<div style="width:14px;height:14px;background:#34d399;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.4)"></div>`, iconSize:[14,14], iconAnchor:[7,7] });

const BRANCHES = [
  { id:'bkk1', name:'DHL สาขาสีลม',      city:'กรุงเทพฯ', pos:[13.725,100.529] as [number,number] },
  { id:'bkk2', name:'DHL สาขาอโศก',       city:'กรุงเทพฯ', pos:[13.736,100.560] as [number,number] },
  { id:'bkk3', name:'DHL สาขาลาดพร้าว',   city:'กรุงเทพฯ', pos:[13.783,100.575] as [number,number] },
  { id:'bkk4', name:'DHL สาขาบางนา',      city:'กรุงเทพฯ', pos:[13.680,100.605] as [number,number] },
  { id:'bkk5', name:'DHL สาขาสุวรรณภูมิ', city:'กรุงเทพฯ', pos:[13.680,100.750] as [number,number] },
  { id:'cnx',  name:'DHL สาขาเชียงใหม่',  city:'เชียงใหม่', pos:[18.790,98.985]  as [number,number] },
  { id:'hkt',  name:'DHL สาขาภูเก็ต',     city:'ภูเก็ต',    pos:[7.880,98.398]   as [number,number] },
  { id:'kkn',  name:'DHL สาขาขอนแก่น',    city:'ขอนแก่น',   pos:[16.430,102.836] as [number,number] },
  { id:'pty',  name:'DHL สาขาพัทยา',      city:'ชลบุรี',    pos:[12.927,100.877] as [number,number] },
  { id:'hat',  name:'DHL สาขาหาดใหญ่',    city:'สงขลา',     pos:[7.007,100.474]  as [number,number] },
];

const COUNTRIES = [
  { code:'JP', flag:'🇯🇵', name:'ญี่ปุ่น',         city:'Tokyo',       dist:4600,  pos:[35.689,139.692]   as [number,number] },
  { code:'CN', flag:'🇨🇳', name:'จีน',             city:'Shanghai',    dist:2700,  pos:[31.230,121.473]   as [number,number] },
  { code:'US', flag:'🇺🇸', name:'สหรัฐอเมริกา',    city:'Los Angeles', dist:14000, pos:[34.052,-118.244]  as [number,number] },
  { code:'GB', flag:'🇬🇧', name:'สหราชอาณาจักร',  city:'London',      dist:9560,  pos:[51.508,-0.128]    as [number,number] },
  { code:'DE', flag:'🇩🇪', name:'เยอรมนี',         city:'Frankfurt',   dist:9230,  pos:[50.110,8.682]     as [number,number] },
  { code:'AU', flag:'🇦🇺', name:'ออสเตรเลีย',      city:'Sydney',      dist:7540,  pos:[-33.868,151.209]  as [number,number] },
  { code:'SG', flag:'🇸🇬', name:'สิงคโปร์',        city:'Singapore',   dist:1430,  pos:[1.352,103.820]    as [number,number] },
  { code:'HK', flag:'🇭🇰', name:'ฮ่องกง',          city:'Hong Kong',   dist:1730,  pos:[22.319,114.170]   as [number,number] },
  { code:'KR', flag:'🇰🇷', name:'เกาหลีใต้',       city:'Seoul',       dist:3700,  pos:[37.566,126.978]   as [number,number] },
  { code:'FR', flag:'🇫🇷', name:'ฝรั่งเศส',        city:'Paris',       dist:9330,  pos:[48.857,2.352]     as [number,number] },
  { code:'IN', flag:'🇮🇳', name:'อินเดีย',         city:'Mumbai',      dist:2900,  pos:[19.076,72.877]    as [number,number] },
  { code:'AE', flag:'🇦🇪', name:'UAE / ดูไบ',      city:'Dubai',       dist:4900,  pos:[25.204,55.270]    as [number,number] },
  { code:'MY', flag:'🇲🇾', name:'มาเลเซีย',        city:'KL',          dist:1200,  pos:[3.139,101.687]    as [number,number] },
  { code:'VN', flag:'🇻🇳', name:'เวียดนาม',        city:'Ho Chi Minh', dist:720,   pos:[10.823,106.630]   as [number,number] },
  { code:'ID', flag:'🇮🇩', name:'อินโดนีเซีย',     city:'Jakarta',     dist:1870,  pos:[-6.200,106.816]   as [number,number] },
  { code:'NL', flag:'🇳🇱', name:'เนเธอร์แลนด์',   city:'Amsterdam',   dist:9360,  pos:[52.370,4.895]     as [number,number] },
  { code:'CA', flag:'🇨🇦', name:'แคนาดา',          city:'Vancouver',   dist:12500, pos:[49.283,-123.121]  as [number,number] },
  { code:'IT', flag:'🇮🇹', name:'อิตาลี',          city:'Milan',       dist:9100,  pos:[45.465,9.188]     as [number,number] },
  { code:'BR', flag:'🇧🇷', name:'บราซิล',          city:'São Paulo',   dist:17800, pos:[-23.550,-46.633]  as [number,number] },
  { code:'CH', flag:'🇨🇭', name:'สวิตเซอร์แลนด์', city:'Zurich',      dist:9100,  pos:[47.376,8.542]     as [number,number] },
];

type Branch  = typeof BRANCHES[0];
type Country = typeof COUNTRIES[0];
type Screen  = 'map' | 'form' | 'otp' | 'success';

function calcCO2(dist: number, weight: number) {
  const standard = +(dist * weight * 0.00051).toFixed(2);
  const saf      = +(standard * 0.20).toFixed(2);
  const saved    = +(standard - saf).toFixed(2);
  const trees    = +(saved / 21.7).toFixed(1);
  const kwh      = +(saved * 0.9).toFixed(1);
  return { standard, saf, saved, trees, kwh };
}

function genTracking(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let r = 'GP-';
  for (let i = 0; i < 6; i++) r += chars[Math.floor(Math.random() * chars.length)];
  return r + '-TH';
}

const G = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
  * { box-sizing:border-box; -webkit-tap-highlight-color:transparent; }
  @keyframes sheet-up  { from{transform:translateY(100%)} to{transform:translateY(0)} }
  @keyframes fade-in   { from{opacity:0} to{opacity:1} }
  @keyframes pop-in    { 0%{transform:scale(.8);opacity:0} 60%{transform:scale(1.05)} 100%{transform:scale(1);opacity:1} }
  @keyframes otp-shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-6px)} 40%,80%{transform:translateX(6px)} }
  .ibtn { cursor:pointer; border:none; outline:none; font-family:inherit; transition:transform .12s ease,opacity .12s ease; user-select:none; }
  .ibtn:hover  { transform:scale(1.025); }
  .ibtn:active { transform:scale(.94)!important; opacity:.85; }
  .iscroll::-webkit-scrollbar { width:3px; }
  .iscroll::-webkit-scrollbar-thumb { background:rgba(0,0,0,0.12); border-radius:2px; }
  .otp-shake { animation: otp-shake 0.4s ease; }
  .otp-box:focus { border-color: #d40511 !important; box-shadow: 0 0 0 3px rgba(212,5,17,0.15); }
`;

function MapBounds({ origin, dest }: { origin:Branch|null; dest:Country|null }) {
  const map = useMap();
  useEffect(() => {
    if (origin && dest) map.fitBounds([origin.pos, dest.pos], { padding:[60,60] });
    else if (origin) map.setView(origin.pos, 10);
    else map.setView([13.736,100.523], 5);
  }, [origin, dest, map]);
  return null;
}

function BottomSheet({ open, onClose, title, children }: { open:boolean; onClose:()=>void; title:string; children:React.ReactNode }) {
  if (!open) return null;
  return (
    <div style={{ position:'fixed', inset:0, zIndex:9999 }}>
      <div onClick={onClose} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.45)', animation:'fade-in .2s ease' }}/>
      <div style={{ position:'absolute', bottom:0, left:0, right:0, background:'#fff', borderRadius:'20px 20px 0 0', maxHeight:'70vh', display:'flex', flexDirection:'column', animation:'sheet-up .28s ease' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 20px 12px', borderBottom:'1px solid #f3f4f6', flexShrink:0 }}>
          <div style={{ fontWeight:800, fontSize:'1rem', fontFamily:F, color:'#111' }}>{title}</div>
          <button type="button" className="ibtn" onClick={onClose} style={{ width:30, height:30, borderRadius:15, background:'#f3f4f6', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <X size={15} color="#374151"/>
          </button>
        </div>
        <div className="iscroll" style={{ flex:1, overflowY:'auto', padding:'8px 12px 24px' }}>{children}</div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   SCREEN 1: MAP
══════════════════════════════════════════════════════════ */
function MapScreen({ onBack, onNext }: { onBack:()=>void; onNext:(b:Branch,c:Country)=>void }) {
  const [origin, setOrigin] = useState<Branch|null>(null);
  const [dest,   setDest]   = useState<Country|null>(null);
  const [sheetO, setSheetO] = useState(false);
  const [sheetD, setSheetD] = useState(false);
  const ready = origin && dest;

  return (
    <div style={{ height:'100vh', position:'relative', fontFamily:F, overflow:'hidden' }}>
      <style>{G}</style>
      <MapContainer center={[13.736,100.523]} zoom={5} style={{ position:'absolute', inset:0, width:'100%', height:'100%', zIndex:0 }} zoomControl={false} attributionControl={false}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
        <MapBounds origin={origin} dest={dest}/>
        {origin && <Marker position={origin.pos} icon={bkkIcon}/>}
        {dest   && <Marker position={dest.pos}   icon={destIcon}/>}
        {origin && dest && <Polyline positions={[origin.pos,dest.pos]} pathOptions={{ color:'#059669', weight:3, opacity:0.85, dashArray:'8 6' }}/>}
      </MapContainer>

      <div style={{ position:'absolute', top:0, left:0, right:0, zIndex:100, padding:'44px 12px 12px', background:'linear-gradient(to bottom, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0) 100%)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <button type="button" className="ibtn" onClick={onBack} style={{ width:38, height:38, borderRadius:19, background:'rgba(0,0,0,0.35)', backdropFilter:'blur(8px)', border:'1.5px solid rgba(255,255,255,0.25)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <ArrowLeft size={18} color="#fff"/>
          </button>
          <button type="button" className="ibtn" onClick={()=>setSheetO(true)} style={{ flex:1, background:origin?'rgba(74,222,128,0.18)':'rgba(0,0,0,0.35)', backdropFilter:'blur(10px)', border:`1.5px solid ${origin?'rgba(74,222,128,0.55)':'rgba(255,255,255,0.35)'}`, borderRadius:12, padding:'9px 12px', display:'flex', alignItems:'center', gap:7, minWidth:0, boxShadow:'0 2px 8px rgba(0,0,0,0.4)' }}>
            <MapPin size={14} color={origin?'#4ade80':'rgba(255,255,255,0.85)'}/>
            <span style={{ flex:1, color:origin?'#4ade80':'rgba(255,255,255,0.9)', fontSize:'0.75rem', fontWeight:700, textAlign:'left', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', textShadow:'0 1px 4px rgba(0,0,0,0.8)' }}>{origin?origin.name:'เลือกสาขาต้นทาง'}</span>
            <ChevronDown size={13} color={origin?'#4ade80':'rgba(255,255,255,0.7)'}/>
          </button>
          <span style={{ color:'rgba(255,255,255,0.8)', fontSize:'1rem', flexShrink:0, textShadow:'0 1px 3px rgba(0,0,0,0.8)' }}>→</span>
          <button type="button" className="ibtn" onClick={()=>setSheetD(true)} style={{ flex:1, background:'rgba(0,0,0,0.35)', backdropFilter:'blur(10px)', border:'1.5px solid rgba(255,255,255,0.35)', borderRadius:12, padding:'9px 12px', display:'flex', alignItems:'center', gap:7, minWidth:0, boxShadow:'0 2px 8px rgba(0,0,0,0.4)' }}>
            <span style={{ flex:1, color:'rgba(255,255,255,0.9)', fontSize:'0.75rem', fontWeight:700, textAlign:'left', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', textShadow:'0 1px 4px rgba(0,0,0,0.8)' }}>{dest?dest.name:'เลือกประเทศปลายทาง'}</span>
            <ChevronDown size={13} color='rgba(255,255,255,0.7)'/>
          </button>
        </div>
      </div>

      <div style={{ position:'absolute', bottom:0, left:0, right:0, zIndex:100, padding:'16px 16px 36px', background:'linear-gradient(to top, rgba(6,30,14,0.9) 60%, transparent)' }}>
        <button type="button" className="ibtn" disabled={!ready} onClick={()=>ready&&onNext(origin!,dest!)}
          style={{ width:'100%', padding:'15px', borderRadius:14, border:'none', background:ready?`linear-gradient(135deg,${DARK_GREEN},#059669)`:'rgba(255,255,255,0.12)', color:ready?'#fff':'rgba(255,255,255,0.35)', fontSize:'0.95rem', fontWeight:800, fontFamily:F, display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow:ready?'0 4px 20px rgba(5,150,105,0.5)':'none', cursor:ready?'pointer':'not-allowed', transition:'all .25s' }}>
          {ready?<>ต่อไป — กรอกน้ำหนักพัสดุ <ArrowRight size={18}/></>:'เลือกต้นทางและปลายทาง'}
        </button>
      </div>

      <BottomSheet open={sheetO} onClose={()=>setSheetO(false)} title="เลือกสาขาต้นทาง">
        {BRANCHES.map(b=>(
          <button type="button" key={b.id} className="ibtn" onClick={()=>{ setOrigin(b); setSheetO(false); }}
            style={{ width:'100%', padding:'12px 14px', borderRadius:12, marginBottom:4, display:'flex', alignItems:'center', gap:12, background:origin?.id===b.id?'#f0fdf4':'#f9fafb', border:`1.5px solid ${origin?.id===b.id?GREEN:'transparent'}`, textAlign:'left' }}>
            <div style={{ width:36, height:36, borderRadius:10, background:origin?.id===b.id?GREEN:'#e5e7eb', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <MapPin size={16} color={origin?.id===b.id?'#fff':'#6b7280'}/>
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontWeight:700, fontSize:'0.88rem', color:'#111' }}>{b.name}</div>
              <div style={{ fontSize:'0.72rem', color:'#6b7280' }}>{b.city}</div>
            </div>
            {origin?.id===b.id&&<Check size={16} color={GREEN}/>}
          </button>
        ))}
      </BottomSheet>

      <BottomSheet open={sheetD} onClose={()=>setSheetD(false)} title="เลือกประเทศปลายทาง">
        {(['เอเชีย','ยุโรป','อเมริกา / โอเชียเนีย'] as const).map(region => {
          const regionMap:Record<string,string[]> = {
            'เอเชีย': ['JP','CN','KR','HK','SG','MY','VN','ID','IN','AE'],
            'ยุโรป': ['GB','DE','FR','NL','IT','CH'],
            'อเมริกา / โอเชียเนีย': ['US','CA','BR','AU'],
          };
          const codes = regionMap[region];
          const list = COUNTRIES.filter(c=>codes.includes(c.code));
          return (
            <div key={region}>
              <div style={{ fontSize:'0.65rem', fontWeight:800, color:'#9ca3af', letterSpacing:'1px', padding:'8px 4px 4px', textTransform:'uppercase' as const }}>{region}</div>
              {list.map(c=>(
                <button type="button" key={c.code} className="ibtn" onClick={()=>{ setDest(c); setSheetD(false); }}
                  style={{ width:'100%', padding:'10px 14px', borderRadius:12, marginBottom:4, display:'flex', alignItems:'center', gap:12, background:dest?.code===c.code?'#f0fdf4':'#f9fafb', border:`1.5px solid ${dest?.code===c.code?GREEN:'transparent'}`, textAlign:'left' }}>
                  <img
                    src={`https://flagcdn.com/w40/${c.code.toLowerCase()}.png`}
                    alt={c.code}
                    width={36} height={36}
                    style={{ borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.12)' }}
                  />
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:700, fontSize:'0.88rem', color:'#111' }}>{c.name}</div>
                    <div style={{ fontSize:'0.72rem', color:'#6b7280' }}>{c.city} · {c.dist.toLocaleString()} km</div>
                  </div>
                  {dest?.code===c.code&&<Check size={16} color={GREEN}/>}
                </button>
              ))}
            </div>
          );
        })}
      </BottomSheet>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   SCREEN 2: FORM
══════════════════════════════════════════════════════════ */
function FormScreen({ origin, dest, onBack, onSubmit }: { origin:Branch; dest:Country; onBack:()=>void; onSubmit:(w:number,phone:string)=>void }) {
  const [weight, setWeight] = useState(1.0);
  const [photo,  setPhoto]  = useState<string|null>(null);
  const [sName,  setSName]  = useState('สมชาย ใจดี');
  const [sPhone, setSPhone] = useState('0812345678');
  const [rName,  setRName]  = useState('');
  const [rAddr,  setRAddr]  = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const canSubmit = photo && rName && rAddr;

  return (
    <div style={{ height:'100vh', display:'flex', flexDirection:'column', fontFamily:F, background:'#f8faf8', overflow:'hidden' }}>
      <style>{G}</style>
      <div style={{ background:DARK_GREEN, padding:'44px 16px 16px', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:10 }}>
          <button type="button" className="ibtn" onClick={onBack} style={{ width:36, height:36, borderRadius:18, background:'rgba(255,255,255,0.12)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <ArrowLeft size={16} color="#fff"/>
          </button>
          <div>
            <div style={{ color:'rgba(255,255,255,0.6)', fontSize:'0.62rem', fontWeight:700, letterSpacing:'1px' }}>กรอกข้อมูลพัสดุ</div>
            <div style={{ color:'#fff', fontWeight:800, fontSize:'1rem' }}>{origin.name} → {dest.city}</div>
          </div>
        </div>
      </div>

      <div className="iscroll" style={{ flex:1, overflowY:'auto', padding:'14px 16px 100px' }}>
        {/* Weight */}
        <div style={{ background:'#fff', borderRadius:14, padding:'16px', marginBottom:10, border:'1px solid #e5e7eb' }}>
          <div style={{ fontWeight:700, fontSize:'0.9rem', color:'#111', marginBottom:10, display:'flex', alignItems:'center', gap:6 }}>
            <Package size={15} color={GREEN}/> น้ำหนักพัสดุ
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <input
              type="number" min={0.1} max={70} step={0.1}
              value={weight}
              onChange={e=>{ const v=parseFloat(e.target.value); if(!isNaN(v)&&v>0) setWeight(v); }}
              style={{ flex:1, border:'1.5px solid #e5e7eb', borderRadius:10, padding:'10px 12px', fontSize:'1.1rem', fontWeight:800, color:'#111', fontFamily:F, outline:'none', textAlign:'right' as const, accentColor:GREEN }}
            />
            <span style={{ fontSize:'1rem', fontWeight:700, color:'#6b7280', flexShrink:0 }}>kg</span>
          </div>
          <div style={{ fontSize:'0.65rem', color:'#9ca3af', marginTop:6 }}>สูงสุด 70 kg ต่อกล่อง</div>
        </div>

        {/* Photo */}
        <div style={{ background:'#fff', borderRadius:14, padding:'16px', marginBottom:10, border:'1px solid #e5e7eb' }}>
          <div style={{ fontWeight:700, fontSize:'0.88rem', color:'#111', marginBottom:10 }}>ถ่ายรูปสินค้า</div>
          {photo?(
            <div style={{ position:'relative' }}>
              <img src={photo} alt="parcel" style={{ width:'100%', borderRadius:10, maxHeight:160, objectFit:'cover' }}/>
              <button type="button" onClick={()=>setPhoto(null)} style={{ position:'absolute', top:6, right:6, background:'rgba(0,0,0,0.55)', border:'none', borderRadius:10, padding:'3px 8px', color:'#fff', cursor:'pointer', fontSize:'0.7rem' }}>✕</button>
            </div>
          ):(
            <button type="button" className="ibtn" onClick={()=>fileRef.current?.click()} style={{ width:'100%', height:100, borderRadius:12, border:'2px dashed #d1d5db', background:'#f9fafb', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:6 }}>
              <Camera size={24} color="#9ca3af"/>
              <span style={{ color:'#9ca3af', fontSize:'0.78rem', fontWeight:600 }}>กดถ่ายรูปหรืออัปโหลด</span>
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display:'none' }} onChange={e=>{ const f=e.target.files?.[0]; if(f) setPhoto(URL.createObjectURL(f)); }}/>
        </div>

        {/* Sender / Receiver */}
        {[
          { id:'sender', title:'ผู้ส่ง', icon:<User size={14} color={GREEN}/>, fields:[
            {label:'ชื่อ-นามสกุล', val:sName, set:setSName},
            {label:'เบอร์โทร',      val:sPhone, set:setSPhone},
          ]},
          { id:'receiver', title: <span style={{display:'inline-flex',alignItems:'center',gap:5}}><img src={`https://flagcdn.com/w40/${dest.code.toLowerCase()}.png`} alt={dest.code} width={18} height={13} style={{borderRadius:3,objectFit:'cover',border:'1px solid #e5e7eb'}}/> {dest.name}</span>, icon:<MapPin size={14} color={GREEN}/>, fields:[
            {label:'ชื่อผู้รับ',    val:rName, set:setRName},
            {label:'ที่อยู่จัดส่ง', val:rAddr, set:setRAddr},
          ]},
        ].map(({ id, title, icon, fields }) => (
          <div key={id} style={{ background:'#fff', borderRadius:14, padding:'14px', marginBottom:10, border:'1px solid #e5e7eb' }}>
            <div style={{ fontWeight:700, fontSize:'0.85rem', color:'#111', marginBottom:10, display:'flex', alignItems:'center', gap:6 }}>{icon} {title}</div>
            {fields.map(({ label, val, set }) => (
              <div key={label} style={{ marginBottom:8 }}>
                <div style={{ fontSize:'0.7rem', fontWeight:600, color:'#6b7280', marginBottom:3 }}>{label}</div>
                <div style={{ display:'flex', alignItems:'center', border:`1.5px solid ${val?GREEN:'#e5e7eb'}`, borderRadius:10, padding:'9px 12px', background:val?'#f0fdf4':'#f9fafb', transition:'all .2s' }}>
                  <input value={val} onChange={e=>set(e.target.value)} placeholder={label} style={{ flex:1, border:'none', outline:'none', background:'none', fontSize:'0.88rem', fontFamily:F, color:'#111' }}/>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div style={{ position:'fixed', bottom:0, left:0, right:0, padding:'10px 16px 28px', background:'linear-gradient(to top,#f8faf8 70%,transparent)', zIndex:10 }}>
        <button type="button" className="ibtn" disabled={!canSubmit}
          onClick={()=>canSubmit&&onSubmit(weight,sPhone)}
          style={{ width:'100%', padding:'14px', borderRadius:14, border:'none', background:canSubmit?`linear-gradient(135deg,${DARK_GREEN},${GREEN})`:'#e5e7eb', color:canSubmit?'#fff':'#9ca3af', fontSize:'0.95rem', fontWeight:800, fontFamily:F, display:'flex', alignItems:'center', justifyContent:'center', gap:8, cursor:canSubmit?'pointer':'not-allowed', transition:'all .25s', boxShadow:canSubmit?'0 4px 20px rgba(5,150,105,0.4)':'none' }}>
          {canSubmit?<>ยืนยันข้อมูล — รับ OTP <ArrowRight size={18}/></>:'กรอกข้อมูลให้ครบก่อน'}
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   SCREEN 3: OTP
══════════════════════════════════════════════════════════ */
function OtpScreen({ phone, onBack, onVerify }: { phone:string; onBack:()=>void; onVerify:()=>void }) {
  const DEMO_OTP = '482917';
  const [digits, setDigits]       = useState(DEMO_OTP.split(''));
  const [shake,  setShake]        = useState(false);
  const [countdown, setCountdown] = useState(60);
  const refs = Array.from({ length:6 }, () => useRef<HTMLInputElement>(null));
  const GGREEN = '#059669'; const GGREEN_D = '#064e3b';

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const masked = phone.replace(/(\d{3})\d{4}(\d{3})/, '$1 **** $2');

  const handleDigit = (i:number, val:string) => {
    const v = val.replace(/\D/g,'').slice(-1);
    const next = [...digits];
    next[i] = v;
    setDigits(next);
    if (v && i < 5) refs[i+1].current?.focus();
    if (!v && i > 0) refs[i-1].current?.focus();
  };

  const handleKeyDown = (i:number, e:React.KeyboardEvent) => {
    if (e.key==='Backspace' && !digits[i] && i > 0) refs[i-1].current?.focus();
  };

  const verify = () => {
    const code = digits.join('');
    if (code.length < 6) { setShake(true); setTimeout(()=>setShake(false), 500); return; }
    // Demo: any 6-digit code is accepted
    onVerify();
  };

  const resend = () => { setCountdown(60); setDigits(DEMO_OTP.split('')); refs[0].current?.focus(); };

  return (
    <div style={{ height:'100vh', display:'flex', flexDirection:'column', fontFamily:F, background:'#f0fdf4', overflow:'hidden' }}>
      <style>{G}</style>

      {/* Hero header */}
      <div style={{ background:`linear-gradient(160deg,${GGREEN_D} 0%,${GGREEN} 100%)`, padding:'44px 20px 32px', flexShrink:0, position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-40, right:-40, width:140, height:140, borderRadius:'50%', background:'rgba(255,255,255,0.06)' }}/>
        <div style={{ position:'absolute', bottom:-20, left:-20, width:80, height:80, borderRadius:'50%', background:'rgba(255,255,255,0.05)' }}/>
        <button type="button" className="ibtn" onClick={onBack} style={{ width:36, height:36, borderRadius:18, background:'rgba(255,255,255,0.14)', border:'none', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:20 }}>
          <ArrowLeft size={16} color="#fff"/>
        </button>
        <div style={{ color:'rgba(255,255,255,0.6)', fontSize:'0.62rem', fontWeight:700, letterSpacing:'2px', marginBottom:6 }}>STEP 3 · VERIFICATION</div>
        <div style={{ color:'#fff', fontSize:'1.5rem', fontWeight:900, marginBottom:4 }}>ยืนยันตัวตน OTP</div>
        <div style={{ color:'rgba(255,255,255,0.7)', fontSize:'0.82rem' }}>ส่งรหัสไปยัง {masked}</div>
      </div>

      {/* Body */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'flex-start', padding:'28px 28px 40px' }}>
        <div style={{ background:'#ecfdf5', border:'1.5px solid #6ee7b7', borderRadius:10, padding:'8px 16px', fontSize:'0.72rem', color:GGREEN, fontWeight:700, marginBottom:28, display:'flex', alignItems:'center', gap:6 }}>
          รหัสทดสอบถูกกรอกให้แล้ว — กดยืนยันได้เลย!
        </div>

        {/* 6-digit OTP boxes */}
        <div className={shake ? 'otp-shake' : ''} style={{ display:'flex', gap:10, marginBottom:28 }}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={refs[i]}
              type="tel"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={e=>handleDigit(i,e.target.value)}
              onKeyDown={e=>handleKeyDown(i,e)}
              style={{ width:48, height:60, borderRadius:16, border:`2.5px solid ${d?GGREEN:'#d1fae5'}`, textAlign:'center', fontSize:'1.6rem', fontWeight:900, color:GGREEN_D, background:d?'#ecfdf5':'#fff', outline:'none', transition:'all .15s', fontFamily:F, boxShadow:d?`0 2px 12px rgba(5,150,105,0.15)`:'none' }}
            />
          ))}
        </div>

        <button type="button" className="ibtn" onClick={verify}
          style={{ width:'100%', maxWidth:320, padding:'16px', borderRadius:16, border:'none', background:`linear-gradient(135deg,${GGREEN_D},${GGREEN})`, color:'#fff', fontSize:'1.05rem', fontWeight:800, fontFamily:F, display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow:`0 6px 24px rgba(5,150,105,0.4)`, marginBottom:16 }}>
          ยืนยัน OTP <Check size={18}/>
        </button>

        <button type="button" className="ibtn" disabled={countdown>0} onClick={resend}
          style={{ background:'none', border:'none', color:countdown>0?'#9ca3af':GGREEN, fontSize:'0.85rem', fontWeight:600, fontFamily:F, cursor:countdown>0?'not-allowed':'pointer', display:'flex', alignItems:'center', gap:5 }}>
          <RefreshCw size={13}/>
          {countdown>0?`ส่งรหัสใหม่ใน ${countdown}s`:'ส่งรหัสใหม่'}
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   SCREEN 4: SUCCESS
══════════════════════════════════════════════════════════ */
function SuccessScreen({ origin, dest, weight, tracking, onDone }: {
  origin:Branch; dest:Country; weight:number; tracking:string; onDone:()=>void;
}) {
  const [copied, setCopied] = useState(false);
  const copy = () => navigator.clipboard.writeText(tracking).then(()=>{ setCopied(true); setTimeout(()=>setCopied(false),2000); });

  const timeline = [
    { label:'รับพัสดุแล้ว',             done:true,  time:'วันนี้ 09:15' },
    { label:'กำลังเตรียมจัดส่ง',         done:true,  time:'วันนี้ 11:30' },
    { label:'ส่งให้ผู้ให้บริการขนส่ง',   done:false, time:'วันถัดไป' },
    { label:'ขนส่งระหว่างประเทศ',         done:false, time:'2–3 วัน' },
    { label: <span style={{display:'inline-flex',alignItems:'center',gap:4}}>ถึง <img src={`https://flagcdn.com/w40/${dest.code.toLowerCase()}.png`} alt={dest.code} width={16} height={11} style={{borderRadius:2,objectFit:'cover'}}/> {dest.city}</span>, done:false, time:'5–7 วัน' },
  ];

  return (
    <div style={{ height:'100vh', display:'flex', flexDirection:'column', fontFamily:F, background:'#f0fdf4', overflow:'hidden' }}>
      <style>{G}{`
        @keyframes float-up{0%{opacity:0;transform:translateY(20px)}100%{opacity:1;transform:translateY(0)}}
        .su-card{animation:float-up .4s ease both;}
      `}</style>

      {/* Hero */}
      <div style={{ background:'linear-gradient(160deg,#032617 0%,#064e3b 50%,#059669 100%)', padding:'50px 20px 32px', flexShrink:0, textAlign:'center', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', right:-50, top:-50, width:180, height:180, borderRadius:'50%', background:'rgba(255,255,255,0.04)' }}/>
        <div style={{ position:'absolute', left:-30, bottom:-30, width:120, height:120, borderRadius:'50%', background:'rgba(255,255,255,0.03)' }}/>
        <div style={{ width:80, height:80, borderRadius:40, background:'rgba(5,150,105,0.2)', border:'2px solid rgba(5,150,105,0.5)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', boxShadow:'0 0 32px rgba(5,150,105,0.45)' }}>
          <div style={{ width:58, height:58, borderRadius:29, background:'linear-gradient(135deg,#059669,#34d399)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 20px rgba(52,211,153,0.5)' }}>
            <Check size={28} color="#fff" strokeWidth={3}/>
          </div>
        </div>
        <div style={{ color:'rgba(255,255,255,0.5)', fontSize:'0.6rem', fontWeight:700, letterSpacing:'2.5px', marginBottom:6 }}>DHL GREEN PASSPORT</div>
        <div style={{ color:'#fff', fontSize:'1.55rem', fontWeight:900, marginBottom:6 }}>จัดส่งสำเร็จ!</div>
        <div style={{ color:'rgba(255,255,255,0.65)', fontSize:'0.82rem', display:'flex', alignItems:'center', gap:4, justifyContent:'center', flexWrap:'nowrap' }}>
          <img src="https://flagcdn.com/w40/th.png" alt="TH" width={16} height={11} style={{borderRadius:2,objectFit:'cover'}}/> {origin.name} →
          <img src={`https://flagcdn.com/w40/${dest.code.toLowerCase()}.png`} alt={dest.code} width={16} height={11} style={{borderRadius:2,objectFit:'cover'}}/> {dest.city} · {weight} kg
        </div>
      </div>

      <div className="iscroll" style={{ flex:1, overflowY:'auto', padding:'16px 16px 100px', display:'flex', flexDirection:'column', gap:10 }}>

        {/* Tracking number */}
        <div className="su-card" style={{ background:'#fff', borderRadius:16, padding:'16px', border:'1px solid #e5e7eb', animationDelay:'.05s', boxShadow:'0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ color:'#9ca3af', fontSize:'0.58rem', fontWeight:700, letterSpacing:'2px', textTransform:'uppercase', marginBottom:8 }}>หมายเลขติดตามพัสดุ</div>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ fontWeight:900, fontSize:'1.15rem', color:'#059669', letterSpacing:'1.5px', flex:1 }}>{tracking}</div>
            <button type="button" className="ibtn" onClick={copy}
              style={{ display:'flex', alignItems:'center', gap:5, background:copied?'#f0fdf4':'#f9fafb', border:`1px solid ${copied?'#6ee7b7':'#e5e7eb'}`, borderRadius:8, padding:'7px 12px', color:copied?'#059669':'#374151', fontWeight:700, fontSize:'0.72rem', fontFamily:F, flexShrink:0 }}>
              {copied?<><Check size={12}/> คัดลอกแล้ว</>:<><Copy size={12}/> คัดลอก</>}
            </button>
          </div>
          <div style={{ fontSize:'0.68rem', color:'#9ca3af', marginTop:6 }}>นำไปติดตามสถานะที่หน้าหลัก หรือหน้าประวัติพัสดุ</div>
        </div>


        {/* Timeline */}
        <div className="su-card" style={{ background:'#fff', borderRadius:16, padding:'16px', border:'1px solid #e5e7eb', animationDelay:'.1s', boxShadow:'0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ fontWeight:800, fontSize:'0.88rem', color:'#111', marginBottom:14 }}>สถานะการจัดส่ง</div>
          {timeline.map((t,i) => (
            <div key={i} style={{ display:'flex', gap:14, alignItems:'flex-start' }}>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', width:20, flexShrink:0 }}>
                <div style={{ width:16, height:16, borderRadius:8, background:t.done?'#059669':'#e5e7eb', border:`2px solid ${t.done?'#6ee7b7':'#d1d5db'}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  {t.done&&<Check size={8} color="#fff" strokeWidth={3}/>}
                </div>
                {i<timeline.length-1&&<div style={{ width:2, flex:1, background:t.done?'#bbf7d0':'#f3f4f6', minHeight:24 }}/>}
              </div>
              <div style={{ flex:1, paddingBottom:16, display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
                <div>
                  <div style={{ fontWeight:700, fontSize:'0.82rem', color:t.done?'#111':'#9ca3af' }}>{t.label}</div>
                  {t.done&&<div style={{ fontSize:'0.68rem', color:'#059669', marginTop:2 }}>ดำเนินการแล้ว</div>}
                </div>
                <div style={{ fontSize:'0.68rem', color:t.done?'#059669':'#9ca3af', fontWeight:600, whiteSpace:'nowrap', marginLeft:8, marginTop:1 }}>{t.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ position:'fixed', bottom:0, left:0, right:0, padding:'10px 16px 28px', background:'linear-gradient(to top,#f0fdf4 60%,transparent)', zIndex:10 }}>
        <button type="button" className="ibtn" onClick={onDone}
          style={{ width:'100%', padding:'15px', borderRadius:14, border:'none', background:'linear-gradient(135deg,#064e3b,#059669)', color:'#fff', fontSize:'0.98rem', fontWeight:800, fontFamily:F, display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow:'0 6px 28px rgba(5,150,105,0.3)' }}>
          <Home size={18}/> กลับหน้าหลัก
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   ROOT
══════════════════════════════════════════════════════════ */
export default function IntlShipping() {
  const [screen,   setScreen]   = useState<Screen>('map');
  const [origin,   setOrigin]   = useState<Branch|null>(null);
  const [dest,     setDest]     = useState<Country|null>(null);
  const [weight,   setWeight]   = useState(1.0);
  const [phone,    setPhone]    = useState('');
  const [tracking, setTracking] = useState('');
  const navigate = useNavigate();

  const handleDone = () => {
    if (origin && dest) {
      const co2 = calcCO2(dest.dist, weight);
      const data = {
        tracking,
        origin: origin.name,
        dest: `${dest.city}`,
        destName: dest.name,
        destCode: dest.code,
        weight,
        co2saved:    co2.saved,
        co2standard: co2.standard,
        trees:       co2.trees,
        kwh:         co2.kwh,
        ts: Date.now(),
      };
      // Save to pending CO₂ popup
      localStorage.setItem('pending_co2', JSON.stringify(data));
      // Save to last shipment (drawer)
      localStorage.setItem('last_shipment', JSON.stringify({ tracking, origin:origin.name, dest:dest.city, ts: Date.now() }));
      // Append to shipment history list
      const prev = localStorage.getItem('shipment_history');
      const list = prev ? JSON.parse(prev) : [];
      list.push(data);
      localStorage.setItem('shipment_history', JSON.stringify(list));
    }
    navigate('/home');
  };

  if (screen==='map') return (
    <MapScreen onBack={()=>navigate(-1)} onNext={(b,c)=>{ setOrigin(b); setDest(c); setScreen('form'); }}/>
  );
  if (screen==='form' && origin && dest) return (
    <FormScreen origin={origin} dest={dest} onBack={()=>setScreen('map')} onSubmit={(w,p)=>{ setWeight(w); setPhone(p); setTracking(genTracking()); setScreen('otp'); }}/>
  );
  if (screen==='otp') return (
    <OtpScreen phone={phone} onBack={()=>setScreen('form')} onVerify={()=>setScreen('success')}/>
  );
  if (screen==='success' && origin && dest) return (
    <SuccessScreen origin={origin} dest={dest} weight={weight} tracking={tracking} onDone={handleDone}/>
  );
  return null;
}

export { SuccessScreen as TrackingSuccessScreen };
