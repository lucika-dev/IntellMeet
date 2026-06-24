import { useMemo } from 'react';

import { CircleDot, Radio } from 'lucide-react';

import { MeetingCard } from '../components/MeetingCard';
import { useWorkspaceSelection } from '../hooks/useWorkspaceSelection';
import {
  useLiveMeetings,
  useMeetings,
} from '../hooks/useMeetings';

export const LivePanel = () => {
  const { activeOrganization } =
    useWorkspaceSelection();

  const {
    data: liveMeetings = [],
  } = useLiveMeetings(
    activeOrganization?.id,
  );

  const {
    data: meetings = [],
  } = useMeetings(
    activeOrganization?.id,
  );

  const upcomingMeetings =
    useMemo(
      () =>
        meetings.filter(
          (meeting) =>
            meeting.status ===
              'scheduled' ||
            meeting.status ===
              'upcoming',
        ),
      [meetings],
    );

  return (
    <div className="h-full overflow-y-auto px-4 py-5 pr-2">
      <div className="space-y-4">
        {/* LIVE FEED */}

        <section className="border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-foreground">
              Live Feed
            </h2>

            <div className="flex items-center gap-2 border border-border bg-background px-3 py-1 text-sm text-muted-foreground">
              <CircleDot
                size={12}
                className="animate-pulse text-primary"
              />

              <span>
                {liveMeetings.length}{' '}
                live
              </span>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {liveMeetings.length ===
            0 ? (
              <div className="border border-dashed border-border bg-background p-5 text-sm text-muted-foreground">
                No live meetings right
                now.
              </div>
            ) : (
              liveMeetings.map(
                (meeting) => (
                  <div
                    key={meeting.id}
                    className="border border-border bg-background p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 items-center justify-center overflow-hidden border border-border bg-muted text-primary">
                          {meeting.thumbnail_url ? (
                            <img
                              src={
                                meeting.thumbnail_url
                              }
                              alt={
                                meeting.title
                              }
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Radio
                              size={
                                18
                              }
                            />
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">
                            {
                              meeting.title
                            }
                          </p>

                          <p className="truncate text-xs text-muted-foreground">
                            {meeting
                              .channel
                              ?.name ||
                              'Live channel'}
                          </p>
                        </div>
                      </div>

                      <a
                        href={`/meetings/${meeting.id}`}
                        className="border border-border bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90"
                      >
                        Join
                      </a>
                    </div>

                    <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {meeting.participant_count ??
                          0}{' '}
                        participants
                      </span>

                      <span>
                        {
                          meeting.status
                        }
                      </span>
                    </div>
                  </div>
                ),
              )
            )}
          </div>
        </section>

        {/* UPCOMING */}

        <section className="border border-border bg-card p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-foreground">
              Upcoming Meetings
            </h2>

            <p className="mt-1 text-xs text-muted-foreground">
              Scheduled sessions
              in this workspace.
            </p>
          </div>

          <div className="space-y-3">
            {upcomingMeetings.map(
              (meeting) => (
                <MeetingCard
                  key={meeting.id}
                  meeting={meeting}
                  variant="upcoming"
                  primaryActionLabel="Open"
                  primaryActionHref={`/meetings/${meeting.id}`}
                  creatorLabel={
                    meeting.creator_label
                  }
                />
              ),
            )}

            {upcomingMeetings.length ===
              0 && (
              <div className="border border-dashed border-border bg-background p-5 text-sm text-muted-foreground">
                No upcoming meetings
                scheduled.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};