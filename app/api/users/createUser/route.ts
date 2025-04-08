import { NextRequest, NextResponse } from "next/server";
import * as admin from "firebase-admin";
import bcrypt from "bcryptjs";


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
      return NextResponse.json({ error: "Forbidden: Only admins can create users" }, { status: 403 });
    }

    // 3️⃣ Parse Request Body
    const { email, password, name,role} = await req.json();
    if (!email || !password || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 4️⃣ Hash the Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5️⃣ Create Firebase Auth User
    const userRecord = await admin.auth().createUser({
      email,
      password, // This password is only used for Firebase Auth
      displayName: name,
    });

    // 6️⃣ Set User Role (Custom Claims)
    await admin.auth().setCustomUserClaims(userRecord.uid, { role: role });

    // 7️⃣ Store User in Firestore
    await admin.firestore().collection("users").doc(userRecord.uid).set({
      id: userRecord.uid,
      email,
      name,
      role,
      password: hashedPassword, // Store hashed password
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ message: "User created successfully", userId: userRecord.uid }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
