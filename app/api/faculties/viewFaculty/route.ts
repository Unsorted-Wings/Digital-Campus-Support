import { NextRequest, NextResponse } from "next/server";
import * as admin from "firebase-admin";

// Initialize Firebase Admin SDK if not already initialized
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
    // 1️⃣ Authorization Header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.split("Bearer ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 2️⃣ Verify Firebase ID Token
    const decodedToken = await admin.auth().verifyIdToken(token);
    const { uid, role } = decodedToken;

    // 3️⃣ Get `facultyId` from query params
    const url = new URL(req.url);
    const facultyId = url.searchParams.get("facultyId");

    if (!facultyId) {
      return NextResponse.json({ error: "Missing faculty ID" }, { status: 400 });
    }

    // 4️⃣ Fetch user and faculty data
    const userDoc = await admin.firestore().collection("users").doc(facultyId).get();
    const facultyDoc = await admin.firestore().collection("faculty").doc(facultyId).get();

    if (!userDoc.exists || !facultyDoc.exists) {
      return NextResponse.json({ error: "Faculty not found" }, { status: 404 });
    }

    const userData = userDoc.data();
    const facultyData = facultyDoc.data();

    if (!userData || !facultyData) {
      return NextResponse.json({ error: "Incomplete faculty data" }, { status: 404 });
    }

    // 5️⃣ Return full details if requester is admin
    if (role === "admin") {
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
        faculty: {
          id: facultyData.id,
          isMentor: facultyData.isMentor,
          qualification: facultyData.qualification,
          createdAt: facultyData.createdAt,
          updatedAt: facultyData.updatedAt,
        },
      }, { status: 200 });
    }

    // 6️⃣ Faculty viewing their own data
    if (uid === facultyId) {
      return NextResponse.json({
        user: {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          profilePicture: userData.profilePicture,
          createdAt: userData.createdAt,
          updatedAt: userData.updatedAt,
        },
        faculty: {
          id: facultyData.id,
          isMentor: facultyData.isMentor,
          qualification: facultyData.qualification,
          createdAt: facultyData.createdAt,
          updatedAt: facultyData.updatedAt,
        },
      }, { status: 200 });
    }

    // 7️⃣ Default: Public view with basic info
    return NextResponse.json({
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
      },
      faculty: {
        id: facultyData.id,
        isMentor: facultyData.isMentor,
        qualification: facultyData.qualification,
      },
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
