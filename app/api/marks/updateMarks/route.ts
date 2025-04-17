// app/api/marks/update/route.ts

import { NextRequest, NextResponse } from "next/server";
import * as admin from "firebase-admin";

// ✅ Initialize Firebase Admin SDK
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
    // 1️⃣ Check Authorization Header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.split("Bearer ")[1];
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 2️⃣ Verify Admin Token
    const decodedToken = await admin.auth().verifyIdToken(token);
    if (decodedToken.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Only admins can update marks" },
        { status: 403 }
      );
    }

    // 3️⃣ Parse Request Body
    const { id, studentId, examId, subjects } = await req.json();

    if (!id || !studentId || !examId || !subjects || !Array.isArray(subjects)) {
      return NextResponse.json(
        { error: "Missing or invalid fields" },
        { status: 400 }
      );
    }

    const marksRef = admin.firestore().collection("marks").doc(id);
    const doc = await marksRef.get();

    if (!doc.exists) {
      return NextResponse.json(
        { error: "Marks record not found" },
        { status: 404 }
      );
    }

    // 4️⃣ Update the Document
    await marksRef.update({
      studentId,
      examId,
      subjects,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json(
      { message: "Marks updated successfully", id },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
