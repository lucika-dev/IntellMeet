import { Link } from 'react-router-dom';
import { CalendarDays, Building2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

import type { MeetingRecord } from '../api/meetingsApi';

interface MeetingCardProps {
  meeting: MeetingRecord;
  actionLabel: string;
  actionTo: string;
  tone?: 'default' | 'recorded';
}

export const MeetingCard = ({
  meeting,
  actionLabel,
  actionTo,
  tone = 'default',
}: MeetingCardProps) => {
  const formattedDate = new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(meeting.scheduled_time));

  return (
    <motion.article
      className={`glass-card group overflow-hidden ${tone === 'recorded' ? 'opacity-95' : ''}`}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
    >
      <div className="relative aspect-[16/9] overflow-hidden border-b border-border/50 bg-muted/30">
        {meeting.image_url ? (
          <img
            src={meeting.image_url}
            alt={meeting.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/15 via-background to-muted/30 text-sm font-medium text-muted-foreground">
            Meeting cover
          </div>
        )}

        <div className="absolute left-4 top-4 inline-flex items-center gap-2 border border-border/40 bg-background/75 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground backdrop-blur-xl">
          <span className={`h-2 w-2 rounded-full ${meeting.status === 'live' ? 'bg-emerald-500' : meeting.status === 'recorded' ? 'bg-zinc-500' : 'bg-primary'}`} />
          {meeting.status}
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-base font-semibold tracking-tight text-foreground">{meeting.title}</h3>

            <span className="shrink-0 rounded-full border border-border/40 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              {meeting.meeting_code}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Building2 size={13} />
              {meeting.organization_name || 'Workspace'}
            </span>

            <span className="inline-flex items-center gap-1.5">
              <CalendarDays size={13} />
              {formattedDate}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">{meeting.participant_count} participants</p>

          <Link
            to={actionTo}
            className={`inline-flex items-center gap-2 border px-4 py-2 text-sm font-medium transition-colors ${meeting.status === 'recorded' ? 'border-border/50 bg-background/40 text-foreground hover:bg-accent/30' : 'border-transparent bg-primary text-primary-foreground hover:opacity-90'}`}
          >
            {actionLabel}
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </motion.article>
  );
};