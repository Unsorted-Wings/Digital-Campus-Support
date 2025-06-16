import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt"; // Import NextAuth's JWT token handler
import { firestore } from "@/lib/firebase/firebaseAdmin"; // Assuming you're using Firestore for data storage

export async function PUT(req: NextRequest) {
  try {
    // 1️⃣ Authorization Check using NextAuth JWT Token
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { role } = token; // Assuming the role is included in the JWT token

    // 2️⃣ Verify that only admins can update courses
    if (role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Only admins can update courses" },
        { status: 403 }
      );
    }

    // 3️⃣ Parse Request Body
    const { id, name, duration } = await req.json();

    if (!id || !name || !duration) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 4️⃣ Fetch the Course from Firestore
    const courseRef = firestore.collection("courses").doc(id);
    const courseDoc = await courseRef.get();

    if (!courseDoc.exists) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // 5️⃣ Update Course Data
    const updatedCourse = {
      name,
      duration,
      updatedAt: new Date().toISOString(),
    };

    await courseRef.update(updatedCourse);

    return NextResponse.json(
      { message: "Course updated successfully", courseId: id },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
