import { Button } from "@/components/ui/button";
import { topicConfigurations } from "@/lib/topic-configurations";

interface ActionButtonProps {
  topic: string;
  onClick: (topic: string) => void;
}

const iconComponents: Record<string, string> = {
  'fa-user-chart': '📊',
  'fa-traffic-light': '🚦',
  'fa-target': '🎯',
  'fa-chart-pie': '📈',
  'fa-heart': '❤️',
  'fa-th': '⚏',
  'fa-comments': '💬',
  'fa-calendar-check': '✅'
};

export default function ActionButton({ topic, onClick }: ActionButtonProps) {
  const config = topicConfigurations[topic];
  
  if (!config) return null;

  const icon = iconComponents[config.icon] || '📋';

  return (
    <Button
      variant="outline"
      className="bg-card hover:bg-accent/5 border border-border rounded-lg p-4 text-left transition-all duration-200 button-hover min-h-[120px] flex flex-col justify-between h-auto"
      onClick={() => onClick(topic)}
      data-testid={`button-action-${topic}`}
    >
      <div className="w-full">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
          <span className="text-lg">{icon}</span>
        </div>
        <h3 className="font-medium text-foreground text-sm leading-tight text-left">
          {config.title}
        </h3>
      </div>
    </Button>
  );
}
