import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Users, 
  Calendar, 
  Briefcase, 
  MessageSquare, 
  Settings, 
  Shield,
  Search,
  User
} from "lucide-react";
import { Link, useLocation } from "wouter";

const navigationItems = [
  { name: 'Dashboard', href: '/', icon: Home, roles: ['ADMIN', 'MENTOR', 'MENTEE'] },
  { name: 'Find Mentors', href: '/mentors', icon: Users, roles: ['MENTEE'] },
  { name: 'My Mentees', href: '/mentees', icon: Users, roles: ['MENTOR'] },
  { name: 'Sessions', href: '/sessions', icon: Calendar, roles: ['MENTOR', 'MENTEE'] },
  { name: 'Projects', href: '/projects', icon: Briefcase, roles: ['ADMIN', 'MENTOR', 'MENTEE'] },
  { name: 'Opportunities', href: '/gigs', icon: Search, roles: ['ADMIN', 'MENTOR', 'MENTEE'] },
  { name: 'Messages', href: '/messages', icon: MessageSquare, roles: ['ADMIN', 'MENTOR', 'MENTEE'] },
  { name: 'Profile', href: '/profile', icon: User, roles: ['ADMIN', 'MENTOR', 'MENTEE'] },
  { name: 'Admin', href: '/admin', icon: Shield, roles: ['ADMIN'] },
];

export function Sidebar() {
  const { user } = useAuth();
  const [location] = useLocation();

  const userRole = user?.role || 'MENTEE';
  const filteredItems = navigationItems.filter(item => 
    item.roles.includes(userRole)
  );

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:pt-16">
      <div className="flex flex-col flex-grow bg-white border-r border-border pt-6 overflow-y-auto">
        <nav className="flex-1 px-4 space-y-2">
          {filteredItems.map((item) => {
            const isActive = location === item.href || 
              (item.href !== '/' && location.startsWith(item.href));
            
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    isActive && "bg-primary text-primary-foreground"
                  )}
                  data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Button>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
