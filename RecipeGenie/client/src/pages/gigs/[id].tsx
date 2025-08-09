import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { 
  ArrowLeft,
  DollarSign,
  MapPin,
  Calendar,
  User,
  MessageSquare,
  Briefcase,
  Clock,
  CheckCircle
} from "lucide-react";

export default function GigDetail() {
  const { id } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showApplicationDialog, setShowApplicationDialog] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState('');

  const { data: gig, isLoading } = useQuery({
    queryKey: [`/api/gigs/${id}`],
    enabled: !!id,
  });

  const applyToGigMutation = useMutation({
    mutationFn: async (applicationData: any) => {
      return apiRequest('POST', `/api/gigs/${id}/apply`, applicationData);
    },
    onSuccess: () => {
      toast({
        title: "Application Submitted!",
        description: "Your application has been sent to the gig creator.",
      });
      setShowApplicationDialog(false);
      setApplicationMessage('');
      queryClient.invalidateQueries({ queryKey: [`/api/gigs/${id}`] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Application Failed",
        description: "There was an error submitting your application. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleApplyToGig = () => {
    if (!applicationMessage.trim()) {
      toast({
        title: "Missing Message",
        description: "Please provide a message with your application.",
        variant: "destructive",
      });
      return;
    }

    applyToGigMutation.mutate({
      message: applicationMessage.trim(),
    });
  };

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
                <div className="lg:col-span-2">
                  <Skeleton className="h-96" />
                </div>
                <Skeleton className="h-96" />
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!gig) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6 md:ml-64">
            <div className="max-w-4xl mx-auto">
              <Card className="text-center py-12" data-testid="card-gig-not-found">
                <CardContent>
                  <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Gig Not Found</h3>
                  <p className="text-muted-foreground mb-4">
                    The opportunity you're looking for doesn't exist or has been removed.
                  </p>
                  <Link href="/gigs">
                    <Button>Browse All Opportunities</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 md:ml-64">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Link href="/gigs" className="hover:text-foreground">
                <Button variant="ghost" size="sm" data-testid="button-back">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Opportunities
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Gig Header */}
                <Card data-testid="card-gig-header">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <h1 className="text-2xl font-bold text-foreground" data-testid="text-gig-title">
                            {gig.title}
                          </h1>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              Posted {new Date(gig.createdAt).toLocaleDateString()}
                            </div>
                            <div className="flex items-center">
                              <User className="w-4 h-4 mr-1" />
                              {gig.applicationCount} application{gig.applicationCount !== 1 ? 's' : ''}
                            </div>
                          </div>
                        </div>
                        <Badge variant={gig.status === 'OPEN' ? 'default' : 'secondary'}>
                          {gig.status === 'OPEN' ? 'Open' : 'Closed'}
                        </Badge>
                      </div>

                      <div className="flex items-center space-x-6">
                        {gig.budget && (
                          <div className="flex items-center text-lg font-semibold text-foreground">
                            <DollarSign className="w-5 h-5 mr-1" />
                            {gig.budget.toLocaleString()} {gig.currency}
                          </div>
                        )}
                        <div className="flex items-center text-muted-foreground">
                          <MapPin className="w-4 h-4 mr-1" />
                          {gig.isRemote ? 'Remote' : gig.location || 'Location not specified'}
                        </div>
                      </div>

                      {gig.tags && gig.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {gig.tags.map((tag: string) => (
                            <Badge key={tag} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Description */}
                <Card data-testid="card-gig-description">
                  <CardHeader>
                    <CardTitle>Job Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none">
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {gig.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Applications */}
                {gig.applications && gig.applications.length > 0 && (
                  <Card data-testid="card-gig-applications">
                    <CardHeader>
                      <CardTitle>Applications ({gig.applications.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {gig.applications.map((application: any) => (
                          <div key={application.id} className="border rounded-lg p-4">
                            <div className="flex items-start space-x-3">
                              <Avatar className="w-10 h-10">
                                <AvatarImage src={application.applicant.profileImageUrl} />
                                <AvatarFallback>
                                  {application.applicant.firstName?.charAt(0)}
                                  {application.applicant.lastName?.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium">
                                    {application.applicant.firstName} {application.applicant.lastName}
                                  </span>
                                  <span className="text-sm text-muted-foreground">
                                    applied on {new Date(application.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {application.message}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Creator Info */}
                <Card data-testid="card-gig-creator">
                  <CardHeader>
                    <CardTitle>Posted by</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={gig.creator.profileImageUrl} />
                        <AvatarFallback>
                          {gig.creator.firstName?.charAt(0)}
                          {gig.creator.lastName?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {gig.creator.firstName} {gig.creator.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {gig.creator.email}
                        </p>
                      </div>
                    </div>
                    
                    <Separator className="my-4" />
                    
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full" data-testid="button-contact-creator">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Contact Creator
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Apply Section */}
                {gig.status === 'OPEN' && (
                  <Card data-testid="card-apply-section">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Briefcase className="mr-2 h-5 w-5" />
                        Apply for this Gig
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-sm text-muted-foreground">
                        <div className="flex items-center mb-2">
                          <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                          Free to apply
                        </div>
                        <div className="flex items-center mb-2">
                          <Clock className="w-4 h-4 mr-2" />
                          Quick response expected
                        </div>
                      </div>

                      <Dialog open={showApplicationDialog} onOpenChange={setShowApplicationDialog}>
                        <DialogTrigger asChild>
                          <Button className="w-full" size="lg" data-testid="button-apply">
                            Apply Now
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                          <DialogHeader>
                            <DialogTitle>Apply for "{gig.title}"</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">
                                Cover Message *
                              </label>
                              <Textarea
                                placeholder="Tell the client why you're the perfect fit for this job..."
                                value={applicationMessage}
                                onChange={(e) => setApplicationMessage(e.target.value)}
                                className="min-h-[120px]"
                                data-testid="textarea-application-message"
                              />
                            </div>
                            
                            <div className="bg-muted p-4 rounded-lg">
                              <div className="text-sm space-y-1">
                                <p><strong>Budget:</strong> {gig.budget ? `${gig.budget.toLocaleString()} ${gig.currency}` : 'Not specified'}</p>
                                <p><strong>Type:</strong> {gig.isRemote ? 'Remote' : `On-site (${gig.location})`}</p>
                                <p><strong>Applications:</strong> {gig.applicationCount} so far</p>
                              </div>
                            </div>
                            
                            <div className="flex space-x-2 pt-4">
                              <Button
                                onClick={handleApplyToGig}
                                disabled={applyToGigMutation.isPending}
                                className="flex-1"
                                data-testid="button-submit-application"
                              >
                                {applyToGigMutation.isPending ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                    Submitting...
                                  </>
                                ) : (
                                  'Submit Application'
                                )}
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => setShowApplicationDialog(false)}
                                data-testid="button-cancel-application"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </CardContent>
                  </Card>
                )}

                {/* Gig Stats */}
                <Card data-testid="card-gig-stats">
                  <CardHeader>
                    <CardTitle>Gig Statistics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Applications</span>
                      <span className="font-medium">{gig.applicationCount}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Posted</span>
                      <span className="font-medium">
                        {new Date(gig.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Status</span>
                      <Badge variant={gig.status === 'OPEN' ? 'default' : 'secondary'}>
                        {gig.status}
                      </Badge>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Work Type</span>
                      <span className="font-medium">
                        {gig.isRemote ? 'Remote' : 'On-site'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
