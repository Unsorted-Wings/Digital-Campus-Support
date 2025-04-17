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
      return NextResponse.json({ error: "Forbidden: Only admins can add faculty" }, { status: 403 });
    }

    // 3️⃣ Parse Request Body
    const { email, password, name, qualification, isMentor } = await req.json();
    if (!email || !password || !name || !qualification || isMentor === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 4️⃣ Hash the Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5️⃣ Create Firebase Auth User (User in 'users' collection)
    const userRecord = await admin.auth().createUser({
      email,
      password, // This password is only used for Firebase Auth
      displayName: name,
    });

    // 6️⃣ Set User Role (Custom Claims)
    await admin.auth().setCustomUserClaims(userRecord.uid, { role: "faculty" });

    // 7️⃣ Create Faculty Record in 'faculties' Collection
    const facultyData = {
      id: userRecord.uid,
      isMentor,
      qualification,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await admin.firestore().collection("faculties").doc(userRecord.uid).set(facultyData);

    // 8️⃣ Store User Data in Firestore 'users' Collection
    const userData = {
      id: userRecord.uid,
      email,
      name,
      role: "faculty", // Set the role as 'faculty'
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await admin.firestore().collection("users").doc(userRecord.uid).set(userData);

    return NextResponse.json({ message: "Faculty created successfully", userId: userRecord.uid }, { status: 201 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
