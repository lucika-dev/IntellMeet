import { PageTransition } from '../../components/PageTransition';

export const BillingPage = () => {
  return (
    <PageTransition>
      <div className="p-8 max-w-4xl">
        <h1 className="text-2xl font-bold text-foreground">Billing</h1>
        <p className="text-muted-foreground mt-1 mb-8">Manage your subscription and payment methods</p>
        
        <div className="space-y-6">
          <div className="bg-card rounded-2xl border border-border shadow-sm p-8 group hover:shadow-md transition-all duration-300">
            <div className="flex justify-between items-start pb-6 border-b border-border/50 mb-6">
              <div>
                <h3 className="font-semibold text-lg text-foreground">Current plan</h3>
                <p className="text-muted-foreground mt-0.5">Enterprise Pro — Unlimited features</p>
              </div>
              <span className="bg-emerald-500/10 text-emerald-500 px-4 py-1.5 rounded-full text-sm font-medium border border-emerald-500/20">
                Active
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="font-semibold text-foreground">Next billing date</h3>
                <p className="text-muted-foreground mt-0.5 font-mono">May 15, 2026</p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Monthly amount</h3>
                <p className="text-muted-foreground mt-0.5 font-mono">$199.00 USD</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              <button className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-medium hover:bg-primary/90 transition shadow-sm hover:shadow-md hover-lift">
                Change plan
              </button>
              <button className="border border-border text-foreground px-6 py-2.5 rounded-xl font-medium hover:bg-muted/50 transition hover-lift">
                Manage payment methods
              </button>
            </div>
          </div>

          <div className="bg-destructive/5 border border-destructive/10 rounded-2xl p-6">
            <h3 className="font-semibold text-destructive">Danger Zone</h3>
            <p className="text-muted-foreground text-sm mt-1 mb-4">Once you cancel your subscription, you will lose access to premium features at the end of your billing cycle.</p>
            <button className="text-destructive font-medium hover:underline text-sm transition-all">
              Cancel subscription
            </button>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};
