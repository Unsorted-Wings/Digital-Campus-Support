// app/api/marks/view/route.ts

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

export async function GET(req: NextRequest) {
  try {
    // 1️⃣ Check Admin Authorization
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
      return NextResponse.json({ error: "Forbidden: Only admins can view marks" }, { status: 403 });
    }

    // 2️⃣ Optionally filter by studentId (query param)
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");

    let marksQuery: FirebaseFirestore.Query = admin.firestore().collection("marks");
    if (studentId) {
      marksQuery = marksQuery.where("studentId", "==", studentId);
    }

    const snapshot = await marksQuery.get();
    const marks = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json({ marks }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
