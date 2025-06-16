import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import * as admin from "firebase-admin";

// Initialize Firestore (only)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

export async function DELETE(req: NextRequest) {
  try {
    // 1️⃣ Verify Admin via JWT (NextAuth)
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Only admins can delete users" }, { status: 403 });
    }

    // 2️⃣ Parse Request Body
    const { uid } = await req.json();
    if (!uid) {
      return NextResponse.json({ error: "User ID (uid) is required" }, { status: 400 });
    }

    // 3️⃣ Delete user from Firestore
    await admin.firestore().collection("users").doc(uid).delete();

    return NextResponse.json({ message: "User deleted successfully", userId: uid }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
