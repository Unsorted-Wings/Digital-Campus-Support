import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt"; // Import NextAuth's JWT token handler
import { firestore } from "@/lib/firebase/firebaseAdmin"; // Assuming you're using Firestore for data storage

export async function POST(req: NextRequest) {
  try {
    // 1️⃣ Authorization Check using NextAuth JWT Token
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { role } = token; // Assuming role is included in the JWT token

    // 2️⃣ Verify that only admins can create courses
    if (role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Only admins can create courses" },
        { status: 403 }
      );
    }

    // 3️⃣ Parse Request Body
    const { name, duration } = await req.json();
    if (!name || !duration) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 4️⃣ Prepare Data
    const newCourseRef = firestore.collection("courses").doc();
    const timestamp = new Date().toISOString();

    const courseData = {
      id: newCourseRef.id,
      name,
      duration,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    // 5️⃣ Save to Firestore
    await newCourseRef.set(courseData);

    return NextResponse.json(
      { message: "Course created successfully", course: courseData },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
