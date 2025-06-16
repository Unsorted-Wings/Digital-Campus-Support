import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { firestore } from "@/lib/firebase/firebaseAdmin";

export async function POST(req: NextRequest) {
  try {
    // 🔐 1. Auth Check
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (token.role !== "admin" && token.role !== "faculty") {
      return NextResponse.json(
        { error: "Forbidden: Only admins or faculty can create marks" },
        { status: 403 }
      );
    }

    // 📦 2. Parse Request Body
    const { courseId, batchId, subjectId, semesterId, students, category } =
      await req.json();

    if (
      !courseId ||
      !batchId ||
      !semesterId ||
      !subjectId ||
      !category ||
      !Array.isArray(students)
    ) {
      return NextResponse.json(
        { error: "Missing or invalid required fields" },
        { status: 400 }
      );
    }

    // 🛠️ 3. Prepare Students Array: Set attendance, sessional1, sessional2 to 0
    const processedStudents = students.map((student: any) => ({
      studentId: student.studentId,
      assignments: student.assignment ?? 0, // fallback if undefined
      attendance: 0,
      sessional1: 0,
      sessional2: 0,
    }));

    // 📝 4. Create Document
    const now = new Date().toISOString();
    const newDocRef = firestore.collection("grades").doc();
    const gradeId = newDocRef.id;

    const gradesData = {
      id: gradeId,
      courseId,
      batchId,
      subjectId,
      semesterId,
      students: processedStudents,
      category,
      createdAt: now,
      updatedAt: now,
    };

    await newDocRef.set(gradesData);

    return NextResponse.json(
      { message: "Marks created successfully", marksId: gradeId },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
