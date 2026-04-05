"use client";

import { useState } from "react";
import { CheckSquare, Circle, AlertCircle, Clock, Flag } from "lucide-react";
import { cn, formatDate, initials, DEPT_COLOURS } from "@/lib/utils";

type TaskWithDetails = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_date: string | null;
  is_critical_path: boolean;
  owner: { id: string; full_name: string; department: string | null } | null;
  event: { id: string; name: string } | null;
};

const STATUS_CONFIG = {
  todo:        { label: "To do",       icon: Circle,       colour: "text-[var(--color-text-muted)]" },
  in_progress: { label: "In progress", icon: Clock,        colour: "text-[var(--color-signal-blue)]" },
  blocked:     { label: "Blocked",     icon: AlertCircle,  colour: "text-[var(--color-signal-red)]" },
  done:        { label: "Done",        icon: CheckSquare,  colour: "text-[var(--color-signal-green)]" },
  cancelled:   { label: "Cancelled",   icon: Circle,       colour: "text-[var(--color-text-muted)]" },
};

const PRIORITY_COLOURS = {
  low:      "text-[var(--color-text-muted)]",
  medium:   "text-[var(--color-signal-blue)]",
  high:     "text-[var(--color-signal-amber)]",
  critical: "text-[var(--color-signal-red)]",
};

interface TasksViewProps {
  tasks: TaskWithDetails[];
}

export function TasksView({ tasks }: TasksViewProps) {
  const [filter, setFilter] = useState<string>("active");

  const filtered = tasks.filter((t) => {
    if (filter === "active") return t.status !== "done" && t.status !== "cancelled";
    if (filter === "blocked") return t.status === "blocked";
    if (filter === "done") return t.status === "done";
    return true;
  });

  const blockedCount = tasks.filter((t) => t.status === "blocked").length;
  const criticalCount = tasks.filter((t) => t.is_critical_path && t.status !== "done").length;

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">Tasks</h1>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 tabular-nums">
            {tasks.length} total
            {blockedCount > 0 && <span className="text-[var(--color-signal-red)]"> · {blockedCount} blocked</span>}
            {criticalCount > 0 && <span className="text-[var(--color-signal-amber)]"> · {criticalCount} critical path</span>}
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-1.5 mb-4">
        {["active", "blocked", "done", "all"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors",
              filter === f
                ? "bg-[var(--color-brand-navy)] text-white"
                : "bg-[var(--color-surface-3)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Task table */}
      <div className="rounded-xl bg-white border border-[var(--color-border)] overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-sm text-[var(--color-text-muted)]">
            No tasks
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-2)]">
                <th className="text-left px-4 py-2.5 text-xs font-medium text-[var(--color-text-muted)]">Task</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-[var(--color-text-muted)] w-28">Status</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-[var(--color-text-muted)] w-24">Priority</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-[var(--color-text-muted)] w-28">Due</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-[var(--color-text-muted)] w-36">Owner</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {filtered.map((task) => (
                <TaskRow key={task.id} task={task} />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

function TaskRow({ task }: { task: TaskWithDetails }) {
  const statusCfg = STATUS_CONFIG[task.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.todo;
  const StatusIcon = statusCfg.icon;

  const isOverdue =
    task.due_date &&
    task.status !== "done" &&
    new Date(task.due_date) < new Date();

  return (
    <tr className="hover:bg-[var(--color-surface-2)] transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          {task.is_critical_path && (
            <Flag className="h-3 w-3 text-[var(--color-signal-amber)] shrink-0" />
          )}
          <span
            className={cn(
              "text-sm",
              task.status === "done" || task.status === "cancelled"
                ? "line-through text-[var(--color-text-muted)]"
                : "text-[var(--color-text-primary)]"
            )}
          >
            {task.title}
          </span>
        </div>
        {task.event && (
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5 pl-5">
            {task.event.name}
          </p>
        )}
      </td>
      <td className="px-4 py-3">
        <span className={cn("flex items-center gap-1.5", statusCfg.colour)}>
          <StatusIcon className="h-3.5 w-3.5 shrink-0" />
          <span className="text-xs">{statusCfg.label}</span>
        </span>
      </td>
      <td className="px-4 py-3">
        <span className={cn("text-xs font-medium capitalize", PRIORITY_COLOURS[task.priority as keyof typeof PRIORITY_COLOURS] ?? "text-[var(--color-text-muted)]")}>
          {task.priority}
        </span>
      </td>
      <td className="px-4 py-3">
        <span
          className={cn(
            "text-xs tabular-nums",
            isOverdue
              ? "text-[var(--color-signal-red)] font-medium"
              : "text-[var(--color-text-muted)]"
          )}
        >
          {formatDate(task.due_date)}
        </span>
      </td>
      <td className="px-4 py-3">
        {task.owner ? (
          <div className="flex items-center gap-1.5">
            <span
              className="h-5 w-5 rounded-full flex items-center justify-center text-white text-[9px] font-semibold shrink-0"
              style={{
                background: task.owner.department
                  ? DEPT_COLOURS[task.owner.department]
                  : "var(--color-signal-grey)",
              }}
            >
              {initials(task.owner.full_name)}
            </span>
            <span className="text-xs text-[var(--color-text-secondary)] truncate">
              {task.owner.full_name}
            </span>
          </div>
        ) : (
          <span className="text-xs text-[var(--color-text-muted)]">Unassigned</span>
        )}
      </td>
    </tr>
  );
}
