import { Link } from 'react-router-dom';

import { ArrowRight, Building2, CalendarDays, PlayCircle, Video } from 'lucide-react';

import type { MeetingRecord } from '../api/meetingsApi';
import type { DashboardMeeting, RecordedMeeting } from '../types';
import { formatDateTime, getYoutubeThumbnail } from '../lib/meetingUtils';

interface MeetingCardProps {
  meeting: MeetingRecord | DashboardMeeting | RecordedMeeting;
  variant?: 'upcoming' | 'recorded' | 'live';
  primaryActionLabel?: string;
  primaryActionHref?: string;
  secondaryActionLabel?: string;
  secondaryActionHref?: string;
  creatorLabel?: string;
  actionLabel?: string;
  actionTo?: string;
  tone?: 'default' | 'recorded';
}

const isExternalHref = (href: string) => /^https?:\/\//.test(href);

const firstRelation = <T,>(value: T | T[] | null | undefined) =>
  Array.isArray(value) ? value[0] ?? null : value ?? null;

const getStringValue = (value: unknown) =>
  typeof value === 'string' ? value : null;

export const MeetingCard = ({
  meeting,
  variant,
  primaryActionLabel,
  primaryActionHref,
  secondaryActionLabel,
  secondaryActionHref,
  creatorLabel,
  actionLabel,
  actionTo,
  tone,
}: MeetingCardProps) => {
  const isLegacyMeeting = 'scheduled_time' in meeting;
  const renderVariant =
    variant ?? (tone === 'recorded' ? 'recorded' : 'upcoming');

  const thumbnail =
    'youtube_url' in meeting
      ? meeting.thumbnail_url ?? getYoutubeThumbnail(meeting.youtube_url)
      : 'image_url' in meeting
        ? meeting.image_url
        : meeting.thumbnail_url;

  const scheduledLabel = formatDateTime(
    'scheduled_for' in meeting
      ? getStringValue(meeting.scheduled_for)
      : isLegacyMeeting
        ? meeting.scheduled_time
        : meeting.created_at,
  );

  const organizationName =
    'organization' in meeting
      ? firstRelation(meeting.organization)?.name || 'Workspace'
      : 'organization_name' in meeting
        ? meeting.organization_name || 'Workspace'
        : 'Workspace';

  const channelName =
    'channel' in meeting
      ? firstRelation(meeting.channel)?.name || 'Channel'
      : 'room_name' in meeting
        ? meeting.room_name || 'Channel'
        : 'Channel';

  const participantCount =
    'participant_count' in meeting && typeof meeting.participant_count === 'number'
      ? meeting.participant_count
      : 0;

  const primaryHref = primaryActionHref ?? actionTo ?? '#';
  const primaryLabel = primaryActionLabel ?? actionLabel ?? 'Open';

  return (
    <article className="group overflow-hidden border border-border bg-card shadow-sm">
      <div className="relative aspect-[16/9] overflow-hidden border-b border-border bg-muted">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={meeting.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-background text-sm text-muted-foreground">
            {variant === 'recorded' ? 'Recorded meeting' : 'Meeting cover'}
          </div>
        )}

        <div className="absolute left-4 top-4 inline-flex items-center gap-2 border border-border bg-background px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
          <span className={`h-2 w-2 ${renderVariant === 'live' ? 'bg-primary' : renderVariant === 'recorded' ? 'bg-muted-foreground' : 'bg-accent'}`} />
          {renderVariant}
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-base font-semibold text-foreground">{meeting.title}</h3>

            <span className="shrink-0 border border-border bg-background px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              {participantCount} people
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Building2 size={13} />
              {organizationName}
            </span>

            <span className="inline-flex items-center gap-1.5">
              <CalendarDays size={13} />
              {scheduledLabel}
            </span>

            <span className="inline-flex items-center gap-1.5">
              <Video size={13} />
              {channelName}
            </span>
          </div>

          {creatorLabel ? <p className="text-xs text-muted-foreground">Created by {creatorLabel}</p> : null}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {isExternalHref(primaryHref) ? (
            <a
              href={primaryHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 border border-border bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              {renderVariant === 'recorded' ? <PlayCircle size={14} /> : <ArrowRight size={14} />}
              {primaryLabel}
            </a>
          ) : (
            <Link
              to={primaryHref}
              className="inline-flex items-center gap-2 border border-border bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              {renderVariant === 'recorded' ? <PlayCircle size={14} /> : <ArrowRight size={14} />}
              {primaryLabel}
            </Link>
          )}

          {secondaryActionLabel && secondaryActionHref ? (
            <Link
              to={secondaryActionHref}
              className="inline-flex items-center gap-2 border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              {secondaryActionLabel}
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
};
