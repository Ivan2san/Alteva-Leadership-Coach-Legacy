import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface BackButtonProps {
  href?: string;
  label?: string;
  onClick?: () => void;
}

export function BackButton({ href = "/", label = "Back to Main Menu", onClick }: BackButtonProps) {
  if (onClick) {
    return (
      <Button 
        variant="ghost" 
        onClick={onClick}
        className="mb-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
        data-testid="button-back"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        {label}
      </Button>
    );
  }

  return (
    <Link href={href}>
      <Button 
        variant="ghost" 
        className="mb-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
        data-testid="button-back"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        {label}
      </Button>
    </Link>
  );
}