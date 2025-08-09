import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Star, 
  MapPin, 
  Clock, 
  Calendar, 
  MessageCircle,
  Award,
  Briefcase,
  Users,
  ExternalLink
} from "lucide-react";

export default function MentorDetail() {
  const { id } = useParams();
  
  const { data: mentor, isLoading } = useQuery({
    queryKey: [`/api/mentors/${id}`],
    enabled: !!id,
  });

  const { data: reviews } = useQuery({
    queryKey: [`/api/mentors/${id}/reviews`],
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6 md:ml-64">
            <div className="max-w-4xl mx-auto space-y-6">
              <Skeleton className="h-8 w-64" />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <Skeleton className="h-96" />
                  <Skeleton className="h-48" />
                </div>
                <Skeleton className="h-96" />
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6 md:ml-64">
            <div className="max-w-4xl mx-auto">
              <Card className="text-center py-12" data-testid="card-mentor-not-found">
                <CardContent>
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Mentor Not Found</h3>
                  <p className="text-muted-foreground mb-4">
                    The mentor you're looking for doesn't exist or has been removed.
                  </p>
                  <Link href="/mentors">
                    <Button>Browse All Mentors</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const fullName = `${mentor.firstName} ${mentor.lastName}`;
  const initials = `${mentor.firstName?.charAt(0) || ''}${mentor.lastName?.charAt(0) || ''}`;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 md:ml-64">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Link href="/mentors" className="hover:text-foreground">Mentors</Link>
              <span>/</span>
              <span>{fullName}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Profile */}
              <div className="lg:col-span-2 space-y-6">
                <Card data-testid="card-mentor-profile">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-6">
                      <Avatar className="w-24 h-24">
                        <AvatarImage src={mentor.profileImageUrl} alt={fullName} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 space-y-3">
                        <div>
                          <h1 className="text-2xl font-bold text-foreground" data-testid="text-mentor-name">
                            {fullName}
                          </h1>
                          {mentor.profile?.headline && (
                            <p className="text-lg text-muted-foreground" data-testid="text-mentor-headline">
                              {mentor.profile.headline}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          {mentor.profile?.location && (
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              {mentor.profile.location}
                            </div>
                          )}
                          {mentor.profile?.yearsExperience && (
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {mentor.profile.yearsExperience} years experience
                            </div>
                          )}
                          {mentor.avgRating !== undefined && (
                            <div className="flex items-center">
                              <Star className="w-4 h-4 mr-1 text-yellow-400 fill-current" />
                              {mentor.avgRating.toFixed(1)} rating
                            </div>
                          )}
                        </div>

                        {mentor.profile?.industries && mentor.profile.industries.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {mentor.profile.industries.map((industry) => (
                              <Badge key={industry} variant="default">
                                {industry.charAt(0) + industry.slice(1).toLowerCase()}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* About */}
                <Card data-testid="card-mentor-about">
                  <CardHeader>
                    <CardTitle>About</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {mentor.profile?.bio ? (
                      <p className="text-muted-foreground leading-relaxed">
                        {mentor.profile.bio}
                      </p>
                    ) : (
                      <p className="text-muted-foreground italic">
                        No bio provided yet.
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Skills & Specialties */}
                {(mentor.profile?.skills && mentor.profile.skills.length > 0) || 
                 (mentor.profile?.specialties && mentor.profile.specialties.length > 0) ? (
                  <Card data-testid="card-mentor-skills">
                    <CardHeader>
                      <CardTitle>Skills & Specialties</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {mentor.profile.skills && mentor.profile.skills.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Technical Skills</h4>
                          <div className="flex flex-wrap gap-2">
                            {mentor.profile.skills.map((skill) => (
                              <Badge key={skill} variant="secondary">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {mentor.profile.specialties && mentor.profile.specialties.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Specialties</h4>
                          <div className="flex flex-wrap gap-2">
                            {mentor.profile.specialties.map((specialty) => (
                              <Badge key={specialty} variant="outline">
                                {specialty}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ) : null}

                {/* Reviews */}
                <Card data-testid="card-mentor-reviews">
                  <CardHeader>
                    <CardTitle>Reviews & Testimonials</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {reviews && reviews.length > 0 ? (
                      <div className="space-y-4">
                        {reviews.map((review: any) => (
                          <div key={review.id} className="border-b pb-4 last:border-b-0">
                            <div className="flex items-start space-x-3">
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={review.mentee.profileImageUrl} />
                                <AvatarFallback>
                                  {review.mentee.firstName?.charAt(0)}
                                  {review.mentee.lastName?.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium text-sm">
                                    {review.mentee.firstName} {review.mentee.lastName}
                                  </span>
                                  <div className="flex text-yellow-400">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`w-3 h-3 ${
                                          i < review.rating ? 'fill-current' : ''
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {review.comment}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(review.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No reviews yet.</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Action Card */}
                <Card data-testid="card-mentor-actions">
                  <CardHeader>
                    <CardTitle className="text-lg">Get Started</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Link href={`/book/${mentor.id}`}>
                      <Button className="w-full" size="lg" data-testid="button-book-session">
                        <Calendar className="mr-2 h-4 w-4" />
                        Book a Session
                      </Button>
                    </Link>
                    <Button variant="outline" className="w-full" data-testid="button-send-message">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Send Message
                    </Button>
                    {mentor.profile?.linkedin && (
                      <Button variant="ghost" className="w-full" asChild data-testid="button-linkedin">
                        <a href={mentor.profile.linkedin} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          LinkedIn Profile
                        </a>
                      </Button>
                    )}
                  </CardContent>
                </Card>

                {/* Stats */}
                <Card data-testid="card-mentor-stats">
                  <CardHeader>
                    <CardTitle className="text-lg">Mentor Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Average Rating</span>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="font-medium">
                          {mentor.avgRating ? mentor.avgRating.toFixed(1) : 'N/A'}
                        </span>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total Reviews</span>
                      <span className="font-medium">{reviews?.length || 0}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Response Rate</span>
                      <span className="font-medium">98%</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Response Time</span>
                      <span className="font-medium">&lt; 2 hours</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Languages */}
                {mentor.profile?.languages && mentor.profile.languages.length > 0 && (
                  <Card data-testid="card-mentor-languages">
                    <CardHeader>
                      <CardTitle className="text-lg">Languages</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {mentor.profile.languages.map((language) => (
                          <Badge key={language} variant="outline">
                            {language}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
