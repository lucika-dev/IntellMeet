import { motion } from 'framer-motion';

interface RingStatProps {
  title: string;
  value: number;
  description: string;
}

export const RingStat = ({ title, value, description }: RingStatProps) => {
  const circumference = 2 * Math.PI * 42;
  const progress = circumference - (value / 100) * circumference;

  return (
    <motion.article
      className="glass-card flex h-full flex-col gap-6 p-5"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>

          <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">{value}</p>

          <p className="mt-1 text-xs text-muted-foreground">/100 score</p>
        </div>

        <div className="relative h-24 w-24 shrink-0">
          <svg className="-rotate-90" width="100%" height="100%" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="42"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-border/60"
            />

            <motion.circle
              cx="50"
              cy="50"
              r="42"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeLinecap="round"
              className="text-primary"
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: progress }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
              strokeDasharray={circumference}
            />
          </svg>
        </div>
      </div>

      <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
    </motion.article>
  );
};