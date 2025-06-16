import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt"; 
import { firestore } from "@/lib/firebase/firebaseAdmin";

export async function POST(req: NextRequest) {
  try {
    // 1️⃣ Authorization Check using NextAuth JWT Token
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { role } = token; // Assuming the role is included in the JWT token

    // 2️⃣ Verify that only admins can create batches
    if (role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    // 3️⃣ Parse the Request Body
    const { name, courseId, semesters = [], students = [] } = await req.json();
    if (!name || !courseId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 4️⃣ Create a New Batch in Firestore
    const batchRef = firestore.collection("batches").doc();
    const timestamp = new Date().toISOString();

    const batch = {
      id: batchRef.id,
      name,
      courseId,
      semesters,
      students,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await batchRef.set(batch);

    return NextResponse.json({ message: "Batch created", batch }, { status: 201 });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
