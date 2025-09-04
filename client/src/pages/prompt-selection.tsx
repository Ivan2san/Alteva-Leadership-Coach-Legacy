import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, PenTool } from "lucide-react";
import Header from "@/components/header";
import PromptCard from "@/components/prompt-card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { topicConfigurations } from "@/lib/topic-configurations";
import { useToast } from "@/hooks/use-toast";

interface PromptSelectionProps {
  params: { topic: string };
}

export default function PromptSelection({ params }: PromptSelectionProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showCustomPrompt, setShowCustomPrompt] = useState(false);
  const [customPromptText, setCustomPromptText] = useState("");

  const topic = params.topic;
  const config = topicConfigurations[topic];

  if (!config) {
    setLocation("/");
    return null;
  }

  const handleBackToMain = () => {
    setLocation("/");
  };

  const handlePromptClick = (promptText: string) => {
    // Store the prompt in session storage for the chat page
    sessionStorage.setItem('currentPrompt', promptText);
    setLocation(`/chat/${topic}`);
  };

  const handleCustomPromptSubmit = () => {
    const promptText = customPromptText.trim();
    
    if (promptText.length < 10) {
      toast({
        title: "Prompt too short",
        description: "Please write a more detailed prompt (at least 10 characters)",
        variant: "destructive"
      });
      return;
    }

    handlePromptClick(promptText);
  };

  const toggleCustomPrompt = () => {
    setShowCustomPrompt(!showCustomPrompt);
    if (showCustomPrompt) {
      setCustomPromptText("");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-md mx-auto px-4 py-6">
        <div className="space-y-6">
          <div className="flex items-center space-x-3 mb-6">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleBackToMain}
              data-testid="button-back-main"
            >
              <ArrowLeft className="text-muted-foreground" size={16} />
            </Button>
            <div>
              <h2 className="text-lg font-semibold text-foreground">{config.title}</h2>
              <p className="text-sm text-muted-foreground">Choose a prompt to get started</p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground">Suggested Prompts</h3>
            
            <div className="space-y-3">
              {config.prompts.map((prompt, index) => (
                <PromptCard
                  key={index}
                  prompt={prompt}
                  index={index}
                  onClick={handlePromptClick}
                />
              ))}
            </div>

            <div className="mt-6">
              <Button
                variant="secondary"
                className="w-full font-medium py-4 px-6 transition-all duration-200 button-hover"
                onClick={toggleCustomPrompt}
                data-testid="button-custom-prompt"
              >
                <PenTool className="mr-2" size={16} />
                {showCustomPrompt ? "Hide Custom Prompt" : "Write Your Own Prompt"}
              </Button>
            </div>

            {showCustomPrompt && (
              <div className="mt-4 space-y-3">
                <Textarea
                  placeholder="Describe what you'd like to work on in your leadership journey..."
                  className="resize-none focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                  rows={4}
                  value={customPromptText}
                  onChange={(e) => setCustomPromptText(e.target.value)}
                  data-testid="textarea-custom-prompt"
                />
                <div className="flex space-x-3">
                  <Button
                    className="flex-1 font-medium py-3 px-4 transition-all duration-200"
                    onClick={handleCustomPromptSubmit}
                    data-testid="button-submit-custom"
                  >
                    Start Conversation
                  </Button>
                  <Button
                    variant="ghost"
                    className="px-4 py-3 transition-colors"
                    onClick={() => setShowCustomPrompt(false)}
                    data-testid="button-cancel-custom"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
