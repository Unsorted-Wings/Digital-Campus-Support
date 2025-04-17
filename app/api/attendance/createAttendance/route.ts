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
    if (decoded.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const {
      courseId,
      batchId,
      semesterId,
      studentId,
      averagePercentage,
      subjects,
    } = await req.json();

    if (!courseId || !batchId || !semesterId || !studentId || !subjects) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const id = admin.firestore().collection("attendances").doc().id;
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

    await admin.firestore().collection("attendances").doc(id).set(attendance);

    return NextResponse.json({ message: "Attendance created", id }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
