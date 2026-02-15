"use client";

import { Todo } from "@/lib/types";
import { TodoItem } from "./todo-item";
import { AnimatePresence, motion } from "motion/react";
import { ClipboardList } from "lucide-react";

interface TodoListProps {
  todos: Todo[];
  isLoading: boolean;
}

function TodoSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 animate-pulse">
      <div className="h-5 w-5 rounded-full bg-muted" />
      <div className="flex-1">
        <div className="h-4 w-3/4 rounded bg-muted" />
      </div>
      <div className="h-5 w-16 rounded-full bg-muted" />
    </div>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="mb-4 rounded-2xl bg-muted/50 p-4">
        <ClipboardList className="h-10 w-10 text-muted-foreground/50" />
      </div>
      <h3 className="mb-1 text-lg font-semibold text-foreground">
        No tasks yet
      </h3>
      <p className="max-w-xs text-sm text-muted-foreground">
        Create your first task to start tracking your app dev projects.
      </p>
    </motion.div>
  );
}

export function TodoList({ todos, isLoading }: TodoListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <TodoSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (todos.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-2">
      <AnimatePresence mode="popLayout">
        {todos.map((todo) => (
          <TodoItem key={todo.id} todo={todo} />
        ))}
      </AnimatePresence>
    </div>
  );
}
