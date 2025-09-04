import { Button } from "@/components/ui/button";
import { Menu, Users } from "lucide-react";

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
            <h1 className="text-lg font-semibold text-foreground">Leadership Coach</h1>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onMenuClick}
            data-testid="button-menu"
          >
            <Menu className="text-muted-foreground" size={16} />
          </Button>
        </div>
      </div>
    </header>
  );
}
