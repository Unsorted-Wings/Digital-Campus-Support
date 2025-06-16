// app/api/semesterSubjects/update/route.ts

import { NextRequest, NextResponse } from "next/server";
import { firestore } from "@/lib/firebase/firebaseAdmin"; // Adjust import path if different
import { getToken } from "next-auth/jwt";

export async function PUT(req: NextRequest) {
  try {
    // 1️⃣ Authenticate with NextAuth
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (token.role !== "admin") {
      return NextResponse.json({ error: "Admins only" }, { status: 403 });
    }

    // 2️⃣ Parse request body
    const { id, semesterDetailId, subjectId, teacherId, category } = await req.json();

    if (!id || !semesterDetailId || !subjectId || !teacherId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // 3️⃣ Check if document exists
    const ref = firestore.collection("semesterSubjects").doc(id);
    const doc = await ref.get();

    if (!doc.exists) {
      return NextResponse.json({ error: "SemesterSubject not found" }, { status: 404 });
    }

    // 4️⃣ Update document
    const updateData = {
      semesterDetailId,
      subjectId,
      teacherId,
      category: category || null,
      updatedAt: new Date().toISOString(),
    };

    await ref.update(updateData);

    return NextResponse.json({ message: "SemesterSubject updated", id }, { status: 200 });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
