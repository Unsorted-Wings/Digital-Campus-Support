import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { firestore } from "@/lib/firebase/firebaseAdmin";

export async function GET(req: NextRequest) {
  try {
    // 1️⃣ Authorization Check
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2️⃣ Get `studentId` from query params
    const url = new URL(req.url);
    const studentId = url.searchParams.get("studentId");

    if (!studentId) {
      return NextResponse.json(
        { error: "Missing student ID" },
        { status: 400 }
      );
    }

    // 3️⃣ Query batches where students array contains studentId
    const snapshot = await firestore
      .collection("batches")
      .where("students", "array-contains", studentId)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return NextResponse.json(
        { error: "No batch found for this student" },
        { status: 404 }
      );
    }

    const doc = snapshot.docs[0];
    const batch = { id: doc.id, ...(doc.data() as any) };

    // 4️⃣ Fetch course data using courseId from batch
    const courseId = batch.courseId;
    const courseRef = firestore.collection("courses").doc(courseId);
    const courseDoc = await courseRef.get();

    if (!courseDoc.exists) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const courseData = courseDoc.data();
    const course = { id: courseDoc.id, ...(courseData || {}) };

    // 5️⃣ Merge and return batch + course
    const result = {
      batchId: batch.id,
      batchName: batch.name,
      courseId: courseData?.id,
      courseName: courseData?.name,
    };

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching batch and course:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
