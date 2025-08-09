import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { GigCard } from "@/components/gigs/gig-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { 
  Plus,
  Search,
  Briefcase,
  DollarSign,
  MapPin,
  Clock
} from "lucide-react";

export default function GigsIndex() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [tags, setTags] = useState('');
  const [isRemote, setIsRemote] = useState(true);
  const [location, setLocation] = useState('');

  const { data: gigs, isLoading } = useQuery({
    queryKey: ["/api/gigs"],
  });

  const createGigMutation = useMutation({
    mutationFn: async (gigData: any) => {
      return apiRequest('POST', '/api/gigs', gigData);
    },
    onSuccess: () => {
      toast({
        title: "Gig Posted!",
        description: "Your opportunity has been posted successfully.",
      });
      setShowCreateDialog(false);
      // Reset form
      setTitle('');
      setDescription('');
      setBudget('');
      setCurrency('USD');
      setTags('');
      setIsRemote(true);
      setLocation('');
      queryClient.invalidateQueries({ queryKey: ["/api/gigs"] });
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
        description: "Failed to post gig. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCreateGig = () => {
    if (!title.trim() || !description.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both title and description for your gig.",
        variant: "destructive",
      });
      return;
    }

    const gigData = {
      title: title.trim(),
      description: description.trim(),
      budget: budget ? parseInt(budget) : undefined,
      currency,
      tags: tags ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
      isRemote,
      location: !isRemote && location.trim() ? location.trim() : undefined,
    };

    createGigMutation.mutate(gigData);
  };

  const filteredGigs = gigs?.filter((gig: any) =>
    gig.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    gig.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    gig.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
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
                  Job Opportunities
                </h1>
                <p className="text-muted-foreground">
                  Find freelance work and gig opportunities or post your own projects.
                </p>
              </div>
              
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button data-testid="button-post-gig">
                    <Plus className="mr-2 h-4 w-4" />
                    Post a Gig
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Post New Opportunity</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Job Title *</label>
                      <Input
                        placeholder="e.g. Frontend Developer for Landing Page"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        data-testid="input-gig-title"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Description *</label>
                      <Textarea
                        placeholder="Describe the work, requirements, and expectations..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="min-h-[120px]"
                        data-testid="textarea-gig-description"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Budget</label>
                        <Input
                          type="number"
                          placeholder="1000"
                          value={budget}
                          onChange={(e) => setBudget(e.target.value)}
                          data-testid="input-gig-budget"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Currency</label>
                        <Select value={currency} onValueChange={setCurrency}>
                          <SelectTrigger data-testid="select-gig-currency">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="EUR">EUR</SelectItem>
                            <SelectItem value="GBP">GBP</SelectItem>
                            <SelectItem value="CAD">CAD</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Skills/Tags</label>
                      <Input
                        placeholder="e.g. React, TypeScript, Design (comma-separated)"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        data-testid="input-gig-tags"
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="remote-work"
                          checked={isRemote}
                          onCheckedChange={setIsRemote}
                          data-testid="switch-remote"
                        />
                        <label htmlFor="remote-work" className="text-sm font-medium">
                          Remote Work
                        </label>
                      </div>
                      
                      {!isRemote && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Location</label>
                          <Input
                            placeholder="e.g. New York, NY"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            data-testid="input-gig-location"
                          />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex space-x-2 pt-4">
                      <Button
                        onClick={handleCreateGig}
                        disabled={createGigMutation.isPending}
                        className="flex-1"
                        data-testid="button-save-gig"
                      >
                        {createGigMutation.isPending ? "Posting..." : "Post Gig"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowCreateDialog(false)}
                        data-testid="button-cancel-gig"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card data-testid="card-total-gigs">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Opportunities</CardTitle>
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{filteredGigs?.length || 0}</div>
                  <p className="text-xs text-muted-foreground">Available now</p>
                </CardContent>
              </Card>

              <Card data-testid="card-remote-gigs">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Remote Work</CardTitle>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {filteredGigs?.filter((gig: any) => gig.isRemote).length || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Remote opportunities</p>
                </CardContent>
              </Card>

              <Card data-testid="card-avg-budget">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg. Budget</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${filteredGigs && filteredGigs.length > 0
                      ? Math.round(filteredGigs.filter((gig: any) => gig.budget).reduce((sum: number, gig: any) => sum + gig.budget, 0) / filteredGigs.filter((gig: any) => gig.budget).length || 0)
                      : 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Per project</p>
                </CardContent>
              </Card>

              <Card data-testid="card-new-today">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Posted Today</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {filteredGigs?.filter((gig: any) => {
                      const today = new Date();
                      const gigDate = new Date(gig.createdAt);
                      return gigDate.toDateString() === today.toDateString();
                    }).length || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">New opportunities</p>
                </CardContent>
              </Card>
            </div>

            {/* Search */}
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search opportunities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search"
                />
              </div>
            </div>

            {/* Gigs Grid */}
            {filteredGigs?.length === 0 ? (
              <Card className="text-center py-12" data-testid="card-no-gigs">
                <CardContent>
                  <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No opportunities found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm ? 'No gigs match your search.' : 'Be the first to post an opportunity!'}
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
                {filteredGigs?.map((gig: any) => (
                  <GigCard key={gig.id} gig={gig} />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
