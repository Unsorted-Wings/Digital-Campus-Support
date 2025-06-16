import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { firestore } from "@/lib/firebase/firebaseAdmin";

export async function POST(req: NextRequest) {
  try {
    // 1️⃣ Authorization Check using NextAuth JWT Token
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { role } = token; // Assuming role is included in the JWT token

    // 2️⃣ Verify that only admins can create exams
    if (role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Only admins can create exams" },
        { status: 403 }
      );
    }

    // 3️⃣ Parse Request Body
    const {
      name,
      courseId,
      batchId,
      semesterId,
      scheduleUrl = "",
      marks = [],
    } = await req.json();

    if (
      !name ||
      !courseId ||
      !batchId ||
      !semesterId ||
      !Array.isArray(marks)
    ) {
      return NextResponse.json(
        { error: "Missing or invalid required fields" },
        { status: 400 }
      );
    }

    // 4️⃣ Prepare Data
    const now = new Date().toISOString();
    const examRef = firestore.collection("exams").doc(); // Assuming you're using Firestore
    const examId = examRef.id;

    const examData = {
      id: examId,
      name,
      courseId,
      batchId,
      semesterId,
      scheduleUrl,
      marks,
      createdAt: now,
      updatedAt: now,
    };

    // 5️⃣ Save Exam Data to Firestore
    await examRef.set(examData);

    return NextResponse.json(
      { message: "Exam created successfully", exam: examData },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
