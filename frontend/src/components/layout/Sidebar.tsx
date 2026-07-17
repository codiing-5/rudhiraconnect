import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Activity, User, ClipboardCheck, Users, MessageSquareCode, 
  ShieldAlert, Settings, LogOut, Award
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const userMenuItems = [
    { name: 'Overview', path: '/dashboard', icon: Activity },
    { name: 'My Profile', path: '/profile', icon: User },
    { name: 'Eligibility Checker', path: '/eligibility-checker', icon: ClipboardCheck },
    { name: 'Blood Buddy Challenge', path: '/blood-buddy', icon: Users },
    { name: 'AI Assistant', path: '/ai-assistant', icon: MessageSquareCode },
  ];

  const adminMenuItems = [
    { name: 'Admin Dashboard', path: '/admin', icon: ShieldAlert },
  ];

  return (
    <aside className="w-full md:w-64 bg-white border-r border-slate-100 flex flex-col shrink-0">
      {/* Profile summary */}
      <div className="p-6 border-b border-slate-100 flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-primary font-bold">
          {user.name.charAt(0)}
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-800 leading-tight truncate w-40">{user.name}</h4>
          <span className="text-[10px] text-slate-400 font-medium tracking-wide">
            {user.role === 'ADMIN' ? 'NSS Coordinator' : 'Blood Volunteer'}
          </span>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 block mb-2">
          Dashboard Menu
        </span>

        {userMenuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-card text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-red-50 text-primary border border-red-100'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
              }`
            }
          >
            <item.icon className="h-4 w-4 shrink-0" />
            <span>{item.name}</span>
          </NavLink>
        ))}

        {/* Admin Links */}
        {user.role === 'ADMIN' && (
          <div className="pt-6">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 block mb-2">
              Admin Actions
            </span>
            {adminMenuItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-card text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-white border border-primary shadow-sm shadow-primary/20'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                  }`
                }
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            ))}
          </div>
        )}
      </nav>

      {/* Footer sign out */}
      <div className="p-4 border-t border-slate-100">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 text-slate-500 hover:text-primary hover:bg-red-50 rounded-card text-sm font-medium transition-all"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
