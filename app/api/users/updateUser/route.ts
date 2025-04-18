import { NextRequest, NextResponse } from "next/server";
import { firestore } from "@/lib/firebase/firebaseAdmin";
import { getToken } from "next-auth/jwt";

export async function PUT(req: NextRequest) {
  try {
    // 1️⃣ Check Admin Authorization via NextAuth JWT
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token || token.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Only admins can update users" }, { status: 403 });
    }

    // 2️⃣ Parse Request Body
    const { uid, email, name } = await req.json();
    if (!uid || !email || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 3️⃣ Fetch Existing User Document from Firestore
    const userDoc = firestore.collection("users").doc(uid);
    const userSnapshot = await userDoc.get();

    if (!userSnapshot.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 4️⃣ Update User Data in Firestore
    const updatedUserData = { email, name, updatedAt: new Date().toISOString() };
    await userDoc.update(updatedUserData);

    return NextResponse.json({ message: "User updated successfully", userId: uid }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
