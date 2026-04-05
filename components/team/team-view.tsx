"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Person } from "@/types/database";

const DEPARTMENTS = ["stage", "av", "hospitality", "security", "media", "ops", "production", "other"] as const;

const DEPT_PILL: Record<string, { bg: string; color: string; label: string }> = {
  stage:       { bg: "#E1F5EE", color: "#085041", label: "Stage" },
  av:          { bg: "#EEEDFE", color: "#3C3489", label: "AV" },
  hospitality: { bg: "#FAEEDA", color: "#633806", label: "Hospitality" },
  security:    { bg: "#E6F1FB", color: "#0C447C", label: "Security" },
  media:       { bg: "#FCF0EB", color: "#7A2E0C", label: "Media" },
  ops:         { bg: "#EAF3DE", color: "#27500A", label: "Ops" },
  production:  { bg: "#E1F5EE", color: "#085041", label: "Production" },
  other:       { bg: "#F3F4F6", color: "#374151", label: "Other" },
};

const AV_COLORS = [
  { bg: "#FAECE7", color: "#712B13" },
  { bg: "#E6F1FB", color: "#0C447C" },
  { bg: "#E1F5EE", color: "#085041" },
  { bg: "#EEEDFE", color: "#3C3489" },
  { bg: "#FAEEDA", color: "#633806" },
  { bg: "#EAF3DE", color: "#27500A" },
];

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

function getAvatarColor(name: string) {
  const idx = name.charCodeAt(0) % AV_COLORS.length;
  return AV_COLORS[idx];
}

interface TeamViewProps {
  people: Person[];
}

const TABS = ["All people", "Production", "External crew", "Unassigned (8)"];

export function TeamView({ people: initialPeople }: TeamViewProps) {
  const [people, setPeople] = useState(initialPeople);
  const [showAdd, setShowAdd] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("all");

  const filtered = people.filter((p) => {
    const matchSearch = !search || p.full_name.toLowerCase().includes(search.toLowerCase());
    const matchDept = filterDept === "all" || p.department === filterDept;
    return matchSearch && matchDept;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Topbar */}
      <div style={{
        height: 54, background: "var(--surface)", borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", padding: "0 24px", gap: 12, flexShrink: 0,
      }}>
        <span style={{ fontSize: 15, fontWeight: 600 }}>People Database</span>
        <span style={{ fontSize: 12, color: "var(--t3)" }}>{people.length} people</span>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
          <button className="btn btn-out btn-sm">Export</button>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>+ Add person</button>
          <div className="av">SR</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {TABS.map((tab, i) => (
          <div key={tab} className={`tab${activeTab === i ? " active" : ""}`} onClick={() => setActiveTab(i)}>
            {tab}
          </div>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1 }}>
        {/* Filters */}
        <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
          <input
            type="text"
            placeholder="Search by name, role, or department…"
            style={{ maxWidth: 320 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select style={{ width: 160 }} value={filterDept} onChange={(e) => setFilterDept(e.target.value)}>
            <option value="all">All departments</option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d} style={{ textTransform: "capitalize" }}>{d}</option>
            ))}
          </select>
          <select style={{ width: 140 }}>
            <option>All tiers</option>
            <option>Tier A</option>
            <option>Tier B</option>
            <option>Tier C</option>
          </select>
        </div>

        {/* Table */}
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 0", color: "var(--t3)", fontSize: 13 }}>
              {people.length === 0 ? (
                <>
                  <div>No people added yet</div>
                  <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }} onClick={() => setShowAdd(true)}>
                    + Add first person
                  </button>
                </>
              ) : "No results match your search"}
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Accreditation</th>
                  <th>Shift today</th>
                  <th>Workload</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((person) => {
                  const dept = person.department ? DEPT_PILL[person.department] : null;
                  const av = getAvatarColor(person.full_name);
                  return (
                    <tr key={person.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                          <div style={{
                            width: 30, height: 30, borderRadius: "50%",
                            background: av.bg, color: av.color,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 11, fontWeight: 600, flexShrink: 0,
                          }}>
                            {getInitials(person.full_name)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 500 }}>{person.full_name}</div>
                            {person.email && (
                              <div style={{ fontSize: 11, color: "var(--t3)" }}>{person.email}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>{person.role ?? "—"}</td>
                      <td>
                        {dept ? (
                          <span className="dept" style={{ background: dept.bg, color: dept.color }}>{dept.label}</span>
                        ) : "—"}
                      </td>
                      <td>
                        <span className="badge badge-grey">Unassigned</span>
                      </td>
                      <td style={{ fontSize: 12, color: "var(--t3)" }}>—</td>
                      <td>
                        <span className="badge badge-grey">—</span>
                      </td>
                      <td>
                        <button className="btn btn-out btn-sm">View</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showAdd && (
        <AddPersonModal
          onClose={() => setShowAdd(false)}
          onAdded={(p) => {
            setPeople((prev) => [...prev, p]);
            setShowAdd(false);
          }}
        />
      )}
    </div>
  );
}

function AddPersonModal({ onClose, onAdded }: { onClose: () => void; onAdded: (p: Person) => void }) {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
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

    const { data: profile } = await supabase.from("users").select("organisation_id").eq("id", user.id).single();
    if (!profile?.organisation_id) { setError("No organisation found"); setLoading(false); return; }

    const { data: person, error: err } = await supabase
      .from("people")
      .insert({
        organisation_id: profile.organisation_id,
        full_name: fullName.trim(),
        role: role || null,
        email: email || null,
        department: (department as never) || null,
        is_external: isExternal,
      })
      .select()
      .single();

    if (err || !person) { setError(err?.message ?? "Failed"); setLoading(false); return; }
    onAdded(person);
    router.refresh();
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div className="modal-title" style={{ marginBottom: 0 }}>Add team member</div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--t3)", fontSize: 18 }}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full name *</label>
            <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Alex Johnson" />
          </div>
          <div className="form-group">
            <label className="form-label">Role</label>
            <input type="text" value={role} onChange={(e) => setRole(e.target.value)} placeholder="Stage Manager" />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="alex@company.com" />
          </div>
          <div className="form-group">
            <label className="form-label">Department</label>
            <select value={department} onChange={(e) => setDepartment(e.target.value)}>
              <option value="">— None —</option>
              {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, marginBottom: 20 }}>
            <input type="checkbox" checked={isExternal} onChange={(e) => setIsExternal(e.target.checked)} />
            External contractor / vendor
          </label>

          {error && <p style={{ color: "var(--red)", fontSize: 13, marginBottom: 12 }}>{error}</p>}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button type="button" onClick={onClose} className="btn btn-out">Cancel</button>
            <button type="submit" disabled={loading || !fullName.trim()} className="btn btn-primary">
              {loading ? "Adding…" : "Add person"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}