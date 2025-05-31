import { NextRequest, NextResponse } from "next/server";
import { firestore } from "@/lib/firebase/firebaseAdmin";
import { getToken } from "next-auth/jwt";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // 1️⃣ Authenticate student
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.role !== "student") {
      return NextResponse.json(
        { error: "Unauthorized: Only students can view their reviews" },
        { status: 403 }
      );
    }

    const studentId = token.id;

    // ✅ Correct way to extract query params
    const { searchParams } = new URL(req.url);
    const semesterId = searchParams.get("semesterId");

    if (!semesterId) {
      return NextResponse.json(
        { error: "Missing semesterId in query" },
        { status: 400 }
      );
    }

    // 2️⃣ Query reviews by studentId and semesterId
    const snapshot = await firestore
      .collection("reviews")
      .where("studentId", "==", studentId)
      .where("semesterId", "==", semesterId)
      .get();

    const reviews = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ reviews }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching student reviews:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
