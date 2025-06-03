import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { firestore } from "@/lib/firebase/firebaseAdmin";

export async function PUT(req: NextRequest) {
  try {
    // 1️⃣ Verify Admin Authorization with NextAuth JWT token
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2️⃣ Allow only 'admin' or 'faculty'
    if (token.role !== "admin" && token.role !== "faculty") {
      return NextResponse.json(
        { error: "Forbidden: Only admins or faculty can update grades" },
        { status: 403 }
      );
    }

    // 3️⃣ Parse request body
    const { gradeId, ...updatedFields } = await req.json();

    if (!gradeId) {
      return NextResponse.json({ error: "Missing gradeId" }, { status: 400 });
    }

    const docRef = firestore.collection("grades").doc(gradeId);

    // 4️⃣ Check if document exists
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      return NextResponse.json({ error: "Grade document not found" }, { status: 404 });
    }

    // 5️⃣ Add updatedAt timestamp
    updatedFields.updatedAt = new Date().toISOString();

    // 6️⃣ Apply the updates
    await docRef.update(updatedFields);

    return NextResponse.json({ message: "Grades updated successfully" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
