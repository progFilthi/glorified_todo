"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useCreateTodo } from "@/hooks/use-todos";
import { Plus, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function CreateTodoDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  const createMutation = useCreateTodo();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter a task name");
      return;
    }

    createMutation.mutate(
      { name: name.trim() },
      {
        onSuccess: () => {
          toast.success("Task created! 🚀");
          setName("");
          setOpen(false);
        },
        onError: (err) => toast.error(err.message),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="gap-2 mt-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 font-medium text-white shadow-lg shadow-violet-500/25 transition-all duration-200 hover:shadow-violet-500/40 hover:brightness-110"
        >
          <Plus className="h-4 w-4" />
          Add Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md border-border/50 bg-card">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-lg">Create New Task</DialogTitle>
            <DialogDescription>
              Add a new task to track your app dev progress.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="todo-name"
                className="text-sm font-medium text-foreground"
              >
                Task Name
              </label>
              <Input
                id="todo-name"
                placeholder="e.g., Implement user authentication"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-lg"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || !name.trim()}
              className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:brightness-110"
            >
              {createMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Create Task
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
