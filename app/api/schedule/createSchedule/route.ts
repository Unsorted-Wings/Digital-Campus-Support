import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { firestore } from "@/lib/firebase/firebaseAdmin";

export async function POST(req: NextRequest) {
  try {
    // 1️⃣ Authenticate user via NextAuth JWT
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2️⃣ Only admin users can create calendar events
    if (token.role !== "admin" && token.role !== "faculty") {
      return NextResponse.json(
        { error: "Only admin can create calendar events" },
        { status: 403 }
      );
    }

    // 3️⃣ Extract event details from request body
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
      userIds,
    } = await req.json();

    if (!title || !start || allDay === undefined || !status || !visibility) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 4️⃣ Prepare event object
    const id = firestore.collection("calendarEvents").doc().id;
    const now = new Date().toISOString();

    const event = {
      id,
      userIds, // user ID from NextAuth token
      title,
      description: description || "",
      start,
      end: end || "",
      allDay,
      createdBy: token.sub,
      category: category || "other",
      status,
      visibility,
      recurring: recurring || null,
      createdAt: now,
      updatedAt: now,
    };

    // 5️⃣ Save to Firestore
    await firestore.collection("calendarEvents").doc(id).set(event);
    return NextResponse.json({ message: "Event created", id }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
