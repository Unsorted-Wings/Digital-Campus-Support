// app/api/subjects/update/route.ts

import { NextRequest, NextResponse } from "next/server";
import { firestore } from "@/lib/firebase/firebaseAdmin"; // Ensure this points to your Firestore admin instance
import { getToken } from "next-auth/jwt";

export async function PUT(req: NextRequest) {
  try {
    // 1️⃣ Check Authorization Header and Verify Token using NextAuth JWT
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token || token.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Only admins can update subjects" }, { status: 403 });
    }

    // 2️⃣ Parse Request Body
    const { id, name, code, isPractical, isTrack } = await req.json();
    if (!id || !name || !code) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 3️⃣ Fetch the Subject Document from Firestore
    const subjectRef = firestore.collection("subjects").doc(id);
    const subjectSnap = await subjectRef.get();

    // 4️⃣ Ensure the Subject Exists
    if (!subjectSnap.exists) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    // 5️⃣ Update the Subject Document
    await subjectRef.update({
      name,
      code,
      isPractical: isPractical ?? false,
      isTrack: isTrack ?? false,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ message: "Subject updated successfully", subjectId: id }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
