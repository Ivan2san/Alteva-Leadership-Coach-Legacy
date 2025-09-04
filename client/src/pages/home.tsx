import { useLocation } from "wouter";
import Header from "@/components/header";
import ActionButton from "@/components/action-button";
import { topicConfigurations } from "@/lib/topic-configurations";

export default function Home() {
  const [, setLocation] = useLocation();

  const handleTopicClick = (topic: string) => {
    setLocation(`/prompts/${topic}`);
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

          <div className="grid grid-cols-2 gap-5">
            {topics.map((topic) => (
              <ActionButton
                key={topic}
                topic={topic}
                onClick={handleTopicClick}
              />
            ))}
          </div>

          <div className="mt-10 text-center">
            <p className="text-xs text-muted-foreground/70">Powered by AI coaching expertise</p>
          </div>
        </div>
      </main>
    </div>
  );
}
