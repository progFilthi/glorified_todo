"use client";

import { Todo } from "@/lib/types";
import { useCompleteTodo, useReopenTodo, useUpdateTodo, useDeleteTodo } from "@/hooks/use-todos";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MoreHorizontal, Pencil, Trash2, Check, X, RotateCcw, Calendar, Clock } from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface TodoItemProps {
  todo: Todo;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateStr);
}

export function TodoItem({ todo }: TodoItemProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(todo.name);

  const completeMutation = useCompleteTodo();
  const reopenMutation = useReopenTodo();
  const updateMutation = useUpdateTodo();
  const deleteMutation = useDeleteTodo();

  const isCompleted = todo.status === "COMPLETED";

  const handleToggle = () => {
    if (isCompleted) {
      reopenMutation.mutate(todo.id, {
        onSuccess: () => toast.success("Todo reopened"),
        onError: (err) => toast.error(err.message),
      });
    } else {
      completeMutation.mutate(todo.id, {
        onSuccess: () => toast.success("Todo completed! 🎉"),
        onError: (err) => toast.error(err.message),
      });
    }
  };

  const handleUpdate = () => {
    if (!editName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    updateMutation.mutate(
      { id: todo.id, data: { name: editName.trim() } },
      {
        onSuccess: () => {
          toast.success("Todo updated");
          setIsEditing(false);
        },
        onError: (err) => toast.error(err.message),
      }
    );
  };

  const handleDelete = () => {
    deleteMutation.mutate(todo.id, {
      onSuccess: () => toast.success("Todo deleted"),
      onError: (err) => toast.error(err.message),
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleUpdate();
    if (e.key === "Escape") {
      setEditName(todo.name);
      setIsEditing(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: -20, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 500, damping: 35 }}
      className="group relative"
    >
      <div
        onClick={() => router.push(`/todos/${todo.id}`)}
        className={`flex items-start gap-3 rounded-xl border px-4 py-3.5 cursor-pointer transition-all duration-200 ${
          isCompleted
            ? "border-emerald-500/20 bg-emerald-500/5"
            : "border-border bg-card hover:border-primary/20 hover:bg-accent/50"
        }`}
      >
        {/* Checkbox */}
        <div className="pt-0.5" onClick={(e) => e.stopPropagation()}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Checkbox
                  checked={isCompleted}
                  onCheckedChange={handleToggle}
                  className={`h-5 w-5 rounded-full transition-all duration-200 ${
                    isCompleted
                      ? "border-emerald-500 bg-emerald-500 text-white data-[state=checked]:border-emerald-500 data-[state=checked]:bg-emerald-500"
                      : "border-muted-foreground/30"
                  }`}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>{isCompleted ? "Reopen task" : "Mark as complete"}</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-1.5">
          {isEditing ? (
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={handleKeyDown}
                className="h-8 text-sm"
                autoFocus
              />
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 shrink-0 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10"
                onClick={handleUpdate}
                disabled={updateMutation.isPending}
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setEditName(todo.name);
                  setIsEditing(false);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <>
              <span
                className={`block text-sm font-medium transition-all duration-200 ${
                  isCompleted
                    ? "text-muted-foreground line-through"
                    : "text-foreground"
                }`}
              >
                {todo.name}
              </span>

              {/* Date info */}
              <div className="flex items-center gap-3 text-[11px] text-muted-foreground/70">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(todo.createdAt)}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Created: {formatDate(todo.createdAt)} at {formatTime(todo.createdAt)}</p>
                  </TooltipContent>
                </Tooltip>

                {todo.updatedAt !== todo.createdAt && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {timeAgo(todo.updatedAt)}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Updated: {formatDate(todo.updatedAt)} at {formatTime(todo.updatedAt)}</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </>
          )}
        </div>

        {/* Status Badge */}
        <motion.div
          initial={false}
          animate={{ scale: 1 }}
          whileTap={{ scale: 0.9 }}
          className="pt-0.5"
        >
          <Badge
            variant={isCompleted ? "default" : "secondary"}
            className={`text-xs font-medium transition-all duration-200 ${
              isCompleted
                ? "bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25 border-emerald-500/20"
                : "bg-amber-500/15 text-amber-500 hover:bg-amber-500/25 border-amber-500/20"
            }`}
          >
            {isCompleted ? "Done" : "Pending"}
          </Badge>
        </motion.div>

        {/* Actions */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pt-0.5" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => setIsEditing(true)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              {isCompleted ? (
                <DropdownMenuItem onClick={handleToggle}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reopen
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={handleToggle}>
                  <Check className="mr-2 h-4 w-4" />
                  Complete
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.div>
  );
}
