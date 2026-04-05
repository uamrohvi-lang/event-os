"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const EVENT_TYPES = [
  { value: "conference",     label: "Conference" },
  { value: "product_launch", label: "Product Launch" },
  { value: "summit",         label: "Summit" },
  { value: "festival",       label: "Festival" },
  { value: "gala",           label: "Gala" },
  { value: "workshop",       label: "Workshop" },
  { value: "other",          label: "Other" },
];

// Phase archetypes per event type
const PHASE_TEMPLATES: Record<string, string[]> = {
  conference:     ["Brief & Scope", "Venue & Suppliers", "Content & Speakers", "Logistics", "Pre-show", "Show Day", "Debrief"],
  product_launch: ["Strategy & Brief", "Creative Development", "Production", "PR & Media", "Event Day", "Post-launch"],
  summit:         ["Planning", "Speaker Curation", "Venue & Logistics", "Pre-summit", "Summit Day", "Follow-up"],
  festival:       ["Concept & Budget", "Talent & Programming", "Production Build", "Rehearsals", "Event Days", "Strike"],
  gala:           ["Brief", "Venue & Theme", "Suppliers", "Pre-event", "Event Night", "Wrap"],
  workshop:       ["Scoping", "Content Design", "Logistics", "Delivery", "Follow-up"],
  other:          ["Planning", "Production", "Delivery", "Debrief"],
};

interface CreateEventModalProps {
  onClose: () => void;
}

export function CreateEventModal({ onClose }: CreateEventModalProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [type, setType] = useState("conference");
  const [venue, setVenue] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const phases = PHASE_TEMPLATES[type] ?? PHASE_TEMPLATES.other;

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("Not authenticated"); setLoading(false); return; }

    const { data: profile } = await supabase
      .from("users")
      .select("organisation_id")
      .eq("id", user.id)
      .single();

    if (!profile?.organisation_id) {
      setError("No organisation found — please contact support");
      setLoading(false);
      return;
    }

    const { data: event, error: eventErr } = await supabase
      .from("events")
      .insert({
        organisation_id: profile.organisation_id,
        name: name.trim(),
        type: type as never,
        venue: venue || null,
        start_date: startDate || null,
        end_date: endDate || null,
        description: description || null,
        created_by: user.id,
      })
      .select()
      .single();

    if (eventErr || !event) {
      setError(eventErr?.message ?? "Failed to create event");
      setLoading(false);
      return;
    }

    // Insert phase template
    const phaseInserts = phases.map((name, idx) => ({
      event_id: event.id,
      name,
      order_index: idx,
    }));
    await supabase.from("phases").insert(phaseInserts);

    router.push(`/events/${event.id}`);
    router.refresh();
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white"
        style={{ boxShadow: "var(--shadow-modal)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
          <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
            New event
          </h2>
          <button
            onClick={onClose}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleCreate} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
              Event name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:border-[var(--color-brand-teal)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-teal)]/20"
              placeholder="Global Tech Summit 2026"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
              Event type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:border-[var(--color-brand-teal)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-teal)]/20 bg-white"
            >
              {EVENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Phase preview */}
          <div className="rounded-lg bg-[var(--color-surface-2)] px-3 py-2.5">
            <p className="text-xs font-medium text-[var(--color-text-muted)] mb-1.5">
              Phases auto-created ({phases.length})
            </p>
            <div className="flex flex-wrap gap-1">
              {phases.map((p, i) => (
                <span
                  key={i}
                  className="rounded-full bg-[var(--color-border)] px-2 py-0.5 text-xs text-[var(--color-text-secondary)]"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
              Venue
            </label>
            <input
              type="text"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:border-[var(--color-brand-teal)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-teal)]/20"
              placeholder="Excel London"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
                Start date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:border-[var(--color-brand-teal)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-teal)]/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
                End date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:border-[var(--color-brand-teal)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-teal)]/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm resize-none focus:border-[var(--color-brand-teal)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-teal)]/20"
              placeholder="Brief overview of the event…"
            />
          </div>

          {error && (
            <p className="text-sm text-[var(--color-signal-red)]">{error}</p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 transition-opacity"
              style={{ background: "var(--color-brand-teal)" }}
            >
              {loading ? "Creating…" : "Create event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
