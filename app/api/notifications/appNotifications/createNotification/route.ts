import { NextRequest, NextResponse } from "next/server";
import { firestore } from "@/lib/firebase/firebaseAdmin";
import { getToken } from "next-auth/jwt";

export async function POST(req: NextRequest) {
  try {
    // 1️⃣ Verify Admin Token using NextAuth (JWT)
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token || (token.role !== "admin" && token.role !== "faculty")) {
      return NextResponse.json(
        { error: "Forbidden: Only admins and faculty can create notifications" },
        { status: 403 }
      );
    }

    // 2️⃣ Parse Request Body
    const { userIds, title, description, type, sentBy, date } = await req.json();

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0 ||
        !title || !description || !type || !sentBy || !date) {
      return NextResponse.json(
        { error: "Missing or invalid required fields" },
        { status: 400 }
      );
    }

    // 3️⃣ Create Notification in Firestore
    const newNotificationRef = firestore.collection("notifications").doc();
    const now = new Date().toISOString();

    const notification = {
      id: newNotificationRef.id,
      userIds,
      title,
      description,
      type,
      sentBy,
      date,
      createdAt: now,
      updatedAt: now,
    };

    await newNotificationRef.set(notification);

    // 4️⃣ Return Success Response
    return NextResponse.json(
      { message: "Notification created successfully", notificationId: newNotificationRef.id },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
