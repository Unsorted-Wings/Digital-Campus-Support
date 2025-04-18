// app/api/semesterSubjects/create/route.ts

import { NextRequest, NextResponse } from "next/server";
import { firestore } from "@/lib/firebase/firebaseAdmin"; // Adjust path as needed
import { getToken } from "next-auth/jwt";

export async function POST(req: NextRequest) {
  try {
    // 1️⃣ Authenticate with NextAuth
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (token.role !== "admin") {
      return NextResponse.json({ error: "Admins only" }, { status: 403 });
    }

    // 2️⃣ Parse Request Body
    const { semesterDetailId, subjectId, teacherId, category } = await req.json();

    if (!semesterDetailId || !subjectId || !teacherId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 3️⃣ Create Firestore Document
    const docRef = firestore.collection("semesterSubjects").doc();
    const timestamp = new Date().toISOString();

    const data = {
      id: docRef.id,
      semesterDetailId,
      subjectId,
      teacherId,
      category: category || null,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await docRef.set(data);

    return NextResponse.json({ message: "Semester subject created", data }, { status: 201 });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
