import { ChevronRight, Home } from "lucide-react";
import { Link } from "wouter";

interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400 mb-4">
      <Link href="/">
        <span className="flex items-center hover:text-gray-900 dark:hover:text-gray-200 cursor-pointer">
          <Home className="h-4 w-4 mr-1" />
          Home
        </span>
      </Link>
      
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          <ChevronRight className="h-4 w-4 mx-1" />
          {item.href && !item.current ? (
            <Link href={item.href}>
              <span className="hover:text-gray-900 dark:hover:text-gray-200 cursor-pointer">
                {item.label}
              </span>
            </Link>
          ) : (
            <span className={item.current ? "text-gray-900 dark:text-gray-100 font-medium" : ""}>
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}