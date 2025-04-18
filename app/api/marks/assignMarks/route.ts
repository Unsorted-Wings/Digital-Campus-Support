// app/api/marks/create/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt"; // Import getToken from NextAuth
import { firestore } from "@/lib/firebase/firebaseAdmin"; // Assuming you have a Firestore connection

export async function POST(req: NextRequest) {
  try {
    // 1️⃣ Verify Admin Authorization with NextAuth JWT token
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2️⃣ Check if the user has the 'admin' role
    if (token.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Only admins can create marks" },
        { status: 403 }
      );
    }

    // 3️⃣ Parse Request Body
    const { studentId, examId, subjects } = await req.json();

    if (!studentId || !examId || !subjects || !Array.isArray(subjects)) {
      return NextResponse.json(
        { error: "Missing or invalid required fields" },
        { status: 400 }
      );
    }

    // 4️⃣ Create Marks Document in Firestore
    const now = new Date().toISOString();
    const marksDoc = {
      studentId,
      examId,
      subjects,
      createdAt: now,
      updatedAt: now,
    };

    const newDocRef = await firestore.collection("marks").add(marksDoc);

    return NextResponse.json(
      { message: "Marks created successfully", marksId: newDocRef.id },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
