import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { email, password, fullName, orgName } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    const supabase = await createAdminClient();

    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // skip email confirmation for local dev
      user_metadata: { full_name: fullName, org_name: orgName },
    });

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: authError?.message ?? "Failed to create user" },
        { status: 400 }
      );
    }

    const userId = authData.user.id;

    // 2. Create organisation
    const { data: org, error: orgError } = await supabase
      .from("organisations")
      .insert({ name: orgName || email.split("@")[1] || "My Organisation" })
      .select("id")
      .single();

    if (orgError || !org) {
      // Clean up auth user if org creation fails
      await supabase.auth.admin.deleteUser(userId);
      return NextResponse.json(
        { error: orgError?.message ?? "Failed to create organisation" },
        { status: 500 }
      );
    }

    // 3. Create user profile row
    const { error: profileError } = await supabase
      .from("users")
      .upsert({
        id: userId,
        organisation_id: org.id,
        email,
        full_name: fullName || email.split("@")[0],
        role: "owner",
      });

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message },
        { status: 500 }
      );
    }

    // 4. Sign the user in (create a session)
    const { data: session, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError || !session.session) {
      return NextResponse.json({ error: "Account created — please sign in" }, { status: 200 });
    }

    return NextResponse.json({
      access_token: session.session.access_token,
      refresh_token: session.session.refresh_token,
    });
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}