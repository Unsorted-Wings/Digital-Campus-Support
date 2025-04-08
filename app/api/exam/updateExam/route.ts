// app/api/exams/update/route.ts

import { NextRequest, NextResponse } from "next/server";
import * as admin from "firebase-admin";

// Initialize Firebase Admin
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
    // 1️⃣ Authorization Check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    if (decodedToken.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Only admins can update exams" }, { status: 403 });
    }

    // 2️⃣ Parse Request Body
    const { id, name, courseId, batchId, semesterId, scheduleUrl } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Missing exam ID" }, { status: 400 });
    }

    // 3️⃣ Reference and Update Exam Document
    const examRef = admin.firestore().collection("exams").doc(id);
    const doc = await examRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    const updatedData: any = {
      updatedAt: new Date().toISOString(),
    };

    if (name) updatedData.name = name;
    if (courseId) updatedData.courseId = courseId;
    if (batchId) updatedData.batchId = batchId;
    if (semesterId) updatedData.semesterId = semesterId;
    if (scheduleUrl) updatedData.scheduleUrl = scheduleUrl;

    await examRef.update(updatedData);

    return NextResponse.json({ message: "Exam updated successfully", examId: id }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
