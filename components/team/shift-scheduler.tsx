"use client";

import { useState } from "react";
import { Plus, AlertTriangle, Clock, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn, DEPT_COLOURS, initials, formatTime } from "@/lib/utils";

type PersonRow = { id: string; full_name: string; department: string | null };
type EventRow  = { id: string; name: string; start_date: string | null; end_date: string | null };
type ShiftRow  = {
  id: string;
  person_id: string;
  event_id: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  role_note: string | null;
  department: string | null;
};
type ClashRow = {
  id: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  role_note: string | null;
  event_id: string;
};

const DEPTS = ["stage", "av", "hospitality", "security", "media", "ops", "production", "other"] as const;

interface ShiftSchedulerProps {
  people: PersonRow[];
  events: EventRow[];
}

export function ShiftScheduler({ people, events }: ShiftSchedulerProps) {
  const [selectedEvent, setSelectedEvent] = useState<string>(events[0]?.id ?? "");
  const [shifts, setShifts] = useState<ShiftRow[]>([]);
  const [loadingShifts, setLoadingShifts] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  async function loadShifts(eventId: string) {
    if (!eventId) return;
    setLoadingShifts(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("shifts")
      .select("*")
      .eq("event_id", eventId)
      .order("shift_date")
      .order("start_time");
    setShifts(data ?? []);
    setLoadingShifts(false);
  }

  function handleEventChange(id: string) {
    setSelectedEvent(id);
    loadShifts(id);
  }

  function handleShiftAdded(shift: ShiftRow) {
    setShifts((prev) => [...prev, shift].sort((a, b) =>
      a.shift_date.localeCompare(b.shift_date) || a.start_time.localeCompare(b.start_time)
    ));
    setShowAdd(false);
  }

  async function handleDelete(shiftId: string) {
    const supabase = createClient();
    await supabase.from("shifts").delete().eq("id", shiftId);
    setShifts((prev) => prev.filter((s) => s.id !== shiftId));
  }

  // Group shifts by date
  const byDate: Record<string, ShiftRow[]> = {};
  shifts.forEach((s) => {
    byDate[s.shift_date] = [...(byDate[s.shift_date] ?? []), s];
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Topbar */}
      <div style={{
        height: 54, background: "var(--surface)", borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", padding: "0 24px", gap: 12, flexShrink: 0,
      }}>
        <span style={{ fontSize: 15, fontWeight: 600 }}>Shift Scheduler</span>
        <span style={{ fontSize: 12, color: "var(--t3)" }}>
          {shifts.length} shift{shifts.length !== 1 ? "s" : ""} scheduled
        </span>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
          <select
            value={selectedEvent}
            onChange={(e) => handleEventChange(e.target.value)}
            style={{ width: "auto" }}
          >
            <option value="">— Select event —</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>{ev.name}</option>
            ))}
          </select>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowAdd(true)}
            disabled={!selectedEvent}
          >
            + Add shift
          </button>
          <div className="av">SR</div>
        </div>
      </div>
      <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1 }}>
      {/* legacy header placeholder removed */}

      {/* Shift grid */}
      {loadingShifts ? (
        <div className="text-sm text-[var(--color-text-muted)] py-8 text-center">Loading shifts…</div>
      ) : Object.keys(byDate).length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[var(--color-border)] py-16 text-center">
          <Clock className="h-8 w-8 text-[var(--color-border-strong)] mb-2" />
          <p className="text-sm text-[var(--color-text-muted)]">
            {selectedEvent ? "No shifts yet — add the first one" : "Select an event to view shifts"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(byDate).map(([date, dayShifts]) => (
            <div key={date}>
              <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
                {new Date(date).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
              </p>
              <div className="space-y-2">
                {dayShifts.map((shift) => {
                  const person = people.find((p) => p.id === shift.person_id);
                  const deptColour = (shift.department ?? person?.department)
                    ? DEPT_COLOURS[shift.department ?? person?.department ?? ""]
                    : "var(--color-signal-grey)";
                  return (
                    <div
                      key={shift.id}
                      className="flex items-center gap-3 rounded-xl bg-white border border-[var(--color-border)] px-4 py-3"
                    >
                      <span
                        className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0"
                        style={{ background: deptColour }}
                      >
                        {person ? initials(person.full_name) : "?"}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--color-text-primary)]">
                          {person?.full_name ?? "Unknown"}
                        </p>
                        {shift.role_note && (
                          <p className="text-xs text-[var(--color-text-muted)] truncate">{shift.role_note}</p>
                        )}
                      </div>
                      <span className="text-sm tabular-nums text-[var(--color-text-secondary)]">
                        {formatTime(shift.start_time)} — {formatTime(shift.end_time)}
                      </span>
                      <button
                        onClick={() => handleDelete(shift.id)}
                        className="text-[var(--color-text-muted)] hover:text-[var(--color-signal-red)] transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd && selectedEvent && (
        <AddShiftModal
          eventId={selectedEvent}
          people={people}
          onClose={() => setShowAdd(false)}
          onAdded={handleShiftAdded}
        />
      )}
      </div>
    </div>
  );
}

function AddShiftModal({
  eventId,
  people,
  onClose,
  onAdded,
}: {
  eventId: string;
  people: PersonRow[];
  onClose: () => void;
  onAdded: (s: ShiftRow) => void;
}) {
  const [personId, setPersonId] = useState(people[0]?.id ?? "");
  const [shiftDate, setShiftDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [roleNote, setRoleNote] = useState("");
  const [department, setDepartment] = useState("");
  const [clashes, setClashes] = useState<ClashRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingClash, setCheckingClash] = useState(false);

  async function checkClash(pId: string, date: string, start: string, end: string) {
    if (!pId || !date || !start || !end || start >= end) { setClashes([]); return; }
    setCheckingClash(true);
    const supabase = createClient();
    const { data } = await supabase
      .rpc("get_shift_clashes", {
        p_person_id: pId,
        p_shift_date: date,
        p_start_time: start,
        p_end_time: end,
        p_exclude_id: undefined,
      });
    setClashes((data as ClashRow[]) ?? []);
    setCheckingClash(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!personId || !shiftDate || !startTime || !endTime) return;
    if (startTime >= endTime) { setError("End time must be after start time"); return; }
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data: shift, error: err } = await supabase
      .from("shifts")
      .insert({
        event_id: eventId,
        person_id: personId,
        shift_date: shiftDate,
        start_time: startTime,
        end_time: endTime,
        role_note: roleNote || null,
        department: (department as never) || null,
      })
      .select()
      .single();

    if (err || !shift) {
      setError(err?.message ?? "Failed to add shift");
      setLoading(false);
      return;
    }

    onAdded(shift as ShiftRow);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md rounded-2xl bg-white" style={{ boxShadow: "var(--shadow-modal)" }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
          <h2 className="text-base font-semibold text-[var(--color-text-primary)]">Add shift</h2>
          <button onClick={onClose} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Person */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">Person *</label>
            <select
              required
              value={personId}
              onChange={(e) => { setPersonId(e.target.value); checkClash(e.target.value, shiftDate, startTime, endTime); }}
              className={inputCls + " bg-white"}
            >
              {people.map((p) => <option key={p.id} value={p.id}>{p.full_name}</option>)}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">Date *</label>
            <input
              type="date"
              required
              value={shiftDate}
              onChange={(e) => { setShiftDate(e.target.value); checkClash(personId, e.target.value, startTime, endTime); }}
              className={inputCls}
            />
          </div>

          {/* Times */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">Start *</label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => { setStartTime(e.target.value); checkClash(personId, shiftDate, e.target.value, endTime); }}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">End *</label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => { setEndTime(e.target.value); checkClash(personId, shiftDate, startTime, e.target.value); }}
                className={inputCls}
              />
            </div>
          </div>

          {/* Clash warning */}
          {clashes.length > 0 && (
            <div className="rounded-lg bg-[var(--color-signal-amber)]/10 border border-[var(--color-signal-amber)]/30 px-3 py-2.5">
              <div className="flex items-center gap-1.5 mb-1">
                <AlertTriangle className="h-3.5 w-3.5 text-[var(--color-signal-amber)]" />
                <span className="text-xs font-semibold text-[var(--color-signal-amber)]">
                  {clashes.length} scheduling clash{clashes.length > 1 ? "es" : ""}
                </span>
              </div>
              {clashes.map((c) => (
                <p key={c.id} className="text-xs text-[var(--color-text-secondary)]">
                  {formatTime(c.start_time)} — {formatTime(c.end_time)}{c.role_note ? ` · ${c.role_note}` : ""}
                </p>
              ))}
            </div>
          )}
          {checkingClash && (
            <p className="text-xs text-[var(--color-text-muted)]">Checking for clashes…</p>
          )}

          {/* Role note */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">Role note</label>
            <input
              type="text"
              value={roleNote}
              onChange={(e) => setRoleNote(e.target.value)}
              className={inputCls}
              placeholder="Stage Manager — Main Stage"
            />
          </div>

          {/* Department override */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">Department</label>
            <select value={department} onChange={(e) => setDepartment(e.target.value)} className={inputCls + " bg-white"}>
              <option value="">— Inherit from person —</option>
              {DEPTS.map((d) => <option key={d} value={d} className="capitalize">{d}</option>)}
            </select>
          </div>

          {error && <p className="text-sm text-[var(--color-signal-red)]">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)]">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !personId || !shiftDate}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-60",
                clashes.length > 0 ? "bg-[var(--color-signal-amber)]" : ""
              )}
              style={clashes.length === 0 ? { background: "var(--color-brand-teal)" } : undefined}
            >
              {loading ? "Adding…" : clashes.length > 0 ? "Add anyway" : "Add shift"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:border-[var(--color-brand-teal)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-teal)]/20";