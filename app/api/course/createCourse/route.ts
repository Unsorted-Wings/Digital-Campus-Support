// app/api/course/route.ts
import { NextRequest, NextResponse } from "next/server";
import * as admin from "firebase-admin";

// Initialize Firebase Admin SDK
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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    if (decodedToken.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Only admins can create courses" }, { status: 403 });
    }

    const { name, duration } = await req.json();
    if (!name || !duration) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newCourseRef = admin.firestore().collection("courses").doc();
    const timestamp = new Date().toISOString();

    const courseData = {
      id: newCourseRef.id,
      name,
      duration,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await newCourseRef.set(courseData);

    return NextResponse.json({ message: "Course created successfully", course: courseData }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
