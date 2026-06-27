
import { Home, Archive, PieChart, CircleEllipsis, MessagesSquare } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItemsLeft = [
    { path: '/', label: 'หน้าหลัก', icon: Home },
    { path: '/history', label: 'ประวัติพัสดุ', icon: Archive },
  ];

  const navItemsRight = [
    { path: '/reports', label: 'รายงาน', icon: PieChart },
    { path: '/more', label: 'เพิ่มเติม', icon: CircleEllipsis },
  ];

  const renderNavItem = (item: any) => {
    const Icon = item.icon;
    const isActive = location.pathname === item.path;
    return (
      <div 
        key={item.path} 
        className={`nav-item ${isActive ? 'active' : ''}`}
        onClick={() => navigate(item.path)}
      >
        <Icon size={24} color={isActive ? "var(--primary-accent)" : "#a3a3a3"} />
        <span>{item.label}</span>
      </div>
    );
  };

  return (
    <div className="bottom-nav">
      {navItemsLeft.map(renderNavItem)}

      {/* Center Floating Chat Button */}
      <div className="nav-fab-container">
        <div className="nav-fab">
          <MessagesSquare size={28} />
        </div>
      </div>

      {navItemsRight.map(renderNavItem)}
    </div>
  );
}
