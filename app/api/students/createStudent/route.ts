// app/api/students/create/route.ts

import { NextRequest, NextResponse } from "next/server";
import { firestore, FieldValue } from "@/lib/firebase/firebaseAdmin";
import bcrypt from "bcryptjs";
import { getToken } from "next-auth/jwt";

export async function POST(req: NextRequest) {
  try {
    // 1️⃣ Authenticate Admin via NextAuth
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token || token.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Only admins can create students" },
        { status: 403 }
      );
    }

    // 2️⃣ Extract request data
    const {
      email,
      name,
      rollNumber,
      courseId,
      batchId,
      description,
      isAlumni,
    } = await req.json();
    if (!email || !name || !rollNumber || !courseId || !batchId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 3️⃣ Generate Firebase-style UUID
    const studentRef = firestore.collection("students").doc();
    const studentId = studentRef.id;

    // 4️⃣ Hash the password
    const password = process.env.DEFAULT_STUDENT_PASSWORD || "Student@1292";
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5️⃣ Create student record
    const timestamp = new Date().toISOString();
    const studentData = {
      id: studentId,
      rollNumber,
      courseId,
      batchId,
      description: description || "",
      isAlumni: isAlumni ?? false,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await studentRef.set(studentData);

    // 6️⃣ Create user record (linked to student)
    const userData = {
      id: studentId,
      email,
      name,
      role: "student",
      password: hashedPassword,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await firestore.collection("users").doc(studentId).set(userData);

    // Add student ID to batch

    const batchRef = firestore.collection("batches").doc(batchId);
    await batchRef.update({
      students: FieldValue.arrayUnion(studentId),
      updatedAt: timestamp,
    });

    return NextResponse.json(
      { message: "Student created successfully", studentId },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
