// app/api/marks/create/route.ts

import { NextRequest, NextResponse } from "next/server";
import * as admin from "firebase-admin";

// ✅ Initialize Firebase Admin if not already initialized
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
    // 1️⃣ Verify Admin Authorization
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
      return NextResponse.json({ error: "Forbidden: Only admins can create marks" }, { status: 403 });
    }

    // 2️⃣ Parse Request Body
    const { studentId, subjects } = await req.json();

    if (!studentId || !subjects || !Array.isArray(subjects)) {
      return NextResponse.json({ error: "Missing or invalid required fields" }, { status: 400 });
    }

    // 3️⃣ Create Marks Document
    const now = new Date().toISOString();
    const marksDoc = {
      studentId,
      subjects, // array of { subjectId, marks }
      createdAt: now,
      updatedAt: now,
    };

    const newDocRef = await admin.firestore().collection("marks").add(marksDoc);

    return NextResponse.json(
      { message: "Marks created successfully", marksId: newDocRef.id },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
