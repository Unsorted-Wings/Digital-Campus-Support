import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { firestore } from "@/lib/firebase/firebaseAdmin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // 🔐 Authenticate user
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token || !token.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 📦 Get query parameters
    const { searchParams } = new URL(req.url);
    const batchId = searchParams.get("batchId");
    const subjectId = searchParams.get("subjectId");
    const semesterId = searchParams.get("semesterId");

    if (!batchId || !subjectId || !semesterId) {
      return NextResponse.json(
        { error: "Missing query parameters" },
        { status: 400 }
      );
    }

    // 🔍 Query the grades collection
    const gradesSnapshot = await firestore
      .collection("grades")
      .where("batchId", "==", batchId)
      .where("subjectId", "==", subjectId)
      .where("semesterId", "==", semesterId)
      .get();

    if (gradesSnapshot.empty) {
      return NextResponse.json({ grades: [] }, { status: 200 });
    }

    // Assume only one relevant grade doc
    const gradeDoc = gradesSnapshot.docs[0];
    const gradeData = gradeDoc.data();

    const studentsWithNames = await Promise.all(
      gradeData.students.map(async (student: any) => {
        const userDoc = await firestore
          .collection("users")
          .doc(student.studentId)
          .get();
        const userData = userDoc.exists ? userDoc.data() : { name: "Unknown" };

        return {
          studentId: student.studentId,
          name: userData?.name || "Unknown",
          assignmentGrade: student.assignments || 0,
        };
      })
    );

    const result = {
      gradeId: gradeData.id,
      courseId: gradeData.courseId,
      batchId: gradeData.batchId,
      subjectId: gradeData.subjectId,
      semesterId: gradeData.semesterId,
      students: studentsWithNames,
    };

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("Error retrieving grades:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
