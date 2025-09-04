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
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold text-foreground">Your Leadership Journey</h2>
            <p className="text-muted-foreground">Choose an area to focus on for your growth</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {topics.map((topic) => (
              <ActionButton
                key={topic}
                topic={topic}
                onClick={handleTopicClick}
              />
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-xs text-muted-foreground">Powered by AI coaching expertise</p>
          </div>
        </div>
      </main>
    </div>
  );
}
