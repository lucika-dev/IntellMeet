import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Building2, CalendarDays } from 'lucide-react';

import { meetingsApi } from '../api/meetingsApi';
import { PageTransition } from '../components/PageTransition';

export const MeetingSummaryPage = () => {
  const { meetingCode = '' } = useParams();

  const { data: meeting } = useQuery({
    queryKey: ['meeting-summary', meetingCode],
    queryFn: () => meetingsApi.fetchMeetingByCode(meetingCode),
    enabled: Boolean(meetingCode),
    staleTime: 30_000,
  });

  return (
    <PageTransition>
      <div className="flex h-full min-h-0 flex-col gap-5 overflow-hidden">
        <div className="glass-card p-5">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
            Meeting summary
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
            {meeting?.title || 'Meeting summary'}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Building2 size={14} />
              {meeting?.organization_name || 'Workspace'}
            </span>

            <span className="inline-flex items-center gap-1.5">
              <CalendarDays size={14} />
              {meeting
                ? new Intl.DateTimeFormat(undefined, {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  }).format(new Date(meeting.scheduled_time))
                : 'Loading'}
            </span>
          </div>
        </div>

        <div className="grid min-h-0 flex-1 gap-5 xl:grid-cols-[1.1fr_0.9fr]">
          <section className="glass-card p-5">
            <h2 className="text-lg font-semibold text-foreground">Session recap</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              This summary route is wired to the same meeting record as the room page, so the backend can render recordings, notes, and action items from Supabase once they are saved.
            </p>

            <a href="/meetings" className="mt-6 inline-flex items-center gap-2 border border-border/50 bg-background/40 px-4 py-2 text-sm font-medium text-foreground backdrop-blur-xl transition-colors hover:bg-accent/30">
              <ArrowLeft size={14} />
              Back to meetings
            </a>
          </section>

          <section className="glass-card p-5">
            <h2 className="text-lg font-semibold text-foreground">Room metadata</h2>

            <div className="mt-4 space-y-3 text-sm text-muted-foreground">
              <div className="border border-border/50 bg-background/40 p-4">
                <p className="text-foreground">Meeting code</p>
                <p className="mt-1">{meeting?.meeting_code || meetingCode}</p>
              </div>

              <div className="border border-border/50 bg-background/40 p-4">
                <p className="text-foreground">Status</p>
                <p className="mt-1 capitalize">{meeting?.status || 'Loading'}</p>
              </div>

              <div className="border border-border/50 bg-background/40 p-4">
                <p className="text-foreground">Participants</p>
                <p className="mt-1">{meeting?.participant_count || 0}</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </PageTransition>
  );
};