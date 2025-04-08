import { NextRequest, NextResponse } from "next/server";
import { db, auth } from "@/lib/firebase/firebaseAdmin"

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.split("Bearer ")[1];
    const decoded = await auth.verifyIdToken(token);

    if (!decoded.admin) {
      return NextResponse.json({ error: "Only admin can create calendar events" }, { status: 403 });
    }

    const {
      title,
      description,
      start,
      end,
      allDay,
      category,
      status,
      visibility,
      recurring,
    } = await req.json();

    if (!title || !start || allDay === undefined || !status || !visibility) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const id = db.collection("calendarEvents").doc().id;
    const now = new Date().toISOString();

    const event = {
      id,
      userId: decoded.uid,
      title,
      description: description || "",
      start,
      end: end || "",
      allDay,
      createdBy: decoded.uid,
      category: category || "other",
      status,
      visibility,
      recurring: recurring || null,
      createdAt: now,
      updatedAt: now,
    };

    await db.collection("calendarEvents").doc(id).set(event);
    return NextResponse.json({ message: "Event created", id }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
