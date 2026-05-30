import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Video, KanbanSquare, BarChart3, Settings, ArrowLeftRight } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { DarkModeToggle } from './DarkModeToggle';

export const Sidebar = () => {
  const switchAccount = useAuthStore((s) => s.switchAccount);
  const user = useAuthStore((s) => s.user);
  
  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/meetings', icon: Video, label: 'Meetings' },
    { path: '/kanban', icon: KanbanSquare, label: 'Kanban' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="w-20 glass flex flex-col items-center py-6 justify-between h-screen sticky top-0 transition-all duration-300 z-20">
      <div className="flex flex-col items-center gap-6">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg animate-float">
          <span className="text-primary-foreground font-bold text-sm">IM</span>
        </div>
        <nav className="flex flex-col gap-4 mt-4">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `p-2 rounded-xl transition-all duration-200 hover-lift ${
                  isActive
                    ? 'bg-primary text-primary-foreground scale-105'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`
              }
            >
              <item.icon size={22} strokeWidth={1.7} />
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="flex flex-col items-center gap-4 mb-4">
        <DarkModeToggle />
        
        {user && (
          <div className="flex flex-col items-center gap-4">
            <NavLink
              to="/settings/my-details"
              className="w-10 h-10 rounded-xl overflow-hidden border border-border shadow-sm hover:ring-2 hover:ring-primary transition-all"
            >
              {user.avatarUrl ? (
                <img 
                  src={user.avatarUrl} 
                  alt={user.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase">
                  {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
              )}
            </NavLink>
            
            <button
              onClick={switchAccount}
              className="p-2 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200 hover:scale-105"
              title="Switch account"
            >
              <ArrowLeftRight size={22} strokeWidth={1.7} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
