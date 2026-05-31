import { Outlet } from 'react-router-dom';
import { useState } from 'react';

import { Sidebar } from '../components/Sidebar.tsx';
import { Topbar } from '../components/Topbar.tsx';
import { LivePanel } from '../components/LivePanel.tsx';

export const DashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="dashboard-backdrop flex h-screen w-full overflow-hidden bg-background text-foreground">
      <Topbar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <div className="flex min-h-0 flex-1 overflow-hidden pt-20">
        <Sidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />

        <main className="min-h-0 min-w-0 flex-1 overflow-hidden px-4 py-5 md:px-6 lg:px-8">
          <Outlet />
        </main>

        <div className="hidden w-[380px] shrink-0 border-l border-border/50 xl:block">
          <LivePanel />
        </div>
      </div>
    </div>
  );
};