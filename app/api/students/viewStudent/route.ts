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

    const requesterId = token.sub; // This is the UID of the authenticated user
    const requesterRole = token.role;

    // 2️⃣ Get studentId from query params
    const url = new URL(req.url);
    const studentId = url.searchParams.get("studentId");

    if (!studentId) {
      return NextResponse.json({ error: "Missing student ID" }, { status: 400 });
    }

    // 3️⃣ Fetch the User and Student Documents
    const [userDoc, studentDoc] = await Promise.all([
      firestore.collection("users").doc(studentId).get(),
      firestore.collection("students").doc(studentId).get()
    ]);

    if (!userDoc.exists || !studentDoc.exists) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const userData = userDoc.data();
    const studentData = studentDoc.data();

    if (!userData || !studentData) {
      return NextResponse.json({ error: "Student data is missing or incomplete" }, { status: 404 });
    }

    // 4️⃣ Return Full Data for Admin
    if (requesterRole === "admin") {
      return NextResponse.json({
        user: {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          role: userData.role,
          profilePicture: userData.profilePicture,
          createdAt: userData.createdAt,
          updatedAt: userData.updatedAt,
        },
        student: {
          id: studentData.id,
          rollNumber: studentData.rollNumber,
          courseId: studentData.course,
          batchId: studentData.batchId,
          description: studentData.description || "",
          isAlumni: studentData.isAlumni ?? false,
          createdAt: studentData.createdAt,
          updatedAt: studentData.updatedAt,
        },
      }, { status: 200 });
    }

    // 5️⃣ Return Partial Data if Student is viewing themselves
    if (requesterId === studentId) {
      return NextResponse.json({
        user: {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          profilePicture: userData.profilePicture,
          createdAt: userData.createdAt,
          updatedAt: userData.updatedAt,
        },
        student: {
          id: studentData.id,
          rollNumber: studentData.rollNumber,
          courseId: studentData.course,
          batchId: studentData.batchId,
          createdAt: studentData.createdAt,
          updatedAt: studentData.updatedAt,
        },
      }, { status: 200 });
    }

    // 6️⃣ Return Public Info for other users
    return NextResponse.json({
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
      },
      student: {
        id: studentData.id,
        rollNumber: studentData.rollNumber,
        courseId: studentData.course,
        batchId: studentData.batchId,
      },
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
