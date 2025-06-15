import { NextRequest, NextResponse } from "next/server";
import { firestore } from "@/lib/firebase/firebaseAdmin";
import { getToken } from "next-auth/jwt";

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    return NextResponse.json(
      { error: "Forbidden: Only admins and faculty can create notifications" },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId parameter" },
        { status: 400 }
      );
    }

    // Today's date at 00:00:00 in ISO format
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISOString = today.toISOString();

    // Query Firestore
    const snapshot = await firestore
      .collection("notifications")
      .where("userIds", "array-contains", userId)
      .get();

    const notifications = snapshot.docs
      .map((doc) => doc.data())
      .filter((notification) => {
        const notifDate = new Date(notification.date);
        return notifDate >= today;
      });

    return NextResponse.json({ notifications }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
