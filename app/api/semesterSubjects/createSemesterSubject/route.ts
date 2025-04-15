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
    if (decoded.role !== "admin") return NextResponse.json({ error: "Admins only" }, { status: 403 });

    const { semesterDetailId, subjectId, teacherId, category } = await req.json();

    if (!semesterDetailId || !subjectId || !teacherId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const docRef = admin.firestore().collection("semesterSubjects").doc();
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
