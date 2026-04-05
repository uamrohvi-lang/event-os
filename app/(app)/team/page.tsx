import { createClient } from "@/lib/supabase/server";
import { TeamView } from "@/components/team/team-view";

export default async function TeamPage() {
  const supabase = await createClient();

  const { data: people } = await supabase
    .from("people")
    .select("*")
    .order("full_name");

  return <TeamView people={people ?? []} />;
}