import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/shell/sidebar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch user profile
  const { data: profile } = await supabase
    .from("users")
    .select("full_name, organisation_id")
    .eq("id", user.id)
    .single();

  let orgName = "My Organisation";
  if (profile?.organisation_id) {
    const { data: org } = await supabase
      .from("organisations")
      .select("name")
      .eq("id", profile.organisation_id)
      .single();
    orgName = org?.name ?? orgName;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-surface-2)]">
      <Sidebar
        orgName={orgName}
        userEmail={user.email ?? ""}
      />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
