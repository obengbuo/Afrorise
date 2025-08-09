import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import MentorsIndex from "@/pages/mentors/index";
import MentorDetail from "@/pages/mentors/[id]";
import BookSession from "@/pages/book/[mentorId]";
import ProjectsIndex from "@/pages/projects/index";
import ProjectDetail from "@/pages/projects/[id]";
import GigsIndex from "@/pages/gigs/index";
import GigDetail from "@/pages/gigs/[id]";
import Messages from "@/pages/messages/index";
import Profile from "@/pages/profile/index";
import Admin from "@/pages/admin/index";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/mentors" component={MentorsIndex} />
          <Route path="/mentors/:id" component={MentorDetail} />
          <Route path="/book/:mentorId" component={BookSession} />
          <Route path="/projects" component={ProjectsIndex} />
          <Route path="/projects/:id" component={ProjectDetail} />
          <Route path="/gigs" component={GigsIndex} />
          <Route path="/gigs/:id" component={GigDetail} />
          <Route path="/messages" component={Messages} />
          <Route path="/profile" component={Profile} />
          <Route path="/admin" component={Admin} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
