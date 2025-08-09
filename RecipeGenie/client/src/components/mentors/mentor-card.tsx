import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Clock, MapPin } from "lucide-react";
import { Link } from "wouter";

interface MentorCardProps {
  mentor: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profileImageUrl?: string;
    profile: {
      headline?: string;
      bio?: string;
      location?: string;
      industries?: string[];
      skills?: string[];
      yearsExperience?: number;
      specialties?: string[];
    } | null;
    avgRating?: number;
  };
}

export function MentorCard({ mentor }: MentorCardProps) {
  const fullName = `${mentor.firstName} ${mentor.lastName}`;
  const initials = `${mentor.firstName?.charAt(0) || ''}${mentor.lastName?.charAt(0) || ''}`;
  
  return (
    <Card className="mentor-card-hover cursor-pointer" data-testid={`card-mentor-${mentor.id}`}>
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <Avatar className="w-20 h-20">
            <AvatarImage src={mentor.profileImageUrl} alt={fullName} />
            <AvatarFallback className="bg-primary text-primary-foreground text-lg">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          <div className="space-y-2">
            <h3 className="font-semibold text-lg text-foreground" data-testid={`text-mentor-name-${mentor.id}`}>
              {fullName}
            </h3>
            {mentor.profile?.headline && (
              <p className="text-sm text-muted-foreground" data-testid={`text-mentor-headline-${mentor.id}`}>
                {mentor.profile.headline}
              </p>
            )}
            {mentor.profile?.location && (
              <div className="flex items-center justify-center text-xs text-muted-foreground">
                <MapPin className="w-3 h-3 mr-1" />
                {mentor.profile.location}
              </div>
            )}
          </div>

          {mentor.profile?.yearsExperience && (
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="w-3 h-3 mr-1" />
              {mentor.profile.yearsExperience} years experience
            </div>
          )}

          {mentor.profile?.specialties && mentor.profile.specialties.length > 0 && (
            <div className="flex flex-wrap gap-1 justify-center">
              {mentor.profile.specialties.slice(0, 3).map((specialty, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {specialty}
                </Badge>
              ))}
              {mentor.profile.specialties.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{mentor.profile.specialties.length - 3} more
                </Badge>
              )}
            </div>
          )}

          {mentor.avgRating !== undefined && (
            <div className="flex items-center justify-center space-x-1">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(mentor.avgRating!) ? 'fill-current' : ''
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {mentor.avgRating.toFixed(1)}
              </span>
            </div>
          )}

          <div className="flex space-x-2 w-full">
            <Link href={`/mentors/${mentor.id}`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full" data-testid={`button-view-profile-${mentor.id}`}>
                View Profile
              </Button>
            </Link>
            <Link href={`/book/${mentor.id}`} className="flex-1">
              <Button size="sm" className="w-full" data-testid={`button-book-session-${mentor.id}`}>
                Book Session
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
