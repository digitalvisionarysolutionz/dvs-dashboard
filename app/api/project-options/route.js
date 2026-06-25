import { NextResponse } from "next/server";
import { createClient } from "../../../utils/supabase/server.js";
import { getCurrentWorkspace } from "../../../lib/workspace.js";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ clients: [] }, { status: 401 });
  }

  const workspace = await getCurrentWorkspace(supabase, user);

  if (!workspace?.organization?.id) {
    return NextResponse.json({ clients: [] }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("clients")
    .select("id, name, business_name")
    .eq("organization_id", workspace.organization.id)
    .order("business_name", { ascending: true });

  if (error) {
    return NextResponse.json({ clients: [] }, { status: 500 });
  }

  const clients = (data || []).map((client) => ({
    id: client.id,
    name: client.business_name || client.name || "Unnamed Client",
  }));

  return NextResponse.json({ clients });
}