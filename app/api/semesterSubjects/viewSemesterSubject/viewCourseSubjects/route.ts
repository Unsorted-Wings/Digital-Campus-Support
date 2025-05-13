import { NextRequest, NextResponse } from "next/server";
import { firestore } from "@/lib/firebase/firebaseAdmin";
import { getToken } from "next-auth/jwt";

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");

    if (!studentId) {
      return NextResponse.json(
        { error: "Missing student ID" },
        { status: 400 }
      );
    }

    const studentRef = firestore.collection("students").doc(studentId);
    const studentSnap = await studentRef.get();

    if (!studentSnap.exists) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const batchId = studentSnap.data()?.batchId;
    if (!batchId) {
      return NextResponse.json(
        { error: "Batch ID not found" },
        { status: 404 }
      );
    }

    const semesterSnap = await firestore
      .collection("semesterDetails")
      .where("batchId", "==", batchId)
      .limit(1)
      .get();

    if (semesterSnap.empty) {
      return NextResponse.json(
        { error: "No semester found for this batch" },
        { status: 404 }
      );
    }

    const semesters = semesterSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const semesterIds = semesters.map((s) => s.id);

    const semesterSubjectSnap = await firestore
      .collection("semesterSubjects")
      .where("semesterDetailId", "in", semesterIds)
      .get();

    if (semesterSubjectSnap.empty) {
      return NextResponse.json(
        { error: "No subjects found for this semester" },
        { status: 404 }
      );
    }

    const semesterSubjects = await Promise.all(
      semesterSubjectSnap.docs.map(async (doc) => {
        const data = doc.data();
        const subjectId = data.subjectId;
        const teacherId = data.teacherId;

        const [subjectSnap, teacherSnap] = await Promise.all([
          firestore.collection("subjects").doc(subjectId).get(),
          firestore.collection("users").doc(teacherId).get(),
        ]);

        const subjectName = subjectSnap.exists
          ? subjectSnap.data()?.name
          : "Unknown Subject";
        const teacherName = teacherSnap.exists
          ? teacherSnap.data()?.name
          : "Unknown Faculty";

        return {
          id: doc.id,
          subjectId: data.subjectId,
          teacherId: data.teacherId,
          subjectName,
          teacherName,
        };
      })
    );
    const simplifiedSubjects = semesterSubjects.map((item) => ({
      subjectId: item.subjectId,
      subjectName: item.subjectName,
      teacherId: item.teacherId,
      teacherName: item.teacherName,
    }));

    return NextResponse.json(simplifiedSubjects, { status: 200 });

    // const dataToSend =
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
