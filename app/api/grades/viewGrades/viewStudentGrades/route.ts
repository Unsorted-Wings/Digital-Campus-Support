import { NextRequest, NextResponse } from "next/server";
import { firestore } from "@/lib/firebase/firebaseAdmin";
import { FieldPath } from "firebase-admin/firestore";
import { getToken } from "next-auth/jwt";

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token || !token.email || !token.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const studentId = token.id;
  const semesterId = searchParams.get("semesterId");

  if (!studentId || !semesterId) {
    return NextResponse.json(
      { error: "Missing studentId or semesterId" },
      { status: 400 }
    );
  }

  try {
    const gradesRef = firestore.collection("grades");
    const snapshot = await gradesRef
      .where("semesterId", "==", semesterId)
      .get();

    const matchedGrades: any[] = [];

    // Collect grades for the student
    snapshot.forEach((doc) => {
      const data = doc.data();
      const student = data.students.find((s: any) => s.studentId === studentId);
      if (student) {
        matchedGrades.push({
          ...student,
          subjectId: data.subjectId,
          category: data.category,
          courseId: data.courseId,
          batchId: data.batchId,
          semesterId: data.semesterId,
        });
      }
    });

    if (matchedGrades.length === 0) {
      return NextResponse.json({ error: "Grades not found" }, { status: 404 });
    }

    // Extract unique subjectIds
    const subjectIds = Array.from(
      new Set(matchedGrades.map((grade) => grade.subjectId))
    );

    // Fetch subject names
    const subjectsSnapshot = await firestore
      .collection("subjects")
      .where(FieldPath.documentId(), "in", subjectIds)
      .get();

    const subjectNameMap: Record<string, string> = {};
    subjectsSnapshot.forEach((doc) => {
      const data = doc.data();
      subjectNameMap[doc.id] = data.name || "Unknown Subject";
    });

    // Append subjectName to each grade
    const gradesData = matchedGrades.map((gradeData) => ({
      ...gradeData,
      subjectName: subjectNameMap[gradeData.subjectId] || "Unknown Subject",
    }));

    return NextResponse.json(gradesData, { status: 200 });
  } catch (error) {
    console.error("Error fetching grades:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
