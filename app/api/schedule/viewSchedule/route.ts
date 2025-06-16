import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { firestore } from "@/lib/firebase/firebaseAdmin";

export async function GET(req: NextRequest) {
  try {
    // 1️⃣ Authenticate user via NextAuth JWT
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2️⃣ Only admin users can view calendar events
    if (token.role !== "admin") {
      return NextResponse.json({ error: "Only admin can view calendar events" }, { status: 403 });
    }

    // 3️⃣ Fetch all calendar events from Firestore
    const snapshot = await firestore.collection("calendarEvents").get();
    const events = snapshot.docs.map((doc) => doc.data());

    return NextResponse.json(events, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
