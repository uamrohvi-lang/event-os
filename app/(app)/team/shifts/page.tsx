import { createClient } from "@/lib/supabase/server";
import { ShiftScheduler } from "@/components/team/shift-scheduler";

export default async function ShiftsPage() {
  const supabase = await createClient();

  const [{ data: people }, { data: events }] = await Promise.all([
    supabase.from("people").select("id, full_name, department").order("full_name"),
    supabase.from("events").select("id, name, start_date, end_date").order("start_date", { ascending: false }),
  ]);

  return <ShiftScheduler people={people ?? []} events={events ?? []} />;
}