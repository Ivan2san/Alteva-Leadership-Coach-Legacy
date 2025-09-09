import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageSquare, 
  Search, 
  Star, 
  Archive, 
  Download,
  Trash2,
  Calendar,
  Clock,
  MoreVertical
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { topicConfigurations } from "@/lib/topic-configurations";
import { Link } from "wouter";
import { Breadcrumb } from "@/components/breadcrumb";
import { BackButton } from "@/components/back-button";
import type { Conversation } from "@shared/schema";

export default function ConversationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("active");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch conversations
  const { data: conversations = [], isLoading, refetch } = useQuery<Conversation[]>({
    queryKey: ["/api/conversations", { status: activeTab === "all" ? undefined : activeTab, search: searchQuery || undefined }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (activeTab !== "all") params.set("status", activeTab);
      if (searchQuery) params.set("search", searchQuery);
      
      const response = await fetch(`/api/conversations?${params}`);
      if (!response.ok) throw new Error("Failed to fetch conversations");
      return response.json();
    },
  });

  // Star conversation mutation
  const starMutation = useMutation({
    mutationFn: async ({ id, isStarred }: { id: string; isStarred: boolean }) => {
      const response = await fetch(`/api/conversations/${id}/star`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isStarred }),
      });
      if (!response.ok) throw new Error("Failed to star conversation");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      toast({ title: "Conversation updated" });
    },
  });

  // Archive conversation mutation
  const archiveMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/conversations/${id}/archive`, {
        method: "PATCH",
      });
      if (!response.ok) throw new Error("Failed to archive conversation");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      toast({ title: "Conversation archived" });
    },
  });

  // Delete conversation mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/conversations/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete conversation");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      toast({ title: "Conversation deleted" });
    },
  });

  const formatDate = (date: string | Date | null) => {
    if (!date) return 'Unknown';
    return new Date(date).toLocaleDateString();
  };

  const formatTime = (date: string | Date | null) => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getTopicConfig = (topic: string) => {
    return topicConfigurations[topic] || { title: topic, icon: "💬", color: "blue" };
  };

  const handleExport = (conversationId: string, format: 'json' | 'txt') => {
    window.open(`/api/conversations/${conversationId}/export?format=${format}`, '_blank');
  };

  const handleDelete = (id: string, title?: string) => {
    if (confirm(`Are you sure you want to delete "${title || 'this conversation'}"? This action cannot be undone.`)) {
      deleteMutation.mutate(id);
    }
  };

  // Filter conversations based on search
  const filteredConversations = conversations.filter(conv => 
    !searchQuery || 
    conv.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.topic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <BackButton />
      <Breadcrumb items={[{ label: "Conversations", current: true }]} />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Conversation History</h1>
        <p className="text-gray-600 dark:text-gray-400">
          View and manage your AI coaching conversations
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="active" data-testid="active-tab">Active</TabsTrigger>
          <TabsTrigger value="archived" data-testid="archived-tab">Archived</TabsTrigger>
          <TabsTrigger value="all" data-testid="all-tab">All</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Conversations ({filteredConversations.length})
                </span>
                <Link href="/prompts/growth-profile">
                  <Button data-testid="new-conversation-button">
                    Start New Conversation
                  </Button>
                </Link>
              </CardTitle>
              <CardDescription>
                Your coaching conversation history and analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search conversations by title, topic, or content..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    data-testid="search-conversations"
                  />
                </div>
              </div>

              {/* Conversations Grid */}
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p>Loading conversations...</p>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">
                    {searchQuery ? "No conversations found" : "No conversations yet"}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {searchQuery 
                      ? "Try adjusting your search terms"
                      : "Start your first AI coaching conversation to see it here"
                    }
                  </p>
                  {!searchQuery && (
                    <Link href="/prompts/growth-profile">
                      <Button>Start Your First Conversation</Button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredConversations.map((conversation) => {
                    const topicConfig = getTopicConfig(conversation.topic);
                    const messageCount = conversation.messageCount || 0;
                    const messages = Array.isArray(conversation.messages) ? conversation.messages : [];
                    const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
                    
                    return (
                      <Card key={conversation.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div className="text-2xl">{topicConfig.icon}</div>
                              <div className="min-w-0 flex-1">
                                <h3 className="font-medium truncate" title={conversation.title || conversation.topic}>
                                  {conversation.title || `${topicConfig.title} Session`}
                                </h3>
                                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                  <Badge variant="outline" className="text-xs">
                                    {topicConfig.title}
                                  </Badge>
                                  {conversation.isStarred && (
                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                  )}
                                </div>
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" data-testid={`conversation-menu-${conversation.id}`}>
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => starMutation.mutate({ id: conversation.id, isStarred: !conversation.isStarred })}
                                >
                                  <Star className="h-4 w-4 mr-2" />
                                  {conversation.isStarred ? 'Unstar' : 'Star'}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleExport(conversation.id, 'txt')}
                                >
                                  <Download className="h-4 w-4 mr-2" />
                                  Export as TXT
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleExport(conversation.id, 'json')}
                                >
                                  <Download className="h-4 w-4 mr-2" />
                                  Export as JSON
                                </DropdownMenuItem>
                                {conversation.status === 'active' && (
                                  <DropdownMenuItem
                                    onClick={() => archiveMutation.mutate(conversation.id)}
                                  >
                                    <Archive className="h-4 w-4 mr-2" />
                                    Archive
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  onClick={() => handleDelete(conversation.id, conversation.title || undefined)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          {conversation.summary && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                              {conversation.summary}
                            </p>
                          )}
                          
                          {lastMessage && (
                            <div className="text-xs text-gray-500 mb-3 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                              <span className="font-medium">{lastMessage.sender === 'user' ? 'You' : 'AI'}:</span> {lastMessage.text.substring(0, 100)}...
                            </div>
                          )}

                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1">
                                <MessageSquare className="h-3 w-3" />
                                {messageCount} messages
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(conversation.createdAt)}
                              </div>
                            </div>
                            {conversation.lastMessageAt && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatTime(conversation.lastMessageAt)}
                              </div>
                            )}
                          </div>

                          <div className="mt-3 pt-3 border-t">
                            <Link href={`/chat/${conversation.topic}?resumeId=${conversation.id}`}>
                              <Button variant="outline" size="sm" className="w-full" data-testid={`resume-conversation-${conversation.id}`}>
                                Resume Conversation
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}