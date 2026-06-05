import { type LucideIcon } from 'lucide-react';

interface AdminStatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
}

export function AdminStatCard({ label, value, icon: Icon, hint }: AdminStatCardProps) {
  return (
    <div className="bg-card/50 backdrop-blur-md rounded-lg border border-border/30 p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground">{label}</span>
        <Icon className="w-4 h-4 text-muted-foreground" />
      </div>
      <p className="text-2xl font-semibold">{value}</p>
      {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
    </div>
  );
}
