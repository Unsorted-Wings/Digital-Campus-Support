import { NextRequest, NextResponse } from "next/server";
import * as admin from "firebase-admin";

// Initialize Firebase Admin SDK if it's not initialized yet
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
    if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.split("Bearer ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 2️⃣ Verify Admin Token
    const decodedToken = await admin.auth().verifyIdToken(token);
    if (decodedToken.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Only admins can update faculty" }, { status: 403 });
    }

    // 3️⃣ Parse Request Body
    const { facultyId, email, name, qualification, isMentor } = await req.json();
    if (!facultyId || !email || !name || !qualification || isMentor === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 4️⃣ Check if the faculty exists in 'users' and 'faculties'
    const userDoc = await admin.firestore().collection("users").doc(facultyId).get();
    const facultyDoc = await admin.firestore().collection("faculties").doc(facultyId).get();

    if (!userDoc.exists || !facultyDoc.exists) {
      return NextResponse.json({ error: "Faculty not found" }, { status: 404 });
    }

    // 5️⃣ Update User Data in 'users' Collection
    await admin.firestore().collection("users").doc(facultyId).update({
      email,
      name,
      updatedAt: new Date().toISOString(),
    });

    // 6️⃣ Update Faculty Data in 'faculties' Collection
    await admin.firestore().collection("faculties").doc(facultyId).update({
      qualification,
      isMentor,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ message: "Faculty updated successfully" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
