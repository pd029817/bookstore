import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { maskEmail, maskName, maskPhone } from "@/lib/utils";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Mask personal data
  const users = (data || []).map((u) => ({
    ...u,
    email: maskEmail(u.email),
    name: maskName(u.name),
    phone: u.phone ? maskPhone(u.phone) : null,
  }));

  return NextResponse.json({ users });
}
