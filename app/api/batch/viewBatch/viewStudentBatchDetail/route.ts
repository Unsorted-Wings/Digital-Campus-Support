import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { firestore } from "@/lib/firebase/firebaseAdmin";

export const dynamic = "force-dynamic";

// Define the expected shape of a batch document
type BatchData = {
  name: string;
  courseId: string;
  [key: string]: any; // allow additional fields
};

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");

    if (!studentId) {
      return NextResponse.json(
        { error: "Missing student ID" },
        { status: 400 }
      );
    }

    const batchSnapshot = await firestore
      .collection("batches")
      .where("students", "array-contains", studentId)
      .limit(1)
      .get();

    if (batchSnapshot.empty) {
      return NextResponse.json(
        { error: "No batch found for this student" },
        { status: 404 }
      );
    }

    const batchDoc = batchSnapshot.docs[0];
    const batchData = batchDoc.data() as BatchData;

    const courseId = batchData.courseId;
    if (!courseId) {
      return NextResponse.json(
        { error: "Course ID missing in batch" },
        { status: 400 }
      );
    }

    const courseDoc = await firestore.collection("courses").doc(courseId).get();

    if (!courseDoc.exists) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const courseData = courseDoc.data();
    const result = {
      batchId: batchDoc.id,
      batchName: batchData.name,
      courseId: courseDoc.id,
      courseName: courseData?.name,
    };

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching batch and course:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
