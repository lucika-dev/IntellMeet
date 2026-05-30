import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/mockApi';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Video, CalendarDays, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { PageTransition } from '../components/PageTransition';

export const MeetingsPage = () => {
  const { data: meetings = [] } = useQuery({
    queryKey: ['meetings'],
    queryFn: api.fetchMeetings,
  });
  const [newTitle, setNewTitle] = useState('');
  const qc = useQueryClient();
  const navigate = useNavigate();

  const createMutation = useMutation({
    mutationFn: api.createMeeting,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['meetings'] });
      toast.success('Meeting created successfully!');
    },
    onError: () => toast.error('Failed to create meeting'),
  });

  const handleCreate = async () => {
    if (newTitle.trim()) {
      await createMutation.mutateAsync(newTitle);
      setNewTitle('');
    } else {
      toast.error('Please enter a meeting title');
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <PageTransition>
      <div className="p-4 md:p-8">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              All meetings
            </h1>
            <p className="text-muted-foreground mt-1">
              AI‑powered sessions with smart summaries
            </p>
          </div>

          {/* Create meeting form */}
          <div className="flex gap-2">
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="New meeting title"
              className="px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary transition bg-card text-foreground"
              onKeyPress={(e) => e.key === 'Enter' && handleCreate()}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCreate}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-primary/90 transition shadow-md hover:shadow-lg"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Create</span>
            </motion.button>
          </div>
        </div>

        {/* Meetings grid */}
        {meetings.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
              <CalendarDays size={32} className="text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">No meetings yet</h3>
            <p className="text-muted-foreground mt-1">Create your first meeting above</p>
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {meetings.map((meeting) => (
              <motion.div
                key={meeting.id}
                variants={item}
                whileHover={{ y: -5 }}
                className="group bg-card rounded-xl border border-border shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-primary/10 group-hover:scale-110 transition-transform">
                        <Video size={18} className="text-primary" />
                      </div>
                      <h3 className="font-semibold text-foreground line-clamp-1">
                        {meeting.title}
                      </h3>
                    </div>
                    {meeting.summary && (
                      <Sparkles size={16} className="text-amber-500" />
                    )}
                  </div>

                  <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarDays size={14} />
                    <span>{new Date(meeting.date).toLocaleString()}</span>
                  </div>

                  <div className="mt-5 flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate(`/meeting/${meeting.id}`)}
                      className="flex-1 text-sm bg-primary text-primary-foreground px-3 py-1.5 rounded-lg hover:bg-primary/90 transition shadow-sm"
                    >
                      Join
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate(`/meeting/${meeting.id}/summary`)}
                      className="flex-1 text-sm border border-border text-foreground px-3 py-1.5 rounded-lg hover:bg-accent transition"
                    >
                      Summary
                    </motion.button>
                  </div>
                </div>

                {/* Decorative gradient bar at bottom */}
                <div className="h-1 w-full bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
};
