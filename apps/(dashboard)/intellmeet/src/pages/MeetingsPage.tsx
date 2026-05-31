import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { CalendarDays, Sparkles, Upload, Video } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

import { meetingsApi } from '../api/meetingsApi';
import { PageTransition } from '../components/PageTransition';
import { MeetingCard } from '../components/MeetingCard';

export const MeetingsPage = () => {
  const { data: meetings = [] } = useQuery({
    queryKey: ['meetings'],
    queryFn: meetingsApi.fetchMeetings,
    staleTime: 30_000,
  });
  const [title, setTitle] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [organizationName, setOrganizationName] = useState('IntellMeet Workspace');
  const [scheduleMode, setScheduleMode] = useState<'instant' | 'scheduled'>('scheduled');
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const qc = useQueryClient();
  const navigate = useNavigate();

  const createMutation = useMutation({
    mutationFn: meetingsApi.createMeeting,
    onSuccess: (meeting) => {
      qc.invalidateQueries({ queryKey: ['meetings'] });
      toast.success('Meeting created successfully!');
      navigate(meeting.meeting_url);
    },
    onError: () => toast.error('Failed to create meeting'),
  });

  const scheduledMeetings = useMemo(
    () => meetings.filter((meeting) => meeting.status === 'scheduled').slice(0, 6),
    [meetings],
  );

  const recordedMeetings = useMemo(
    () => meetings.filter((meeting) => meeting.status === 'recorded' || meeting.status === 'ended').slice(0, 6),
    [meetings],
  );

  const handleImageChange = (file: File | null) => {
    setImage(file);

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error('Please add a meeting title');
      return;
    }

    if (scheduleMode === 'scheduled' && !scheduledAt) {
      toast.error('Please choose a scheduled time');
      return;
    }

    await createMutation.mutateAsync({
      title,
      scheduleMode,
      scheduledAt,
      organizationName,
      image,
    });

    setTitle('');
    setScheduledAt('');
    setImage(null);

    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
    }
  };

  const joinLabel = (status: string) => {
    if (status === 'live') return 'Join';
    if (status === 'recorded' || status === 'ended') return 'Summary';
    return 'Register';
  };

  return (
    <PageTransition>
      <div className="flex h-full min-h-0 flex-col gap-5 overflow-hidden">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
              Meeting workspace
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground md:text-5xl">
              Create Meetings
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
              Schedule a room, upload a cover image, and generate a shareable meeting URL for instant joining or future sessions.
            </p>
          </div>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-5 xl:grid-cols-[0.95fr_1.05fr]">
          <section className="glass-card min-h-0 overflow-hidden p-5">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center border border-border/50 bg-primary/10 text-primary">
                <Video size={18} />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  New meeting
                </h2>

                <p className="text-sm text-muted-foreground">
                  Choose instant launch or scheduled creation.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block space-y-2 text-sm font-medium text-foreground">
                Title
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Quarterly planning sync"
                  className="h-12 w-full border border-border/50 bg-background/50 px-4 text-sm outline-none backdrop-blur-xl transition-colors placeholder:text-muted-foreground focus:border-border"
                />
              </label>

              <label className="block space-y-2 text-sm font-medium text-foreground">
                Organization
                <input
                  value={organizationName}
                  onChange={(event) => setOrganizationName(event.target.value)}
                  placeholder="IntellMeet Workspace"
                  className="h-12 w-full border border-border/50 bg-background/50 px-4 text-sm outline-none backdrop-blur-xl transition-colors placeholder:text-muted-foreground focus:border-border"
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setScheduleMode('scheduled')}
                  className={`border px-4 py-3 text-sm font-medium transition-colors ${scheduleMode === 'scheduled' ? 'border-border bg-primary text-primary-foreground' : 'border-border/50 bg-background/40 text-muted-foreground hover:text-foreground'}`}
                >
                  Schedule
                </button>

                <button
                  type="button"
                  onClick={() => setScheduleMode('instant')}
                  className={`border px-4 py-3 text-sm font-medium transition-colors ${scheduleMode === 'instant' ? 'border-border bg-primary text-primary-foreground' : 'border-border/50 bg-background/40 text-muted-foreground hover:text-foreground'}`}
                >
                  Create instantly
                </button>
              </div>

              <label className="block space-y-2 text-sm font-medium text-foreground">
                Scheduled time
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(event) => setScheduledAt(event.target.value)}
                  disabled={scheduleMode === 'instant'}
                  className="h-12 w-full border border-border/50 bg-background/50 px-4 text-sm outline-none backdrop-blur-xl transition-colors placeholder:text-muted-foreground focus:border-border disabled:cursor-not-allowed disabled:opacity-50"
                />
              </label>

              <div className="space-y-2 text-sm font-medium text-foreground">
                Cover image
                <label className="flex min-h-40 cursor-pointer flex-col items-center justify-center gap-3 border border-dashed border-border/60 bg-background/40 px-4 text-center backdrop-blur-xl transition-colors hover:border-border">
                  <Upload size={18} className="text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Upload a meeting image to send to Cloudinary
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => handleImageChange(event.target.files?.[0] ?? null)}
                  />
                </label>

                {preview && (
                  <img
                    src={preview}
                    alt="Cover preview"
                    className="h-40 w-full object-cover"
                  />
                )}
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                className="inline-flex h-12 w-full items-center justify-center gap-2 border border-transparent bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                {createMutation.isPending ? 'Creating...' : scheduleMode === 'instant' ? 'Create meeting instantly' : 'Schedule meeting'}
                <Sparkles size={16} />
              </motion.button>
            </div>
          </section>

          <section className="grid min-h-0 grid-rows-[auto,1fr] gap-5">
            <div className="glass-card p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    Scheduled meetings
                  </h2>

                  <p className="text-sm text-muted-foreground">
                    Active rooms and future sessions from your workspace.
                  </p>
                </div>

                <CalendarDays size={18} className="text-muted-foreground" />
              </div>
            </div>

            <div className="grid min-h-0 gap-4 overflow-hidden md:grid-cols-2">
              {scheduledMeetings.map((meeting) => (
                <MeetingCard
                  key={meeting.id}
                  meeting={meeting}
                  actionLabel={joinLabel(meeting.status)}
                  actionTo={meeting.meeting_url}
                />
              ))}

              {scheduledMeetings.length === 0 && (
                <div className="border border-dashed border-border/50 bg-background/40 p-5 text-sm text-muted-foreground md:col-span-2">
                  No scheduled meetings yet.
                </div>
              )}
            </div>

            <div className="grid min-h-0 gap-4 overflow-hidden md:grid-cols-2">
              {recordedMeetings.map((meeting) => (
                <MeetingCard
                  key={meeting.id}
                  meeting={meeting}
                  actionLabel={joinLabel(meeting.status)}
                  actionTo={`${meeting.meeting_url}/summary`}
                  tone="recorded"
                />
              ))}

              {recordedMeetings.length === 0 && (
                <div className="border border-dashed border-border/50 bg-background/40 p-5 text-sm text-muted-foreground md:col-span-2">
                  Recorded meetings will appear here after they finish.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </PageTransition>
  );
};
