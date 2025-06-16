// app/api/subjects/view/route.ts

import { NextRequest, NextResponse } from "next/server";
import { firestore } from "@/lib/firebase/firebaseAdmin"; // Ensure this points to your Firestore admin instance
import { getToken } from "next-auth/jwt";

export async function GET(req: NextRequest) {
  try {
    // 1️⃣ Check Authorization Header and Verify Token using NextAuth JWT
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    // 2️⃣ Extract Subject ID from Query Params
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");

    if (!studentId) {
      return NextResponse.json(
        { error: "Missing student ID" },
        { status: 400 }
      );
    }

    // 3️⃣ Fetch Subject from Firestore
    const studentRef = firestore.collection("students").doc(studentId);
    const studentSnap = await studentRef.get();

    if (!studentSnap.exists) {
      return NextResponse.json({ error: "student not found" }, { status: 404 });
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

    // 4️⃣ Return Subject Data
    const semesters = semesterSnap.docs.map((doc) => doc.data());
    const semesterIds = semesters.map((semester) => semester.id);

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
    const semesterSubjects = semesterSubjectSnap.docs.map((doc) => doc.data());
    // onst semesterSubjects = semesterSubjectSnap.docs.map((doc) => doc.data());

    // Create sets to store unique IDs (optional if duplicates are okay)
    const subjectIds = new Set<string>();
    const teacherIds = new Set<string>();

    semesterSubjects.forEach((subject) => {
      if (subject.subjectId) subjectIds.add(subject.subjectId);
      if (subject.teacherId) teacherIds.add(subject.teacherId);
    });

    // If you need them as arrays:
    const subjectIdArray = Array.from(subjectIds);
    const teacherIdArray = Array.from(teacherIds);
    const subjectsCollection = firestore.collection("subjects");

    let allSubjects: FirebaseFirestore.DocumentData[] = [];

    // Firestore allows max 10 elements for "in" queries, so we batch
    const BATCH_SIZE = 10;

    for (let i = 0; i < subjectIdArray.length; i += BATCH_SIZE) {
      const batch = subjectIdArray.slice(i, i + BATCH_SIZE);
      const querySnapshot = await subjectsCollection
        .where("id", "in", batch)
        .get();
      const subjects = querySnapshot.docs.map((doc) => doc.data());
      allSubjects = allSubjects.concat(subjects);
    }

    // ✅ allSubjects now contains full subject objects
    const simplifiedSubjects = allSubjects.map((subject) => ({
      id: subject.id,
      name: subject.name,
    }));

    return NextResponse.json({ simplifiedSubjects }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
