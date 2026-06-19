import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function POST(request: Request) {
  let body: { email?: string; name?: string; note?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { email, name, note } = body;

  // Validate name
  if (!name || name.trim().length === 0) {
    return NextResponse.json({ error: "name_required" }, { status: 400 });
  }

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return NextResponse.json({ error: "email_invalid" }, { status: 400 });
  }

  // Insert into Supabase
  const { error } = await getSupabase()
    .from("waitlist")
    .insert({ email: email.toLowerCase().trim(), name: name.trim(), note: note?.trim() || null });

  if (error) {
    // Unique constraint violation (email already exists)
    if (error.code === "23505") {
      return NextResponse.json({ error: "already_exists" }, { status: 409 });
    }
    console.error("Supabase insert error:", error);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
