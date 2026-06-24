import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  hint: string;
  icon: LucideIcon;
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
}: StatCardProps) {
  return (
    <div className="border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {label}
          </p>

          <p className="mt-3 text-3xl font-semibold tracking-tight text-card-foreground">
            {value}
          </p>

          <p className="mt-2 text-sm text-muted-foreground">
            {hint}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center border border-border bg-background text-muted-foreground">
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}