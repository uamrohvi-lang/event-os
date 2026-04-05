import { createClient } from "@/lib/supabase/server";
import { WorkloadDashboard } from "@/components/workload/workload-dashboard";

export default async function WorkloadPage() {
  const supabase = await createClient();

  // Get people with their thread counts
  const { data: people } = await supabase
    .from("people")
    .select(`
      id, full_name, role, department,
      threads:activity_threads!owner_id(id, status, urgency_level)
    `)
    .order("full_name");

  return (
    <div className="p-6">
      <WorkloadDashboard people={people ?? []} />
    </div>
  );
}
