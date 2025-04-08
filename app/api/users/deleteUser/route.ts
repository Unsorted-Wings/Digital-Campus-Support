import { NextRequest, NextResponse } from "next/server";
import * as admin from "firebase-admin";

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
    // 1️⃣ Check Authorization Header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.split("Bearer ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 2️⃣ Verify Admin Token
    const decodedToken = await admin.auth().verifyIdToken(token);
    if (decodedToken.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Only admins can delete users" }, { status: 403 });
    }

    // 3️⃣ Parse Request Body
    const { uid } = await req.json();
    if (!uid) {
      return NextResponse.json({ error: "User ID (uid) is required" }, { status: 400 });
    }

    // 4️⃣ Delete User from Firebase Authentication
    await admin.auth().deleteUser(uid);

    // 5️⃣ Delete User from Firestore
    await admin.firestore().collection("users").doc(uid).delete();

    return NextResponse.json({ message: "User deleted successfully", userId: uid }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
