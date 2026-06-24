import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useRef, useMemo } from 'react';
import { Upload, X, Sparkles, ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

import { meetingsApi } from '../api/meetingsApi';
import { PageTransition } from '../components/PageTransition';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

interface DateRange {
  start: Date | null;
  end: Date | null;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isBetween(d: Date, start: Date, end: Date) {
  const t = d.getTime();
  return t > Math.min(start.getTime(), end.getTime()) && t < Math.max(start.getTime(), end.getTime());
}

function calendarDays(year: number, month: number): (Date | null)[] {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startPad = (first.getDay() + 6) % 7;
  const days: (Date | null)[] = Array(startPad).fill(null);
  for (let d = 1; d <= last.getDate(); d++) days.push(new Date(year, month, d));
  const endPad = (7 - (days.length % 7)) % 7;
  for (let i = 0; i < endPad; i++) days.push(null);
  return days;
}

function formatDisplayDate(d: Date | null) {
  if (!d) return '';
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function formatSummary(range: DateRange, startTime: string, endTime: string) {
  if (!range.start) return null;
  const end = range.end ?? range.start;
  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  if (isSameDay(range.start, end)) return `${fmt(range.start)}, ${startTime} – ${endTime}`;
  return `${fmt(range.start)} – ${fmt(end)}, ${startTime} – ${endTime}`;
}

function MiniCalendar({ range, onChange }: { range: DateRange; onChange: (r: DateRange) => void }) {
  const today = new Date();
  const [view, setView] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [hovered, setHovered] = useState<Date | null>(null);
  const days = useMemo(() => calendarDays(view.year, view.month), [view]);

  function handleDayClick(d: Date) {
    if (!range.start || (range.start && range.end)) {
      onChange({ start: d, end: null });
    } else {
      onChange(d < range.start ? { start: d, end: range.start } : { start: range.start, end: d });
    }
  }

  function prev() {
    setView(v => v.month === 0 ? { year: v.year - 1, month: 11 } : { ...v, month: v.month - 1 });
  }
  function next() {
    setView(v => v.month === 11 ? { year: v.year + 1, month: 0 } : { ...v, month: v.month + 1 });
  }

  const effectiveEnd = range.end ?? hovered ?? null;

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <button type="button" onClick={prev} className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-accent transition-colors">
          <ChevronLeft size={15} className="text-muted-foreground" />
        </button>
        <span className="text-sm font-semibold text-foreground">{MONTHS[view.month]} {view.year}</span>
        <button type="button" onClick={next} className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-accent transition-colors">
          <ChevronRight size={15} className="text-muted-foreground" />
        </button>
      </div>

      <div className="mb-2 grid grid-cols-7">
        {DAYS.map(d => (
          <div key={d} className="py-1 text-center text-[11px] font-medium text-muted-foreground">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {days.map((day, i) => {
          if (!day) return <div key={`e-${i}`} className="h-9" />;

          const isStart = !!(range.start && isSameDay(day, range.start));
          const isEnd = !!(effectiveEnd && isSameDay(day, effectiveEnd));
          const inRange = !!(range.start && effectiveEnd && !isSameDay(range.start, effectiveEnd) && isBetween(day, range.start, effectiveEnd));
          const isPast = day < new Date(today.getFullYear(), today.getMonth(), today.getDate());
          const isToday = isSameDay(day, today);

          return (
            <button
              key={day.toISOString()}
              type="button"
              disabled={isPast}
              onClick={() => handleDayClick(day)}
              onMouseEnter={() => range.start && !range.end && setHovered(day)}
              onMouseLeave={() => setHovered(null)}
              className={[
                'relative h-9 w-full text-sm transition-colors disabled:pointer-events-none disabled:opacity-25',
                isStart || isEnd ? 'rounded-full bg-primary text-primary-foreground font-semibold' : '',
                inRange ? 'bg-primary/10 text-foreground' : '',
                !isStart && !isEnd && !inRange && !isPast ? 'hover:bg-accent text-foreground rounded-full' : '',
                isToday && !isStart && !isEnd ? 'font-semibold' : '',
              ].join(' ')}
            >
              {day.getDate()}
              {isToday && !isStart && !isEnd && (
                <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TimeSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const times: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (const m of [0, 30]) {
      const hh = h % 12 === 0 ? 12 : h % 12;
      const ampm = h < 12 ? 'am' : 'pm';
      times.push(`${hh}:${m === 0 ? '00' : '30'} ${ampm}`);
    }
  }
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="h-9 rounded-lg border border-border bg-background px-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-ring"
      style={{ minWidth: '88px' }}
    >
      {times.map(t => <option key={t} value={t}>{t}</option>)}
    </select>
  );
}

function ImageDropZone({ preview, onChange }: { preview: string | null; onChange: (f: File | null) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-foreground">Cover image</label>
      {preview ? (
        <div className="relative h-28 overflow-hidden rounded-lg">
          <img src={preview} alt="Cover" className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-background"
          >
            <X size={12} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => ref.current?.click()}
          onDragOver={e => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={e => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) onChange(f); }}
          className={[
            'flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed py-6 transition-colors',
            drag ? 'border-primary bg-primary/5' : 'border-border bg-background hover:border-primary/50',
          ].join(' ')}
        >
          <Upload size={18} className="text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            Drop or <span className="text-primary">browse</span>
          </span>
        </button>
      )}
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && onChange(e.target.files[0])} />
    </div>
  );
}

export const MeetingsPage = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [organizationName, setOrganizationName] = useState('IntellMeet Workspace');
  const [scheduleMode, setScheduleMode] = useState<'instant' | 'scheduled'>('scheduled');
  const [range, setRange] = useState<DateRange>({ start: null, end: null });
  const [startTime, setStartTime] = useState('9:00 am');
  const [endTime, setEndTime] = useState('10:00 am');
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const qc = useQueryClient();
  const navigate = useNavigate();

  const createMutation = useMutation({
    mutationFn: meetingsApi.createMeeting,
    onSuccess: (meeting: any) => {
      qc.invalidateQueries({ queryKey: ['meetings'] });
      toast.success('Meeting created!');
      navigate(meeting.meeting_url);
    },
    onError: () => toast.error('Failed to create meeting'),
  });

  function handleImageChange(file: File | null) {
    setImage(file);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(file ? URL.createObjectURL(file) : null);
  }

  function buildScheduledAt(): string {
    if (scheduleMode === 'instant') return new Date().toISOString();
    if (!range.start) return new Date().toISOString();
    const [timePart] = startTime.split(' ');
    const [hStr, mStr] = timePart.split(':');
    let h = parseInt(hStr);
    const m = parseInt(mStr);
    const d = new Date(range.start);
    d.setHours(h, m, 0, 0);
    return d.toISOString();
  }

  async function handleSubmit() {
    if (!title.trim()) { toast.error('Please add a title'); return; }
    if (scheduleMode === 'scheduled' && !range.start) { toast.error('Please select a date'); return; }
    await createMutation.mutateAsync({ title, description, scheduleMode, scheduledAt: buildScheduledAt(), organizationName, image });
    setTitle(''); setDescription(''); setRange({ start: null, end: null }); setImage(null);
    if (preview) { URL.revokeObjectURL(preview); setPreview(null); }
  }

  const summary = formatSummary(range, startTime, endTime);

  return (
    <PageTransition>
        <div className="flex items-center justify-between gap-4">
          <div>

            <h1 className="mt-2 text-3xl font-medium tracking-tight mb-4 text-foreground md:text-5xl">
              Create a session
            </h1>

          </div>
        </div>
      <div className="flex bg-red-500  min-h-0 flex-col gap-0 overflow-hidden">
        <div className="mx-auto w-full h-[80vh] rounded-xl border border-border bg-card shadow-sm">

          <div className="flex items-center border-b border-border">
            {(['scheduled', 'instant'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setScheduleMode(mode)}
                className="relative flex flex-1 items-center justify-center gap-2 py-4 text-sm font-semibold transition-colors">
                {mode === 'scheduled' ? 'Schedule' : 'Instant'}
                {scheduleMode === mode && (
                  <motion.div
                    layoutId="underline"
                    className="absolute bottom-0 left-1/2 h-0.5 w-10 -translate-x-1/2 rounded-full bg-primary"
                  />
                )}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
            <div className="p-6">
              <AnimatePresence mode="wait">
                {scheduleMode === 'scheduled' ? (
                  <motion.div
                    key="cal"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="space-y-5"
                  >
                    <MiniCalendar range={range} onChange={setRange} />

                    <div className="border-t border-border" />

                    <div className="space-y-1.5">
                      <p className="text-xs font-semibold text-foreground">
                        Start date <span className="text-destructive">*</span>
                      </p>
                      <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
                        <span className={['flex-1 text-sm', range.start ? 'text-foreground' : 'text-muted-foreground'].join(' ')}>
                          {range.start ? formatDisplayDate(range.start) : 'Select a date'}
                        </span>
                        <TimeSelect value={startTime} onChange={setStartTime} />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <p className="text-xs font-semibold text-foreground">
                        End date <span className="text-destructive">*</span>
                      </p>
                      <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
                        <span className={['flex-1 text-sm', (range.end ?? range.start) ? 'text-foreground' : 'text-muted-foreground'].join(' ')}>
                          {range.end ? formatDisplayDate(range.end) : range.start ? formatDisplayDate(range.start) : 'Select a date'}
                        </span>
                        <TimeSelect value={endTime} onChange={setEndTime} />
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="instant"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="flex min-h-72 flex-col items-center justify-center gap-4 text-center"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                      <Zap size={24} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Start instantly</p>
                      <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                        A meeting room opens right away — just fill in a title and go.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex flex-col gap-5 p-6">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Title</label>
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Quarterly planning sync"
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-ring transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Description</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="What is this meeting about?"
                  rows={3}
                  className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-ring transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Organization</label>
                <input
                  value={organizationName}
                  onChange={e => setOrganizationName(e.target.value)}
                  placeholder="IntellMeet Workspace"
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-ring transition-colors"
                />
              </div>

              <ImageDropZone preview={preview} onChange={handleImageChange} />
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-border px-6 py-4">
            <p className="truncate text-xs text-muted-foreground">
              {scheduleMode === 'instant'
                ? 'Meeting will start immediately'
                : summary
                ? <>Event: <span className="font-medium text-foreground">{summary}</span></>
                : 'Select dates on the calendar'}
            </p>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => {
                  setTitle(''); setDescription(''); setRange({ start: null, end: null }); setImage(null);
                  if (preview) { URL.revokeObjectURL(preview); setPreview(null); }
                }}
                className="h-9 rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={handleSubmit}
                disabled={createMutation.isPending}
                className="flex h-9 items-center gap-1.5 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {createMutation.isPending
                  ? 'Creating…'
                  : scheduleMode === 'instant'
                  ? 'Create now'
                  : 'Schedule'}
                <Sparkles size={13} />
              </motion.button>
            </div>
          </div>

        </div>
      </div>
    </PageTransition>
  );
};