import { useState } from 'react';
import { PageTransition } from '../../components/PageTransition';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export const PasswordPage = () => {
  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPwd !== confirm) {
      setStatus({ type: 'error', message: 'New passwords do not match' });
      return;
    }
    // Logic for updating password would go here
    setStatus({ type: 'success', message: 'Password updated successfully' });
    setTimeout(() => setStatus(null), 3000);
  };

  return (
    <PageTransition>
      <div className="p-8 max-w-4xl">
        <h1 className="text-2xl font-bold text-foreground">Password & Security</h1>
        <p className="text-muted-foreground mt-1 mb-8">Manage your account password and security settings</p>
        
        <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border shadow-sm p-8 space-y-6">
          <div className="grid grid-cols-1 gap-6 max-w-md">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Current password</label>
              <input
                type="password"
                value={oldPwd}
                onChange={(e) => setOldPwd(e.target.value)}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition"
                required
              />
            </div>
            
            <div className="space-y-2 pt-2">
              <label className="text-sm font-medium text-foreground">New password</label>
              <input
                type="password"
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition"
                required
              />
              <p className="text-xs text-muted-foreground">Minimum 8 characters with numbers and symbols.</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Confirm new password</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition"
                required
              />
            </div>
          </div>

          <div className="pt-4 flex items-center gap-4">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit" 
              className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-all shadow-md hover:shadow-lg"
            >
              Update password
            </motion.button>
            
            <AnimatePresence>
              {status && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className={`flex items-center gap-2 text-sm font-medium ${
                    status.type === 'success' ? 'text-emerald-500' : 'text-destructive'
                  }`}
                >
                  {status.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  {status.message}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </form>

        <div className="mt-8 bg-muted/30 rounded-2xl p-6 border border-border/50">
          <h3 className="font-semibold text-foreground">Two-Factor Authentication</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">Add an extra layer of security to your account by enabling 2FA.</p>
          <button className="text-primary font-medium hover:underline transition-all text-sm">
            Enable 2FA (Coming Soon)
          </button>
        </div>
      </div>
    </PageTransition>
  );
};
