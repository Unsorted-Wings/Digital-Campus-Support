import { NextRequest, NextResponse } from "next/server";
import { firestore } from "@/lib/firebase/firebaseAdmin"; 
import { getToken } from "next-auth/jwt";

export async function POST(req: NextRequest) {
  try {
    // 1️⃣ Authenticate via NextAuth
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (token.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    // 2️⃣ Parse and validate body
    const { courseId, batchId, subjects, startDate, endDate, mentor } = await req.json();

    if (!courseId || !batchId || !startDate || !endDate || !mentor || !subjects) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // 3️⃣ Create new semester document
    const semesterRef = firestore.collection("semesterDetails").doc();
    const timestamp = new Date().toISOString();

    const semesterDetail = {
      id: semesterRef.id,
      courseId,
      batchId,
      subjects,
      startDate,
      endDate,
      mentor,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await semesterRef.set(semesterDetail);

    // 4️⃣ Respond with success
    return NextResponse.json({ message: "Semester created", semesterDetail }, { status: 201 });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
