import { NextRequest, NextResponse } from "next/server";
import { db, auth } from "@/lib/firebase/firebaseAdmin";

export async function PUT(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.split("Bearer ")[1];
    const decoded = await auth.verifyIdToken(token);

    if (!decoded.admin) {
      return NextResponse.json({ error: "Only admin can update calendar events" }, { status: 403 });
    }

    const { id, ...updates } = await req.json();
    if (!id) return NextResponse.json({ error: "Missing event ID" }, { status: 400 });

    const ref = db.collection("calendarEvents").doc(id);
    const doc = await ref.get();

    if (!doc.exists) return NextResponse.json({ error: "Event not found" }, { status: 404 });

    const updatedAt = new Date().toISOString();
    await ref.update({ ...updates, updatedAt });

    return NextResponse.json({ message: "Event updated" }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
