
import { User, Landmark, Box, Bookmark, MapPin, Phone, HelpCircle, FileText, ChevronRight } from 'lucide-react';
import BottomNav from './components/BottomNav';

export default function More() {
  const menuList1 = [
    { title: 'ข้อมูลส่วนตัว', icon: <User size={20} /> },
    { title: 'ตั้งค่าสมุดบัญชี', icon: <Landmark size={20} /> },
    { title: 'ที่อยู่ในการออกใบเสร็จฯ', icon: <Box size={20} /> },
    { title: 'บันทึกข้อมูลแล้ว (0)', icon: <Bookmark size={20} /> },
    { title: 'ที่อยู่ผู้ส่ง', icon: <Box size={20} /> },
    { title: 'ที่อยู่ผู้รับ', icon: <Box size={20} /> },
  ];

  const menuList2 = [
    { title: 'จุดรับพัสดุ DHL', icon: <MapPin size={20} /> },
    { title: 'ติดต่อเรา', icon: <Phone size={20} /> },
    { title: 'คำถามที่พบบ่อย', icon: <HelpCircle size={20} /> },
    { title: 'ข้อกำหนดและเงื่อนไข', icon: <FileText size={20} /> },
  ];

  return (
    <div style={{ paddingBottom: '80px', backgroundColor: 'var(--bg-secondary)', minHeight: '100vh' }}>
      {/* Profile Header (Yellow Gradient) */}
      <div className="bg-yellow-gradient" style={{ padding: '40px 20px 30px', display: 'flex', alignItems: 'center' }}>
        <div style={{ 
          width: '50px', height: '50px', borderRadius: '50%', background: 'var(--primary-accent)', 
          color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', 
          fontWeight: 'bold', fontSize: '1.2rem', marginRight: '15px' 
        }}>
          SN
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600' }}>อรชุน ธนพงศ์</h2>
      </div>

      <div style={{ background: 'var(--bg-white)', marginTop: '10px' }}>
        {menuList1.map((item, idx) => (
          <div key={idx} className="list-item">
            <div className="list-item-icon">{item.icon}</div>
            <div className="list-item-text">{item.title}</div>
            <ChevronRight size={20} color="var(--text-muted)" />
          </div>
        ))}
      </div>

      <div style={{ background: 'var(--bg-white)', marginTop: '10px' }}>
        {menuList2.map((item, idx) => (
          <div key={idx} className="list-item">
            <div className="list-item-icon">{item.icon}</div>
            <div className="list-item-text">{item.title}</div>
            <ChevronRight size={20} color="var(--text-muted)" />
          </div>
        ))}
      </div>

      <div style={{ padding: '20px', marginTop: '10px' }}>
        <button 
          className="btn-primary" 
          onClick={() => window.location.href = '/login'}
          style={{ backgroundColor: '#fff', color: 'var(--primary-accent)', border: '1px solid var(--primary-accent)' }}
        >
          ออกจากระบบ (Logout)
        </button>
      </div>

      <div className="fab-right hide-desktop">
        <span style={{ fontSize: '2rem', fontWeight: '300' }}>+</span>
      </div>

      <BottomNav />
    </div>
  );
}
