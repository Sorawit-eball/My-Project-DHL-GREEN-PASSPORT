import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './index.css';

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState('Sorawit Nuamwat');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('halooo3569@gmail.com');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate sending OTP
    navigate('/otp');
  };

  return (
    <div className="bg-yellow" style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px', cursor: 'pointer' }} onClick={() => navigate(-1)}>
        <ArrowLeft size={24} color="var(--primary-accent)" />
      </div>

      <div className="auth-container">
        <div className="auth-card">
          <h2 style={{ color: 'var(--primary-accent)', fontSize: '1.8rem', marginBottom: '20px' }}>ลงทะเบียน</h2>

          <form onSubmit={handleRegister}>
            <div style={{ marginBottom: '5px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>ชื่อ</div>
            <input 
              type="text" 
              className="form-input" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <div style={{ marginBottom: '5px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>หมายเลขโทรศัพท์</div>
            <input 
              type="tel" 
              className="form-input" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />

            <div style={{ marginBottom: '5px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>อีเมล</div>
            <input 
              type="email" 
              className="form-input" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <button 
              type="submit" 
              className={`btn-primary ${phone.length > 8 ? 'active-btn' : ''}`}
              style={{ marginTop: '15px' }}
            >
              ลงทะเบียน
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: '1.6' }}>
            การยืนยันการลงทะเบียนจะถือเป็นการแสดงว่าคุณ<br/>
            ยอมรับ <span style={{ color: 'var(--primary-accent)', fontWeight: '600' }}>ข้อกำหนดและเงื่อนไข</span>
          </div>
        </div>
      </div>
      
    </div>
  );
}
