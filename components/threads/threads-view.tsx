"use client";

import { useState } from "react";
import { ThreadPanel } from "./thread-panel";

type ThreadWithDetails = {
  id: string;
  title: string;
  status: string;
  urgency_level?: string;
  ai_escalate?: boolean | null;
  last_entry_at?: string | null;
  owner?: { id: string; full_name: string; department?: string | null } | null;
  entries?: { id: string; content: string; created_at: string; ai_urgency?: string | null; ai_escalate?: boolean | null }[];
};

const STATUS_STYLE: Record<string, { border: string; dot: string; badge: string; badgeColor: string; cls: string }> = {
  open:     { border: "var(--green)", dot: "var(--dot-green)",  badge: "var(--green-l)", badgeColor: "var(--green)", cls: "In progress" },
  waiting:  { border: "var(--dot-amber)", dot: "var(--dot-amber)", badge: "var(--amber-l)", badgeColor: "var(--amber)", cls: "Waiting" },
  blocked:  { border: "var(--dot-red)", dot: "var(--dot-red)", badge: "var(--red-l)", badgeColor: "var(--red)", cls: "Blocked" },
  resolved: { border: "var(--t3)", dot: "var(--t3)", badge: "var(--bg)", badgeColor: "var(--t3)", cls: "Resolved" },
};

interface ThreadsViewProps {
  threads: ThreadWithDetails[];
  people: { id: string; full_name: string; department?: string | null }[];
  eventId?: string;
}

export function ThreadsView({ threads: initialThreads, people, eventId }: ThreadsViewProps) {
  const [threads, setThreads] = useState(initialThreads);
  const [selected, setSelected] = useState<ThreadWithDetails | null>(null);
  const [showNew, setShowNew] = useState(false);

  if (selected) {
    return (
      <ThreadPanel
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        thread={selected as any}
        people={people}
        onBack={() => setSelected(null)}
      />
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Topbar */}
      <div style={{
        height: 54, background: "var(--surface)", borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", padding: "0 24px", gap: 12, flexShrink: 0,
      }}>
        <span style={{ fontSize: 15, fontWeight: 600 }}>Activity Threads</span>
        <span style={{ fontSize: 12, color: "var(--t3)" }}>{threads.length} threads</span>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
          <button className="btn btn-primary btn-sm" onClick={() => setShowNew(true)}>+ New thread</button>
          <div className="av">SR</div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1 }}>
        {threads.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "var(--t3)" }}>
            <div style={{ fontSize: 13, marginBottom: 12 }}>No activity threads yet</div>
            <button className="btn btn-primary btn-sm" onClick={() => setShowNew(true)}>+ Create first thread</button>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
              {threads.map((thread) => {
                const s = STATUS_STYLE[thread.status] ?? STATUS_STYLE.open;
                const lastEntry = thread.entries?.[thread.entries.length - 1];
                const isResolved = thread.status === "resolved";
                return (
                  <div
                    key={thread.id}
                    onClick={() => setSelected(thread)}
                    style={{
                      background: "var(--surface)", borderRadius: 11,
                      border: "1px solid var(--border)",
                      borderLeft: `3px solid ${s.border}`,
                      padding: "14px 16px", cursor: "pointer",
                      opacity: isResolved ? 0.6 : 1,
                      transition: "border-color 0.15s",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <div className={thread.status === "blocked" ? "pulse" : ""} style={{
                        width: 8, height: 8, borderRadius: "50%", background: s.dot, flexShrink: 0,
                      }} />
                      <span style={{ fontSize: 13, fontWeight: 600, flex: 1, color: "var(--t1)" }}>{thread.title}</span>
                      <span style={{ fontSize: 11, fontWeight: 500, padding: "3px 8px", borderRadius: 20, background: s.badge, color: s.badgeColor }}>
                        {s.cls}
                      </span>
                      {thread.ai_escalate && (
                        <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 20, background: "var(--amber-l)", color: "var(--amber)" }}>
                          AI: Critical
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--t3)", marginBottom: 6 }}>
                      {thread.owner?.full_name ? `Owner: ${thread.owner.full_name}` : ""}
                      {thread.urgency_level ? ` · ${thread.urgency_level}` : ""}
                    </div>
                    {lastEntry && (
                      <div style={{ fontSize: 12, color: "var(--t2)", fontStyle: "italic", lineHeight: 1.5 }}>
                        &ldquo;{lastEntry.content}&rdquo;
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Quick log input */}
            <QuickLogArea eventId={eventId} onCreated={(t) => setThreads((prev) => [t, ...prev])} people={people} />
          </>
        )}
      </div>

      {showNew && (
        <NewThreadModal
          eventId={eventId}
          people={people}
          onClose={() => setShowNew(false)}
          onCreated={(t) => { setThreads((prev) => [t, ...prev]); setShowNew(false); }}
        />
      )}
    </div>
  );
}

function QuickLogArea({ eventId, onCreated, people }: {
  eventId?: string;
  onCreated: (t: ThreadWithDetails) => void;
  people: { id: string; full_name: string }[];
}) {
  const [text, setText] = useState("");
  const [status, setStatus] = useState("open");
  const [loading, setLoading] = useState(false);

  async function handleLog() {
    if (!text.trim() || !eventId) return;
    setLoading(true);
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    const { data: t } = await supabase
      .from("activity_threads")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .insert({ event_id: eventId, title: text.slice(0, 80), status } as any)
      .select()
      .single();
    if (t) onCreated(t as ThreadWithDetails);
    setText("");
    setLoading(false);
  }

  return (
    <div style={{ background: "var(--surface)", borderRadius: 11, border: "1px solid var(--border)", padding: 14 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "var(--t3)", textTransform: "uppercase", letterSpacing: 0.7, marginBottom: 8 }}>
        Log new activity thread
      </div>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Log a call, email, meeting, update… (15 seconds)"
        onKeyDown={(e) => e.key === "Enter" && handleLog()}
      />
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8 }}>
        <select style={{ width: 160, flexShrink: 0 }} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="open">Status: In progress</option>
          <option value="waiting">Waiting</option>
          <option value="blocked">Blocked</option>
          <option value="resolved">Resolved</option>
        </select>
        <button
          className="btn btn-primary btn-sm"
          style={{ marginLeft: "auto" }}
          onClick={handleLog}
          disabled={!text.trim() || loading}
        >
          Log entry
        </button>
      </div>
    </div>
  );
}

