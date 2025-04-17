// app/api/subjects/delete/route.ts

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

export async function DELETE(req: NextRequest) {
  try {
    // 1️⃣ Authorization Header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2️⃣ Verify Admin Token
    const decodedToken = await admin.auth().verifyIdToken(token);
    if (decodedToken.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Only admins can delete subjects" }, { status: 403 });
    }

    // 3️⃣ Extract Subject ID from Query Params
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing subject ID" }, { status: 400 });
    }

    // 4️⃣ Delete Subject Document
    const subjectRef = admin.firestore().collection("subjects").doc(id);
    const subjectSnap = await subjectRef.get();

    if (!subjectSnap.exists) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    await subjectRef.delete();

    return NextResponse.json({ message: "Subject deleted successfully", id }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
