import { useState } from 'react';
import { Eye, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './index.css';

export default function Login() {
  const [activeTab, setActiveTab] = useState<'general' | 'contract'>('general');
  const [phone, setPhone] = useState('0812345678');
  const navigate = useNavigate();

  const handleLogin = () => {
    localStorage.setItem('user_phone', phone || '0812345678');
    localStorage.setItem('user_name', 'คุณสมชาย ใจดี');
    navigate('/home');
  };

  return (
    <div className="bg-yellow" style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px', cursor: 'pointer' }} onClick={() => navigate(-1)}>
        <ArrowLeft size={24} color="var(--primary-accent)" />
      </div>

      <div className="auth-container">
        <div className="auth-card">
          <h2 style={{ color: 'var(--primary-accent)', fontSize: '1.8rem', marginBottom: '20px' }}>เข้าสู่ระบบ</h2>
          
          <div className="tabs">
            <div 
              className={`tab ${activeTab === 'general' ? 'active' : ''}`}
              onClick={() => setActiveTab('general')}
            >
              ลูกค้าทั่วไป
            </div>
            <div 
              className={`tab ${activeTab === 'contract' ? 'active' : ''}`}
              onClick={() => setActiveTab('contract')}
            >
              ลูกค้าสัญญา
            </div>
          </div>

          <form>
            <input type="text" placeholder="หมายเลขโทรศัพท์/อีเมล" className="form-input" value={phone} onChange={e=>setPhone(e.target.value)} />
            <div className="input-container">
              <input type="password" placeholder="รหัสผ่าน" className="form-input" />
              <Eye className="input-icon-right" size={20} />
            </div>

            <div style={{ textAlign: 'right', marginBottom: '20px' }}>
              <a href="#" style={{ color: 'var(--primary-accent)', fontSize: '0.9rem', fontWeight: '600', textDecoration: 'none' }}>ลืมรหัสผ่าน?</a>
            </div>

            <button type="button" className="btn-primary" onClick={handleLogin}>
              เข้าสู่ระบบ
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/register'); }} style={{ color: 'var(--primary-accent)', fontSize: '1rem', fontWeight: '600', textDecoration: 'none' }}>
              สมัครบัญชีใหม่
            </a>
          </div>

          <div className="divider">หรือ</div>

          <div>
            <button className="btn-social">
              <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/google/google-original.svg" alt="Google" width="20" height="20" />
              Continue with Google
            </button>
            <button className="btn-social">
              <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/facebook/facebook-original.svg" alt="Facebook" width="20" height="20" />
              Continue with Facebook
            </button>
            <button className="btn-social">
              <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/apple/apple-original.svg" alt="Apple" width="20" height="20" />
              Continue with Apple
            </button>
          </div>

        </div>
      </div>
      
    </div>
  );
}
