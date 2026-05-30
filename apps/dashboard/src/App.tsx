import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { Sidebar } from './components/Sidebar';
import { SettingsSubMenu } from './components/SettingsSubMenu';
import { DashboardPage } from './pages/DashboardPage';
import { MeetingsPage } from './pages/MeetingsPage';
import { KanbanBoardPage } from './pages/KanbanBoardPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { TeamManagementPage } from './pages/TeamManagementPage';
import { MyDetailsPage } from './pages/settings/MyDetailsPage';
import { PasswordPage } from './pages/settings/PasswordPage';
import { BillingPage } from './pages/settings/BillingPage';
import { NotificationsPage } from './pages/settings/NotificationsPage';
import { IntegrationsPage } from './pages/settings/IntegrationsPage';
import { MemberFormDialog } from './components/MemberFormDialog';

const APP_ORIGIN = (import.meta.env.VITE_APP_ORIGIN as string | undefined) || 'http://localhost:3000';

function App() {
  const { isAuthenticated, loading } = useAuthStore();
  const location = useLocation();

  console.log('App state:', { isAuthenticated, loading });

  console.log('App render state:', { isAuthenticated, loading });

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="text-muted-foreground animate-pulse text-sm">Synchronizing your meeting workspace...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-background text-foreground p-4 text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
          <span className="text-3xl">🔒</span>
        </div>
        <h1 className="text-2xl font-bold mb-2 tracking-tight">Access Restricted</h1>
        <p className="text-muted-foreground mb-4 max-w-sm">
          Please log in via the main application to securely access your meeting dashboard.
        </p>
        <div className="flex flex-col gap-3">
          <a 
            href={APP_ORIGIN}
            className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-semibold shadow-lg hover:bg-primary/90 transition hover:scale-105 active:scale-95 text-sm"
          >
            Return to Login
          </a>
          <button 
             onClick={() => {
               console.log('Manual reload requested');
               window.location.reload();
             }}
             className="text-xs text-muted-foreground underline hover:text-foreground"
          >
            Refresh state
          </button>
        </div>
        <p className="mt-8 text-[10px] text-muted-foreground opacity-50 uppercase tracking-widest font-mono">
          Security Protocol 403 • ID: {Math.random().toString(36).substr(2, 9)}
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden relative z-0">
      <div className="animated-bg opacity-30" />
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <main className="flex-1 overflow-y-auto scrollbar-hide">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/meetings" element={<MeetingsPage />} />
              <Route path="/kanban" element={<KanbanBoardPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route
                path="/settings/*"
                element={
                  <div className="flex flex-1 overflow-hidden">
                    <SettingsSubMenu />
                    <div className="flex-1 overflow-y-auto">
                      <Routes>
                        <Route path="team" element={<TeamManagementPage />} />
                        <Route path="my-details" element={<MyDetailsPage />} />
                        <Route path="password" element={<PasswordPage />} />
                        <Route path="billing" element={<BillingPage />} />
                        <Route path="notifications" element={<NotificationsPage />} />
                        <Route path="integrations" element={<IntegrationsPage />} />
                        <Route path="/" element={<Navigate to="my-details" replace />} />
                      </Routes>
                    </div>
                  </div>
                }
              />
              <Route path="/projects" element={<div className="p-8 text-foreground">Projects Integration Coming Soon</div>} />
              <Route path="/analytics" element={<div className="p-8 text-foreground">Analytics Integration Coming Soon</div>} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </AnimatePresence>
        </main>
      </div>
      <MemberFormDialog />
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--card)',
            color: 'var(--foreground)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
          },
        }}
      />
    </div>
  );
}

export default App;
