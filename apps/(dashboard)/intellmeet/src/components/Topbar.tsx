import { Bell, ChevronDown, Menu, Search } from 'lucide-react';

import { Logo } from './Logo';

interface TopbarProps {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
}

export const Topbar = ({ collapsed, setCollapsed }: TopbarProps) => {
  return (
    <header className="fixed inset-x-0 top-0 z-50 h-20 w-full border-b border-border/50 bg-background/75 backdrop-blur-2xl">
      <div className="flex h-full items-center gap-4 px-4 md:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex h-11 w-11 items-center justify-center border border-border/50 bg-card/60 text-muted-foreground backdrop-blur-xl transition-colors hover:text-foreground"
          >
            <Menu size={18} />
          </button>

          <Logo
            src="/Logo.svg"
            alt="IntellMeet"
            size={132}
            className="relative h-auto w-auto"
          />
        </div>

        <div className="hidden flex-1 px-4 lg:flex">
          <div className="relative w-full max-w-2xl">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            />

            <input
              type="text"
              placeholder="Search meetings, classrooms, members..."
              className="h-11 w-full border border-border/50 bg-card/70 px-11 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-border"
            />
          </div>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <div className="hidden items-center gap-2 border border-border/50 bg-card/60 px-3 py-2 text-sm backdrop-blur-xl md:flex">
            <span className="text-muted-foreground">Workspace</span>
            <select className="bg-transparent text-foreground outline-none">
              <option>IntellMeet</option>
            </select>
            <ChevronDown size={14} className="text-muted-foreground" />
          </div>

          <button className="relative flex h-11 w-11 items-center justify-center border border-border/50 bg-card/60 text-muted-foreground backdrop-blur-xl transition-colors hover:text-foreground">
            <Bell size={18} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
          </button>
        </div>
      </div>
    </header>
  );
};
