import { MessageSquare, Code, Calendar, Globe, Link2 } from 'lucide-react';
import { PageTransition } from '../../components/PageTransition';
import { motion } from 'framer-motion';

const integrations = [
  { name: 'Slack', icon: MessageSquare, description: 'Get meeting summaries and action items in Slack', connected: false, color: 'text-[#4A154B]' },
  { name: 'Google Calendar', icon: Calendar, description: 'Sync meetings and schedule automatically', connected: true, color: 'text-[#4285F4]' },
  { name: 'GitHub', icon: Code, description: 'Link action items to GitHub issues', connected: false, color: 'text-foreground' },
  { name: 'Chrome Extension', icon: Globe, description: 'Record meetings directly from your browser', connected: false, color: 'text-[#4285F4]' },
];

export const IntegrationsPage = () => {
  return (
    <PageTransition>
      <div className="p-8 max-w-4xl">
        <h1 className="text-2xl font-bold text-foreground">Integrations</h1>
        <p className="text-muted-foreground mt-1 mb-8">Connect IntelliMeet with your favorite productivity tools</p>
        
        <div className="grid gap-4">
          {integrations.map((int, idx) => (
            <motion.div
              key={int.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-card rounded-2xl border border-border shadow-sm p-6 flex items-center justify-between hover:shadow-md transition-all group hover-lift"
            >
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-muted/50 rounded-2xl flex items-center justify-center group-hover:bg-muted transition-colors">
                  <int.icon size={24} className={int.color} />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-lg">{int.name}</h3>
                  <p className="text-sm text-muted-foreground">{int.description}</p>
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-5 py-2 rounded-xl text-sm font-medium transition-all shadow-sm ${
                  int.connected
                    ? 'bg-muted text-muted-foreground hover:bg-muted/80'
                    : 'bg-primary text-primary-foreground hover:bg-primary/90'
                }`}
              >
                {int.connected ? 'Connected' : 'Connect'}
              </motion.button>
            </motion.div>
          ))}
          
          <div className="bg-muted/30 rounded-2xl border-2 border-dashed border-border p-8 text-center mt-4">
            <div className="w-12 h-12 bg-card rounded-full flex items-center justify-center mx-auto mb-4 border border-border shadow-sm">
              <Link2 size={24} className="text-muted-foreground" />
            </div>
            <h4 className="font-medium text-foreground">More coming soon</h4>
            <p className="text-sm text-muted-foreground mt-1">We're building more integrations. Need something specific? Let us know!</p>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};
