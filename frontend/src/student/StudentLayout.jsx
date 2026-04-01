import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  BarChart3, 
  BookOpen, 
  ClipboardList, 
  LayoutDashboard, 
  UserCircle, 
  Users, 
  Calendar,
  LogOut,
  ChevronLeft,
  Menu
} from 'lucide-react';
import { Toaster } from 'react-hot-toast';

export default function StudentLayout() {
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const navItems = [
    { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/student/attendance', label: 'Attendance', icon: Calendar },
    { to: '/student/assignments', label: 'Assignments', icon: ClipboardList },
    { to: '/student/quizzes', label: 'Quizzes', icon: BookOpen },
    { to: '/student/results', label: 'Results', icon: BarChart3 },
    { to: '/student/batch', label: 'My Batch', icon: Users },
    { to: '/student/profile', label: 'Profile', icon: UserCircle },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Toaster position="top-right" />
      
      {/* Sidebar */}
      <aside 
        className={`${
          isCollapsed ? 'w-20' : 'w-72'
        } bg-white border-r border-slate-200 transition-all duration-300 ease-in-out flex flex-col shadow-sm relative z-20`}
      >
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-10 bg-emerald-600 text-white rounded-full p-1 shadow-lg hover:bg-emerald-700 transition-colors"
        >
          {isCollapsed ? <Menu size={16} /> : <ChevronLeft size={16} />}
        </button>

        <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} mb-4`}>
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-100">
             <BookOpen size={24} />
          </div>
          {!isCollapsed && (
            <span className="text-xl font-black text-slate-800 tracking-tight">Nav<span className="text-emerald-600">Kalpana</span></span>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => 
                `flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-4'} py-3.5 rounded-xl transition-all group ${
                  isActive 
                    ? 'bg-emerald-50 text-emerald-700 font-bold' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-emerald-600'
                }`
              }
            >
              <item.icon size={22} className={`${isCollapsed ? '' : 'shrink-0'}`} />
              {!isCollapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={handleLogout}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-4'} py-3.5 text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all`}
          >
            <LogOut size={22} />
            {!isCollapsed && <span className="font-semibold">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white/70 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 z-10 sticky top-0">
          <div className="flex flex-col">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Student Portal</h2>
            <p className="text-lg font-black text-slate-800 tracking-tight">Welcome Area</p>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="text-right hidden sm:block">
                <p className="font-bold text-slate-900 leading-none">{user?.name}</p>
                <p className="text-xs font-semibold text-emerald-600 mt-1 uppercase tracking-tighter">Verified Student</p>
             </div>
             <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center font-black text-lg border-2 border-white shadow-md">
                {user?.name?.[0].toUpperCase()}
             </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 lg:p-12 scroll-smooth">
           <Outlet />
        </main>
      </div>
    </div>
  );
}
