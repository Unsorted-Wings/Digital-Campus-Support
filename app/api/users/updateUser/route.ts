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
      return NextResponse.json({ error: "Forbidden: Only admins can update users" }, { status: 403 });
    }

    // 3️⃣ Parse Request Body
    const { uid, email, name } = await req.json();
    if (!uid || !email || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 4️⃣ Fetch Existing User Record
    const userRecord = await admin.auth().getUser(uid);

    // 5️⃣ Update Firebase Auth User
    const updateData: any = {};
    if (email !== userRecord.email) {
      updateData.email = email;
    }
    if (name !== userRecord.displayName) {
      updateData.displayName = name;
    }
    
    

    await admin.auth().updateUser(uid, updateData);

    const userDoc = admin.firestore().collection("users").doc(uid);
    const updatedUserData: any = { email, name};
    await userDoc.update({
      ...updatedUserData,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ message: "User updated successfully", userId: uid }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
