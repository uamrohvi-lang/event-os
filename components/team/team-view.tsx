"use client";

import { useState } from "react";
import { Plus, Users, Mail, Phone } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn, initials, DEPT_COLOURS } from "@/lib/utils";
import type { Person } from "@/types/database";

const DEPARTMENTS = ["stage", "av", "hospitality", "security", "media", "ops", "production", "other"] as const;

interface TeamViewProps {
  people: Person[];
}

export function TeamView({ people: initialPeople }: TeamViewProps) {
  const [people, setPeople] = useState(initialPeople);
  const [showAdd, setShowAdd] = useState(false);
  const [filterDept, setFilterDept] = useState<string>("all");

  const filtered = filterDept === "all"
    ? people
    : people.filter((p) => p.department === filterDept);

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">Team</h1>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 tabular-nums">
            {people.length} member{people.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-white"
          style={{ background: "var(--color-brand-teal)" }}
        >
          <Plus className="h-4 w-4" />
          Add person
        </button>
      </div>

      {/* Dept filter */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        <button
          onClick={() => setFilterDept("all")}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium transition-colors",
            filterDept === "all"
              ? "bg-[var(--color-brand-navy)] text-white"
              : "bg-[var(--color-surface-3)] text-[var(--color-text-secondary)]"
          )}
        >
          All
        </button>
        {DEPARTMENTS.map((dept) => (
          <button
            key={dept}
            onClick={() => setFilterDept(dept)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors",
              filterDept === dept ? "text-white" : "bg-[var(--color-surface-3)] text-[var(--color-text-secondary)]"
            )}
            style={filterDept === dept ? { background: DEPT_COLOURS[dept] } : undefined}
          >
            {dept}
          </button>
        ))}
      </div>

      {/* People grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[var(--color-border)] py-16 text-center">
          <Users className="h-10 w-10 text-[var(--color-border-strong)] mb-3" />
          <p className="text-sm text-[var(--color-text-muted)]">No people found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map((person) => (
            <PersonCard key={person.id} person={person} />
          ))}
        </div>
      )}

      {/* Add person modal */}
      {showAdd && (
        <AddPersonModal
          onClose={() => setShowAdd(false)}
          onAdded={(p) => {
            setPeople((prev) => [...prev, p]);
            setShowAdd(false);
          }}
        />
      )}
    </>
  );
}

function PersonCard({ person }: { person: Person }) {
  const deptColour = person.department
    ? DEPT_COLOURS[person.department]
    : "var(--color-signal-grey)";

  return (
    <div className="rounded-xl bg-white border border-[var(--color-border)] p-4">
      <div className="flex items-center gap-3 mb-3">
        <span
          className="h-9 w-9 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0"
          style={{ background: deptColour }}
        >
          {initials(person.full_name)}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
            {person.full_name}
          </p>
          {person.role && (
            <p className="text-xs text-[var(--color-text-muted)] truncate">{person.role}</p>
          )}
        </div>
      </div>

      {person.department && (
        <span
          className="inline-block rounded-full px-2 py-0.5 text-xs font-medium text-white capitalize mb-2"
          style={{ background: deptColour }}
        >
          {person.department}
        </span>
      )}

      <div className="space-y-1 mt-2">
        {person.email && (
          <a
            href={`mailto:${person.email}`}
            className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-brand-teal)] transition-colors"
          >
            <Mail className="h-3 w-3 shrink-0" />
            <span className="truncate">{person.email}</span>
          </a>
        )}
        {person.phone && (
          <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
            <Phone className="h-3 w-3 shrink-0" />
            <span>{person.phone}</span>
          </div>
        )}
      </div>

      {person.is_external && (
        <span className="mt-2 inline-block text-[10px] bg-[var(--color-surface-3)] text-[var(--color-text-muted)] rounded-full px-2 py-0.5">
          External
        </span>
      )}
    </div>
  );
}

function AddPersonModal({
  onClose,
  onAdded,
}: {
  onClose: () => void;
  onAdded: (p: Person) => void;
}) {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState<string>("");
  const [isExternal, setIsExternal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim()) return;
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
      setError("No organisation found");
      setLoading(false);
      return;
    }

    const { data: person, error: err } = await supabase
      .from("people")
      .insert({
        organisation_id: profile.organisation_id,
        full_name: fullName.trim(),
        role: role || null,
        email: email || null,
        phone: phone || null,
        department: (department as never) || null,
        is_external: isExternal,
      })
      .select()
      .single();

    if (err || !person) {
      setError(err?.message ?? "Failed to add person");
      setLoading(false);
      return;
    }

    onAdded(person);
    router.refresh();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md rounded-2xl bg-white" style={{ boxShadow: "var(--shadow-modal)" }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
          <h2 className="text-base font-semibold text-[var(--color-text-primary)]">Add team member</h2>
          <button onClick={onClose} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <Field label="Full name *">
            <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputCls} placeholder="Alex Johnson" />
          </Field>
          <Field label="Role">
            <input type="text" value={role} onChange={(e) => setRole(e.target.value)} className={inputCls} placeholder="Stage Manager" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Email">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} placeholder="alex@company.com" />
            </Field>
            <Field label="Phone">
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} placeholder="+44 7700 000000" />
            </Field>
          </div>
          <Field label="Department">
            <select value={department} onChange={(e) => setDepartment(e.target.value)} className={cn(inputCls, "bg-white")}>
              <option value="">— None —</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d} className="capitalize">{d}</option>
              ))}
            </select>
          </Field>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={isExternal} onChange={(e) => setIsExternal(e.target.checked)} className="rounded" />
            <span className="text-sm text-[var(--color-text-secondary)]">External contractor / vendor</span>
          </label>

          {error && <p className="text-sm text-[var(--color-signal-red)]">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)]">Cancel</button>
            <button type="submit" disabled={loading || !fullName.trim()} className="rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-60" style={{ background: "var(--color-brand-teal)" }}>
              {loading ? "Adding…" : "Add person"}
            </button>
          </div>
        </form>
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

const inputCls =
  "w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:border-[var(--color-brand-teal)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-teal)]/20";
