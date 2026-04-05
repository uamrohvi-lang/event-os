"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronRight, CalendarDays, MapPin, Plus, Pencil, Check, X,
  Circle, Clock, AlertCircle, CheckSquare, Flag, MessageSquare,
  AlertTriangle, Brain,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { cn, formatDate, initials, DEPT_COLOURS } from "@/lib/utils";

// ── Types ────────────────────────────────────────────────────
type EventRow   = { id: string; name: string; type: string; status: string; venue: string | null; start_date: string | null; end_date: string | null; description: string | null; organisation_id: string };
type PhaseRow   = { id: string; name: string; order_index: number; status: string; start_date: string | null; end_date: string | null };
type TaskRow    = { id: string; title: string; status: string; priority: string; due_date: string | null; is_critical_path: boolean; phase_id: string | null; owner: { id: string; full_name: string; department: string | null } | null };
type PersonRow  = { id: string; full_name: string; department: string | null };
type ThreadRow  = { id: string; title: string; status: string; urgency_level: string; sentiment: string; is_silent: boolean; last_entry_at: string | null; owner: { id: string; full_name: string; department: string | null } | null; entries: { id: string; content: string; created_at: string; ai_urgency: string | null; ai_escalate: boolean | null }[] };
type EntryRow   = { id: string; content: string; created_at: string; ai_urgency: string | null; ai_sentiment: string | null; ai_suggested_action: string | null; ai_risk_keywords: string[] | null; ai_escalate: boolean | null; ai_processed: boolean };

// ── Constant maps ─────────────────────────────────────────────
const PHASE_STATUS_OPTS = ["pending", "active", "complete"] as const;
const TASK_STATUS_OPTS  = ["todo", "in_progress", "blocked", "done", "cancelled"] as const;
const TASK_PRIORITY_OPTS = ["low", "medium", "high", "critical"] as const;
const THREAD_STATUS_OPTS = ["in_progress", "waiting", "blocked", "resolved"] as const;
const URGENCY_OPTS = ["low", "medium", "high", "critical"] as const;

const PHASE_STATUS_COLOURS: Record<string, string> = {
  pending:  "bg-[var(--color-surface-3)] text-[var(--color-text-muted)]",
  active:   "bg-[var(--color-signal-green)]/10 text-[var(--color-signal-green)]",
  complete: "bg-[var(--color-brand-teal)]/10 text-[var(--color-brand-teal)]",
};

const TASK_STATUS_ICON: Record<string, React.ElementType> = {
  todo: Circle, in_progress: Clock, blocked: AlertCircle, done: CheckSquare, cancelled: Circle,
};
const TASK_STATUS_COLOUR: Record<string, string> = {
  todo: "text-[var(--color-text-muted)]", in_progress: "text-[var(--color-signal-blue)]",
  blocked: "text-[var(--color-signal-red)]", done: "text-[var(--color-signal-green)]",
  cancelled: "text-[var(--color-text-muted)]",
};
const PRIORITY_COLOUR: Record<string, string> = {
  low: "text-[var(--color-text-muted)]", medium: "text-[var(--color-signal-blue)]",
  high: "text-[var(--color-signal-amber)]", critical: "text-[var(--color-signal-red)]",
};
const THREAD_STATUS_DOT: Record<string, string> = {
  in_progress: "bg-[var(--color-signal-blue)]", waiting: "bg-[var(--color-signal-amber)]",
  blocked: "bg-[var(--color-signal-red)]", resolved: "bg-[var(--color-signal-green)]",
};
const THREAD_URGENCY_BORDER: Record<string, string> = {
  low: "border-[var(--color-border)]", medium: "border-[var(--color-signal-amber)]/40",
  high: "border-[var(--color-signal-red)]/40", critical: "border-[var(--color-signal-red)]",
};

// ── Props ─────────────────────────────────────────────────────
interface EventDetailProps {
  event: EventRow;
  phases: PhaseRow[];
  tasks: TaskRow[];
  people: PersonRow[];
  threads: ThreadRow[];
}

