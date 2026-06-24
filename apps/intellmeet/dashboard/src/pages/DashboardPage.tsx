import { useMemo } from 'react';
import { Link } from 'react-router-dom';

import {
  CircleCheckBig,
  Clock3,
  Radio,
  Sparkles,
} from 'lucide-react';

import { PageTransition } from '../components/PageTransition';
import { MeetingCard } from '../components/MeetingCard';
import {
  useMeetings,
  useRecordedMeetings,
  useLiveMeetings,
} from '../hooks/useMeetings';
import { useWorkspaceSelection } from '../hooks/useWorkspaceSelection';
import { useAuthStore } from '../store/authStore';

const StatCard = ({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint: string;
  icon: typeof Sparkles;
}) => (
  <div className="border border-border bg-card p-5 shadow-sm">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-ring">
          {label}
        </p>

        <p className="mt-3 text-3xl font-semibold tracking-tight">
          {value}
        </p>

        <p className="mt-2 text-sm text-muted-foreground">
          {hint}
        </p>
      </div>

      <div className="flex h-11 w-11 items-center justify-center border border-border bg-background text-muted-foreground">
        <Icon size={18} />
      </div>
    </div>
  </div>
);

export const DashboardPage = () => {
  const { user } = useAuthStore();

  const { selectedOrganizationId } =
    useWorkspaceSelection();

  const { data: meetings = [] } =
    useMeetings(
      selectedOrganizationId,
    );

  const {
    data: recordedMeetings = [],
  } = useRecordedMeetings(
    selectedOrganizationId,
  );

  const {
    data: liveMeetings = [],
  } = useLiveMeetings(
    selectedOrganizationId,
  );

  const upcomingMeetings =
    useMemo(
      () =>
        meetings.filter(
          (meeting) =>
            meeting.status ===
              'upcoming' ||
            meeting.status ===
              'scheduled',
        ),
      [meetings],
    );

  return (
    <PageTransition>
      <div className="flex h-full min-h-0 flex-col gap-6 overflow-hidden p-6">

        <header className="shrink-0 space-y-3">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">
                My Activity
              </h1>

              <p className="mt-3 max-w-2xl text-sm text-muted-foreground md:text-base">
                Welcome back
                {user?.name
                  ? `, ${user.name}`
                  : ''}
                .
              </p>
            </div>

            <Link
              to="/meetings"
              className="inline-flex items-center gap-2 border border-border bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              <Sparkles size={14} />
              Open Meetings
            </Link>
          </div>
        </header>

        <section className="shrink-0 grid gap-4 md:grid-cols-3">
          <StatCard
            label="Upcoming"
            value={String(
              upcomingMeetings.length,
            )}
            hint="Scheduled sessions waiting in this workspace"
            icon={Clock3}
          />

          <StatCard
            label="Live"
            value={String(
              liveMeetings.length,
            )}
            hint="Rooms currently active right now"
            icon={Radio}
          />

          <StatCard
            label="Recorded"
            value={String(
              recordedMeetings.length,
            )}
            hint="Saved recordings ready to watch"
            icon={CircleCheckBig}
          />
        </section>

        <section className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="mb-4 shrink-0">
            <h2 className="text-2xl font-semibold">
              Previous Meetings
            </h2>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto pr-2">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {recordedMeetings.map(
                (meeting) => (
                  <MeetingCard
                    key={meeting.id}
                    meeting={meeting}
                    variant="recorded"
                    primaryActionLabel="Watch"
                    primaryActionHref={
                      meeting.youtube_url
                    }
                    secondaryActionLabel="Summary"
                    secondaryActionHref={`/meetings/${meeting.id}/summary`}
                    creatorLabel={
                      meeting.creator_label
                    }
                  />
                ),
              )}

              {recordedMeetings.length ===
                0 && (
                <div className="border border-dashed border-border bg-card p-5 text-sm text-muted-foreground lg:col-span-2">
                  No recordings have
                  been saved yet.
                </div>
              )}
            </div>
          </div>
        </section>

      </div>
    </PageTransition>
  );
};