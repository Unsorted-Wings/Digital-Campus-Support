// app/api/exams/create/route.ts

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
    // 1️⃣ Authorization Check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.split("Bearer ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decodedToken = await admin.auth().verifyIdToken(token);
    if (decodedToken.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Only admins can create exams" }, { status: 403 });
    }

    // 2️⃣ Parse Request Body
    const { name, courseId, batchId, semesterId, scheduleUrl } = await req.json();

    if (!name || !courseId || !batchId || !semesterId || !scheduleUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 3️⃣ Prepare Data
    const now = new Date().toISOString();
    const examRef = admin.firestore().collection("exams").doc();
    const examId = examRef.id;

    const examData = {
      id: examId,
      name,
      courseId,
      batchId,
      semesterId,
      scheduleUrl,
      createdAt: now,
      updatedAt: now,
    };

    // 4️⃣ Save to Firestore
    await examRef.set(examData);

    return NextResponse.json({ message: "Exam created successfully", exam: examData }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
