import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  CalendarDays,
  PlayCircle,
} from 'lucide-react';

import { meetingsApi } from '../api/meetingsApi';
import { PageTransition } from '../components/PageTransition';

const fetchTranscript = async (
  youtubeUrl: string,
) => {
  const response = await fetch(
    'http://localhost:5000/api/transcript',
    {
      method: 'POST',
      headers: {
        'Content-Type':
          'application/json',
      },
      body: JSON.stringify({
        youtubeUrl,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(
      'Failed to load transcript',
    );
  }

  return response.json();
};

export const MeetingSummaryPage =
  () => {
    const navigate =
      useNavigate();

    const {
      meetingId = '',
    } = useParams();

    const {
      data: meeting,
      isLoading:
        meetingLoading,
      error:
        meetingError,
    } = useQuery({
      queryKey: [
        'recorded-meeting',
        meetingId,
      ],
      queryFn: () =>
        meetingsApi.fetchRecordedMeeting(
          meetingId,
        ),
      enabled:
        Boolean(meetingId),
    });

    const {
      data: transcriptData,
      isLoading:
        transcriptLoading,
      error:
        transcriptError,
    } = useQuery({
      queryKey: [
        'transcript',
        meeting?.youtube_url,
      ],
      queryFn: () =>
        fetchTranscript(
          meeting!.youtube_url,
        ),
      enabled:
        Boolean(
          meeting?.youtube_url,
        ),
    });

    if (meetingLoading) {
      return (
        <PageTransition>
          <div className="flex h-full items-center justify-center">
            Loading recordedMeeting...
          </div>
        </PageTransition>
      );
    }

if (meetingError) {
  return (
    <PageTransition>
      <div className="flex h-full items-center justify-center">
        <div className="border border-border bg-card p-8">
          Failed to load meeting
        </div>
      </div>
    </PageTransition>
  );
}

if (!meeting) {
  return (
    <PageTransition>
      <div className="flex h-full items-center justify-center">
        <div className="border border-border bg-card p-8">
          Meeting not found
        </div>
      </div>
    </PageTransition>
  );
}

const recordedMeeting = meeting;

    return (
      <PageTransition>
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-6">

          <button
            onClick={() =>
              navigate(-1)
            }
            className="inline-flex w-fit items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft
              size={14}
            />
            Back
          </button>

          <div className="overflow-hidden border border-border bg-card shadow-sm">
            {recordedMeeting.thumbnail_url ? (
              <img
                src={
                  recordedMeeting.thumbnail_url
                }
                alt={
                  recordedMeeting.title
                }
                className="aspect-video w-full object-cover"
              />
            ) : (
              <div className="flex aspect-video items-center justify-center bg-muted text-muted-foreground">
                No Thumbnail
              </div>
            )}
          </div>

          <div className="border border-border bg-card p-6 shadow-sm">
            <h1 className="text-4xl font-semibold tracking-tight">
              {recordedMeeting.title}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <CalendarDays
                  size={14}
                />
                {new Intl.DateTimeFormat(
                  undefined,
                  {
                    dateStyle:
                      'medium',
                    timeStyle:
                      'short',
                  },
                ).format(
                  new Date(
                    recordedMeeting.created_at,
                  ),
                )}
              </span>
            </div>

            {recordedMeeting.youtube_url && (
              <a
                href={
                  recordedMeeting.youtube_url
                }
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex items-center gap-2 border border-border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
              >
                <PlayCircle
                  size={16}
                />
                Open Video
              </a>
            )}
          </div>

          <div className="border border-border bg-card p-6 shadow-sm">
            <h2 className="text-2xl font-semibold">
              Description
            </h2>

            <div className="mt-4 whitespace-pre-wrap leading-7 text-muted-foreground">
              {recordedMeeting.description ||
                'No description available'}
            </div>
          </div>

          <div className="border border-border bg-card p-6 shadow-sm">
            <h2 className="text-2xl font-semibold">
              Transcript
            </h2>

            {transcriptLoading ? (
              <div className="mt-4 text-muted-foreground">
                Loading transcript...
              </div>
            ) : transcriptError ? (
              <div className="mt-4 text-destructive">
                Failed to load transcript
              </div>
            ) : (
              <div className="mt-4 max-h-[900px] overflow-y-auto whitespace-pre-wrap rounded border border-border bg-background p-6 text-sm leading-8">
                {transcriptData?.transcript ||
                  'Transcript unavailable'}
              </div>
            )}
          </div>
        </div>
      </PageTransition>
    );
  };