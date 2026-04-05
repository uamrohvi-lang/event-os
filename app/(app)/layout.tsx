import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";
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
    .maybeSingle();

  // Self-heal: if the user has no org row (created before the trigger fix),
  // create one now using the admin client.
  let organisationId = profile?.organisation_id ?? null;
  if (!organisationId) {
    const admin = await createAdminClient();

    const orgName =
      user.user_metadata?.org_name ||
      user.email?.split("@")[1] ||
      "My Organisation";

    const { data: newOrg } = await admin
      .from("organisations")
      .insert({ name: orgName })
      .select("id")
      .single();

    if (newOrg) {
      await admin.from("users").upsert({
        id: user.id,
        organisation_id: newOrg.id,
        email: user.email!,
        full_name: user.user_metadata?.full_name || user.email!.split("@")[0],
        role: "owner",
      });
      organisationId = newOrg.id;
    }
  }

  let orgName = "My Organisation";
  if (organisationId) {
    const { data: org } = await supabase
      .from("organisations")
      .select("name")
      .eq("id", organisationId)
      .single();
    orgName = org?.name ?? orgName;
  }

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--bg)" }}>
      <Sidebar orgName={orgName} userEmail={user.email ?? ""} />
      <main style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>{children}</main>
    </div>
  );
}