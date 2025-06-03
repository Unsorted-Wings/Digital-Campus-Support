// app/api/marks/create/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt"; // Import getToken from NextAuth
import { firestore } from "@/lib/firebase/firebaseAdmin"; // Assuming you have a Firestore connection

export async function POST(req: NextRequest) {
  try {
    // 1️⃣ Verify Admin Authorization with NextAuth JWT token
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2️⃣ Check if the user has the 'admin' or 'faculty' role
    if (token.role !== "admin" && token.role !== "faculty") {
      return NextResponse.json(
        { error: "Forbidden: Only admins or faculty can create marks" },
        { status: 403 }
      );
    }

    // 3️⃣ Parse Request Body
    const { courseId, batchId, subjectId, semesterId, students, category } =
      await req.json();

    if (
      !courseId ||
      !batchId ||
      !semesterId ||
      !subjectId ||
      !category ||
      !Array.isArray(students)
    ) {
      return NextResponse.json(
        { error: "Missing or invalid required fields" },
        { status: 400 }
      );
    }

    // 4️⃣ Create Marks Document in Firestore
    const now = new Date().toISOString();

    const newDocRef = firestore.collection("grades").doc();
    const gradeId = newDocRef.id;
    const gradesData = {
      id: gradeId,
      courseId,
      batchId,
      subjectId,
      semesterId,
      students,
      category,
      createdAt: now,
      updatedAt: now,
    };
    await newDocRef.set(gradesData);

    return NextResponse.json(
      { message: "Marks created successfully", marksId: newDocRef.id },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
