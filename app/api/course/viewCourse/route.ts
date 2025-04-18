import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt"; // Import NextAuth's JWT token handler
import { firestore } from "@/lib/firebase/firebaseAdmin"; // Assuming you're using Firestore for data storage

export async function GET(req: NextRequest) {
  try {
    // 1️⃣ Authorization Check using NextAuth JWT Token
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { role } = token; // Assuming the role is included in the JWT token

    // 2️⃣ Verify that only admins can view courses
    if (role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Only admins can view courses" },
        { status: 403 }
      );
    }

    // 3️⃣ Get `courseId` from query params
    const url = new URL(req.url);
    const courseId = url.searchParams.get("courseId");

    if (!courseId) {
      return NextResponse.json({ error: "Missing course ID" }, { status: 400 });
    }

    // 4️⃣ Fetch course data from Firestore
    const courseRef = firestore.collection("courses").doc(courseId);
    const courseDoc = await courseRef.get();

    if (!courseDoc.exists) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    return NextResponse.json(courseDoc.data(), { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
