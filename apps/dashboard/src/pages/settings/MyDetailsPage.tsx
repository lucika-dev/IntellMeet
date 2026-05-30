import { PageTransition } from '../../components/PageTransition';
import { useAuthStore } from '../../store/authStore';

export const MyDetailsPage = () => {
  const { user } = useAuthStore();
  return (
    <PageTransition>
      <div className="p-8 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground">My details</h1>
        <p className="text-muted-foreground mt-1 mb-6">Manage your personal information</p>
        
        <div className="bg-card rounded-2xl border border-border shadow-sm p-6 space-y-5 hover-lift transition">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-primary/20 bg-muted">
              {user?.avatarUrl ? (
                <img 
                  src={user.avatarUrl} 
                  alt={user.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-primary">
                  {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                </div>
              )}
            </div>
            <div>
              <p className="font-semibold text-foreground text-lg">{user?.name}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Full name</label>
            <input
              type="text"
              defaultValue={user?.name || ''}
              className="w-full px-4 py-2 border border-border bg-background text-foreground rounded-xl focus:ring-2 focus:ring-primary transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Email address</label>
            <input
              type="email"
              defaultValue={user?.email || ''}
              className="w-full px-4 py-2 border border-border bg-background text-foreground rounded-xl focus:ring-2 focus:ring-primary transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Job title</label>
            <input
              type="text"
              placeholder="e.g. Product Manager"
              className="w-full px-4 py-2 border border-border bg-background text-foreground rounded-xl focus:ring-2 focus:ring-primary transition"
            />
          </div>
          <button className="px-5 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition hover:scale-105">
            Save changes
          </button>
        </div>
      </div>
    </PageTransition>
  );
};
