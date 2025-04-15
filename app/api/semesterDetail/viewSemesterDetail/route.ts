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

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.split("Bearer ")[1];
    const decoded = await admin.auth().verifyIdToken(token);
    if (decoded.role !== "admin") return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });

    const url = new URL(req.url);
    const semesterId = url.searchParams.get("id");

    if (!semesterId) return NextResponse.json({ error: "Missing semester ID" }, { status: 400 });

    const doc = await admin.firestore().collection("semesterDetails").doc(semesterId).get();
    if (!doc.exists) return NextResponse.json({ error: "Semester not found" }, { status: 404 });

    return NextResponse.json(doc.data(), { status: 200 });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
