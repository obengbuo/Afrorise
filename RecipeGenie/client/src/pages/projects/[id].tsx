import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { KanbanBoard } from "@/components/projects/kanban-board";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { 
  ArrowLeft,
  Users,
  Calendar,
  ExternalLink,
  Github,
  UserPlus,
  Settings
} from "lucide-react";

export default function ProjectDetail() {
  const { id } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: project, isLoading } = useQuery({
    queryKey: [`/api/projects/${id}`],
    enabled: !!id,
  });

  const { data: tasks } = useQuery({
    queryKey: [`/api/projects/${id}/tasks`],
    enabled: !!id,
  });

  const joinProjectMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', `/api/projects/${id}/join`, {});
    },
    onSuccess: () => {
      toast({
        title: "Joined Project!",
        description: "You have successfully joined this project.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${id}`] });
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
        title: "Error",
        description: "Failed to join project. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6 md:ml-64">
            <div className="max-w-7xl mx-auto space-y-6">
              <Skeleton className="h-8 w-64" />
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3">
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

  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6 md:ml-64">
            <div className="max-w-7xl mx-auto">
              <Card className="text-center py-12" data-testid="card-project-not-found">
                <CardContent>
                  <h3 className="text-lg font-semibold mb-2">Project Not Found</h3>
                  <p className="text-muted-foreground mb-4">
                    The project you're looking for doesn't exist or has been removed.
                  </p>
                  <Link href="/projects">
                    <Button>Browse All Projects</Button>
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
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Link href="/projects" className="hover:text-foreground">
                <Button variant="ghost" size="sm" data-testid="button-back">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Projects
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-3">
                <Tabs defaultValue="kanban" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <TabsList>
                      <TabsTrigger value="kanban" data-testid="tab-kanban">Kanban Board</TabsTrigger>
                      <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="kanban" data-testid="content-kanban">
                    <KanbanBoard projectId={id!} tasks={tasks || []} />
                  </TabsContent>

                  <TabsContent value="overview" data-testid="content-overview">
                    <Card>
                      <CardHeader>
                        <CardTitle>Project Overview</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h3 className="font-semibold mb-2">Description</h3>
                          <p className="text-muted-foreground leading-relaxed">
                            {project.description}
                          </p>
                        </div>

                        {project.tags && project.tags.length > 0 && (
                          <div>
                            <h3 className="font-semibold mb-2">Technologies</h3>
                            <div className="flex flex-wrap gap-2">
                              {project.tags.map((tag: string) => (
                                <Badge key={tag} variant="secondary">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex space-x-4">
                          {project.repoUrl && (
                            <Button variant="outline" asChild data-testid="button-repo">
                              <a href={project.repoUrl} target="_blank" rel="noopener noreferrer">
                                <Github className="mr-2 h-4 w-4" />
                                Repository
                              </a>
                            </Button>
                          )}
                          {project.driveUrl && (
                            <Button variant="outline" asChild data-testid="button-drive">
                              <a href={project.driveUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Documentation
                              </a>
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Project Info */}
                <Card data-testid="card-project-info">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="line-clamp-2">{project.title}</span>
                      <Button size="sm" variant="ghost" data-testid="button-settings">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 mr-2" />
                      Created {new Date(project.createdAt).toLocaleDateString()}
                    </div>
                    
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="w-4 h-4 mr-2" />
                      {project.members.length} member{project.members.length !== 1 ? 's' : ''}
                    </div>

                    <Badge variant={project.visibility === 'PRIVATE' ? 'secondary' : 'default'}>
                      {project.visibility === 'PRIVATE' ? 'Private' : 'Public'} Project
                    </Badge>

                    <Button
                      onClick={() => joinProjectMutation.mutate()}
                      disabled={joinProjectMutation.isPending}
                      className="w-full"
                      size="sm"
                      data-testid="button-join-project"
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      {joinProjectMutation.isPending ? 'Joining...' : 'Join Project'}
                    </Button>
                  </CardContent>
                </Card>

                {/* Team Members */}
                <Card data-testid="card-team-members">
                  <CardHeader>
                    <CardTitle>Team Members</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {project.members.map((member: any) => (
                        <div key={member.userId} className="flex items-center space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={member.user.profileImageUrl} />
                            <AvatarFallback>
                              {member.user.firstName?.charAt(0)}
                              {member.user.lastName?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {member.user.firstName} {member.user.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {member.role.charAt(0) + member.role.slice(1).toLowerCase()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Project Stats */}
                <Card data-testid="card-project-stats">
                  <CardHeader>
                    <CardTitle>Project Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Tasks</span>
                      <span className="font-medium">{tasks?.length || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Completed</span>
                      <span className="font-medium">
                        {tasks?.filter((t: any) => t.status === 'DONE').length || 0}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">In Progress</span>
                      <span className="font-medium">
                        {tasks?.filter((t: any) => t.status === 'IN_PROGRESS').length || 0}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">
                        {tasks && tasks.length > 0
                          ? Math.round((tasks.filter((t: any) => t.status === 'DONE').length / tasks.length) * 100)
                          : 0}%
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
