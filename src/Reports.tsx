
import { RefreshCw, Mail, SlidersHorizontal, BookOpen } from 'lucide-react';
import BottomNav from './components/BottomNav';

export default function Reports() {
  return (
    <div style={{ paddingBottom: '80px', backgroundColor: 'var(--bg-white)', minHeight: '100vh' }}>
      {/* Header */}
      <div className="bg-yellow-gradient page-header">
        <h2 style={{ fontSize: '1.4rem', color: 'var(--primary-accent)' }}>รายงานพัสดุ</h2>
        <div style={{ display: 'flex', gap: '15px', color: 'var(--primary-accent)' }}>
          <RefreshCw size={20} cursor="pointer" />
          <Mail size={20} cursor="pointer" />
          <SlidersHorizontal size={20} cursor="pointer" />
        </div>
      </div>

      {/* Date Range Subtitle */}
      <div style={{ textAlign: 'center', padding: '15px', borderBottom: '1px solid var(--border-light)', fontSize: '1rem', fontWeight: '500' }}>
        30 วันที่แล้ว (19/05/2026 - 18/06/2026)
      </div>

      {/* Empty State */}
      <div className="empty-state">
        <div style={{ position: 'relative', marginBottom: '20px' }}>
          {/* Decorative sparkles */}
          <span style={{ position: 'absolute', top: '-15px', left: '10px', color: 'var(--bg-primary)', fontSize: '1.5rem', fontWeight: 'bold' }}>/</span>
          <span style={{ position: 'absolute', top: '-25px', left: '50%', transform: 'translateX(-50%)', color: 'var(--bg-primary)', fontSize: '1.5rem', fontWeight: 'bold' }}>|</span>
          <span style={{ position: 'absolute', top: '-15px', right: '10px', color: 'var(--bg-primary)', fontSize: '1.5rem', fontWeight: 'bold' }}>\</span>
          <BookOpen size={80} color="var(--text-muted)" strokeWidth={1.5} />
        </div>
        <div style={{ fontSize: '1.2rem' }}>ไม่พบข้อมูล</div>
      </div>

      <div className="fab-right hide-desktop">
        <span style={{ fontSize: '2rem', fontWeight: '300' }}>+</span>
      </div>

      <BottomNav />
    </div>
  );
}
