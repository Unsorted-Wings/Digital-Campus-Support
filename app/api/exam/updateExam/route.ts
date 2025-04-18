import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt"; // Import NextAuth JWT token handler
import { firestore } from "@/lib/firebase/firebaseAdmin"; // Assuming you're using Firestore for data storage

export async function PUT(req: NextRequest) {
  try {
    // 1️⃣ Authorization Check using NextAuth JWT Token
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { role } = token; // Assuming role is included in the JWT token

    // 2️⃣ Verify that only admins can update exams
    if (role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Only admins can update exams" },
        { status: 403 }
      );
    }

    // 3️⃣ Parse Request Body
    const { id, name, courseId, batchId, semesterId, scheduleUrl, marks } =
      await req.json();

    if (!id) {
      return NextResponse.json({ error: "Missing exam ID" }, { status: 400 });
    }

    // 4️⃣ Reference and Update Exam Document
    const examRef = firestore.collection("exams").doc(id); // Assuming Firestore as the database
    const doc = await examRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    const updatedData: any = {
      updatedAt: new Date().toISOString(),
    };

    if (name) updatedData.name = name;
    if (courseId) updatedData.courseId = courseId;
    if (batchId) updatedData.batchId = batchId;
    if (semesterId) updatedData.semesterId = semesterId;
    if (scheduleUrl) updatedData.scheduleUrl = scheduleUrl;
    if (marks && Array.isArray(marks)) updatedData.marks = marks;

    await examRef.update(updatedData);

    return NextResponse.json({ message: "Exam updated successfully", examId: id }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