function NewThreadModal({ eventId, people, onClose, onCreated }: {
  eventId?: string;
  people: { id: string; full_name: string }[];
  onClose: () => void;
  onCreated: (t: ThreadWithDetails) => void;
}) {
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("open");
  const [ownerId, setOwnerId] = useState("");
  const [firstEntry, setFirstEntry] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !eventId) return;
    setLoading(true);
    setError(null);
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    const { data: thread, error: err } = await supabase
      .from("activity_threads")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .insert({ event_id: eventId, title: title.trim(), status, owner_id: ownerId || undefined } as any)
      .select("*, owner:people(id, full_name, department)")
      .single();
    if (err || !thread) { setError(err?.message ?? "Failed"); setLoading(false); return; }
    if (firstEntry.trim()) {
      await supabase.from("thread_entries").insert({ thread_id: thread.id, content: firstEntry.trim() });
    }
    onCreated(thread as ThreadWithDetails);
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div className="modal-title" style={{ marginBottom: 0 }}>New activity thread</div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--t3)", fontSize: 18 }}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Thread title *</label>
            <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. StageCo — rigging spec sign-off" />
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="open">In progress</option>
              <option value="waiting">Waiting</option>
              <option value="blocked">Blocked</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Owner</label>
            <select value={ownerId} onChange={(e) => setOwnerId(e.target.value)}>
              <option value="">— Unassigned —</option>
              {people.map((p) => <option key={p.id} value={p.id}>{p.full_name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">First log entry (optional)</label>
            <textarea
              value={firstEntry}
              onChange={(e) => setFirstEntry(e.target.value)}
              placeholder="What happened? What action was taken?"
              style={{ minHeight: 72, resize: "vertical" }}
            />
          </div>
          {error && <p style={{ color: "var(--red)", fontSize: 13, marginBottom: 12 }}>{error}</p>}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button type="button" onClick={onClose} className="btn btn-out">Cancel</button>
            <button type="submit" disabled={loading || !title.trim()} className="btn btn-primary">
              {loading ? "Creating…" : "Create thread"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}