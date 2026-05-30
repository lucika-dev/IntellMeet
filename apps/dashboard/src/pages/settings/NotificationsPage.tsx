import { useState } from 'react';
import { PageTransition } from '../../components/PageTransition';
import { motion } from 'framer-motion';

export const NotificationsPage = () => {
  const [settings, setSettings] = useState({
    emailSummaries: true,
    emailActionItems: true,
    inAppChat: true,
    taskAssignments: true,
  });

  const toggle = (key: keyof typeof settings) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  return (
    <PageTransition>
      <div className="p-8 max-w-4xl">
        <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
        <p className="text-muted-foreground mt-1 mb-8">Choose what notifications you receive across platform</p>
        
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden divide-y divide-border/50">
          <NotificationItem
            title="Meeting summaries"
            description="Receive AI-generated meeting summaries via email"
            enabled={settings.emailSummaries}
            onToggle={() => toggle('emailSummaries')}
          />
          <NotificationItem
            title="Action items reminder"
            description="Get reminders about pending action items"
            enabled={settings.emailActionItems}
            onToggle={() => toggle('emailActionItems')}
          />
          <NotificationItem
            title="In‑app chat messages"
            description="Get notified when someone mentions you in chat"
            enabled={settings.inAppChat}
            onToggle={() => toggle('inAppChat')}
          />
          <NotificationItem
            title="Task assignments"
            description="Email when you're assigned a task"
            enabled={settings.taskAssignments}
            onToggle={() => toggle('taskAssignments')}
          />
        </div>
        
        <div className="mt-8 flex justify-end">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-all shadow-md hover:shadow-lg"
          >
            Save preferences
          </motion.button>
        </div>
      </div>
    </PageTransition>
  );
};

const NotificationItem = ({ title, description, enabled, onToggle }: any) => (
  <div className="flex items-center justify-between p-6 hover:bg-muted/30 transition-colors group">
    <div className="space-y-1">
      <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
    <button
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
        enabled ? 'bg-primary' : 'bg-muted'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 shadow-sm ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  </div>
);
