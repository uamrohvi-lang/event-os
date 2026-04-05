"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface SidebarProps {
  orgName: string;
  userEmail: string;
  activeEventName?: string;
  activeEventDaysTo?: number | null;
}

const DASHBOARD_ICON = (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
    <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M2 6h12" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

const WORKLOAD_ICON = (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
    <path d="M2 4h12M2 8h8M2 12h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const PEOPLE_ICON = (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="6" r="3" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M2 13c0-2.2 2.7-4 6-4s6 1.8 6 4" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

const SHIFTS_ICON = (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
    <rect x="2" y="4" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M5 4V3M11 4V3" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

const VENDOR_ICON = (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
    <path d="M3 3h10l1 5H2L3 3z" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="6" cy="12" r="1.5" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="11" cy="12" r="1.5" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

const RUNSHEET_ICON = (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
    <path d="M2 4h12M2 8h8M2 12h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const ZONES_ICON = (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
    <path d="M13 6c0 4-5 8-5 8S3 10 3 6a5 5 0 0110 0z" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="8" cy="6" r="1.5" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

const STANDUP_ICON = (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
    <path d="M8 2v4l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

const BRIEFING_ICON = (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
    <path d="M13 2H3a1 1 0 00-1 1v10a1 1 0 001 1h10a1 1 0 001-1V3a1 1 0 00-1-1z" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M5 6h6M5 9h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const NAV_SECTIONS = [
  {
    label: "Events",
    items: [
      { label: "Dashboard", href: "/", icon: DASHBOARD_ICON, exact: true },
    ],
  },
  {
    label: "Module 1",
    items: [
      { label: "Workload", href: "/workload", icon: WORKLOAD_ICON },
      { label: "People", href: "/team", icon: PEOPLE_ICON },
      { label: "Shifts", href: "/team/shifts", icon: SHIFTS_ICON },
      { label: "Standup", href: "/standup", icon: STANDUP_ICON },
      { label: "Briefing", href: "/briefing", icon: BRIEFING_ICON },
    ],
  },
  {
    label: "Module 2",
    items: [
      { label: "Vendors", href: "/vendors", icon: VENDOR_ICON },
    ],
  },
  {
    label: "Module 3",
    items: [
      { label: "Runsheet", href: "/runsheet", icon: RUNSHEET_ICON },
    ],
  },
  {
    label: "Module 4",
    items: [
      { label: "Zones", href: "/zones", icon: ZONES_ICON },
    ],
  },
];

export function Sidebar({ orgName, userEmail, activeEventName, activeEventDaysTo }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  const initials = userEmail.slice(0, 2).toUpperCase();

  return (
    <aside style={{
      width: 220,
      background: "var(--navy)",
      flexShrink: 0,
      display: "flex",
      flexDirection: "column",
      height: "100vh",
    }}>
      {/* Logo */}
      <div style={{
        padding: "20px 16px 14px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        borderBottom: "1px solid rgba(255,255,255,0.07)",
      }}>
        <div style={{
          width: 32, height: 32,
          background: "var(--teal)",
          borderRadius: 8,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 13, fontWeight: 700, color: "#fff",
        }}>EO</div>
        <span style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>EventOS</span>
      </div>

      {/* Nav sections */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <div style={{
              padding: "16px 14px 6px",
              fontSize: 10, fontWeight: 600,
              color: "rgba(255,255,255,0.3)",
              textTransform: "uppercase", letterSpacing: 1,
            }}>
              {section.label}
            </div>
            {section.items.map((item) => {
              const active = isActive(item.href, (item as { exact?: boolean }).exact);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: "flex", alignItems: "center", gap: 9,
                    padding: "7px 10px", margin: "1px 8px",
                    borderRadius: 7,
                    color: active ? "#fff" : "rgba(255,255,255,0.6)",
                    fontSize: 13,
                    fontWeight: active ? 500 : 400,
                    background: active ? "rgba(255,255,255,0.11)" : "transparent",
                    textDecoration: "none",
                    transition: "background 0.12s, color 0.12s",
                  }}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Active event card */}
      <div style={{
        margin: "10px 10px 10px",
        background: "rgba(255,255,255,0.06)",
        borderRadius: 9,
        padding: "11px 12px",
        border: "1px solid rgba(255,255,255,0.07)",
      }}>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 3 }}>
          Active event
        </div>
        <div style={{ fontSize: 12, color: "#fff", fontWeight: 500 }}>
          {activeEventName ?? orgName}
        </div>
        {activeEventDaysTo != null && (
          <div style={{ fontSize: 11, color: "var(--teal-l)", marginTop: 2 }}>
            ● {activeEventDaysTo} days to show day
          </div>
        )}
      </div>

      {/* User footer / sign out */}
      <div
        onClick={handleSignOut}
        style={{
          padding: "10px 12px 14px",
          borderTop: "1px solid rgba(255,255,255,0.07)",
          display: "flex",
          alignItems: "center",
          gap: 9,
          cursor: "pointer",
        }}
        title="Sign out"
      >
        <div className="av" style={{ width: 26, height: 26, fontSize: 10 }}>{initials}</div>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {userEmail}
        </span>
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" style={{ color: "rgba(255,255,255,0.35)", flexShrink: 0 }}>
          <path d="M10 8H3M6 5l-3 3 3 3M13 3v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>
    </aside>
  );
}