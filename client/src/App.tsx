import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthWrapper } from "@/components/AuthWrapper";
import Home from "@/pages/home";
import PromptSelection from "@/pages/prompt-selection";
import Chat from "@/pages/chat";
import KnowledgeBase from "@/pages/knowledge-base";
import Conversations from "@/pages/conversations";
import Analytics from "@/pages/analytics";
import PromptLibrary from "@/pages/prompt-library";
import Settings from "@/pages/settings";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/prompts/:topic" component={PromptSelection} />
      <Route path="/chat/:topic" component={Chat} />
      <Route path="/knowledge-base" component={KnowledgeBase} />
      <Route path="/conversations" component={Conversations} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/prompt-library" component={PromptLibrary} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthWrapper>
          <div className="min-h-screen bg-background">
            <Toaster />
            <Router />
          </div>
        </AuthWrapper>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
