import { Button } from "@/components/ui/button";
import { Menu, Users, Database, MessageSquare, BarChart3, FileText } from "lucide-react";
import { Link } from "wouter";

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="bg-card shadow-sm border-b border-border sticky top-0 z-50">
      <div className="max-w-md mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
              <Users className="text-primary-foreground text-sm" size={16} />
            </div>
            <Link href="/">
              <h1 className="text-lg font-semibold text-foreground hover:text-primary cursor-pointer">Leadership Coach</h1>
            </Link>
          </div>
          <div className="flex items-center space-x-1">
            <Link href="/">
              <Button 
                variant="ghost" 
                className="flex flex-col items-center px-2 py-1 h-auto"
                data-testid="home-link"
              >
                <Users className="text-muted-foreground" size={16} />
                <span className="text-xs mt-0.5">Home</span>
              </Button>
            </Link>
            <Link href="/prompt-library">
              <Button 
                variant="ghost" 
                className="flex flex-col items-center px-2 py-1 h-auto"
                data-testid="prompt-library-link"
              >
                <FileText className="text-muted-foreground" size={16} />
                <span className="text-xs mt-0.5">Prompts</span>
              </Button>
            </Link>
            <Link href="/analytics">
              <Button 
                variant="ghost" 
                className="flex flex-col items-center px-2 py-1 h-auto"
                data-testid="analytics-link"
              >
                <BarChart3 className="text-muted-foreground" size={16} />
                <span className="text-xs mt-0.5">Analytics</span>
              </Button>
            </Link>
            <Link href="/conversations">
              <Button 
                variant="ghost" 
                className="flex flex-col items-center px-2 py-1 h-auto"
                data-testid="conversations-link"
              >
                <MessageSquare className="text-muted-foreground" size={16} />
                <span className="text-xs mt-0.5">Chats</span>
              </Button>
            </Link>
            <Link href="/knowledge-base">
              <Button 
                variant="ghost" 
                className="flex flex-col items-center px-2 py-1 h-auto"
                data-testid="knowledge-base-link"
              >
                <Database className="text-muted-foreground" size={16} />
                <span className="text-xs mt-0.5">Knowledge</span>
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              className="flex flex-col items-center px-2 py-1 h-auto"
              onClick={onMenuClick}
              data-testid="button-menu"
            >
              <Menu className="text-muted-foreground" size={16} />
              <span className="text-xs mt-0.5">Menu</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
