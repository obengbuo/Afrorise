import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { 
  Plus,
  Calendar,
  User,
  MoreVertical,
  Clock
} from "lucide-react";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'BACKLOG' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
  assignee?: {
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
  } | null;
  dueDate?: string;
  labels?: string[];
  createdAt: string;
  updatedAt: string;
}

interface KanbanBoardProps {
  projectId: string;
  tasks: Task[];
}

const TASK_STATUSES = [
  { value: 'BACKLOG', label: 'Backlog', color: 'bg-gray-100' },
  { value: 'IN_PROGRESS', label: 'In Progress', color: 'bg-blue-100' },
  { value: 'REVIEW', label: 'Review', color: 'bg-yellow-100' },
  { value: 'DONE', label: 'Done', color: 'bg-green-100' },
];

export function KanbanBoard({ projectId, tasks }: KanbanBoardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('BACKLOG');
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [labels, setLabels] = useState('');
  const [dueDate, setDueDate] = useState('');

  const createTaskMutation = useMutation({
    mutationFn: async (taskData: any) => {
      return apiRequest('POST', `/api/projects/${projectId}/tasks`, taskData);
    },
    onSuccess: () => {
      toast({
        title: "Task Created!",
        description: "Your task has been added to the project.",
      });
      setShowCreateDialog(false);
      // Reset form
      setTitle('');
      setDescription('');
      setLabels('');
      setDueDate('');
      setSelectedStatus('BACKLOG');
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/tasks`] });
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
        description: "Failed to create task. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateTaskStatusMutation = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: string }) => {
      return apiRequest('PATCH', `/api/tasks/${taskId}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/tasks`] });
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
        description: "Failed to update task status.",
        variant: "destructive",
      });
    },
  });

  const handleCreateTask = () => {
    if (!title.trim()) {
      toast({
        title: "Missing Title",
        description: "Please provide a title for your task.",
        variant: "destructive",
      });
      return;
    }

    const taskData = {
      title: title.trim(),
      description: description.trim() || undefined,
      status: selectedStatus,
      labels: labels ? labels.split(',').map(label => label.trim()).filter(Boolean) : [],
      dueDate: dueDate || undefined,
    };

    createTaskMutation.mutate(taskData);
  };

  const handleStatusChange = (taskId: string, newStatus: string) => {
    updateTaskStatusMutation.mutate({ taskId, status: newStatus });
  };

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status);
  };

  return (
    <div className="space-y-4" data-testid="kanban-board">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Project Tasks</h2>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-task">
              <Plus className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Task Title *</label>
                <Input
                  placeholder="e.g. Implement user authentication"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  data-testid="input-task-title"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  placeholder="Describe what needs to be done..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[80px]"
                  data-testid="textarea-task-description"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger data-testid="select-task-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TASK_STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Labels</label>
                <Input
                  placeholder="e.g. frontend, urgent, bug (comma-separated)"
                  value={labels}
                  onChange={(e) => setLabels(e.target.value)}
                  data-testid="input-task-labels"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Due Date</label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  data-testid="input-task-due-date"
                />
              </div>
              
              <div className="flex space-x-2 pt-4">
                <Button
                  onClick={handleCreateTask}
                  disabled={createTaskMutation.isPending}
                  className="flex-1"
                  data-testid="button-save-task"
                >
                  {createTaskMutation.isPending ? "Creating..." : "Create Task"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCreateDialog(false)}
                  data-testid="button-cancel-task"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {TASK_STATUSES.map((status) => {
          const statusTasks = getTasksByStatus(status.value);
          
          return (
            <div key={status.value} className="space-y-3" data-testid={`column-${status.value.toLowerCase()}`}>
              <div className={`${status.color} rounded-lg p-3`}>
                <h3 className="font-medium text-sm">
                  {status.label} ({statusTasks.length})
                </h3>
              </div>
              
              <div className="space-y-3 min-h-[400px]">
                {statusTasks.map((task) => (
                  <Card key={task.id} className="hover:shadow-md transition-shadow cursor-pointer" data-testid={`task-${task.id}`}>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium text-sm leading-tight flex-1 pr-2">
                          {task.title}
                        </h4>
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      {task.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {task.description}
                        </p>
                      )}
                      
                      {task.labels && task.labels.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {task.labels.slice(0, 2).map((label) => (
                            <Badge key={label} variant="outline" className="text-xs px-1 py-0">
                              {label}
                            </Badge>
                          ))}
                          {task.labels.length > 2 && (
                            <Badge variant="outline" className="text-xs px-1 py-0">
                              +{task.labels.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        {task.assignee && (
                          <div className="flex items-center space-x-1">
                            <Avatar className="w-5 h-5">
                              <AvatarImage src={task.assignee.profileImageUrl} />
                              <AvatarFallback className="text-xs">
                                {task.assignee.firstName?.charAt(0)}
                                {task.assignee.lastName?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-muted-foreground truncate">
                              {task.assignee.firstName}
                            </span>
                          </div>
                        )}
                        
                        {task.dueDate && (
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(task.dueDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      
                      {/* Status Change Actions */}
                      <div className="flex space-x-1">
                        {TASK_STATUSES
                          .filter(s => s.value !== task.status)
                          .slice(0, 2)
                          .map((targetStatus) => (
                            <Button
                              key={targetStatus.value}
                              size="sm"
                              variant="outline"
                              className="text-xs h-6 px-2"
                              onClick={() => handleStatusChange(task.id, targetStatus.value)}
                              disabled={updateTaskStatusMutation.isPending}
                              data-testid={`button-move-${task.id}-${targetStatus.value.toLowerCase()}`}
                            >
                              → {targetStatus.label}
                            </Button>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {statusTasks.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">No tasks in {status.label.toLowerCase()}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
