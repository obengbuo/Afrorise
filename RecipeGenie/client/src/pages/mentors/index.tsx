import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { MentorCard } from "@/components/mentors/mentor-card";
import { MentorSearch } from "@/components/mentors/mentor-search";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Star, Award } from "lucide-react";

export default function MentorsIndex() {
  const [filters, setFilters] = useState({
    industries: [] as string[],
    skills: [] as string[],
    languages: [] as string[],
    ratingMin: undefined as number | undefined,
  });

  const { data: mentors, isLoading } = useQuery({
    queryKey: ["/api/mentors", filters],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters.industries.length) params.set('industries', filters.industries.join(','));
      if (filters.skills.length) params.set('skills', filters.skills.join(','));
      if (filters.languages.length) params.set('languages', filters.languages.join(','));
      if (filters.ratingMin) params.set('ratingMin', filters.ratingMin.toString());
      
      return fetch(`/api/mentors?${params}`).then(res => res.json());
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto">
              <div className="mb-8">
                <Skeleton className="h-8 w-64 mb-2" />
                <Skeleton className="h-4 w-96" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-96" />
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
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-page-title">
                Find Your Mentor
              </h1>
              <p className="text-muted-foreground">
                Connect with experienced professionals who can guide your career journey.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card data-testid="card-total-mentors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Mentors</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mentors?.length || 0}</div>
                  <p className="text-xs text-muted-foreground">Available now</p>
                </CardContent>
              </Card>

              <Card data-testid="card-avg-rating">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">4.8</div>
                  <p className="text-xs text-muted-foreground">Across all mentors</p>
                </CardContent>
              </Card>

              <Card data-testid="card-verified-mentors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Verified Mentors</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">100%</div>
                  <p className="text-xs text-muted-foreground">Background checked</p>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filters */}
            <MentorSearch filters={filters} onFiltersChange={setFilters} />

            {/* Mentors Grid */}
            <div className="mt-8">
              {mentors?.length === 0 ? (
                <Card className="text-center py-12" data-testid="card-no-mentors">
                  <CardContent>
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No mentors found</h3>
                    <p className="text-muted-foreground mb-4">
                      Try adjusting your filters or search criteria.
                    </p>
                    <Button onClick={() => setFilters({ industries: [], skills: [], languages: [], ratingMin: undefined })} data-testid="button-clear-filters">
                      Clear Filters
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {mentors?.map((mentor: any) => (
                    <MentorCard key={mentor.id} mentor={mentor} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
