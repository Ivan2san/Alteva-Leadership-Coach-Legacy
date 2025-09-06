import { useLocation } from "wouter";
import { useState } from "react";
import Header from "@/components/header";
import { TileButton } from "@/components/TileButton";
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

const iconComponents: Record<string, React.ReactNode> = {
  "fa-user-chart": <User />,
  "fa-traffic-light": <Activity />,
  "fa-target": <Target />,
  "fa-chart-pie": <PieChart />,
  "fa-heart": <Heart />,
  "fa-th": <Grid3X3 />,
  "fa-comments": <MessageCircle />,
  "fa-calendar-check": <CheckCircle />,
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

export default function Home() {
  const [, setLocation] = useLocation();
  const [selected, setSelected] = useState<string | null>(null);

  const handleTopicClick = (topic: string) => {
    setSelected(topic);
    if (navigator.vibrate) navigator.vibrate(6);
    // Navigate immediately for now, can be changed to require Continue button
    setLocation(`/prompts/${topic}`);
  };

  const handleContinue = () => {
    if (selected) {
      setLocation(`/prompts/${selected}`);
    }
  };

  const topics = Object.keys(topicConfigurations);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-md mx-auto px-4 py-6">
        <div className="space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Your Leadership Journey</h2>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto">Choose an area to focus on for your professional growth and development</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {topics.map((topic) => {
              const config = topicConfigurations[topic];
              const icon = iconComponents[config.icon] || <User />;
              const description = descriptions[topic] || "Leadership development";
              
              return (
                <TileButton
                  key={topic}
                  title={config.title}
                  subtitle={description}
                  icon={icon}
                  selected={selected === topic}
                  onClick={() => handleTopicClick(topic)}
                />
              );
            })}
          </div>

          {/* Primary CTA appears when a selection exists */}
          {selected && (
            <div className="mt-6">
              <button
                className="w-full rounded-xl bg-brand-600 px-5 py-3 font-semibold text-white shadow hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 transition-colors duration-150"
                onClick={handleContinue}
              >
                Continue with {topicConfigurations[selected]?.title}
              </button>
            </div>
          )}

          <div className="mt-10 text-center">
            <p className="text-xs text-muted-foreground/70">Powered by AI coaching expertise</p>
          </div>
        </div>
      </main>
    </div>
  );
}
