"use client";

import { PaginatedResponse, Todo } from "@/lib/types";
import { CreateTodoDialog } from "./create-todo-dialog";
import { motion } from "motion/react";
import { CheckCircle2, Clock, ListTodo } from "lucide-react";

interface TodoHeaderProps {
  data?: PaginatedResponse<Todo>;
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex items-center gap-2.5 rounded-xl border px-4 py-2.5 ${color}`}
    >
      <Icon className="h-4 w-4" />
      <div className="flex items-baseline gap-1.5">
        <span className="text-lg font-bold tabular-nums">{value}</span>
        <span className="text-xs font-medium opacity-70">{label}</span>
      </div>
    </motion.div>
  );
}

export function TodoHeader({ data }: TodoHeaderProps) {
  // totalElements comes from Spring Boot's Page - it's the total across ALL pages
  const totalElements = data?.totalElements ?? 0;

  // Count completed and pending from the current page content
  const content = data?.content ?? [];
  const completedCount = content.filter((t) => t.status === "COMPLETED").length;
  const pendingCount = content.filter((t) => t.status === "PENDING").length;

  return (
    <div className="space-y-6">
      {/* Title Row */}
      <div className="flex items-start justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Dev Tracker
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track your app dev projects and stay on top of tasks.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.1 }}
        >
          <CreateTodoDialog />
        </motion.div>
      </div>

      {/* Stats Row */}
      <div className="flex flex-wrap gap-3">
        <StatCard
          icon={ListTodo}
          label="Total"
          value={totalElements}
          color="border-border bg-card text-foreground"
        />
        <StatCard
          icon={CheckCircle2}
          label="Done"
          value={completedCount}
          color="border-emerald-500/20 bg-emerald-500/5 text-emerald-500"
        />
        <StatCard
          icon={Clock}
          label="Pending"
          value={pendingCount}
          color="border-amber-500/20 bg-amber-500/5 text-amber-500"
        />
      </div>
    </div>
  );
}
