import { useQuery } from '@tanstack/react-query';
import { api } from '../api/mockApi';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, Clock, CheckCircle, Zap } from 'lucide-react';
import { PageTransition } from '../components/PageTransition';

export const AnalyticsPage = () => {
  const { data: meetings = [] } = useQuery({ queryKey: ['meetings'], queryFn: api.fetchMeetings });

  const chartData =
    meetings.length > 0
      ? meetings.map((m) => ({ name: new Date(m.date).toLocaleDateString(), duration: m.duration }))
      : [{ name: 'No data', duration: 0 }];

  const completionData = [
    { name: 'Completed', value: 68, color: 'hsl(var(--primary))' },
    { name: 'Pending', value: 32, color: 'hsl(var(--muted))' },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <PageTransition>
      <div className="p-4 md:p-8">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Analytics & Insights
          </h1>
          <p className="text-muted-foreground mt-1">
            AI‑powered productivity metrics for your team
          </p>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-8"
        >
          <motion.div variants={item} className="bg-card rounded-2xl p-6 shadow-sm border border-border hover:shadow-lg transition">
            <div className="flex items-center gap-2 mb-6">
              <Clock size={20} className="text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Meeting duration trend</h2>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis 
                    dataKey="name" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '12px',
                      color: 'hsl(var(--foreground))',
                      fontSize: '12px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="duration" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2.5} 
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }} 
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-card rounded-2xl p-6 shadow-sm border border-border hover:shadow-lg transition group hover-lift">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Productivity gain</p>
                  <p className="text-3xl font-bold text-emerald-500 mt-1">+42%</p>
                </div>
                <div className="p-3 rounded-2xl bg-emerald-500/10 group-hover:scale-110 transition">
                  <TrendingUp size={24} className="text-emerald-500" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">Estimated time saved via AI summaries</p>
            </div>

            <div className="bg-card rounded-2xl p-6 shadow-sm border border-border hover:shadow-lg transition group hover-lift">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Action completion rate</p>
                  <p className="text-3xl font-bold text-primary mt-1">68%</p>
                </div>
                <div className="p-3 rounded-2xl bg-primary/10 group-hover:scale-110 transition">
                  <CheckCircle size={24} className="text-primary" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">Completed within 7 days</p>
            </div>

            <div className="bg-card rounded-2xl p-6 shadow-sm border border-border hover:shadow-lg transition group hover-lift">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">AI summary adoption</p>
                  <p className="text-3xl font-bold text-indigo-500 mt-1">85%</p>
                </div>
                <div className="p-3 rounded-2xl bg-indigo-500/10 group-hover:scale-110 transition">
                  <Zap size={24} className="text-indigo-500" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">Meetings with AI summaries</p>
            </div>

            <div className="bg-card rounded-2xl p-6 shadow-sm border border-border hover:shadow-lg transition group hover-lift">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Total meeting hours</p>
                  <p className="text-3xl font-bold text-orange-500 mt-1">
                    {Math.round(meetings.reduce((acc, m) => acc + (m.duration || 0), 0) / 60)}h
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-orange-500/10 group-hover:scale-110 transition">
                  <Clock size={24} className="text-orange-500" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">Across all meetings</p>
            </div>
          </motion.div>

          {/* Additional chart: Completion pie */}
          <motion.div variants={item} className="bg-card rounded-2xl p-6 shadow-sm border border-border hover:shadow-lg transition">
            <h2 className="text-lg font-semibold text-foreground mb-6">Action items breakdown</h2>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={completionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {completionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </PageTransition>
  );
};
