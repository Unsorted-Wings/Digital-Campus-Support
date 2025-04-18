// app/api/subjects/delete/route.ts

import { NextRequest, NextResponse } from "next/server";
import { firestore } from "@/lib/firebase/firebaseAdmin"; // Ensure this points to your Firestore admin instance
import { getToken } from "next-auth/jwt";

export async function DELETE(req: NextRequest) {
  try {
    // 1️⃣ Check Authorization Header and Verify Token using NextAuth JWT
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token || token.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Only admins can delete subjects" }, { status: 403 });
    }

    // 2️⃣ Extract Subject ID from Query Params
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing subject ID" }, { status: 400 });
    }

    // 3️⃣ Delete Subject Document from Firestore
    const subjectRef = firestore.collection("subjects").doc(id);
    const subjectSnap = await subjectRef.get();

    if (!subjectSnap.exists) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    // 4️⃣ Delete the subject from Firestore
    await subjectRef.delete();

    return NextResponse.json({ message: "Subject deleted successfully", id }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
