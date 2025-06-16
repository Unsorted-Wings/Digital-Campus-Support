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

    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");

    // 2️⃣ Fetch all calendar events from Firestore
    const snapshot = await firestore.collection("calendarEvents").get();
    
    // 3️⃣ Filter events where userId is in event.userIds
    const filteredEvents = snapshot.docs
      .map((doc) => doc.data())
      .filter((event) => Array.isArray(event.userIds) && event.userIds.includes(userId));
      console.log("Filtered Events:", filteredEvents);

    return NextResponse.json(filteredEvents, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
