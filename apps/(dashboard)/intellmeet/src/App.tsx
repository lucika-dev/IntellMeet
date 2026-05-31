import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';

import { useAuthStore } from './store/authStore';
import { MemberFormDialog } from './components/MemberFormDialog';
import { DashboardLayout } from './layouts/DashboardLayout';
import { SettingsSubMenu } from './components/SettingsSubMenu';

import { DashboardPage } from './pages/DashboardPage.tsx';
import { MeetingsPage } from './pages/MeetingsPage.tsx';
import { KanbanBoardPage } from './pages/KanbanBoardPage.tsx';
import { AnalyticsPage } from './pages/AnalyticsPage.tsx';
import { TeamManagementPage } from './pages/TeamManagementPage.tsx';
import { MeetingRoomPage } from './pages/MeetingRoomPage.tsx';
import { MeetingSummaryPage } from './pages/MeetingSummaryPage.tsx';

import { MyDetailsPage } from './pages/settings/MyDetailsPage';
import { PasswordPage } from './pages/settings/PasswordPage';
import { BillingPage } from './pages/settings/BillingPage';
import { NotificationsPage } from './pages/settings/NotificationsPage';
import { IntegrationsPage } from './pages/settings/IntegrationsPage';

const APP_ORIGIN =
  (import.meta.env.VITE_APP_ORIGIN as string | undefined) ||
  'http://localhost:4321';

function App() {
  const { isAuthenticated, loading } = useAuthStore();

  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div
            className="
              h-12 w-12 animate-spin rounded-full
              border-4 border-primary/20 border-t-primary
            "
          />

          <p className="animate-pulse text-sm text-muted-foreground">
            Synchronizing your meeting workspace...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div
        className="
          flex h-screen w-screen flex-col
          items-center justify-center
          bg-background p-4 text-center
          text-foreground
        "
      >
        <h1 className="mb-2 text-7xl font-bold tracking-tight">
          Access Restricted
        </h1>

        <p className="mb-12 max-w-2xl text-xl text-muted-foreground">
          Please log in via the main application to securely
          access your enterprise workspace.
        </p>

        <div className="flex flex-col gap-3">
          <a
            href={APP_ORIGIN}
            className="
              rounded-2xl bg-primary
              px-8 py-3
              text-lg font-semibold
              text-primary-foreground
              transition-all duration-200
              hover:opacity-90
            "
          >
            Login From App
          </a>

          <button
            onClick={() => window.location.reload()}
            className="
              text-sm text-muted-foreground
              underline underline-offset-4
              hover:text-foreground
            "
          >
            Refresh state
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <AnimatePresence mode="wait">
        <Routes
          location={location}
          key={location.pathname}
        >
          <Route element={<DashboardLayout />}>
            <Route
              path="/"
              element={
                <Navigate
                  to="/dashboard"
                  replace
                />
              }
            />

            <Route
              path="/dashboard"
              element={<DashboardPage />}
            />

            <Route
              path="/meetings"
              element={<MeetingsPage />}
            />

            <Route
              path="/meetings/:meetingCode"
              element={<MeetingRoomPage />}
            />

            <Route
              path="/meetings/:meetingCode/summary"
              element={<MeetingSummaryPage />}
            />

            <Route
              path="/kanban"
              element={<KanbanBoardPage />}
            />

            <Route
              path="/analytics"
              element={<AnalyticsPage />}
            />

            <Route
              path="/settings/*"
              element={
                <div className="flex h-full min-h-0 overflow-hidden">
                  <SettingsSubMenu />

                  <div className="min-h-0 flex-1 overflow-hidden">
                    <Routes>
                      <Route
                        path="team"
                        element={<TeamManagementPage />}
                      />

                      <Route
                        path="my-details"
                        element={<MyDetailsPage />}
                      />

                      <Route
                        path="password"
                        element={<PasswordPage />}
                      />

                      <Route
                        path="billing"
                        element={<BillingPage />}
                      />

                      <Route
                        path="notifications"
                        element={<NotificationsPage />}
                      />

                      <Route
                        path="integrations"
                        element={<IntegrationsPage />}
                      />

                      <Route
                        path="/"
                        element={
                          <Navigate
                            to="my-details"
                            replace
                          />
                        }
                      />
                    </Routes>
                  </div>
                </div>
              }
            />

            <Route
              path="*"
              element={
                <Navigate
                  to="/dashboard"
                  replace
                />
              }
            />
          </Route>
        </Routes>
      </AnimatePresence>

      <MemberFormDialog />

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--card)',
            color: 'var(--foreground)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
          },
        }}
      />
    </>
  );
}

export default App;