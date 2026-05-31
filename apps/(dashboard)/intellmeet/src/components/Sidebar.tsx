import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Video, KanbanSquare, BarChart3, Settings, ArrowLeftRight } from 'lucide-react';
import type { Dispatch, SetStateAction } from 'react';

import { useAuthStore } from '../store/authStore';
import { DarkModeToggle } from './DarkModeToggle';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: Dispatch<SetStateAction<boolean>>;
}

export const Sidebar = ({ collapsed }: SidebarProps) => {
  const switchAccount = useAuthStore((state) => state.switchAccount);
  const user = useAuthStore((state) => state.user);

  const navSections = [
    {
      title: 'Workspace',
      items: [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/meetings', icon: Video, label: 'Meetings' },
        { path: '/kanban', icon: KanbanSquare, label: 'Kanban' },
      ],
    },
    {
      title: 'Management',
      items: [
        { path: '/analytics', icon: BarChart3, label: 'Analytics' },
        { path: '/settings', icon: Settings, label: 'Settings' },
      ],
    },
  ];

  return (
    <aside className={`relative z-20 flex h-[calc(100vh-5rem)] shrink-0 flex-col justify-between border-r border-border/50 bg-background/65 backdrop-blur-2xl transition-[width] duration-300 ease-in-out ${collapsed ? 'w-20' : 'w-64'}`}>
      <div className="flex-1 overflow-y-auto premium-scrollbar px-3 py-5">


        <div className="flex flex-col gap-7">
          {navSections.map((section) => (
            <div key={section.title}>
              {!collapsed && (
                <p className="mb-3 px-3 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  {section.title}
                </p>
              )}

              <nav className="flex flex-col gap-1">
                {section.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    title={collapsed ? item.label : ''}
                    className={({ isActive }) =>
                      [
                        'group flex items-center rounded-2xl transition-all duration-200',
                        collapsed ? 'justify-center px-0 py-3' : 'gap-3 px-4 py-3',
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'text-muted-foreground hover:bg-accent/60 hover:text-accent-foreground',
                      ].join(' ')
                    }
                  >
                    <item.icon size={19} strokeWidth={1.9} className="shrink-0" />
                    {!collapsed && <span className="truncate text-sm font-medium">{item.label}</span>}
                  </NavLink>
                ))}
              </nav>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-border/50 p-3">
        <div className={`flex items-center ${collapsed ? 'flex-col gap-3' : 'justify-between gap-3'}`}>
          <DarkModeToggle />

          <button
            onClick={switchAccount}
            title="Switch account"
            className="flex h-10 w-10 items-center justify-center text-muted-foreground transition-colors duration-200 hover:text-foreground"
          >
            <ArrowLeftRight size={18} strokeWidth={1.8} />
          </button>
        </div>

        {user && (
          <NavLink
            to="/settings/my-details"
            className={`mt-4 border border-border/50 bg-card/60 backdrop-blur-xl transition-colors duration-200 hover:border-border/70 hover:bg-background/80 ${collapsed ? 'flex justify-center p-2' : 'flex items-center gap-3 p-3'}`}
          >
            <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-border/50">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-primary/10 text-xs font-bold uppercase text-primary">
                  {user.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)}
                </div>
              )}
            </div>

            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{user.name}</p>
                <p className="truncate text-xs text-muted-foreground">Enterprise Member</p>
              </div>
            )}
          </NavLink>
        )}
      </div>
    </aside>
  );
};
