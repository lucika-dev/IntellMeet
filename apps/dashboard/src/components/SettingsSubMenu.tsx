import { NavLink } from 'react-router-dom';
import { UserCircle, Key, Users, CreditCard, Bell, Link2, ChevronRight } from 'lucide-react';

const categories = [
  { name: 'Team', icon: Users, path: '/settings/team', id: 'team' },
  { name: 'My details', icon: UserCircle, path: '/settings/my-details', id: 'details' },
  { name: 'Password', icon: Key, path: '/settings/password', id: 'password' },
  { name: 'Billing', icon: CreditCard, path: '/settings/billing', id: 'billing' },
  { name: 'Notifications', icon: Bell, path: '/settings/notifications', id: 'notifications' },
  { name: 'Integrations', icon: Link2, path: '/settings/integrations', id: 'integrations' },
];

export const SettingsSubMenu = () => (
  <div className="w-64 glass border-r border-border flex-shrink-0 py-8 overflow-y-auto h-screen sticky top-0">
    <div className="px-4 mb-6">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Settings</h4>
    </div>
    <nav className="space-y-1 p-2">
      {categories.map((cat) => (
        <NavLink
          key={cat.id}
          to={cat.path}
          className={({ isActive }) =>
            `w-full flex items-center gap-3 px-5 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 transform hover:translate-x-1 ${
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`
          }
        >
          <cat.icon size={18} strokeWidth={1.6} />
          <span>{cat.name}</span>
          <ChevronRight size={14} className="ml-auto opacity-50" />
        </NavLink>
      ))}
    </nav>
  </div>
);
