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

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.split("Bearer ")[1];
    const decoded = await admin.auth().verifyIdToken(token);
    if (decoded.role !== "admin") return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });

    const { courseId, batchId, subjects, startDate, endDate, mentor } = await req.json();

    if (!courseId || !batchId || !startDate || !endDate || !mentor || !subjects) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const semesterRef = admin.firestore().collection("semesterDetails").doc();
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
    return NextResponse.json({ message: "Semester created", semesterDetail }, { status: 201 });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
