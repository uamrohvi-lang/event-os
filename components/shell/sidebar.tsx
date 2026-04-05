"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  Users,
  MessageSquare,
  BarChart2,
  CheckSquare,
  ClipboardList,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const NAV_ITEMS = [
  { label: "Events",     href: "/",         icon: CalendarDays },
  { label: "Activity",   href: "/threads",   icon: MessageSquare },
  { label: "Workload",   href: "/workload",  icon: BarChart2 },
  { label: "Tasks",      href: "/tasks",     icon: CheckSquare },
  { label: "Team",       href: "/team",      icon: Users },
  { label: "Standup",    href: "/standup",   icon: ClipboardList },
];

interface SidebarProps {
  orgName: string;
  userEmail: string;
  eventName?: string;
}

export function Sidebar({ orgName, userEmail, eventName }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside
      className="flex h-screen w-56 flex-col border-r border-[var(--color-border)] bg-white"
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-[var(--color-border)]">
        <span
          className="h-7 w-7 rounded-md flex items-center justify-center text-white text-xs font-bold shrink-0"
          style={{ background: "var(--color-brand-navy)" }}
        >
          E
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate leading-tight">
            Event OS
          </p>
          <p className="text-xs text-[var(--color-text-muted)] truncate leading-tight">
            {orgName}
          </p>
        </div>
      </div>

      {/* Event switcher */}
      {eventName && (
        <div className="px-3 py-2 border-b border-[var(--color-border)]">
          <button className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-[var(--color-surface-2)] transition-colors">
            <CalendarDays className="h-3.5 w-3.5 text-[var(--color-text-muted)] shrink-0" />
            <span className="flex-1 truncate text-left text-[var(--color-text-primary)] font-medium text-xs">
              {eventName}
            </span>
            <ChevronDown className="h-3 w-3 text-[var(--color-text-muted)] shrink-0" />
          </button>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-[var(--color-brand-teal)]/10 text-[var(--color-brand-teal)]"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text-primary)]"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0",
                  isActive ? "text-[var(--color-brand-teal)]" : "text-[var(--color-text-muted)]"
                )}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="border-t border-[var(--color-border)] px-3 py-3">
        <div className="flex items-center gap-2">
          <span
            className="h-7 w-7 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0"
            style={{ background: "var(--color-brand-purple)" }}
          >
            {userEmail[0]?.toUpperCase()}
          </span>
          <p className="flex-1 text-xs text-[var(--color-text-secondary)] truncate">
            {userEmail}
          </p>
          <button
            onClick={handleSignOut}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-signal-red)] transition-colors"
            title="Sign out"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
