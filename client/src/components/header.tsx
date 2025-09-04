import { Button } from "@/components/ui/button";
import { Menu, Users, Database, MessageSquare, BarChart3, FileText, Home, LogOut, Settings, BookOpen, ClipboardList } from "lucide-react";
import { Link } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { user, logout, isAdmin } = useAuth();

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
          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="flex flex-col items-center px-2 py-1 h-auto"
                  data-testid="button-menu"
                >
                  <Menu className="text-muted-foreground" size={16} />
                  <span className="text-xs mt-0.5">Menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/" className="flex items-center w-full">
                    <Home className="mr-2 h-4 w-4" />
                    <span>Home</span>
                  </Link>
                </DropdownMenuItem>
                
                {/* Show all menu items for admin */}
                {isAdmin ? (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/prompt-library" className="flex items-center w-full">
                        <FileText className="mr-2 h-4 w-4" />
                        <span>Prompts</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/analytics" className="flex items-center w-full">
                        <BarChart3 className="mr-2 h-4 w-4" />
                        <span>Analytics</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/conversations" className="flex items-center w-full">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        <span>Chats</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/knowledge-base" className="flex items-center w-full">
                        <Database className="mr-2 h-4 w-4" />
                        <span>Knowledge</span>
                      </Link>
                    </DropdownMenuItem>
                  </>
                ) : (
                  /* Show only Chats for regular users */
                  <DropdownMenuItem asChild>
                    <Link href="/conversations" className="flex items-center w-full">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      <span>Chats</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                
                {/* Guide, LGP360 Report, and Settings available for all users */}
                <DropdownMenuItem asChild>
                  <Link href="/lgp360" className="flex items-center w-full">
                    <ClipboardList className="mr-2 h-4 w-4" />
                    <span>LGP360 Report</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/guide" className="flex items-center w-full">
                    <BookOpen className="mr-2 h-4 w-4" />
                    <span>Guide</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center w-full">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                {user && (
                  <>
                    <div className="px-2 py-1.5 text-sm text-gray-600 dark:text-gray-400">
                      {user.fullName} {isAdmin && "(Admin)"}
                    </div>
                    <DropdownMenuItem onClick={logout} className="flex items-center w-full text-red-600 focus:text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
