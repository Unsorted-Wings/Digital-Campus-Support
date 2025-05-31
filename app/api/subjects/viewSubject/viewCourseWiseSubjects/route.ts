import { NextRequest, NextResponse } from "next/server";
import { firestore } from "@/lib/firebase/firebaseAdmin";
import { getToken } from "next-auth/jwt";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // 🔐 Auth check
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const teacherId = searchParams.get("teacherId");
    if (!teacherId) {
      return NextResponse.json(
        { message: "Missing teacherId" },
        { status: 400 }
      );
    }

    // 📘 Get semesterSubjects for teacher
    const semesterSubjectSnap = await firestore
      .collection("semesterSubjects")
      .where("teacherId", "==", teacherId)
      .get();

    const semesterSubjects = semesterSubjectSnap.docs.map((doc) => {
      const data = doc.data() as {
        subjectId?: string;
        semesterDetailId?: string;
      };
      return { id: doc.id, ...data };
    });

    const semesterIds = semesterSubjects
      .map((s) => s.semesterDetailId)
      .filter((id): id is string => typeof id === "string" && !!id);

    const semesterDocs = await Promise.all(
      semesterIds.map((id) =>
        firestore.collection("semesterDetails").doc(id).get()
      )
    );

    const now = new Date();

    const semesterDetails = semesterDocs
      .filter((doc) => doc.exists)
      .map((doc) => {
        const data = doc.data() as {
          startDate?: string;
          endDate?: string;
          courseId?: string;
          batchId?: string;
          subjects?: string[];
        };
        return { id: doc.id, ...data };
      })
      .filter((sem) => {
        if (!sem.startDate || !sem.endDate) return false;
        const start = new Date(sem.startDate);
        const end = new Date(sem.endDate);
        return now >= start && now <= end;
      });

    const courseIds = Array.from(
      new Set(semesterDetails.map((s) => s.courseId).filter(Boolean))
    );
    const batchIds = Array.from(
      new Set(semesterDetails.map((s) => s.batchId).filter(Boolean))
    );
    const subjectIds = Array.from(
      new Set(semesterSubjects.map((s) => s.subjectId).filter(Boolean))
    );

    const [courseDocs, batchDocs, subjectDocs] = await Promise.all([
      Promise.all(
        courseIds.map((id) => firestore.collection("courses").doc(id!).get())
      ),
      Promise.all(
        batchIds.map((id) => firestore.collection("batches").doc(id!).get())
      ),
      Promise.all(
        subjectIds.map((id) => firestore.collection("subjects").doc(id!).get())
      ),
    ]);

    const courses = courseDocs
      .filter((doc) => doc.exists)
      .map((doc) => ({ id: doc.id, ...(doc.data() as { name?: string }) }));

    const batches = batchDocs
      .filter((doc) => doc.exists)
      .map((doc) => ({ id: doc.id, ...(doc.data() as { name?: string }) }));

    const subjects = subjectDocs
      .filter((doc) => doc.exists)
      .map((doc) => ({ id: doc.id, ...(doc.data() as { name?: string }) }));

    const formattedData: {
      courseId: string;
      courseName?: string;
      batchId: string;
      batchName?: string;
      subjectId: string;
      subjectName?: string;
    }[] = [];

    for (const semSub of semesterSubjects) {
      if (!semSub.semesterDetailId || !semSub.subjectId) continue;

      const sem = semesterDetails.find((s) => s.id === semSub.semesterDetailId);
      const subject = subjects.find((sub) => sub.id === semSub.subjectId);
      if (!sem || !subject || !sem.courseId || !sem.batchId) continue;

      const course = courses.find((c) => c.id === sem.courseId);
      const batch = batches.find((b) => b.id === sem.batchId);
      if (!course || !batch) continue;

      formattedData.push({
        courseId: course.id,
        courseName: course.name,
        batchId: batch.id,
        batchName: batch.name,
        subjectId: subject.id,
        subjectName: subject.name,
      });
    }

    return NextResponse.json(formattedData, { status: 200 });
  } catch (error) {
    console.error("Error fetching semester details:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
