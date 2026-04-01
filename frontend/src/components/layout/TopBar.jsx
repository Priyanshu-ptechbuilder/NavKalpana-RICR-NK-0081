import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export default function TopBar() {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const teacherName = user?.name || 'Teacher';
  const designation = 'Faculty';

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate('/teacher/login', { replace: true });
  };

  return (
    <header className="app-topbar">
      <div className="topbar-greeting">
        <span className="greeting-text">{getGreeting()}, </span>
        <span className="greeting-name">{teacherName}</span>
      </div>
      <div className="topbar-profile-wrap">
        <button
          type="button"
          className="topbar-profile-btn"
          onClick={() => setDropdownOpen((o) => !o)}
          aria-expanded={dropdownOpen}
          aria-haspopup="true"
        >
          <div className="profile-avatar">
            {(teacherName[0] || 'T').toUpperCase()}
          </div>
          <div className="profile-info">
            <span className="profile-name">{teacherName}</span>
            <span className="profile-designation">{designation}</span>
          </div>
          <span className="profile-chevron">{dropdownOpen ? '▲' : '▼'}</span>
        </button>
        {dropdownOpen && (
          <>
            <div className="dropdown-backdrop" onClick={() => setDropdownOpen(false)} aria-hidden="true" />
            <div className="profile-dropdown">
              <div className="dropdown-header">
                <div className="profile-avatar large">{(teacherName[0] || 'T').toUpperCase()}</div>
                <div>
                  <div className="profile-name">{teacherName}</div>
                  <div className="profile-designation">{designation}</div>
                </div>
              </div>
              <div className="dropdown-divider" />
              <button
                type="button"
                className="dropdown-item"
                onClick={() => {
                  setDropdownOpen(false);
                  navigate('/profile');
                }}
              >
                Profile
              </button>
              <button type="button" className="dropdown-item logout" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
