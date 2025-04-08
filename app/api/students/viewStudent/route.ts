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

export async function GET(req: NextRequest) {
  try {
    // 1️⃣ Check Authorization Header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.split("Bearer ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 2️⃣ Verify Token
    const decodedToken = await admin.auth().verifyIdToken(token);
    const { uid } = decodedToken; // Get the UID of the currently authenticated user

    // 3️⃣ Get the `uid` from the query parameters (or path params depending on your routing setup)
    const url = new URL(req.url);
    const studentId = url.searchParams.get("studentId");

    if (!studentId) {
      return NextResponse.json({ error: "Missing student ID" }, { status: 400 });
    }

    // 4️⃣ Fetch the Student's User and Student Records
    const userDoc = await admin.firestore().collection("users").doc(studentId as string).get();
    const studentDoc = await admin.firestore().collection("students").doc(studentId as string).get();

    // 5️⃣ Check if the user and student exist
    if (!userDoc.exists || !studentDoc.exists) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // 6️⃣ Get user and student data
    const userData = userDoc.exists ? userDoc.data() : null;
    const studentData = studentDoc.exists ? studentDoc.data() : null;

    if (!userData || !studentData) {
      return NextResponse.json({ error: "Student data is missing or incomplete" }, { status: 404 });
    }

    // 7️⃣ Return Data based on the requester's role
    if (decodedToken.role === "admin") {
      // Admin can view all details, including role and profile information
      return NextResponse.json({
        user: {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          role: userData.role,
          profilePicture: userData.profilePicture,
          createdAt: userData.createdAt,
          updatedAt: userData.updatedAt,
        },
        student: {
          id: studentData.id,
          rollNumber: studentData.rollNumber,
          course: studentData.course,
          createdAt: studentData.createdAt,
          updatedAt: studentData.updatedAt,
        },
      }, { status: 200 });
    }

    if (uid === studentId) {
      // Student can view their own details
      return NextResponse.json({
        user: {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          profilePicture: userData.profilePicture,
          createdAt: userData.createdAt,
          updatedAt: userData.updatedAt,
        },
        student: {
          id: studentData.id,
          rollNumber: studentData.rollNumber,
          course: studentData.course,
          createdAt: studentData.createdAt,
          updatedAt: studentData.updatedAt,
        },
      }, { status: 200 });
    }

    // For any other user, only basic information (name, email) is visible
    return NextResponse.json({
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
      },
      student: {
        id: studentData.id,
        rollNumber: studentData.rollNumber,
        course: studentData.course,
      },
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
