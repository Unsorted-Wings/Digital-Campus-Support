// app/api/subjects/update/route.ts

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
    // 1️⃣ Authorization Header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.split("Bearer ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 2️⃣ Verify Admin Token
    const decodedToken = await admin.auth().verifyIdToken(token);
    if (decodedToken.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Only admins can update subjects" }, { status: 403 });
    }

    // 3️⃣ Parse Request Body
    const { id, name, code, isPractical, isTrack } = await req.json();
    if (!id || !name || !code) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const subjectRef = admin.firestore().collection("subjects").doc(id);
    const subjectSnap = await subjectRef.get();

    // 4️⃣ Ensure Subject Exists
    if (!subjectSnap.exists) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    // 5️⃣ Update Subject
    await subjectRef.update({
      name,
      code,
      isPractical: isPractical ?? false,
      isTrack: isTrack ?? false,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ message: "Subject updated successfully", subjectId: id }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
