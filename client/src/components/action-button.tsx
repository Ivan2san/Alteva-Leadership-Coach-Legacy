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
} from "lucide-react";
import type { LucideIcon } from "lucide-react"; // ✅ type-only import

interface ActionButtonProps {
  topic: string;
  onClick: (topic: string) => void;
}

const iconComponents: Record<string, LucideIcon> = {
  "fa-user-chart": User,
  "fa-traffic-light": Activity,
  "fa-target": Target,
  "fa-chart-pie": PieChart,
  "fa-heart": Heart,
  "fa-th": Grid3X3,
  "fa-comments": MessageCircle,
  "fa-calendar-check": CheckCircle,
};

const descriptions: Record<string, string> = {
  "growth-profile": "Assess strengths & areas",
  "red-green-zones": "Identify key behaviors",
  "big-practice": "Focus on biggest impact",
  "360-report": "Interpret feedback data",
  "growth-values": "Align actions & values",
  "growth-matrix": "Integrate development",
  "oora-conversation": "Structure conversations",
  "daily-checkin": "Reflect on progress",
};

export default function ActionButton({ topic, onClick }: ActionButtonProps) {
  const config = topicConfigurations[topic];
  if (!config) return null;

  const IconComponent = iconComponents[config.icon] || User;
  const description = descriptions[topic] || "Leadership development";

  return (
    <Button
      variant="outline"
      onClick={() => onClick(topic)}
      data-testid={`button-action-${topic}`}
      aria-label={config.title}
      className={[
        // container
        "group relative w-full min-h-[168px] h-auto rounded-2xl p-5 text-left",
        // solid card surface with decent contrast
        "bg-white/95 dark:bg-slate-900/95",
        // clearer border and subtle elevation
        "border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md",
        // hover/active feedback
        "transition-all duration-300 ease-out hover:-translate-y-0.5",
        // focus visibility
        "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none",
      ].join(" ")}
    >
      <div className="w-full flex flex-col items-start space-y-4">
        {/* Icon */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center
                     bg-gradient-to-br from-primary/15 to-primary/10
                     group-hover:from-primary/25 group-hover:to-primary/15
                     transition-all duration-300"
        >
          <IconComponent className="w-6 h-6 text-primary group-hover:scale-110 transition-transform duration-300" />
        </div>

        {/* Text block */}
        <div className="flex flex-col items-start space-y-2 w-full">
          <h3
            className="font-semibold text-base leading-tight tracking-wide
                       text-slate-900 dark:text-slate-100
                       group-hover:text-primary transition-colors duration-200"
          >
            {config.title}
          </h3>
          <p
            className="text-sm leading-snug
                       text-slate-600 dark:text-slate-300
                       group-hover:text-slate-700 dark:group-hover:text-slate-200
                       transition-colors duration-200"
          >
            {description}
          </p>
        </div>
      </div>

      {/* subtle hover sweep (no accent token) */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl
                   bg-gradient-to-r from-transparent via-primary/0 to-transparent
                   group-hover:from-primary/5 group-hover:to-primary/10
                   transition-all duration-500"
      />
    </Button>
  );
}
