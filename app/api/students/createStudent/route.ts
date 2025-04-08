import { NextRequest, NextResponse } from "next/server";
import * as admin from "firebase-admin";
import bcrypt from "bcryptjs";

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
      return NextResponse.json({ error: "Forbidden: Only admins can create students" }, { status: 403 });
    }

    // 3️⃣ Parse Request Body
    const { email, password, name, rollNumber, course } = await req.json();
    if (!email || !password || !name || !rollNumber || !course) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 4️⃣ Hash the Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5️⃣ Create Firebase Auth User (for the student)
    const userRecord = await admin.auth().createUser({
      email,
      password, // This password is only used for Firebase Auth
      displayName: name,
    });

    // 6️⃣ Create Student Record in Firestore
    const studentId = userRecord.uid; // Use user UID as student ID
    const studentData = {
      id: studentId,
      rollNumber,
      course,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Store student in the "students" collection
    await admin.firestore().collection("students").doc(studentId).set(studentData);

    // 7️⃣ Store User in "users" collection
    await admin.firestore().collection("users").doc(studentId).set({
      id: studentId,
      email,
      name,
      role: "student", // Mark the user as a student in the users collection
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // 8️⃣ Return Success Response
    return NextResponse.json({ message: "Student created successfully", studentId: studentId }, { status: 201 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
