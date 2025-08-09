import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { MessageThread } from "@/components/messaging/message-thread";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { 
  Search,
  MessageSquare,
  Users,
  Plus,
  Send
} from "lucide-react";

export default function Messages() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: threads, isLoading: threadsLoading } = useQuery({
    queryKey: ["/api/messages"],
  });

  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ["/api/messages", { threadId: selectedThreadId }],
    enabled: !!selectedThreadId,
    queryFn: () => {
      const params = new URLSearchParams();
      if (selectedThreadId) params.set('threadId', selectedThreadId);
      return fetch(`/api/messages?${params}`).then(res => res.json());
    },
  });

  // Auto-refresh messages every 10 seconds
  useEffect(() => {
    if (selectedThreadId) {
      const interval = setInterval(() => {
        queryClient.invalidateQueries({ 
          queryKey: ["/api/messages", { threadId: selectedThreadId }] 
        });
      }, 10000);
      
      return () => clearInterval(interval);
    }
  }, [selectedThreadId, queryClient]);

  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: any) => {
      return apiRequest('POST', '/api/messages', messageData);
    },
    onSuccess: () => {
      // Refresh both threads and messages
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      if (selectedThreadId) {
        queryClient.invalidateQueries({ 
          queryKey: ["/api/messages", { threadId: selectedThreadId }] 
        });
      }
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
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const filteredThreads = threads?.filter((thread: any) =>
    thread.participantIds?.some((participantId: string) =>
      // This is a simplified search - in a real app, you'd search by participant names
      participantId.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (threadsLoading) {
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
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-20" />
                  ))}
                </div>
                <div className="lg:col-span-2">
                  <Skeleton className="h-96" />
                </div>
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
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-page-title">
                Messages
              </h1>
              <p className="text-muted-foreground">
                Connect with mentors, mentees, and project collaborators.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
              {/* Thread List */}
              <div className="space-y-4">
                {/* Search */}
                <Card data-testid="card-search">
                  <CardContent className="p-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="Search conversations..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                        data-testid="input-search-messages"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Thread List */}
                <Card className="flex-1 overflow-hidden" data-testid="card-thread-list">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center">
                        <MessageSquare className="mr-2 h-5 w-5" />
                        Conversations
                      </span>
                      <Button size="sm" variant="outline" data-testid="button-new-message">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 overflow-y-auto">
                    {filteredThreads?.length === 0 ? (
                      <div className="text-center py-8 px-4">
                        <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          {searchTerm ? 'No conversations match your search.' : 'No conversations yet.'}
                        </p>
                        {!searchTerm && (
                          <p className="text-sm text-muted-foreground mt-2">
                            Start a conversation with a mentor or mentee!
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-0">
                        {filteredThreads?.map((thread: any) => (
                          <div
                            key={thread.id}
                            className={`p-4 border-b cursor-pointer hover:bg-accent transition-colors ${
                              selectedThreadId === thread.id ? 'bg-accent' : ''
                            }`}
                            onClick={() => setSelectedThreadId(thread.id)}
                            data-testid={`thread-${thread.id}`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="relative">
                                <Avatar className="w-10 h-10">
                                  <AvatarImage src="/default-avatar.png" />
                                  <AvatarFallback>
                                    <Users className="h-4 w-4" />
                                  </AvatarFallback>
                                </Avatar>
                                {thread.isProjectThread && (
                                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                                    <Users className="h-2 w-2 text-primary-foreground" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className="font-medium truncate">
                                    {thread.isProjectThread 
                                      ? `Project Thread` 
                                      : `Conversation`
                                    }
                                  </p>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(thread.updatedAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground truncate">
                                  {thread.participantIds?.length || 0} participant{thread.participantIds?.length !== 1 ? 's' : ''}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Message Thread */}
              <div className="lg:col-span-2">
                {selectedThreadId ? (
                  <MessageThread
                    threadId={selectedThreadId}
                    messages={messages || []}
                    isLoading={messagesLoading}
                    onSendMessage={(content: string) => {
                      sendMessageMutation.mutate({
                        threadId: selectedThreadId,
                        content,
                      });
                    }}
                    isSending={sendMessageMutation.isPending}
                  />
                ) : (
                  <Card className="h-full flex items-center justify-center" data-testid="card-no-thread-selected">
                    <CardContent className="text-center">
                      <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
                      <p className="text-muted-foreground">
                        Choose a conversation from the sidebar to start messaging.
                      </p>
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
