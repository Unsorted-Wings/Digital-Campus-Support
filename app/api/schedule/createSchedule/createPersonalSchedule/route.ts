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

    // 3️⃣ Extract event details from request body
    const { title, description, start, end, recurring, category } =
      await req.json();

    if (!title || !start || !end) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 4️⃣ Prepare event object
    const id = firestore.collection("calendarEvents").doc().id;
    const now = new Date().toISOString();
    const userIds = Array.isArray(token.id) ? token.id : [token.id]; // Ensure userIds is an array

    const event = {
      id,
      userIds: userIds, // user ID from NextAuth token
      title,
      description: description || "",
      start,
      end,
      createdBy: token.id,
      category: category || "other",
      visibility: "private",
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
