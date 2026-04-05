import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

// Called automatically if the logged-in user has no organisation_id.
// Creates the missing org + user profile rows on the fly.
export async function POST() {
  const supabase = await createClient();
  const admin = await createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  // Check if profile already exists with an org
  const { data: existing } = await supabase
    .from("users")
    .select("organisation_id")
    .eq("id", user.id)
    .maybeSingle();

  if (existing?.organisation_id) {
    return NextResponse.json({ ok: true, already_fixed: true });
  }

  // Create org
  const orgName =
    user.user_metadata?.org_name ||
    user.email?.split("@")[1] ||
    "My Organisation";

  const { data: org, error: orgErr } = await admin
    .from("organisations")
    .insert({ name: orgName })
    .select("id")
    .single();

  if (orgErr || !org) {
    return NextResponse.json({ error: orgErr?.message }, { status: 500 });
  }

  // Upsert user profile
  const { error: profileErr } = await admin.from("users").upsert({
    id: user.id,
    organisation_id: org.id,
    email: user.email!,
    full_name: user.user_metadata?.full_name || user.email!.split("@")[0],
    role: "owner",
  });

  if (profileErr) {
    return NextResponse.json({ error: profileErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}