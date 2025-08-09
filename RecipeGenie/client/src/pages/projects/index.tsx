import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
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
  Plus,
  Briefcase,
  Users,
  Calendar,
  ExternalLink,
  Github,
  Search
} from "lucide-react";
import { Link } from "wouter";

export default function ProjectsIndex() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [driveUrl, setDriveUrl] = useState('');

  const { data: projects, isLoading } = useQuery({
    queryKey: ["/api/projects"],
  });

  const createProjectMutation = useMutation({
    mutationFn: async (projectData: any) => {
      return apiRequest('POST', '/api/projects', projectData);
    },
    onSuccess: () => {
      toast({
        title: "Project Created!",
        description: "Your project has been created successfully.",
      });
      setShowCreateDialog(false);
      // Reset form
      setTitle('');
      setDescription('');
      setTags('');
      setRepoUrl('');
      setDriveUrl('');
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
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
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCreateProject = () => {
    if (!title.trim() || !description.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both title and description for your project.",
        variant: "destructive",
      });
      return;
    }

    const projectData = {
      title: title.trim(),
      description: description.trim(),
      tags: tags ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
      repoUrl: repoUrl.trim() || undefined,
      driveUrl: driveUrl.trim() || undefined,
    };

    createProjectMutation.mutate(projectData);
  };

  const filteredProjects = projects?.filter((project: any) =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6 md:ml-64">
            <div className="max-w-7xl mx-auto">
              <div className="mb-8">
                <Skeleton className="h-8 w-64 mb-2" />
                <Skeleton className="h-4 w-96" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-64" />
                ))}
              </div>
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
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-page-title">
                  Collaborative Projects
                </h1>
                <p className="text-muted-foreground">
                  Join real-world projects to build your portfolio and gain hands-on experience.
                </p>
              </div>
              
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button data-testid="button-create-project">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Project
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Create New Project</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Project Title *</label>
                      <Input
                        placeholder="e.g. E-commerce Web App"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        data-testid="input-title"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Description *</label>
                      <Textarea
                        placeholder="Describe your project, goals, and what you're looking for..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="min-h-[100px]"
                        data-testid="textarea-description"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Tags</label>
                      <Input
                        placeholder="e.g. React, Node.js, MongoDB (comma-separated)"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        data-testid="input-tags"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Repository URL</label>
                      <Input
                        placeholder="https://github.com/username/project"
                        value={repoUrl}
                        onChange={(e) => setRepoUrl(e.target.value)}
                        data-testid="input-repo-url"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Drive/Docs URL</label>
                      <Input
                        placeholder="Google Drive, Notion, or other docs link"
                        value={driveUrl}
                        onChange={(e) => setDriveUrl(e.target.value)}
                        data-testid="input-drive-url"
                      />
                    </div>
                    
                    <div className="flex space-x-2 pt-4">
                      <Button
                        onClick={handleCreateProject}
                        disabled={createProjectMutation.isPending}
                        className="flex-1"
                        data-testid="button-save-project"
                      >
                        {createProjectMutation.isPending ? "Creating..." : "Create Project"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowCreateDialog(false)}
                        data-testid="button-cancel-project"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Search */}
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search"
                />
              </div>
            </div>

            {/* Projects Grid */}
            {filteredProjects?.length === 0 ? (
              <Card className="text-center py-12" data-testid="card-no-projects">
                <CardContent>
                  <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No projects found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm ? 'No projects match your search.' : 'Be the first to create a project!'}
                  </p>
                  {searchTerm && (
                    <Button onClick={() => setSearchTerm('')} variant="outline" data-testid="button-clear-search">
                      Clear Search
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects?.map((project: any) => (
                  <Card key={project.id} className="hover:shadow-lg transition-shadow" data-testid={`card-project-${project.id}`}>
                    <CardHeader>
                      <CardTitle className="flex items-start justify-between">
                        <Link href={`/projects/${project.id}`} className="hover:underline">
                          <span className="line-clamp-2">{project.title}</span>
                        </Link>
                        <Badge variant="outline" className="ml-2 shrink-0">
                          {project.visibility === 'PRIVATE' ? 'Private' : 'Public'}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-muted-foreground text-sm line-clamp-3">
                        {project.description}
                      </p>
                      
                      {project.tags && project.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {project.tags.slice(0, 3).map((tag: string) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {project.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{project.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {project.memberCount} member{project.memberCount !== 1 ? 's' : ''}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(project.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">
                          by {project.owner.firstName} {project.owner.lastName}
                        </div>
                        <div className="flex space-x-2">
                          {project.repoUrl && (
                            <Button size="sm" variant="ghost" asChild data-testid={`button-repo-${project.id}`}>
                              <a href={project.repoUrl} target="_blank" rel="noopener noreferrer">
                                <Github className="w-4 h-4" />
                              </a>
                            </Button>
                          )}
                          {project.driveUrl && (
                            <Button size="sm" variant="ghost" asChild data-testid={`button-drive-${project.id}`}>
                              <a href={project.driveUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <Link href={`/projects/${project.id}`}>
                        <Button size="sm" className="w-full" data-testid={`button-view-project-${project.id}`}>
                          View Project
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
