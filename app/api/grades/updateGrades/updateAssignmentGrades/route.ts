import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { firestore } from "@/lib/firebase/firebaseAdmin";

export async function PUT(req: NextRequest) {
  try {
    // 🔐 Step 1: Auth check
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (token.role !== "admin" && token.role !== "faculty") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 📦 Step 2: Parse request body
    const { gradeId, subjectId, semesterId, students } = await req.json();

    if (!gradeId || !subjectId || !semesterId || !Array.isArray(students) || students.length === 0) {
      return NextResponse.json({ error: "Missing or invalid required fields" }, { status: 400 });
    }

    // 🔍 Step 3: Get the grade document
    const docRef = firestore.collection("grades").doc(gradeId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: "Grade document not found" }, { status: 404 });
    }

    const gradeData = docSnap.data();

    if (!gradeData) {
      return NextResponse.json({ error: "Grade data not found" }, { status: 404 });
    }

    // 🧠 Step 4: Validate subjectId and semesterId
    if (
      gradeData.subjectId !== subjectId ||
      gradeData.semesterId !== semesterId
    ) {
      return NextResponse.json({ error: "Subject or semester mismatch" }, { status: 400 });
    }

    // 🔄 Step 5: Update matching students
    const updatedStudents = gradeData.students.map((student: any) => {
      const match = students.find((s: any) => s.studentId === student.studentId);
      if (match) {
        return {
          ...student,
          assignments: match.assignment,
        };
      }
      return student;
    });

    // 📝 Step 6: Save updates
    await docRef.update({
      students: updatedStudents,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ message: "Assignment marks updated successfully" }, { status: 200 });

  } catch (error: any) {
    console.error("Error updating assignment marks:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
