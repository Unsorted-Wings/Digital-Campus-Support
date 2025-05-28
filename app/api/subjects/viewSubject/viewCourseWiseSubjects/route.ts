// app/api/subjects/view/route.ts

import { NextRequest, NextResponse } from "next/server";
import { firestore } from "@/lib/firebase/firebaseAdmin";
import { getToken } from "next-auth/jwt";

export async function GET(req: NextRequest) {
  try {
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

    // 📚 Get semesterDetails via semesterSubjects
    const semesterSubjectSnap = await firestore
      .collection("semesterSubjects")
      .where("teacherId", "==", teacherId)
      .get();

    const semesterIds = semesterSubjectSnap.docs.map(
      (doc) => doc.data().semesterDetailId
    );
    const semesterPromises = semesterIds.map((id) =>
      firestore.collection("semesterDetails").doc(id).get()
    );
    const semesterDocs = await Promise.all(semesterPromises);

    const now = new Date();

    // 🧠 Extract semesterDetails within valid date range
    const semesterDetails = semesterDocs
      .filter((doc) => doc.exists)
      .map((doc) => {
        const data = doc.data() as any;
        return { id: doc.id, ...data };
      })
      .filter((sem) => {
        if (!sem.startDate || !sem.endDate) return false;
        const start = new Date(sem.startDate);
        const end = new Date(sem.endDate);
        return now >= start && now <= end;
      });

    // 🔄 Gather all unique courseIds, batchIds, and subjectIds
    const courseIds = Array.from(
      new Set(semesterDetails.map((sem) => sem.courseId))
    );
    const batchIds = Array.from(
      new Set(semesterDetails.map((sem) => sem.batchId))
    );
    const subjectIds = Array.from(
      new Set(semesterDetails.flatMap((sem) => sem.subjects || []))
    );

    const semesterSubjects = semesterSubjectSnap.docs.map((doc) => {
      const data = doc.data() as {
        subjectId?: string;
        semesterDetailId?: string;
      };
      return {
        id: doc.id,
        ...data,
      };
    });

    const semesterSubjectIds = semesterSubjects.map((sub) => ({
      subjectId: sub.subjectId,
      semesterDetailId: sub.semesterDetailId,
    }));
 
    // 🔍 Fetch course details
    const coursePromises = courseIds.map((id) =>
      firestore.collection("courses").doc(id).get()
    );
    const batchPromises = batchIds.map((id) =>
      firestore.collection("batches").doc(id).get()
    );
    const subjectPromises = semesterSubjectIds
      .map((obj) => obj.subjectId)
      .filter((id): id is string => typeof id === "string" && !!id)
      .map((id) => firestore.collection("subjects").doc(id).get());

    const [courseDocs, batchDocs, subjectDocs] = await Promise.all([
      Promise.all(coursePromises),
      Promise.all(batchPromises),
      Promise.all(subjectPromises),
    ]);

    // 🧾 Format details
    const courses = courseDocs
      .filter((doc) => doc.exists)
      .map((doc) => {
        const data = doc.data() as { name?: string }; // Ensure 'name' is present
        return { id: doc.id, ...data };
      });
    const batches = batchDocs
      .filter((doc) => doc.exists)
      .map((doc) => {
        const data = doc.data() as { name?: string };
        return { id: doc.id, ...data };
      });
    const subjects = subjectDocs
      .filter((doc) => doc.exists)
      .map((doc) => {
        const data = doc.data() as { name?: string };
        return { id: doc.id, ...data };
      });

    const formattedData = [];

    for (const semSub of semesterSubjects) {
      const semDetail = semesterDetails.find(
        (sem) => sem.id === semSub.semesterDetailId
      );
      const subject = subjects.find((subj) => subj.id === semSub.subjectId);
      if (!semDetail || !subject) continue;

      const course = courses.find((c) => c.id === semDetail.courseId);
      const batch = batches.find((b) => b.id === semDetail.batchId);
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
