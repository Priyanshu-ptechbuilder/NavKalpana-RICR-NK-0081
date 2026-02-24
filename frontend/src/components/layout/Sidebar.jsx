import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/batches', label: 'Batch Management', icon: '📁' },
  { to: '/assignments', label: 'Assignments', icon: '📝', sub: 'Assessment' },
  { to: '/quizzes', label: 'Quizzes', icon: '❓', sub: 'Assessment' },
  { to: '/students', label: 'Student Management', icon: '👥' },
  { to: '/attendance', label: 'Attendance', icon: '📅', hideFromSidebar: false },
  { to: '/analytics', label: 'Analytics', icon: '📈', hideFromSidebar: false },
  { to: '/support', label: 'Support Requests', icon: '💬' },
];

export default function Sidebar() {
  return (
    <aside className="app-sidebar">
      <div className="sidebar-brand">Academic Portal</div>
      <nav className="sidebar-nav">
        {navItems.filter((i) => !i.hideFromSidebar).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            end={item.to === '/dashboard'}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
