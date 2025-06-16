// app/api/students/view/route.ts

import { NextRequest, NextResponse } from "next/server";
import { firestore } from "@/lib/firebase/firebaseAdmin"; // Adjust path if needed
import { getToken } from "next-auth/jwt";

export async function GET(req: NextRequest) {
  try {
    // 1️⃣ Verify Token from NextAuth
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2️⃣ Get studentId from query params
    const url = new URL(req.url);
    const studentId = url.searchParams.get("studentId");

    if (!studentId) {
      return NextResponse.json(
        { error: "Missing student ID" },
        { status: 400 }
      );
    }

    // 3️⃣ Fetch the User and Student Documents
    const [userDoc, studentDoc] = await Promise.all([
      firestore.collection("users").doc(studentId).get(),
      firestore.collection("students").doc(studentId).get(),
    ]);

    if (!userDoc.exists || !studentDoc.exists) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const userData = userDoc.data();
    const studentData = studentDoc.data();
    let courseData = null;

    if (studentData) {
      const courseDoc = await firestore
        .collection("courses")
        .doc(studentData.courseId)
        .get();
      courseData = courseDoc.data();
    }

    if (!userData || !studentData) {
      return NextResponse.json(
        { error: "Student data is missing or incomplete" },
        { status: 404 }
      );
    }

    if (!courseData) {
      return NextResponse.json(
        { error: "Course data is missing or incomplete" },
        { status: 404 }
      );
    }

    // 4️⃣ Return Full Data for Admin

    return NextResponse.json(
      {
          courseId: courseData.id,
          courseName: courseData.name,
          studentId: studentData.id,
          rollNumber: studentData.rollNumber,
          batchId: studentData.batchId
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
