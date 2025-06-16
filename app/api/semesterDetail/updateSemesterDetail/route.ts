import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { firestore } from "@/lib/firebase/firebaseAdmin";
export async function PUT(req: NextRequest) {
  try {
    // 1️⃣ Authenticate using NextAuth JWT
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (token.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    // 2️⃣ Parse request body
    const { id, courseId, batchId, subjects, startDate, endDate, mentor } = await req.json();

    if (!id || !courseId || !batchId || !startDate || !endDate || !mentor || !subjects) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // 3️⃣ Check if the semester exists
    const ref = firestore.collection("semesterDetails").doc(id);
    const doc = await ref.get();
    if (!doc.exists) {
      return NextResponse.json({ error: "Semester not found" }, { status: 404 });
    }

    // 4️⃣ Update the semester
    const updateData = {
      courseId,
      batchId,
      subjects,
      startDate,
      endDate,
      mentor,
      updatedAt: new Date().toISOString(),
    };

    await ref.update(updateData);

    // ✅ Return success
    return NextResponse.json({ message: "Semester updated", id }, { status: 200 });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
