import { useState } from 'react';
import { ArrowLeft, ChevronRight, BookUser, ChevronDown, ChevronUp, Check, MessageSquare, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const F = "'Inter','Kanit',sans-serif";
const GREEN = '#059669';
const DARK_GREEN = '#064e3b';

const genTracking = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'GP-';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code + '-TH';
};

const genOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

export default function RegisterPackage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'form' | 'otp' | 'success'>('form');
  const [manualOpen, setManualOpen] = useState(true);
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [province, setProvince] = useState('');
  const [address, setAddress] = useState('');
  const [saveAddress, setSaveAddress] = useState(false);
  const [packageDetail, setPackageDetail] = useState('');
  const [otp, setOtp] = useState('');
  const [demoOtp] = useState(genOTP);
  const [tracking, setTracking] = useState('');
  const [otpError, setOtpError] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const userPhone = localStorage.getItem('user_phone') || '08X-XXX-XXXX';
  const maskedPhone = userPhone.replace(/(\d{3})\d{4}(\d{3})/, '$1-XXXX-$2');

  const handleSubmit = () => {
    // Go to OTP screen
    setStep('otp');
    // Start resend cooldown
    setResendCooldown(30);
    const timer = setInterval(() => {
      setResendCooldown(c => { if (c <= 1) { clearInterval(timer); return 0; } return c - 1; });
    }, 1000);
  };

  const handleVerifyOtp = () => {
    if (otp === demoOtp) {
      const t = genTracking();
      setTracking(t);
      const entry = {
        tracking: t,
        origin: 'สาขาไทย',
        dest: '🇹🇭 ในประเทศ',
        weight: 1,
        co2saved: 0,
        ts: Date.now(),
        name: name || 'ไม่ระบุ',
        phone: userPhone,
        address: address || '-',
        province: province || '-',
        zipCode: zipCode || '-',
        packageDetail: packageDetail || '-',
        type: 'domestic',
      };
      const prev = localStorage.getItem('shipment_history');
      const list = prev ? JSON.parse(prev) : [];
      list.push(entry);
      localStorage.setItem('shipment_history', JSON.stringify(list));
      setStep('success');
    } else {
      setOtpError(true);
      setTimeout(() => setOtpError(false), 2000);
    }
  };

  // ── OTP Screen ──
  if (step === 'otp') {
    return (
      <div style={{ minHeight: '100vh', background: '#f0fdf4', display: 'flex', flexDirection: 'column', fontFamily: F }}>
        <div style={{ background: `linear-gradient(135deg,${DARK_GREEN},${GREEN})`, padding: '40px 20px 20px', textAlign: 'center', position: 'relative' }}>
          <button type="button" onClick={() => setStep('form')}
            style={{ position: 'absolute', top: 16, left: 16, width: 36, height: 36, borderRadius: 18, background: 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ArrowLeft size={18} color="#fff"/>
          </button>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '2px', marginBottom: 6 }}>ยืนยันตัวตน</div>
          <div style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 900, marginBottom: 6 }}>กรอกรหัส OTP</div>
          <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.82rem' }}>
            ส่ง SMS ไปยัง <strong style={{ color: '#fff' }}>{maskedPhone}</strong>
          </div>
        </div>

        <div style={{ flex: 1, padding: '16px 20px' }}>
          {/* Demo hint */}
          <div style={{ background: '#ecfdf5', border: '1px solid #6ee7b7', borderRadius: 12, padding: '10px 14px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <MessageSquare size={14} color={GREEN}/>
            <div>
              <div style={{ fontSize: '0.65rem', color: '#065f46', fontWeight: 700 }}>Demo: รหัส OTP ของคุณคือ</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: GREEN, letterSpacing: '3px' }}>{demoOtp}</div>
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: '0.78rem', color: '#6b7280', fontWeight: 600, display: 'block', marginBottom: 8 }}>รหัส OTP 6 หลัก</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g,''))}
              placeholder="_ _ _ _ _ _"
              style={{
                width: '100%', padding: '18px', textAlign: 'center', fontSize: '1.8rem', fontWeight: 900,
                letterSpacing: '8px', border: `2px solid ${otpError ? '#ef4444' : otp.length === 6 ? GREEN : '#d1fae5'}`,
                borderRadius: 14, outline: 'none', background: '#fff', color: '#111',
                boxSizing: 'border-box', transition: 'border-color .2s',
              }}
            />
            {otpError && <div style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: 6, textAlign: 'center', fontWeight: 600 }}>รหัส OTP ไม่ถูกต้อง กรุณาลองใหม่</div>}
          </div>

          <button type="button" onClick={handleVerifyOtp}
            style={{ width: '100%', padding: '15px', borderRadius: 14, border: 'none', background: otp.length === 6 ? `linear-gradient(135deg,${DARK_GREEN},${GREEN})` : '#e5e7eb', color: otp.length === 6 ? '#fff' : '#9ca3af', fontSize: '1rem', fontWeight: 800, cursor: otp.length === 6 ? 'pointer' : 'default', marginBottom: 14, transition: 'all .2s', fontFamily: F }}>
            ยืนยัน OTP
          </button>

          <div style={{ textAlign: 'center' }}>
            {resendCooldown > 0 ? (
              <div style={{ fontSize: '0.82rem', color: '#9ca3af' }}>ส่งรหัสใหม่ได้ในอีก <strong>{resendCooldown}</strong> วินาที</div>
            ) : (
              <button type="button" onClick={handleSubmit} style={{ background: 'none', border: 'none', color: GREEN, fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: F }}>
                <RefreshCw size={14}/> ส่งรหัสใหม่
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Success Screen ──
  if (step === 'success') {
    return (
      <div style={{ backgroundColor: '#f0fdf4', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: F }}>
        <div style={{ width: '100%', maxWidth: 400, background: '#fff', borderRadius: 20, overflow: 'hidden', boxShadow: '0 8px 32px rgba(5,150,105,0.15)' }}>
          <div style={{ background: `linear-gradient(135deg,${DARK_GREEN},${GREEN})`, padding: '32px 24px', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: 32, background: 'rgba(52,211,153,0.2)', border: '2px solid rgba(52,211,153,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 0 28px rgba(52,211,153,0.4)' }}>
              <div style={{ width: 48, height: 48, borderRadius: 24, background: 'linear-gradient(135deg,#059669,#34d399)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Check size={24} color="#fff" strokeWidth={3}/>
              </div>
            </div>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '2px', marginBottom: 6 }}>ลงทะเบียนสำเร็จ</div>
            <div style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 900 }}>รับพัสดุแล้ว!</div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.82rem', marginTop: 4 }}>บันทึกหมายเลขติดตามของคุณ</div>
          </div>
          <div style={{ padding: '20px 24px 28px' }}>
            <div style={{ background: '#f0fdf4', borderRadius: 12, padding: '14px 16px', marginBottom: 16, border: '1px solid #bbf7d0' }}>
              <div style={{ color: '#9ca3af', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '1.5px', marginBottom: 6 }}>หมายเลขติดตาม</div>
              <div style={{ fontWeight: 900, fontSize: '1.2rem', color: GREEN, letterSpacing: '1px' }}>{tracking}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
              {[
                { label: 'ผู้รับ', val: name || 'ไม่ระบุ' },
                { label: 'เบอร์โทร', val: userPhone },
                { label: 'ที่อยู่', val: address ? `${address} ${province} ${zipCode}` : '-' },
              ].map(({ label, val }) => (
                <div key={label} style={{ display: 'flex', gap: 8, fontSize: '0.82rem' }}>
                  <span style={{ color: '#9ca3af', minWidth: 60 }}>{label}</span>
                  <span style={{ color: '#111', fontWeight: 600, flex: 1 }}>{val}</span>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => navigate('/history')}
              style={{ width: '100%', padding: '14px', borderRadius: 12, border: 'none', background: `linear-gradient(135deg,${DARK_GREEN},${GREEN})`, color: '#fff', fontSize: '0.95rem', fontWeight: 800, cursor: 'pointer', marginBottom: 10, fontFamily: F }}>
              ดูประวัติพัสดุ
            </button>
            <button type="button" onClick={() => navigate('/home')}
              style={{ width: '100%', padding: '12px', borderRadius: 12, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', fontFamily: F }}>
              กลับหน้าหลัก
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Form Screen ──
  return (
    <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', paddingBottom: '100px', fontFamily: F }}>
      <div style={{ backgroundColor: '#ffcc00', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px', position: 'sticky', top: 0, zIndex: 50 }}>
        <ArrowLeft size={24} style={{ cursor: 'pointer' }} onClick={() => navigate(-1)} />
        <h2 style={{ fontSize: '1.4rem', margin: 0, fontWeight: 700 }}>ลงทะเบียนพัสดุ</h2>
      </div>

      <div style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '1.1rem', margin: '0 0 10px 0', fontWeight: 700 }}>ที่อยู่ผู้ส่ง</h3>
        <div style={{ backgroundColor: '#fff', borderRadius: '4px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '20px', cursor: 'pointer' }}>
          <span style={{ fontSize: '1rem' }}>แตะเพื่อเพิ่มที่อยู่ผู้ส่ง</span>
          <ChevronRight size={20} color="#888" />
        </div>

        <h3 style={{ fontSize: '1.1rem', margin: '0 0 10px 0', fontWeight: 700 }}>จำแนกข้อมูลที่อยู่ผู้รับแบบอัตโนมัติ</h3>
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
          <textarea placeholder={'คัดลอกที่อยู่จาก Facebook, Line หรือช่องทางอื่นๆ แล้ววางที่นี่'}
            style={{ width: '100%', minHeight: '100px', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.95rem', resize: 'none', color: '#666', boxSizing: 'border-box' }}/>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button style={{ backgroundColor: GREEN, color: '#fff', border: 'none', borderRadius: '4px', padding: '10px 20px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' }}>ดำเนินการ</button>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', cursor: 'pointer' }} onClick={() => setManualOpen(!manualOpen)}>
            <h3 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 700 }}>กรอกข้อมูลผู้รับด้วยตนเอง</h3>
            {manualOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
          {manualOpen && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ position: 'relative' }}>
                <input type="tel" placeholder="หมายเลขโทรศัพท์" value={phone} onChange={(e) => setPhone(e.target.value)}
                  style={{ width: '100%', padding: '14px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '1rem', boxSizing: 'border-box' }} />
                <BookUser size={20} color="#aaa" style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
              <input type="text" placeholder="ชื่อผู้รับ" value={name} onChange={(e) => setName(e.target.value)}
                style={{ width: '100%', padding: '14px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '1rem', boxSizing: 'border-box' }} />
              <div style={{ position: 'relative' }}>
                <select value={zipCode} onChange={(e) => setZipCode(e.target.value)}
                  style={{ width: '100%', padding: '14px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '1rem', appearance: 'none', backgroundColor: '#fff', boxSizing: 'border-box' }}>
                  <option value="">รหัสไปรษณีย์</option>
                  <option value="10110">10110</option>
                  <option value="10330">10330</option>
                  <option value="20230">20230</option>
                  <option value="50000">50000</option>
                </select>
                <ChevronDown size={20} color="#333" style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              </div>
              <div style={{ position: 'relative' }}>
                <select value={province} onChange={(e) => setProvince(e.target.value)}
                  style={{ width: '100%', padding: '14px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '1rem', appearance: 'none', backgroundColor: '#fff', boxSizing: 'border-box' }}>
                  <option value="">จังหวัด</option>
                  <option value="กรุงเทพมหานคร">กรุงเทพมหานคร</option>
                  <option value="ชลบุรี">ชลบุรี</option>
                  <option value="เชียงใหม่">เชียงใหม่</option>
                  <option value="ภูเก็ต">ภูเก็ต</option>
                </select>
                <ChevronDown size={20} color="#333" style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              </div>
              <input type="text" placeholder="บ้านเลขที่ / หมู่บ้าน / ถนน" value={address} onChange={(e) => setAddress(e.target.value)}
                style={{ width: '100%', padding: '14px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '1rem', boxSizing: 'border-box' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div onClick={() => setSaveAddress(!saveAddress)}
                  style={{ width: '22px', height: '22px', borderRadius: '4px', border: `2px solid ${saveAddress ? GREEN : '#ccc'}`, backgroundColor: saveAddress ? GREEN : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                  {saveAddress && <Check size={13} color="#fff" strokeWidth={3}/>}
                </div>
                <span style={{ fontSize: '0.95rem' }}>บันทึกลงในสมุดที่อยู่ผู้รับ</span>
              </div>
            </div>
          )}
        </div>

        <div style={{ height: '1px', backgroundColor: '#eee', margin: '20px -20px' }}/>
        <h3 style={{ fontSize: '1.1rem', margin: '16px 0 10px 0', fontWeight: 700 }}>ข้อมูลพัสดุ</h3>
        <input type="text" placeholder="รายละเอียดพัสดุ (เช่น เสื้อผ้า, อุปกรณ์อิเล็กทรอนิกส์)" value={packageDetail} onChange={(e) => setPackageDetail(e.target.value)}
          style={{ width: '100%', padding: '14px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '1rem', boxSizing: 'border-box' }} />
      </div>

      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '16px 20px', backgroundColor: '#fff', borderTop: '1px solid #eaeaea', zIndex: 10 }}>
        <button type="button" onClick={handleSubmit}
          style={{ width: '100%', padding: '16px', borderRadius: '8px', border: 'none', backgroundColor: '#d40511', color: '#fff', fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer', fontFamily: F }}>
          ดำเนินการต่อ
        </button>
      </div>
    </div>
  );
}
