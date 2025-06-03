// app/api/marks/view/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt"; // Import getToken from NextAuth
import { firestore } from "@/lib/firebase/firebaseAdmin"; // Assuming you have Firestore connected

export async function GET(req: NextRequest) {
  try {
    // 1️⃣ Verify Admin Authorization with NextAuth JWT token
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2️⃣ Check if the user has the 'admin' role
    if (token.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Only admins can view marks" },
        { status: 403 }
      );
    }

    // 3️⃣ Optionally filter by studentId (query param)
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");
    const examId = searchParams.get("examId");

    let marksQuery: FirebaseFirestore.Query = firestore.collection("marks");
    if (studentId) {
      marksQuery = marksQuery.where("studentId", "==", studentId);
    }

    if (examId) {
      marksQuery = marksQuery.where("examId", "==", examId);
    }

    const snapshot = await marksQuery.get();
    const marks = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json({ marks }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
