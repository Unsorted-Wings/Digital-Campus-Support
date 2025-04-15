import { NextRequest, NextResponse } from "next/server";
import * as admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

export async function PUT(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.split("Bearer ")[1];
    const decoded = await admin.auth().verifyIdToken(token);
    if (decoded.role !== "admin") return NextResponse.json({ error: "Admins only" }, { status: 403 });

    const { id, semesterDetailId, subjectId, teacherId, category } = await req.json();

    if (!id || !semesterDetailId || !subjectId || !teacherId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const ref = admin.firestore().collection("semesterSubjects").doc(id);
    const doc = await ref.get();
    if (!doc.exists) return NextResponse.json({ error: "SemesterSubject not found" }, { status: 404 });

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
