// app/api/subjects/create/route.ts

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
    // 1️⃣ Check Authorization Header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.split("Bearer ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 2️⃣ Verify Admin Token
    const decodedToken = await admin.auth().verifyIdToken(token);
    if (decodedToken.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Only admins can create subjects" }, { status: 403 });
    }

    // 3️⃣ Parse Subject Data from Body
    const { name, code, isPractical = false, isTrack = false } = await req.json();
    if (!name || !code) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const subjectRef = admin.firestore().collection("subjects").doc();
    const timestamp = new Date().toISOString();

    const subject = {
      id: subjectRef.id,
      name,
      code,
      isPractical,
      isTrack,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    // 4️⃣ Store Subject in Firestore
    await subjectRef.set(subject);

    return NextResponse.json({ message: "Subject created successfully", subjectId: subjectRef.id }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
