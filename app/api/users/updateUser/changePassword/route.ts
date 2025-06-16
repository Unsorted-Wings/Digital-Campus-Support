import { NextRequest, NextResponse } from "next/server";
import { firestore } from "@/lib/firebase/firebaseAdmin";
import { getToken } from "next-auth/jwt";
import bcrypt from "bcryptjs";

export async function PUT(req: NextRequest) {
  try {
    // 1️⃣ Authenticate the user
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { uid, oldPassword, newPassword, confirmPassword } = await req.json();

    if (!uid || !oldPassword || !newPassword || !confirmPassword) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: "New passwords do not match" }, { status: 400 });
    }

    // 2️⃣ Fetch user from Firestore
    const userDocRef = firestore.collection("users").doc(uid);
    const userSnap = await userDocRef.get();

    if (!userSnap.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData = userSnap.data();

    // 3️⃣ Check if old password matches
    const isMatch = await bcrypt.compare(oldPassword, userData?.password || "");
    if (!isMatch) {
      return NextResponse.json({ error: "Incorrect current password" }, { status: 401 });
    }

    // 4️⃣ Hash new password and update
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await userDocRef.update({
      password: hashedNewPassword,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ message: "Password updated successfully" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
