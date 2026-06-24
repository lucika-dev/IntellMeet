import { Outlet } from 'react-router-dom';
import { useState } from 'react';

import { Sidebar } from '../components/Sidebar';
import { Topbar } from '../components/Topbar';
import { LivePanel } from '../components/LivePanel';
import { useWorkspaceSelection } from '../hooks/useWorkspaceSelection';

export const DashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

  useWorkspaceSelection();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      <Topbar collapsed={collapsed} setCollapsed={setCollapsed} />

      <div className="flex min-h-0 flex-1 overflow-hidden pt-20">
        <Sidebar collapsed={collapsed} />

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto px-4 py-5 md:px-6 lg:px-8">
  <Outlet />
</main>

        <aside className="hidden h-full w-96 shrink-0 border-l border-border xl:block">
          <LivePanel />
        </aside>
      </div>
    </div>
  );
};