// ═══════════════════════════════════════════════════════════════
// Main component
// ═══════════════════════════════════════════════════════════════
export function EventDetail({ event, phases: initialPhases, tasks: initialTasks, people, threads: initialThreads }: EventDetailProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"phases" | "tasks" | "activity">("phases");
  const [phases, setPhases] = useState(initialPhases);
  const [tasks, setTasks]   = useState(initialTasks);
  const [threads, setThreads] = useState(initialThreads);
  const [showAddTask, setShowAddTask]     = useState(false);
  const [showAddThread, setShowAddThread] = useState(false);

  const doneTasks    = tasks.filter((t) => t.status === "done").length;
  const blockedTasks = tasks.filter((t) => t.status === "blocked").length;
  const activeThreads = threads.filter((t) => t.status !== "resolved").length;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Main panel */}
      <div className="flex-1 overflow-y-auto p-6 max-w-4xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] mb-4">
          <Link href="/" className="hover:text-[var(--color-text-primary)] transition-colors">Events</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-[var(--color-text-secondary)]">{event.name}</span>
        </nav>

        {/* Header */}
        <div className="mb-5">
          <h1 className="text-2xl font-semibold text-[var(--color-text-primary)] mb-1">{event.name}</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--color-text-secondary)]">
            {event.venue && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />{event.venue}</span>}
            {(event.start_date || event.end_date) && (
              <span className="flex items-center gap-1 tabular-nums">
                <CalendarDays className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
                {formatDate(event.start_date)}{event.end_date && event.end_date !== event.start_date ? ` — ${formatDate(event.end_date)}` : ""}
              </span>
            )}
          </div>
          {/* Stats */}
          <div className="flex gap-3 mt-3">
            <Chip label="Phases" value={phases.length} />
            <Chip label="Tasks" value={tasks.length} />
            <Chip label="Done" value={doneTasks} colour="var(--color-signal-green)" />
            {blockedTasks > 0 && <Chip label="Blocked" value={blockedTasks} colour="var(--color-signal-red)" />}
            <Chip label="Threads" value={activeThreads} />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 border-b border-[var(--color-border)]">
          {(["phases", "tasks", "activity"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={cn("px-3 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px",
                activeTab === tab
                  ? "border-[var(--color-brand-teal)] text-[var(--color-brand-teal)]"
                  : "border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              )}>
              {tab}
            </button>
          ))}
        </div>

        {/* ── PHASES TAB ── */}
        {activeTab === "phases" && (
          <div className="space-y-2">
            {phases.map((phase, idx) => (
              <PhaseRow
                key={phase.id}
                phase={phase}
                idx={idx}
                onUpdate={(updated) => setPhases((prev) => prev.map((p) => p.id === updated.id ? updated : p))}
              />
            ))}
            {phases.length === 0 && (
              <p className="text-sm text-[var(--color-text-muted)] py-8 text-center">No phases yet</p>
            )}
          </div>
        )}

        {/* ── TASKS TAB ── */}
        {activeTab === "tasks" && (
          <>
            <div className="flex justify-end mb-3">
              <button onClick={() => setShowAddTask(true)}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-white"
                style={{ background: "var(--color-brand-teal)" }}>
                <Plus className="h-4 w-4" /> Add task
              </button>
            </div>
            <div className="rounded-xl bg-white border border-[var(--color-border)] overflow-hidden">
              {tasks.length === 0 ? (
                <div className="py-12 text-center text-sm text-[var(--color-text-muted)]">
                  No tasks yet — add the first one
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-2)]">
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-[var(--color-text-muted)]">Task</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-[var(--color-text-muted)] w-28">Status</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-[var(--color-text-muted)] w-24">Priority</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-[var(--color-text-muted)] w-28">Due</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-[var(--color-text-muted)] w-32">Owner</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border)]">
                    {tasks.map((task) => (
                      <TaskRowItem
                        key={task.id}
                        task={task}
                        people={people}
                        phases={phases}
                        onUpdate={(updated) => setTasks((prev) => prev.map((t) => t.id === updated.id ? updated : t))}
                        onDelete={(id) => setTasks((prev) => prev.filter((t) => t.id !== id))}
                      />
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {/* ── ACTIVITY TAB ── */}
        {activeTab === "activity" && (
          <div className="flex gap-4 h-[calc(100vh-280px)]">
            {/* Thread list */}
            <div className="flex flex-col w-80 shrink-0">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-[var(--color-text-secondary)] tabular-nums">
                  {activeThreads} active thread{activeThreads !== 1 ? "s" : ""}
                </p>
                <button onClick={() => setShowAddThread(true)}
                  className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-white"
                  style={{ background: "var(--color-brand-teal)" }}>
                  <Plus className="h-3.5 w-3.5" /> New thread
                </button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2">
                {threads.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <MessageSquare className="h-7 w-7 text-[var(--color-border-strong)] mb-2" />
                    <p className="text-sm text-[var(--color-text-muted)]">No threads yet</p>
                  </div>
                )}
                {threads.map((thread) => (
                  <MiniThreadCard key={thread.id} thread={thread} />
                ))}
              </div>
            </div>
            {/* Placeholder right panel */}
            <div className="flex-1 flex items-center justify-center rounded-xl border-2 border-dashed border-[var(--color-border)]">
              <p className="text-sm text-[var(--color-text-muted)]">
                Go to <Link href="/threads" className="text-[var(--color-brand-teal)] underline">Activity</Link> to open a thread
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {showAddTask && (
        <AddTaskModal
          eventId={event.id}
          phases={phases}
          people={people}
          onClose={() => setShowAddTask(false)}
          onAdded={(t) => { setTasks((prev) => [t, ...prev]); setShowAddTask(false); router.refresh(); }}
        />
      )}
      {showAddThread && (
        <AddThreadModal
          eventId={event.id}
          people={people}
          onClose={() => setShowAddThread(false)}
          onAdded={(t) => { setThreads((prev) => [t, ...prev]); setShowAddThread(false); router.refresh(); }}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Phase row — inline rename + status change
// ═══════════════════════════════════════════════════════════════
function PhaseRow({ phase, idx, onUpdate }: { phase: PhaseRow; idx: number; onUpdate: (p: PhaseRow) => void }) {
  const [editing, setEditing] = useState(false);
  const [name, setName]       = useState(phase.name);
  const [saving, setSaving]   = useState(false);

  async function saveName() {
    if (!name.trim() || name === phase.name) { setEditing(false); setName(phase.name); return; }
    setSaving(true);
    const supabase = createClient();
    const { data } = await supabase.from("phases").update({ name: name.trim() }).eq("id", phase.id).select().single();
    if (data) onUpdate(data as PhaseRow);
    setSaving(false);
    setEditing(false);
  }

  async function changeStatus(status: string) {
    const supabase = createClient();
    const { data } = await supabase.from("phases").update({ status }).eq("id", phase.id).select().single();
    if (data) onUpdate(data as PhaseRow);
  }

  return (
    <div className="flex items-center gap-3 rounded-xl bg-white border border-[var(--color-border)] px-4 py-3 group">
      <span className="text-xs font-medium tabular-nums text-[var(--color-text-muted)] w-5 shrink-0">{idx + 1}</span>

      {/* Editable name */}
      {editing ? (
        <div className="flex items-center gap-1.5 flex-1">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") saveName(); if (e.key === "Escape") { setEditing(false); setName(phase.name); } }}
            className="flex-1 rounded-md border border-[var(--color-brand-teal)] px-2 py-1 text-sm focus:outline-none"
          />
          <button onClick={saveName} disabled={saving} className="text-[var(--color-signal-green)] hover:opacity-80">
            <Check className="h-4 w-4" />
          </button>
          <button onClick={() => { setEditing(false); setName(phase.name); }} className="text-[var(--color-text-muted)] hover:opacity-80">
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <span className="flex-1 text-sm font-medium text-[var(--color-text-primary)]">{phase.name}</span>
      )}

      {/* Edit pencil */}
      {!editing && (
        <button onClick={() => setEditing(true)} className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
          <Pencil className="h-3.5 w-3.5" />
        </button>
      )}

      {/* Dates */}
      {(phase.start_date || phase.end_date) && (
        <span className="text-xs text-[var(--color-text-muted)] tabular-nums">
          {formatDate(phase.start_date)}{phase.end_date ? ` — ${formatDate(phase.end_date)}` : ""}
        </span>
      )}

      {/* Status dropdown */}
      <select
        value={phase.status}
        onChange={(e) => changeStatus(e.target.value)}
        className={cn(
          "rounded-full px-2 py-0.5 text-xs font-medium capitalize border-0 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-teal)]",
          PHASE_STATUS_COLOURS[phase.status]
        )}
      >
        {PHASE_STATUS_OPTS.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Task row — inline status + priority change
// ═══════════════════════════════════════════════════════════════
function TaskRowItem({ task, people, phases, onUpdate, onDelete }: {
  task: TaskRow;
  people: PersonRow[];
  phases: PhaseRow[];
  onUpdate: (t: TaskRow) => void;
  onDelete: (id: string) => void;
}) {
  const StatusIcon = TASK_STATUS_ICON[task.status] ?? Circle;
  const isOverdue  = task.due_date && task.status !== "done" && new Date(task.due_date) < new Date();

  async function updateField(field: string, value: string) {
    const supabase = createClient();
    const { data } = await supabase.from("tasks").update({ [field]: value }).eq("id", task.id).select("*, owner:people(id, full_name, department)").single();
    if (data) onUpdate(data as TaskRow);
  }

  async function deleteTask() {
    const supabase = createClient();
    await supabase.from("tasks").delete().eq("id", task.id);
    onDelete(task.id);
  }

  return (
    <tr className="hover:bg-[var(--color-surface-2)] transition-colors group">
      <td className="px-4 py-2.5">
        <div className="flex items-center gap-2">
          {task.is_critical_path && <Flag className="h-3 w-3 text-[var(--color-signal-amber)] shrink-0" />}
          <span className={cn("text-sm", task.status === "done" || task.status === "cancelled" ? "line-through text-[var(--color-text-muted)]" : "text-[var(--color-text-primary)]")}>
            {task.title}
          </span>
        </div>
      </td>

      {/* Status */}
      <td className="px-4 py-2.5">
        <div className={cn("flex items-center gap-1", TASK_STATUS_COLOUR[task.status])}>
          <StatusIcon className="h-3.5 w-3.5 shrink-0" />
          <select
            value={task.status}
            onChange={(e) => updateField("status", e.target.value)}
            className="text-xs bg-transparent border-0 cursor-pointer focus:outline-none"
          >
            {TASK_STATUS_OPTS.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
          </select>
        </div>
      </td>

      {/* Priority */}
      <td className="px-4 py-2.5">
        <select
          value={task.priority}
          onChange={(e) => updateField("priority", e.target.value)}
          className={cn("text-xs font-medium capitalize bg-transparent border-0 cursor-pointer focus:outline-none", PRIORITY_COLOUR[task.priority])}
        >
          {TASK_PRIORITY_OPTS.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </td>

      {/* Due date */}
      <td className="px-4 py-2.5">
        <span className={cn("text-xs tabular-nums", isOverdue ? "text-[var(--color-signal-red)] font-medium" : "text-[var(--color-text-muted)]")}>
          {formatDate(task.due_date)}
        </span>
      </td>

      {/* Owner */}
      <td className="px-4 py-2.5">
        <div className="flex items-center gap-1.5">
          {task.owner && (
            <span
              className="h-5 w-5 rounded-full flex items-center justify-center text-white text-[9px] font-semibold shrink-0"
              style={{ background: task.owner.department ? DEPT_COLOURS[task.owner.department] : "var(--color-signal-grey)" }}
            >
              {initials(task.owner.full_name)}
            </span>
          )}
          <select
            value={task.owner?.id ?? ""}
            onChange={(e) => updateField("owner_id", e.target.value)}
            className="text-xs bg-transparent border-0 cursor-pointer focus:outline-none text-[var(--color-text-secondary)] max-w-[80px] truncate"
          >
            <option value="">Unassigned</option>
            {people.map((p) => <option key={p.id} value={p.id}>{p.full_name}</option>)}
          </select>
        </div>
      </td>

      {/* Delete */}
      <td className="px-2 py-2.5">
        <button onClick={deleteTask} className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--color-text-muted)] hover:text-[var(--color-signal-red)]">
          <X className="h-3.5 w-3.5" />
        </button>
      </td>
    </tr>
  );
}

// ═══════════════════════════════════════════════════════════════
// Mini thread card for activity tab
// ═══════════════════════════════════════════════════════════════
function MiniThreadCard({ thread }: { thread: ThreadRow }) {
  const hasEscalation = thread.entries?.some((e) => e.ai_escalate);
  return (
    <div className={cn("rounded-xl bg-white border px-3 py-2.5", THREAD_URGENCY_BORDER[thread.urgency_level])}>
      <div className="flex items-start gap-2">
        <span className={cn("h-2 w-2 rounded-full shrink-0 mt-1.5", THREAD_STATUS_DOT[thread.status])} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <p className="text-xs font-medium text-[var(--color-text-primary)] truncate">{thread.title}</p>
            {hasEscalation && <AlertTriangle className="h-3 w-3 text-[var(--color-signal-red)] shrink-0" />}
          </div>
          {thread.owner && (
            <p className="text-xs text-[var(--color-text-muted)] truncate">{thread.owner.full_name}</p>
          )}
          <p className="text-xs text-[var(--color-text-muted)] tabular-nums mt-0.5">
            {thread.entries?.length ?? 0} entr{thread.entries?.length === 1 ? "y" : "ies"}
          </p>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Add Task Modal
// ═══════════════════════════════════════════════════════════════
function AddTaskModal({ eventId, phases, people, onClose, onAdded }: {
  eventId: string;
  phases: PhaseRow[];
  people: PersonRow[];
  onClose: () => void;
  onAdded: (t: TaskRow) => void;
}) {
  const [title, setTitle]         = useState("");
  const [phaseId, setPhaseId]     = useState("");
  const [ownerId, setOwnerId]     = useState("");
  const [priority, setPriority]   = useState("medium");
  const [dueDate, setDueDate]     = useState("");
  const [isCritical, setIsCritical] = useState(false);
  const [description, setDescription] = useState("");
  const [error, setError]         = useState<string | null>(null);
  const [loading, setLoading]     = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data, error: err } = await supabase
      .from("tasks")
      .insert({
        event_id: eventId,
        title: title.trim(),
        description: description || null,
        phase_id: phaseId || null,
        owner_id: ownerId || null,
        priority: priority as never,
        due_date: dueDate || null,
        is_critical_path: isCritical,
      })
      .select("*, owner:people(id, full_name, department)")
      .single();

    if (err || !data) { setError(err?.message ?? "Failed to create task"); setLoading(false); return; }
    onAdded(data as TaskRow);
  }

  return (
    <Modal title="New task" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Title *">
          <input autoFocus required value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} placeholder="Book AV crew" />
        </Field>
        <Field label="Description">
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className={cn(inputCls, "resize-none")} placeholder="Optional details…" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Phase">
            <select value={phaseId} onChange={(e) => setPhaseId(e.target.value)} className={cn(inputCls, "bg-white")}>
              <option value="">— None —</option>
              {phases.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </Field>
          <Field label="Owner">
            <select value={ownerId} onChange={(e) => setOwnerId(e.target.value)} className={cn(inputCls, "bg-white")}>
              <option value="">Unassigned</option>
              {people.map((p) => <option key={p.id} value={p.id}>{p.full_name}</option>)}
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Priority">
            <select value={priority} onChange={(e) => setPriority(e.target.value)} className={cn(inputCls, "bg-white")}>
              {TASK_PRIORITY_OPTS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </Field>
          <Field label="Due date">
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={inputCls} />
          </Field>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={isCritical} onChange={(e) => setIsCritical(e.target.checked)} />
          <span className="text-sm text-[var(--color-text-secondary)]">Critical path task</span>
        </label>
        {error && <p className="text-sm text-[var(--color-signal-red)]">{error}</p>}
        <ModalActions onClose={onClose} loading={loading} label="Create task" disabled={!title.trim()} />
      </form>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════
// Add Thread Modal
// ═══════════════════════════════════════════════════════════════
function AddThreadModal({ eventId, people, onClose, onAdded }: {
  eventId: string;
  people: PersonRow[];
  onClose: () => void;
  onAdded: (t: ThreadRow) => void;
}) {
  const [title, setTitle]     = useState("");
  const [ownerId, setOwnerId] = useState(people[0]?.id ?? "");
  const [urgency, setUrgency] = useState("low");
  const [firstEntry, setFirstEntry] = useState("");
  const [error, setError]     = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !ownerId) return;
    setLoading(true);
    setError(null);

    const supabase = createClient();

    const { data: thread, error: threadErr } = await supabase
      .from("activity_threads")
      .insert({
        event_id: eventId,
        owner_id: ownerId,
        title: title.trim(),
        urgency_level: urgency as never,
        last_entry_at: firstEntry ? new Date().toISOString() : null,
      })
      .select("*, owner:people(id, full_name, department)")
      .single();

    if (threadErr || !thread) { setError(threadErr?.message ?? "Failed to create thread"); setLoading(false); return; }

    // Add first log entry if provided
    if (firstEntry.trim()) {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from("thread_entries").insert({
        thread_id: thread.id,
        author_id: user?.id ?? null,
        content: firstEntry.trim(),
      });
    }

    onAdded({ ...thread, entries: [] } as ThreadRow);
  }

  return (
    <Modal title="New activity thread" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Thread title *">
          <input autoFocus required value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} placeholder="Catering supplier — outstanding confirmation" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Owner *">
            <select required value={ownerId} onChange={(e) => setOwnerId(e.target.value)} className={cn(inputCls, "bg-white")}>
              <option value="">— Select person —</option>
              {people.map((p) => <option key={p.id} value={p.id}>{p.full_name}</option>)}
            </select>
          </Field>
          <Field label="Urgency">
            <select value={urgency} onChange={(e) => setUrgency(e.target.value)} className={cn(inputCls, "bg-white")}>
              {URGENCY_OPTS.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </Field>
        </div>
        <Field label="First log entry (optional)">
          <textarea value={firstEntry} onChange={(e) => setFirstEntry(e.target.value)} rows={3} className={cn(inputCls, "resize-none")} placeholder="What's the current situation…" />
        </Field>
        {error && <p className="text-sm text-[var(--color-signal-red)]">{error}</p>}
        <ModalActions onClose={onClose} loading={loading} label="Create thread" disabled={!title.trim() || !ownerId} />
      </form>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════
// Shared small components
// ═══════════════════════════════════════════════════════════════
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-lg rounded-2xl bg-white" style={{ boxShadow: "var(--shadow-modal)" }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
          <h2 className="text-base font-semibold text-[var(--color-text-primary)]">{title}</h2>
          <button onClick={onClose} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"><X className="h-5 w-5" /></button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function ModalActions({ onClose, loading, label, disabled }: { onClose: () => void; loading: boolean; label: string; disabled?: boolean }) {
  return (
    <div className="flex justify-end gap-2 pt-1">
      <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)]">Cancel</button>
      <button type="submit" disabled={loading || disabled} className="rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-60" style={{ background: "var(--color-brand-teal)" }}>
        {loading ? "Saving…" : label}
      </button>
    </div>
  );
}

function Chip({ label, value, colour }: { label: string; value: number; colour?: string }) {
  return (
    <div className="rounded-lg bg-white border border-[var(--color-border)] px-3 py-1.5">
      <p className="text-base font-semibold tabular-nums leading-tight" style={{ color: colour ?? "var(--color-text-primary)" }}>{value}</p>
      <p className="text-xs text-[var(--color-text-muted)] leading-tight">{label}</p>
    </div>
  );
}

const inputCls = "w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:border-[var(--color-brand-teal)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-teal)]/20";