import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DollarSign,
  MapPin,
  Calendar,
  Users,
  Clock,
  Briefcase
} from "lucide-react";
import { Link } from "wouter";

interface GigCardProps {
  gig: {
    id: string;
    title: string;
    description: string;
    budget?: number;
    currency: string;
    tags?: string[];
    isRemote: boolean;
    location?: string;
    status: 'OPEN' | 'CLOSED';
    createdAt: string;
    creator: {
      id: string;
      firstName: string;
      lastName: string;
      profileImageUrl?: string;
    };
    applicationCount: number;
  };
}

export function GigCard({ gig }: GigCardProps) {
  const creatorName = `${gig.creator.firstName} ${gig.creator.lastName}`;
  const initials = `${gig.creator.firstName?.charAt(0) || ''}${gig.creator.lastName?.charAt(0) || ''}`;
  
  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" data-testid={`card-gig-${gig.id}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg line-clamp-2 flex-1 pr-2">
            <Link href={`/gigs/${gig.id}`} className="hover:underline">
              {gig.title}
            </Link>
          </CardTitle>
          <Badge variant={gig.status === 'OPEN' ? 'default' : 'secondary'} className="shrink-0">
            {gig.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-muted-foreground text-sm line-clamp-3">
          {gig.description}
        </p>
        
        {/* Budget and Location */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            {gig.budget && (
              <div className="flex items-center text-foreground font-medium">
                <DollarSign className="w-4 h-4 mr-1" />
                {gig.budget.toLocaleString()} {gig.currency}
              </div>
            )}
            <div className="flex items-center text-muted-foreground">
              <MapPin className="w-3 h-3 mr-1" />
              {gig.isRemote ? 'Remote' : gig.location || 'Location TBD'}
            </div>
          </div>
        </div>
        
        {/* Tags */}
        {gig.tags && gig.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {gig.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {gig.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{gig.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}
        
        {/* Creator and Stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Avatar className="w-6 h-6">
              <AvatarImage src={gig.creator.profileImageUrl} alt={creatorName} />
              <AvatarFallback className="text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">by {creatorName}</span>
          </div>
          
          <div className="flex items-center space-x-3 text-xs text-muted-foreground">
            <div className="flex items-center">
              <Users className="w-3 h-3 mr-1" />
              {gig.applicationCount} applications
            </div>
            <div className="flex items-center">
              <Calendar className="w-3 h-3 mr-1" />
              {new Date(gig.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2">
          <Link href={`/gigs/${gig.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full" data-testid={`button-view-gig-${gig.id}`}>
              View Details
            </Button>
          </Link>
          {gig.status === 'OPEN' && (
            <Link href={`/gigs/${gig.id}`} className="flex-1">
              <Button size="sm" className="w-full" data-testid={`button-apply-gig-${gig.id}`}>
                <Briefcase className="w-3 h-3 mr-1" />
                Apply Now
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
