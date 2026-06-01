import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { CalendarDays, Clock, Radio, Video } from 'lucide-react';

import { PageTransition } from '../components/PageTransition';
import { useMeetings, useRecordedMeetings } from '../hooks/useMeetings';
import { useWorkspaceSelection } from '../hooks/useWorkspaceSelection';

const parseDurationMinutes = (value: string | null) => {
  if (!value) {
    return 0;
  }

  const numeric = Number.parseFloat(value);

  return Number.isFinite(numeric) ? numeric : 0;
};

const StatCard = ({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof CalendarDays;
}) => {
  return (
    <div className="border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">
            {label}
          </p>

          <p className="mt-2 text-3xl font-semibold text-foreground">
            {value}
          </p>
        </div>

        <div className="flex size-11 items-center justify-center bg-accent text-accent-foreground">
          <Icon className="size-5" />
        </div>
      </div>
    </div>
  );
};

export const AnalyticsPage = () => {
  const { selectedOrganizationId } = useWorkspaceSelection();
  const meetingsQuery = useMeetings(selectedOrganizationId);
  const recordingsQuery = useRecordedMeetings(selectedOrganizationId);

  const meetings = useMemo(
    () => meetingsQuery.data ?? [],
    [meetingsQuery.data],
  );
  const recordings = useMemo(
    () => recordingsQuery.data ?? [],
    [recordingsQuery.data],
  );

  const chartData = useMemo(() => {
    const counts = new Map<string, number>();

    meetings.forEach((meeting) => {
      const key = new Date(meeting.created_at).toLocaleDateString();
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });

    return Array.from(counts.entries()).map(([name, count]) => ({
      name,
      count,
    }));
  }, [meetings]);

  const liveMeetings = meetings.filter(
    (meeting) => meeting.status === 'live',
  ).length;
  const recordedMinutes = recordings.reduce(
    (total, recording) =>
      total + parseDurationMinutes(recording.duration),
    0,
  );

  return (
    <PageTransition>
      <div className="flex h-full min-h-0 flex-col gap-6 overflow-y-auto p-4 md:p-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Analytics
          </h1>

          <p className="mt-1 text-muted-foreground">
            Workspace activity from stored meetings and recordings
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Meetings"
            value={String(meetings.length)}
            icon={CalendarDays}
          />

          <StatCard
            label="Live now"
            value={String(liveMeetings)}
            icon={Radio}
          />

          <StatCard
            label="Recordings"
            value={String(recordings.length)}
            icon={Video}
          />

          <StatCard
            label="Recorded minutes"
            value={String(Math.round(recordedMinutes))}
            icon={Clock}
          />
        </div>

        <section className="min-h-[360px] border border-border bg-card p-5">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-foreground">
              Meetings by day
            </h2>

            <p className="text-sm text-muted-foreground">
              Based on meetings in the selected organization
            </p>
          </div>

          {chartData.length ? (
            <div className="h-[280px]">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart data={chartData}>
                  <XAxis
                    dataKey="name"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />

                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />

                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      color: 'hsl(var(--foreground))',
                      fontSize: '12px',
                    }}
                  />

                  <Bar
                    dataKey="count"
                    fill="hsl(var(--primary))"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
              No meeting activity yet
            </div>
          )}
        </section>
      </div>
    </PageTransition>
  );
};
