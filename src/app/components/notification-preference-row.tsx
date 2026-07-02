import { Switch } from './ui/switch';

type NotificationPreferenceRowProps = {
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onCheckedChange: (checked: boolean) => void;
};

export function NotificationPreferenceRow({
  title,
  description,
  checked,
  disabled,
  onCheckedChange,
}: NotificationPreferenceRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-border last:border-b-0">
      <div className="min-w-0">
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} disabled={disabled} onCheckedChange={onCheckedChange} />
    </div>
  );
}
