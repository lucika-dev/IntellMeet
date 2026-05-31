import { useQuery } from '@tanstack/react-query';
import { CircleDot, Radio } from 'lucide-react';

import { meetingsApi } from '../api/meetingsApi';

export const LivePanel = () => {
  const { data: liveMeetings = [] } = useQuery({
    queryKey: ['meetings', 'live'],
    queryFn: meetingsApi.fetchLiveMeetings,
    staleTime: 30_000,
  });

  return (
    <div className="h-[calc(100vh-5rem)] overflow-hidden">
      <div className="h-full overflow-y-auto premium-scrollbar px-4 py-5 pr-2">
        <div className="glass-card p-5">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Live Now</h2>

            <div className="flex items-center gap-2 rounded-full border border-border/40 px-3 py-1 text-sm text-muted-foreground">
              <CircleDot size={12} className="animate-pulse text-primary" />
              <span>{liveMeetings.length} Live</span>
            </div>
          </div>

          <div className="space-y-3">
            {liveMeetings.length === 0 ? (
              <div className="border border-dashed border-border/50 bg-background/40 p-5 text-sm text-muted-foreground">
                No live meetings right now.
              </div>
            ) : (
              liveMeetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className="flex items-center justify-between border border-border/50 bg-background/40 p-4 backdrop-blur-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border/40 bg-primary/10 text-primary">
                      <Radio size={18} />
                    </div>

                    <div>
                      <p className="font-medium text-foreground">{meeting.title}</p>

                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <CircleDot size={12} className="animate-pulse" />
                        <span>{meeting.participant_count} participants</span>
                      </div>
                    </div>
                  </div>

                  <a
                    href={meeting.meeting_url}
                    className="rounded-lg border border-border/50 bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90"
                  >
                    Join
                  </a>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
