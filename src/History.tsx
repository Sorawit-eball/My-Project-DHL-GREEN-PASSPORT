import { useState, useEffect } from 'react';
import { RefreshCw, SlidersHorizontal, Package, MapPin, Check, Clock, ChevronLeft, Leaf, X, ArrowRight } from 'lucide-react';

import BottomNav from './components/BottomNav';
import { useNavigate } from 'react-router-dom';

const F = "'Inter','Kanit',sans-serif";
const YELLOW = '#FFCC00';
const GREEN  = '#059669';
const GREEN_D = '#064e3b';

const STATUS_STEPS = [
  { label: 'รับพัสดุแล้ว',               done: true  },
  { label: 'กำลังเตรียมจัดส่ง',           done: true  },
  { label: 'ส่งให้ผู้ให้บริการขนส่ง',     done: false },
  { label: 'ขนส่งระหว่างประเทศ',           done: false },
  { label: 'ถึงปลายทาง',                   done: false },
];

interface Shipment {
  tracking: string;
  origin: string;
  dest: string;
  destName?: string;
  weight: number;
  co2saved: number;
  co2standard?: number;
  trees?: number;
  ts: number;
}

const isGoGreen = (s: Shipment) => !!s.co2saved && s.co2saved > 0;

const fmt = (ts: number) =>
  new Date(ts).toLocaleDateString('th-TH', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });

