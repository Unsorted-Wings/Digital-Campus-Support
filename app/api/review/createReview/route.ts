import { NextRequest, NextResponse } from "next/server";
import { firestore } from "@/lib/firebase/firebaseAdmin";
import { getToken } from "next-auth/jwt";

export async function POST(req: NextRequest) {
  try {
    // 1️⃣ Verify Student Token using NextAuth (JWT)
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token || token.role !== "student") {
      return NextResponse.json(
        { error: "Forbidden: Only students can submit reviews" },
        { status: 403 }
      );
    }

    // 2️⃣ Parse Request Body
    const {
      facultyId,
      courseId,
      subjectId,
      batchId,
      semesterId,
      teachingStyle,
      cooperation,
      clarity,
      engagement,
      supportiveness,
    } = await req.json();

    if (
      !facultyId ||
      !courseId ||
      !subjectId ||
      !batchId ||
      !semesterId ||
      teachingStyle == null ||
      cooperation == null ||
      clarity == null ||
      engagement == null ||
      supportiveness == null
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 3️⃣ Create Firestore doc with auto-ID
    const now = new Date().toISOString();
    const reviewRef = firestore.collection("reviews").doc(); // auto-ID
    const reviewData = {
      id: reviewRef.id,
      studentId: token.id,
      facultyId,
      courseId,
      subjectId,
      semesterId,
      teachingStyle,
      cooperation,
      clarity,
      engagement,
      supportiveness,
      createdAt: now,
      updatedAt: now,
    };

    // 4️⃣ Save to Firestore
    await reviewRef.set(reviewData);

    // 5️⃣ Return Success
    return NextResponse.json(
      { message: "Review submitted successfully", reviewId: reviewRef.id },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Review creation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
