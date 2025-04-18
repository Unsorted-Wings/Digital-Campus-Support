// app/api/subjects/view/route.ts

import { NextRequest, NextResponse } from "next/server";
import { firestore } from "@/lib/firebase/firebaseAdmin"; // Ensure this points to your Firestore admin instance
import { getToken } from "next-auth/jwt";

export async function GET(req: NextRequest) {
  try {
    // 1️⃣ Check Authorization Header and Verify Token using NextAuth JWT
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token || token.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Only admins can view subjects" }, { status: 403 });
    }

    // 2️⃣ Extract Subject ID from Query Params
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing subject ID" }, { status: 400 });
    }

    // 3️⃣ Fetch Subject from Firestore
    const subjectRef = firestore.collection("subjects").doc(id);
    const subjectSnap = await subjectRef.get();

    if (!subjectSnap.exists) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    // 4️⃣ Return Subject Data
    return NextResponse.json({ subject: subjectSnap.data() }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