export default function History() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'parcel' | 'order'>('parcel');
  const [history,   setHistory]   = useState<Shipment[]>([]);
  const [selected,  setSelected]  = useState<Shipment | null>(null);
  const [shipModal, setShipModal] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem('shipment_history');
    if (raw) {
      try { setHistory(JSON.parse(raw)); } catch {}
    }
  }, []);

  const reload = () => {
    const raw = localStorage.getItem('shipment_history');
    if (raw) try { setHistory(JSON.parse(raw)); } catch {}
  };

  const HOVER_CSS = `
    .hist-card { transition: transform 0.18s ease, box-shadow 0.18s ease; cursor: pointer; }
    .hist-card:hover { transform: scale(1.025) translateY(-2px); box-shadow: 0 8px 28px rgba(0,0,0,0.1) !important; }
    .hist-card:active { transform: scale(0.99); }
  `;

  return (
    <div style={{ paddingBottom: '80px', background: '#fffdf0', minHeight: '100vh', fontFamily: F }}>
      <style>{HOVER_CSS}</style>

      {/* ── Header ── */}
      <div style={{ background: `linear-gradient(135deg,#d4a000 0%,${YELLOW} 60%,#ffe566 100%)`, padding: '44px 16px 0', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          {/* Back button */}
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{ width: 36, height: 36, borderRadius: 18, background: 'rgba(0,0,0,0.1)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          >
            <ChevronLeft size={20} color="#333"/>
          </button>
          <h2 style={{ flex: 1, color: '#1a1a1a', fontSize: '1.25rem', fontWeight: 900, margin: 0 }}>ประวัติพัสดุ</h2>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" onClick={reload} style={{ background: 'rgba(0,0,0,0.1)', border: 'none', borderRadius: 8, padding: '6px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <RefreshCw size={18} color="#333"/>
            </button>
            <button type="button" style={{ background: 'rgba(0,0,0,0.1)', border: 'none', borderRadius: 8, padding: '6px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <SlidersHorizontal size={18} color="#333"/>
            </button>
          </div>
        </div>

        {/* Tab Switch */}
        <div style={{ display: 'flex', background: 'rgba(0,0,0,0.08)', borderRadius: 10, padding: 3, gap: 3 }}>
          {(['parcel', 'order'] as const).map(t => (
            <button key={t} type="button" onClick={() => setActiveTab(t)}
              style={{ flex: 1, padding: '9px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 700, fontFamily: F, fontSize: '0.85rem', background: activeTab === t ? '#fff' : 'transparent', color: activeTab === t ? '#1a1a1a' : '#4b4b4b', transition: 'all .2s', boxShadow: activeTab === t ? '0 1px 4px rgba(0,0,0,0.1)' : 'none' }}>
              {t === 'parcel' ? 'พัสดุ' : 'คำสั่งซื้อ'}
            </button>
          ))}
        </div>
        {/* GoGreen legend */}
        {activeTab === 'parcel' && history.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 4px 10px', fontSize: '0.68rem', color: GREEN_D, fontWeight: 600 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, border: `2px solid ${GREEN}`, background: '#ecfdf5' }}/>
            GoGreen Plus — พัสดุที่ใช้เส้นทางยั่งยืน
          </div>
        )}
      </div>

      {/* ── Detail Modal ── */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end' }}>
          <div style={{ background: '#fff', borderRadius: '20px 20px 0 0', width: '100%', maxHeight: '85vh', overflowY: 'auto', padding: '20px 20px 40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ fontWeight: 900, fontSize: '1rem' }}>รายละเอียดพัสดุ</div>
                {isGoGreen(selected) && (
                  <div style={{ background: GREEN, borderRadius: 20, padding: '2px 10px', fontSize: '0.6rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Leaf size={9}/> GoGreen
                  </div>
                )}
              </div>
              <button type="button" onClick={() => setSelected(null)} style={{ width: 32, height: 32, borderRadius: 16, background: '#f3f4f6', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
            </div>

            {/* Tracking header */}
            <div style={{ background: isGoGreen(selected) ? 'linear-gradient(135deg,#064e3b,#059669)' : 'linear-gradient(135deg,#b91c1c,#d40511)', borderRadius: 14, padding: '14px 16px', marginBottom: 12 }}>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 4 }}>หมายเลขติดตาม</div>
              <div style={{ fontWeight: 900, fontSize: '1.2rem', color: '#fff', letterSpacing: '1px' }}>{selected.tracking}</div>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)', marginTop: 3 }}>📅 {fmt(selected.ts)}</div>
            </div>

            {/* Route */}
            <div style={{ background: '#f9fafb', borderRadius: 12, padding: '12px 14px', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.58rem', color: '#9ca3af', fontWeight: 700 }}>ต้นทาง</div>
                  <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#111' }}><img src="https://flagcdn.com/w40/th.png" alt="TH" width={16} height={11} style={{borderRadius:2,objectFit:'cover',verticalAlign:'middle',marginRight:3}}/> {selected.origin}</div>
                </div>
                <div style={{ flex: 1, height: 2, background: '#e5e7eb', borderRadius: 1 }}/>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.58rem', color: '#9ca3af', fontWeight: 700 }}>ปลายทาง</div>
                  <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#111' }}>{selected.dest}</div>
                </div>
              </div>
              <div style={{ marginTop: 8, fontSize: '0.75rem', color: '#374151' }}>
                ⚖️ น้ำหนัก: <strong>{selected.weight} kg</strong>
                {isGoGreen(selected) && <span style={{ color: GREEN, fontWeight: 700 }}> · 🌿 ลด CO₂: {selected.co2saved} kg · 🌳 {selected.trees} ต้น</span>}
              </div>
            </div>

            {/* Timeline */}
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #f3f4f6', padding: '14px 16px' }}>
              <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#111', marginBottom: 12 }}>สถานะการจัดส่ง</div>
              {STATUS_STEPS.map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: 14 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 20, flexShrink: 0 }}>
                    <div style={{ width: 16, height: 16, borderRadius: 8, background: s.done ? '#d40511' : '#e5e7eb', border: `2px solid ${s.done ? '#d40511' : '#d1d5db'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {s.done && <Check size={8} color="#fff" strokeWidth={3}/>}
                    </div>
                    {i < STATUS_STEPS.length - 1 && <div style={{ width: 2, flex: 1, background: s.done ? '#fecaca' : '#f3f4f6', minHeight: 20 }}/>}
                  </div>
                  <div style={{ paddingBottom: 14 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.82rem', color: s.done ? '#111' : '#9ca3af' }}>{s.label}</div>
                    {s.done && <div style={{ fontSize: '0.65rem', color: '#6b7280', marginTop: 1 }}>ดำเนินการแล้ว</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── List ── */}
      <div style={{ padding: '14px 14px' }}>
        {activeTab === 'parcel' ? (
          history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
              <Package size={64} color="#d1d5db" strokeWidth={1}/>
              <div style={{ fontSize: '1rem', fontWeight: 600, marginTop: 12, color: '#6b7280' }}>ยังไม่มีประวัติพัสดุ</div>
              <div style={{ fontSize: '0.8rem', marginTop: 4 }}>เริ่มส่งพัสดุผ่าน Green Passport</div>
              <button type="button" onClick={() => setShipModal(true)}
                style={{ marginTop: 16, background: '#d40511', border: 'none', borderRadius: 10, padding: '10px 22px', color: '#fff', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', fontFamily: F }}>
                เริ่มส่งพัสดุ
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[...history].reverse().map((s, i) => {
                const gg = isGoGreen(s);
                return (
                  <div key={i} onClick={() => setSelected(s)}
                    className="hist-card"
                    style={{
                      background: '#fff',
                      borderRadius: 14,
                      padding: '14px 16px',
                      border: gg ? `2px solid ${GREEN}` : '1px solid #e5e7eb',
                      boxShadow: gg ? `0 2px 12px rgba(5,150,105,0.12)` : '0 1px 4px rgba(0,0,0,0.04)',
                      position: 'relative',
                      overflow: 'hidden',
                    }}>

                    {/* GoGreen ribbon */}
                    {gg && (
                      <div style={{ position: 'absolute', top: 0, right: 0, background: GREEN, borderRadius: '0 14px 0 10px', padding: '3px 10px', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Leaf size={10} color="#fff"/>
                        <span style={{ fontSize: '0.58rem', fontWeight: 800, color: '#fff', letterSpacing: '0.5px' }}>GoGreen Plus</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                          <div style={{ width: 8, height: 8, borderRadius: 4, background: '#f59e0b', flexShrink: 0 }}/>
                          <div style={{ fontWeight: 700, fontSize: '0.68rem', color: '#f59e0b' }}>กำลังดำเนินการ</div>
                        </div>
                        <div style={{ fontWeight: 900, fontSize: '0.95rem', color: '#d40511', letterSpacing: '0.5px', marginBottom: 4 }}>{s.tracking}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.76rem', color: '#374151', marginBottom: 3 }}>
                          <MapPin size={11} color="#6b7280"/>
                          <span><img src="https://flagcdn.com/w40/th.png" alt="TH" width={14} height={10} style={{borderRadius:2,objectFit:'cover',verticalAlign:'middle',marginRight:2}}/> {s.origin} → {s.dest}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.68rem', color: '#9ca3af' }}>
                          <Clock size={10}/>
                          <span>{fmt(s.ts)} · ⚖️ {s.weight} kg</span>
                          {gg && <span style={{ color: GREEN, fontWeight: 700 }}>· 🌿 -{s.co2saved} kg CO₂</span>}
                        </div>
                      </div>
                      <div style={{ background: gg ? '#ecfdf5' : '#fff7f7', borderRadius: 10, padding: '6px 10px', textAlign: 'center', flexShrink: 0, border: `1px solid ${gg ? '#6ee7b7' : '#fecaca'}` }}>
                        <Package size={18} color={gg ? GREEN : '#d40511'}/>
                        <div style={{ fontSize: '0.55rem', color: gg ? GREEN : '#d40511', fontWeight: 700, marginTop: 2 }}>รายละเอียด</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
            <Package size={64} color="#d1d5db" strokeWidth={1}/>
            <div style={{ fontSize: '1rem', fontWeight: 600, marginTop: 12 }}>ไม่พบคำสั่งซื้อ</div>
          </div>
        )}
      </div>

      <BottomNav />

      {/* ── Ship Type Modal ── */}
      {shipModal && (
        <div onClick={() => setShipModal(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 9999, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', backdropFilter: 'blur(6px)' }}>
          <style>{`
            .ship-opt { transition: transform 0.15s ease, box-shadow 0.15s ease; }
            .ship-opt:hover { transform: translateY(-3px); box-shadow: 0 10px 28px rgba(0,0,0,0.14) !important; }
            .ship-opt:active { transform: scale(0.98); }
          `}</style>
          <div onClick={e => e.stopPropagation()}
            style={{ background: '#fff', borderRadius: '24px 24px 0 0', width: '100%', maxWidth: 520, padding: '20px 20px 44px', fontFamily: F }}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: '#e5e7eb', margin: '0 auto 20px' }}/>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <div style={{ fontWeight: 900, fontSize: '1.1rem', color: '#111' }}>เลือกประเภทการส่ง</div>
              <button type="button" onClick={() => setShipModal(false)}
                style={{ width: 32, height: 32, borderRadius: 16, background: '#f3f4f6', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={16} color="#6b7280"/>
              </button>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginBottom: 16 }}>เลือกรูปแบบที่ต้องการ แล้วกดเพื่อดำเนินการ</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                {
                  icon: <Package size={22} color="#d40511"/>,
                  iconBg: '#fff1f2', iconBorder: '#fecaca',
                  title: 'ส่งในประเทศ',
                  desc: 'ลงทะเบียนพัสดุ รวดเร็วทั่วไทย — ยืนยันด้วย OTP',
                  tag: 'ได้รับ OTP',
                  tagColor: '#d40511', tagBg: '#fff1f2', border: '#fecaca',
                  action: () => { setShipModal(false); navigate('/register-package'); },
                },
                {
                  icon: <Leaf size={22} color="#059669"/>,
                  iconBg: '#f0fdf4', iconBorder: '#6ee7b7',
                  title: 'ส่งต่างประเทศ GoGreen Plus',
                  desc: 'เส้นทางยั่งยืน ลด CO₂ ด้วย SAF Fuel',
                  tag: 'GoGreen Plus',
                  tagColor: '#059669', tagBg: '#f0fdf4', border: '#6ee7b7',
                  action: () => { setShipModal(false); navigate('/green-passport'); },
                },
              ].map(opt => (
                <button key={opt.title} type="button" onClick={opt.action}
                  className="ship-opt"
                  style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#fafafa', border: `2px solid ${opt.border}`, borderRadius: 16, padding: '16px 18px', cursor: 'pointer', textAlign: 'left', width: '100%', fontFamily: F, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: opt.iconBg, border: `1.5px solid ${opt.iconBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {opt.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#111', marginBottom: 4 }}>{opt.title}</div>
                    <div style={{ fontSize: '0.72rem', color: '#6b7280', lineHeight: 1.4 }}>{opt.desc}</div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 8, background: opt.tagBg, border: `1px solid ${opt.border}`, borderRadius: 20, padding: '3px 10px' }}>
                      <div style={{ width: 5, height: 5, borderRadius: 3, background: opt.tagColor }}/>
                      <span style={{ fontSize: '0.6rem', fontWeight: 700, color: opt.tagColor }}>{opt.tag}</span>
                    </div>
                  </div>
                  <div style={{ width: 30, height: 30, borderRadius: 15, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <ArrowRight size={14} color="#6b7280"/>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
