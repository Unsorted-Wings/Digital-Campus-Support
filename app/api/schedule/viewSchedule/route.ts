import { NextRequest, NextResponse } from "next/server";
import { db, auth } from "@/lib/firebase/firebaseAdmin";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.split("Bearer ")[1];
    const decoded = await auth.verifyIdToken(token);

    if (!decoded.admin) {
      return NextResponse.json({ error: "Only admin can view calendar events" }, { status: 403 });
    }

    const snapshot = await db.collection("calendarEvents").get();
    const events = snapshot.docs.map((doc) => doc.data());

    return NextResponse.json(events, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
