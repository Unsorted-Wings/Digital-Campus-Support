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
      return NextResponse.json({ error: "Forbidden: Only admins can update student data" }, { status: 403 });
    }

    // 3️⃣ Parse Request Body
    const { uid, email, name, role, profilePicture, rollNumber, course, description, isAlumni } = await req.json();


    // 4️⃣ Validate Input Fields
    if (!uid || !email || !name || !rollNumber || !course || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 5️⃣ Fetch User and Student from Firestore
    const userDoc = await admin.firestore().collection("users").doc(uid).get();
    const studentDoc = await admin.firestore().collection("students").doc(uid).get();

    if (!userDoc.exists || !studentDoc.exists) {
      return NextResponse.json({ error: "User or Student not found" }, { status: 404 });
    }

    // 6️⃣ Update User Record
    const updatedUserData = {
      email,
      name,
      role,
      profilePicture: profilePicture || userDoc.data()?.profilePicture,
      updatedAt: new Date().toISOString(),
    };

    await admin.firestore().collection("users").doc(uid).update(updatedUserData);

    // 7️⃣ Update Student Record
    const existingStudent = studentDoc.data();

    const updatedStudentData = {
      rollNumber,
      course,
      description: description ?? existingStudent?.description ?? "",
      isAlumni: isAlumni ?? existingStudent?.isAlumni ?? false,
      updatedAt: new Date().toISOString(),
    };

    await admin.firestore().collection("students").doc(uid).update(updatedStudentData);

    // 8️⃣ Return Success Response
    return NextResponse.json({ message: "Student and User updated successfully", studentId: uid }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
