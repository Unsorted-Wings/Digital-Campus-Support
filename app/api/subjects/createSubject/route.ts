// app/api/subjects/create/route.ts

import { NextRequest, NextResponse } from "next/server";
import { firestore } from "@/lib/firebase/firebaseAdmin"; // Ensure this is pointing to your Firestore admin instance
import { getToken } from "next-auth/jwt";

export async function POST(req: NextRequest) {
  try {
    // 1️⃣ Check Authorization Header and Verify Token using NextAuth JWT
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token || token.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Only admins can create subjects" }, { status: 403 });
    }

    // 2️⃣ Parse Subject Data from Body
    const { name, code, isPractical = false, isTrack = false } = await req.json();
    if (!name || !code) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 3️⃣ Create Subject Document in Firestore
    const subjectRef = firestore.collection("subjects").doc();
    const timestamp = new Date().toISOString();

    const subject = {
      id: subjectRef.id,
      name,
      code,
      isPractical,
      isTrack,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    // 4️⃣ Store Subject in Firestore
    await subjectRef.set(subject);

    return NextResponse.json({ message: "Subject created successfully", subjectId: subjectRef.id }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
