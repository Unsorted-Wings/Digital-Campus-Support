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
    if (decoded.role !== "admin") return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });

    const { id, courseId, batchId, subjects, startDate, endDate, mentor } = await req.json();

    if (!id || !courseId || !batchId || !startDate || !endDate || !mentor || !subjects) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const ref = admin.firestore().collection("semesterDetails").doc(id);
    const doc = await ref.get();
    if (!doc.exists) return NextResponse.json({ error: "Semester not found" }, { status: 404 });

    const updateData = {
      courseId,
      batchId,
      subjects,
      startDate,
      endDate,
      mentor,
      updatedAt: new Date().toISOString(),
    };

    await ref.update(updateData);
    return NextResponse.json({ message: "Semester updated", id }, { status: 200 });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
