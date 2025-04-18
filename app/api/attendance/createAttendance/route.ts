import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt"; 
import { firestore } from "@/lib/firebase/firebaseAdmin"; 

export async function POST(req: NextRequest) {
  try {
    // 1️⃣ Authorization Check using NextAuth JWT Token
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { role } = token; // Assuming the role is included in the JWT token

    // 2️⃣ Verify that only admins can create attendance
    if (role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 3️⃣ Parse request body
    const {
      courseId,
      batchId,
      semesterId,
      studentId,
      averagePercentage,
      subjects,
    } = await req.json();

    // 4️⃣ Check for required fields
    if (!courseId || !batchId || !semesterId || !studentId || !subjects) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 5️⃣ Create a new attendance document
    const id = firestore.collection("attendances").doc().id;
    const attendance = {
      id,
      courseId,
      batchId,
      semesterId,
      studentId,
      averagePercentage,
      subjects,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await firestore.collection("attendances").doc(id).set(attendance);

    return NextResponse.json({ message: "Attendance created", id }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
