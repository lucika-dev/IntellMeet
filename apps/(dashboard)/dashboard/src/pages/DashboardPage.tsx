import { useQuery } from '@tanstack/react-query';
import { api } from '../api/mockApi';
import { Video, CheckSquare, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { PageTransition } from '../components/PageTransition';
import { useAuthStore } from '../store/authStore';

const useTilt = () => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [10, -10]);
  const rotateY = useTransform(x, [-100, 100], [-10, 10]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(e.clientX - centerX);
    y.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return { rotateX, rotateY, handleMouseMove, handleMouseLeave };
};

const TiltCard = ({ children, className }: any) => {
  const { rotateX, rotateY, handleMouseMove, handleMouseLeave } = useTilt();
  return (
    <motion.div
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      transition={{ type: 'spring', stiffness: 300 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const DashboardPage = () => {
  const { user } = useAuthStore();
  const { data: meetings = [] } = useQuery({ queryKey: ['meetings'], queryFn: api.fetchMeetings });
  const recentMeetings = meetings.slice(0, 3);

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  return (
    <PageTransition>
      <div className="p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, <span className="text-primary">{user?.name || 'User'}</span>
          </h1>
          <p className="text-muted-foreground mt-1">Here's what's happening with your meetings today.</p>
        </header>

        <motion.div variants={container} initial="hidden" animate="show">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <TiltCard className="bg-card rounded-xl p-5 shadow-sm border border-border hover-lift transition-all duration-300">
              <div className="flex items-center gap-3">
                <Video className="text-primary" />
                <div>
                  <p className="text-2xl font-bold">{meetings.length}</p>
                  <p className="text-muted-foreground">Total meetings</p>
                </div>
              </div>
            </TiltCard>
            <TiltCard className="bg-card rounded-xl p-5 shadow-sm border border-border hover-lift transition-all duration-300">
              <div className="flex items-center gap-3">
                <CheckSquare className="text-emerald-500" />
                <div>
                  <p className="text-2xl font-bold">12</p>
                  <p className="text-muted-foreground">Action items</p>
                </div>
              </div>
            </TiltCard>
            <TiltCard className="bg-card rounded-xl p-5 shadow-sm border border-border hover-lift transition-all duration-300">
              <div className="flex items-center gap-3">
                <TrendingUp className="text-accent" />
                <div>
                  <p className="text-2xl font-bold">40%</p>
                  <p className="text-muted-foreground">Productivity ↑</p>
                </div>
              </div>
            </TiltCard>
          </div>
        </motion.div>

        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4 text-foreground">Recent meetings</h2>
          <div className="space-y-3">
            {recentMeetings.map((m, idx) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Link
                  to={`/meeting/${m.id}/summary`}
                  className="block p-4 rounded-xl glass hover-lift transition-all duration-300"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-foreground">{m.title}</span>
                    <span className="text-sm text-muted-foreground">{new Date(m.date).toLocaleDateString()}</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};
