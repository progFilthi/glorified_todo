"use client";

import { TodoHeader } from "@/components/todo-header";
import { TodoList } from "@/components/todo-list";
import { TodoPagination } from "@/components/todo-pagination";
import { Separator } from "@/components/ui/separator";
import { useTodos } from "@/hooks/use-todos";
import { useState } from "react";
import { motion } from "motion/react";

export default function Home() {
  const [page, setPage] = useState(0);
  const { data, isLoading } = useTodos(page, 5);

  return (
    <div className="min-h-screen bg-background">
      {/* Subtle gradient backdrop */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-violet-500/5 blur-3xl" />
        <div className="absolute -right-40 top-1/3 h-96 w-96 rounded-full bg-indigo-500/5 blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-emerald-500/5 blur-3xl" />
      </div>

      <main className="relative mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="space-y-6"
        >
          <TodoHeader data={data} />

          <Separator className="opacity-50" />

          <TodoList todos={data?.content ?? []} isLoading={isLoading} />

          <TodoPagination
            page={page}
            totalPages={data?.totalPages ?? 0}
            onPageChange={setPage}
          />
        </motion.div>
      </main>
    </div>
  );
}
