import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt"; // Import NextAuth's JWT token handler
import { firestore } from "@/lib/firebase/firebaseAdmin"; // Assuming you're using Firestore for data storage

export async function GET(req: NextRequest) {
  try {
    // 1️⃣ Authorization Check using NextAuth JWT Token
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { role } = token; // Assuming role is included in the JWT token

    // 2️⃣ Verify that only admins can view exams
    if (role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Only admins can view exams" },
        { status: 403 }
      );
    }

    // 3️⃣ Fetch All Exams
    const examsSnapshot = await firestore.collection("exams").get();
    const exams = examsSnapshot.docs.map(doc => doc.data());

    return NextResponse.json({ exams }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
