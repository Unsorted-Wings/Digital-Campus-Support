// app/api/batch/create/route.ts
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
    if (decoded.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    const { name, courseId, semesters = [], students = [] } = await req.json();
    if (!name || !courseId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const batchRef = admin.firestore().collection("batches").doc();
    const timestamp = new Date().toISOString();

    const batch = {
      id: batchRef.id,
      name,
      courseId,
      semesters,
      students,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await batchRef.set(batch);
    return NextResponse.json({ message: "Batch created", batch }, { status: 201 });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
