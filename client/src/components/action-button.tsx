import { Button } from "@/components/ui/button";
import { topicConfigurations } from "@/lib/topic-configurations";
import { 
  User, 
  Activity, 
  Target, 
  PieChart, 
  Heart, 
  Grid3X3, 
  MessageCircle, 
  CheckCircle,
  LucideIcon 
} from "lucide-react";

interface ActionButtonProps {
  topic: string;
  onClick: (topic: string) => void;
}

const iconComponents: Record<string, LucideIcon> = {
  'fa-user-chart': User,
  'fa-traffic-light': Activity,
  'fa-target': Target,
  'fa-chart-pie': PieChart,
  'fa-heart': Heart,
  'fa-th': Grid3X3,
  'fa-comments': MessageCircle,
  'fa-calendar-check': CheckCircle
};

const descriptions: Record<string, string> = {
  'growth-profile': 'Assess strengths & areas',
  'red-green-zones': 'Identify key behaviors',
  'big-practice': 'Focus on biggest impact',
  '360-report': 'Interpret feedback data',
  'growth-values': 'Align actions & values',
  'growth-matrix': 'Integrate development',
  'oora-conversation': 'Structure conversations',
  'daily-checkin': 'Reflect on progress'
};

export default function ActionButton({ topic, onClick }: ActionButtonProps) {
  const config = topicConfigurations[topic];
  
  if (!config) return null;

  const IconComponent = iconComponents[config.icon] || User;
  const description = descriptions[topic] || 'Leadership development';

  return (
    <Button
      variant="outline"
      className="group relative bg-gradient-to-br from-card to-card/50 hover:from-primary/5 hover:to-accent/10 border border-border/50 hover:border-primary/20 rounded-xl p-4 text-left transition-all duration-300 ease-in-out min-h-[160px] flex flex-col justify-between h-auto shadow-sm hover:shadow-md hover:-translate-y-0.5"
      onClick={() => onClick(topic)}
      data-testid={`button-action-${topic}`}
    >
      <div className="w-full space-y-4">
        <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/5 group-hover:from-primary/15 group-hover:to-primary/10 rounded-xl flex items-center justify-center transition-all duration-300">
          <IconComponent className="text-primary w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
        </div>
        <div className="space-y-2">
          <h3 className="font-medium text-foreground text-xs leading-snug tracking-wide line-clamp-2 group-hover:text-primary transition-colors duration-300">
            {config.title}
          </h3>
          <p className="font-normal text-foreground/70 text-xs leading-normal tracking-normal line-clamp-2 group-hover:text-foreground/80 transition-colors duration-300">
            {description}
          </p>
        </div>
      </div>
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/0 via-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:via-transparent group-hover:to-accent/5 transition-all duration-500 pointer-events-none" />
    </Button>
  );
}
