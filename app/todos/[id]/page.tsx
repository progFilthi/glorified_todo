"use client";

import { useTodos } from "@/hooks/use-todos";
import { useCompleteTodo, useReopenTodo, useUpdateTodo, useDeleteTodo } from "@/hooks/use-todos";
import { Todo } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { fetchTodos } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  Pencil,
  Trash2,
  RotateCcw,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { motion } from "motion/react";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import * as api from "@/lib/api";

function formatFullDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
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
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
  if (diffDays < 30) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
  return formatFullDate(dateStr);
}

export default function TodoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState("");
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [editDesc, setEditDesc] = useState("");

  const { data: todo, isLoading, error } = useQuery({
    queryKey: ["todo", id],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/${id}`);
      if (!res.ok) throw new Error("Todo not found");
      return res.json() as Promise<Todo>;
    },
    enabled: !isNaN(id),
  });

  const completeMutation = useCompleteTodo();
  const reopenMutation = useReopenTodo();
  const updateMutation = useUpdateTodo();
  const deleteMutation = useDeleteTodo();

  useEffect(() => {
    if (todo) {
      setEditName(todo.name);
      setEditDesc(todo.description ?? "");
    }
  }, [todo]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !todo) {
    return (
      <div className="min-h-screen bg-background">
        <main className="relative mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <h2 className="text-2xl font-bold text-foreground mb-2">Todo not found</h2>
            <p className="text-muted-foreground mb-6">
              The task you&apos;re looking for doesn&apos;t exist or was deleted.
            </p>
            <Button onClick={() => router.push("/")} variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to tasks
            </Button>
          </motion.div>
        </main>
      </div>
    );
  }

  const isCompleted = todo.status === "COMPLETED";

  const handleToggle = () => {
    const mutation = isCompleted ? reopenMutation : completeMutation;
    mutation.mutate(id, {
      onSuccess: () =>
        toast.success(isCompleted ? "Todo reopened" : "Todo completed! 🎉"),
      onError: (err) => toast.error(err.message),
    });
  };

  const handleUpdateName = () => {
    if (!editName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    updateMutation.mutate(
      { id, data: { name: editName.trim(), description: todo.description ?? undefined } },
      {
        onSuccess: () => {
          toast.success("Name updated");
          setIsEditingName(false);
        },
        onError: (err) => toast.error(err.message),
      }
    );
  };

  const handleUpdateDesc = () => {
    updateMutation.mutate(
      { id, data: { name: todo.name, description: editDesc.trim() || undefined } },
      {
        onSuccess: () => {
          toast.success("Description updated");
          setIsEditingDesc(false);
        },
        onError: (err) => toast.error(err.message),
      }
    );
  };

  const handleDelete = () => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success("Todo deleted");
        router.push("/");
      },
      onError: (err) => toast.error(err.message),
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-violet-500/5 blur-3xl" />
        <div className="absolute -right-40 top-1/3 h-96 w-96 rounded-full bg-indigo-500/5 blur-3xl" />
      </div>

      <main className="relative mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Back button */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/")}
              className="gap-2 text-muted-foreground hover:text-foreground -ml-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to tasks
            </Button>
          </motion.div>

          {/* Main Card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 30 }}
            className={`rounded-2xl border p-6 transition-all duration-200 ${
              isCompleted
                ? "border-emerald-500/20 bg-emerald-500/5"
                : "border-border bg-card"
            }`}
          >
            {/* Status + Actions Row */}
            <div className="flex items-center justify-between mb-4">
              <Badge
                className={`text-xs font-medium px-3 py-1 ${
                  isCompleted
                    ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/20"
                    : "bg-amber-500/15 text-amber-500 border-amber-500/20"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="mr-1.5 h-3 w-3" />
                ) : (
                  <Circle className="mr-1.5 h-3 w-3" />
                )}
                {isCompleted ? "Completed" : "Pending"}
              </Badge>

              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={handleToggle}
                    >
                      {isCompleted ? (
                        <RotateCcw className="h-4 w-4" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isCompleted ? "Reopen" : "Mark complete"}
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={handleDelete}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Delete</TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* Name */}
            <div className="mb-4">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleUpdateName();
                      if (e.key === "Escape") {
                        setEditName(todo.name);
                        setIsEditingName(false);
                      }
                    }}
                    className="text-xl font-bold"
                    autoFocus
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 shrink-0 text-emerald-500"
                    onClick={handleUpdateName}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 shrink-0"
                    onClick={() => {
                      setEditName(todo.name);
                      setIsEditingName(false);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div
                  className="group/name flex items-start gap-2 cursor-pointer"
                  onClick={() => setIsEditingName(true)}
                >
                  <h1
                    className={`text-xl font-bold tracking-tight transition-all ${
                      isCompleted
                        ? "text-muted-foreground line-through"
                        : "text-foreground"
                    }`}
                  >
                    {todo.name}
                  </h1>
                  <Pencil className="h-4 w-4 mt-1.5 text-muted-foreground/0 group-hover/name:text-muted-foreground transition-colors" />
                </div>
              )}
            </div>

            <Separator className="mb-4 opacity-50" />

            {/* Description */}
            <div className="mb-6">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
                Description
              </label>
              {isEditingDesc ? (
                <div className="space-y-2">
                  <textarea
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        setEditDesc(todo.description ?? "");
                        setIsEditingDesc(false);
                      }
                    }}
                    className="w-full min-h-[100px] rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y"
                    placeholder="Add a description..."
                    autoFocus
                  />
                  <div className="flex gap-2 justify-end">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditDesc(todo.description ?? "");
                        setIsEditingDesc(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleUpdateDesc}
                      className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:brightness-110"
                    >
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  className="group/desc cursor-pointer rounded-lg border border-transparent px-3 py-2 -mx-3 hover:border-border hover:bg-accent/30 transition-all"
                  onClick={() => setIsEditingDesc(true)}
                >
                  {todo.description ? (
                    <p className="text-sm text-foreground whitespace-pre-wrap">
                      {todo.description}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground/50 italic">
                      Click to add a description...
                    </p>
                  )}
                </div>
              )}
            </div>

            <Separator className="mb-4 opacity-50" />

            {/* Timestamps */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 rounded-lg bg-muted/30 px-4 py-3">
                <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-0.5">
                    Created
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {formatFullDate(todo.createdAt)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatTime(todo.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg bg-muted/30 px-4 py-3">
                <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-0.5">
                    Last Updated
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {formatFullDate(todo.updatedAt)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatTime(todo.updatedAt)} · {timeAgo(todo.updatedAt)}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
