import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { firestore } from "@/lib/firebase/firebaseAdmin";

export async function PUT(req: NextRequest) {
  try {
    // 1️⃣ Authenticate user via NextAuth JWT
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2️⃣ Only admin users can update calendar events
    if (token.role !== "admin") {
      return NextResponse.json({ error: "Only admin can update calendar events" }, { status: 403 });
    }

    // 3️⃣ Extract event ID and updates from request body
    const { id, ...updates } = await req.json();
    if (!id) return NextResponse.json({ error: "Missing event ID" }, { status: 400 });

    // 4️⃣ Get reference to the calendar event
    const ref = firestore.collection("calendarEvents").doc(id);
    const doc = await ref.get();

    if (!doc.exists) return NextResponse.json({ error: "Event not found" }, { status: 404 });

    // 5️⃣ Update event
    const updatedAt = new Date().toISOString();
    await ref.update({ ...updates, updatedAt });

    return NextResponse.json({ message: "Event updated" }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
