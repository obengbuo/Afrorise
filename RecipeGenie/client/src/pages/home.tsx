import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { 
  Calendar, 
  Users, 
  Briefcase, 
  MessageSquare, 
  TrendingUp,
  Clock,
  Star
} from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user } = useAuth();

  const { data: upcomingSessions } = useQuery({
    queryKey: ["/api/sessions"],
    queryParams: { role: user?.role === 'MENTOR' ? 'mentor' : 'mentee' },
  });

  const { data: mentorMatches } = useQuery({
    queryKey: ["/api/match"],
    enabled: user?.role === 'MENTEE',
  });

  const { data: recentProjects } = useQuery({
    queryKey: ["/api/projects"],
  });

  const getDashboardContent = () => {
    switch (user?.role) {
      case 'MENTOR':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card data-testid="card-mentor-sessions">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Upcoming Sessions</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{upcomingSessions?.length || 0}</div>
                  <p className="text-xs text-muted-foreground">This week</p>
                </CardContent>
              </Card>

              <Card data-testid="card-mentor-rating">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">4.8</div>
                  <p className="text-xs text-muted-foreground">From 24 reviews</p>
                </CardContent>
              </Card>

              <Card data-testid="card-mentor-mentees">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Mentees</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">+2 this month</p>
                </CardContent>
              </Card>

              <Card data-testid="card-mentor-earnings">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">156</div>
                  <p className="text-xs text-muted-foreground">All time</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card data-testid="card-upcoming-sessions">
                <CardHeader>
                  <CardTitle>Upcoming Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  {upcomingSessions?.slice(0, 5).map((session: any) => (
                    <div key={session.id} className="flex items-center space-x-4 py-3 border-b last:border-0">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="font-medium">{session.type}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(session.startsAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={session.status === 'CONFIRMED' ? 'default' : 'secondary'}>
                        {session.status}
                      </Badge>
                    </div>
                  )) || (
                    <p className="text-muted-foreground">No upcoming sessions</p>
                  )}
                </CardContent>
              </Card>

              <Card data-testid="card-mentor-requests">
                <CardHeader>
                  <CardTitle>Recent Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">No new requests</p>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'MENTEE':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card data-testid="card-mentee-sessions">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Sessions Booked</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{upcomingSessions?.length || 0}</div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>

              <Card data-testid="card-mentee-mentors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Mentors Connected</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-xs text-muted-foreground">Active connections</p>
                </CardContent>
              </Card>

              <Card data-testid="card-mentee-projects">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Projects Joined</CardTitle>
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2</div>
                  <p className="text-xs text-muted-foreground">Currently active</p>
                </CardContent>
              </Card>

              <Card data-testid="card-mentee-applications">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Gig Applications</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">5</div>
                  <p className="text-xs text-muted-foreground">Pending responses</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card data-testid="card-recommended-mentors">
                <CardHeader>
                  <CardTitle>Recommended Mentors</CardTitle>
                </CardHeader>
                <CardContent>
                  {mentorMatches?.slice(0, 3).map((match: any) => (
                    <div key={match.mentor.id} className="flex items-center space-x-4 py-3 border-b last:border-0">
                      <img 
                        src={match.mentor.profileImageUrl || '/default-avatar.png'} 
                        alt={match.mentor.firstName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{match.mentor.firstName} {match.mentor.lastName}</p>
                        <p className="text-sm text-muted-foreground">
                          Score: {match.score}
                        </p>
                      </div>
                      <Link href={`/mentors/${match.mentor.id}`}>
                        <Button size="sm" data-testid={`button-view-mentor-${match.mentor.id}`}>View</Button>
                      </Link>
                    </div>
                  )) || (
                    <p className="text-muted-foreground">Complete your profile to see recommendations</p>
                  )}
                </CardContent>
              </Card>

              <Card data-testid="card-my-projects">
                <CardHeader>
                  <CardTitle>My Projects</CardTitle>
                </CardHeader>
                <CardContent>
                  {recentProjects?.slice(0, 3).map((project: any) => (
                    <div key={project.id} className="flex items-center space-x-4 py-3 border-b last:border-0">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="font-medium">{project.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {project.memberCount} members
                        </p>
                      </div>
                      <Link href={`/projects/${project.id}`}>
                        <Button size="sm" data-testid={`button-view-project-${project.id}`}>View</Button>
                      </Link>
                    </div>
                  )) || (
                    <p className="text-muted-foreground">No active projects</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'ADMIN':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card data-testid="card-total-users">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2,847</div>
                  <p className="text-xs text-muted-foreground">+12% from last month</p>
                </CardContent>
              </Card>

              <Card data-testid="card-active-sessions">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">156</div>
                  <p className="text-xs text-muted-foreground">This week</p>
                </CardContent>
              </Card>

              <Card data-testid="card-pending-approvals">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">8</div>
                  <p className="text-xs text-muted-foreground">Mentor applications</p>
                </CardContent>
              </Card>

              <Card data-testid="card-platform-growth">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Platform Growth</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+24%</div>
                  <p className="text-xs text-muted-foreground">Monthly active users</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card data-testid="card-recent-activity">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Recent platform activity will appear here</p>
                </CardContent>
              </Card>

              <Card data-testid="card-system-status">
                <CardHeader>
                  <CardTitle>System Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Database</span>
                      <Badge variant="default">Healthy</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Email Service</span>
                      <Badge variant="default">Healthy</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Storage</span>
                      <Badge variant="default">Healthy</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return (
          <Card data-testid="card-complete-profile">
            <CardHeader>
              <CardTitle>Welcome to Afrorise!</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Complete your profile to get started and unlock all platform features.</p>
              <Link href="/profile">
                <Button data-testid="button-complete-profile">Complete Profile</Button>
              </Link>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground" data-testid="text-welcome">
                Welcome back, {user?.firstName || 'User'}!
              </h1>
              <p className="text-muted-foreground">
                Here's what's happening with your career journey today.
              </p>
            </div>

            {getDashboardContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
