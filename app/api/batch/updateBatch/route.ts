// app/api/batch/update/route.ts
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
    if (decoded.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    const { id, name, courseId, semesters = [], students = [] } = await req.json();

    if (!id || !name || !courseId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const ref = admin.firestore().collection("batches").doc(id);
    const doc = await ref.get();
    if (!doc.exists) return NextResponse.json({ error: "Batch not found" }, { status: 404 });

    const updateData = {
      name,
      courseId,
      semesters,
      students,
      updatedAt: new Date().toISOString(),
    };

    await ref.update(updateData);
    return NextResponse.json({ message: "Batch updated", batchId: id }, { status: 200 });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
