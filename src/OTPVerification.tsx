import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Shield, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const F = "'Inter','Kanit',sans-serif";
const YELLOW = '#FFCC00';
const GREEN  = '#059669';

export default function OTPVerification() {
  const navigate = useNavigate();
  const [otp, setOtp]         = useState(['','','','','','']);
  const [timeLeft, setTimeLeft] = useState(54);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (timeLeft > 0) {
      const t = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [timeLeft]);

  const handleInput = (idx: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[idx] = val.slice(-1);
    setOtp(next);
    if (val && idx < 5) inputRefs.current[idx + 1]?.focus();
    if (next.every(d => d !== '')) navigate('/home');
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const full = otp.every(d => d !== '');

  return (
    <div style={{ fontFamily:F, background:'#f9fafb', minHeight:'100vh', display:'flex', flexDirection:'column' }}>
      <style>{`
        .otp-input:focus { border-color: ${GREEN} !important; background: #f0fdf4 !important; box-shadow: 0 0 0 3px rgba(5,150,105,0.15) !important; }
      `}</style>

      {/* Yellow header */}
      <div style={{ background:YELLOW, padding:'44px 20px 28px', position:'relative' }}>
        <button type="button" onClick={() => navigate(-1)}
          style={{ position:'absolute', top:14, left:14, width:36, height:36, borderRadius:18, background:'rgba(0,0,0,0.1)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <ArrowLeft size={20} color="#333"/>
        </button>
        <div style={{ display:'flex', alignItems:'center', gap:8, justifyContent:'center' }}>
          <div style={{ background:'#d40511', borderRadius:6, padding:'3px 10px', fontSize:'0.7rem', fontWeight:900, color:'#fff', letterSpacing:'1px' }}>DHL</div>
          <div style={{ fontSize:'0.65rem', fontWeight:700, letterSpacing:'2px', color:'#4b4b4b' }}>GREEN PASSPORT</div>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex:1, padding:'36px 24px 32px', display:'flex', flexDirection:'column', alignItems:'center' }}>

        {/* Shield icon */}
        <div style={{ width:76, height:76, borderRadius:38, background:'#f0fdf4', border:'2.5px solid #bbf7d0', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:22, boxShadow:'0 4px 20px rgba(5,150,105,0.15)' }}>
          <Shield size={36} color={GREEN} strokeWidth={1.8}/>
        </div>

        <h2 style={{ fontWeight:900, fontSize:'1.45rem', color:'#111', margin:'0 0 10px', textAlign:'center' }}>
          ยืนยันตัวตน
        </h2>
        <p style={{ fontSize:'0.88rem', color:'#6b7280', lineHeight:1.65, textAlign:'center', margin:'0 0 32px', maxWidth:280 }}>
          กรุณาระบุรหัส 6 หลักที่ส่งไปยัง<br/>
          <strong style={{ color:'#374151' }}>+66 *****5985</strong>
          {' '}และ{' '}
          <strong style={{ color:'#374151' }}>******3569@gmail.com</strong>
        </p>

        {/* OTP row */}
        <div style={{ display:'flex', gap:9, marginBottom:32 }}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={el => { inputRefs.current[i] = el; }}
              className="otp-input"
              type="tel"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleInput(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              style={{
                width:46, height:58, borderRadius:13, textAlign:'center',
                fontSize:'1.6rem', fontWeight:900, color:'#111',
                border:`2px solid ${digit ? GREEN : '#e5e7eb'}`,
                background: digit ? '#f0fdf4' : '#fff',
                outline:'none', transition:'all 0.15s ease',
                boxShadow: digit ? '0 2px 10px rgba(5,150,105,0.14)' : 'none',
              }}
            />
          ))}
        </div>

        {/* Verify button */}
        <button type="button" onClick={() => navigate('/home')} disabled={!full}
          style={{
            width:'100%', maxWidth:320, padding:'15px', borderRadius:14, border:'none',
            cursor: full ? 'pointer' : 'not-allowed',
            background: full ? 'linear-gradient(135deg,#064e3b,#059669)' : '#e5e7eb',
            color: full ? '#fff' : '#9ca3af',
            fontSize:'0.98rem', fontWeight:800,
            display:'flex', alignItems:'center', justifyContent:'center', gap:8,
            boxShadow: full ? '0 6px 22px rgba(5,150,105,0.3)' : 'none',
            transition:'all 0.2s ease',
          }}>
          ยืนยันรหัส <ChevronRight size={18}/>
        </button>

        {/* Resend timer */}
        <div style={{ marginTop:20, fontSize:'0.82rem', color:'#6b7280', textAlign:'center' }}>
          {timeLeft > 0 ? (
            <>ส่งรหัสอีกครั้งใน{' '}
              <strong style={{ color:'#374151' }}>
                00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
              </strong>
            </>
          ) : (
            <button type="button" onClick={() => setTimeLeft(54)}
              style={{ background:'none', border:'none', cursor:'pointer', color:GREEN, fontWeight:700, fontSize:'0.82rem' }}>
              ส่งรหัสอีกครั้ง
            </button>
          )}
        </div>

        {/* Security note */}
        <div style={{ marginTop:36, display:'flex', alignItems:'center', gap:6, background:'#f3f4f6', borderRadius:10, padding:'10px 14px', maxWidth:300 }}>
          <Shield size={13} color="#9ca3af"/>
          <span style={{ fontSize:'0.7rem', color:'#9ca3af', lineHeight:1.5 }}>
            รหัสนี้จะหมดอายุใน 10 นาที อย่าเปิดเผยรหัสกับผู้อื่น
          </span>
        </div>
      </div>
    </div>
  );
}
