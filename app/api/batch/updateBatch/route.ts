import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { firestore } from "@/lib/firebase/firebaseAdmin";
export async function PUT(req: NextRequest) {
  try {
    // 1️⃣ Authorization Check using NextAuth JWT Token
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { role } = token; // Assuming the role is included in the JWT token

    // 2️⃣ Verify that only admins can update batches
    if (role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Admins only" },
        { status: 403 }
      );
    }

    // 3️⃣ Parse the Request Body
    const {
      id,
      name,
      courseId,
      semesters = [],
      students = [],
    } = await req.json();

    if (!id || !name || !courseId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 4️⃣ Reference the Batch Document and Check if It Exists
    const batchRef = firestore.collection("batches").doc(id);
    const batchDoc = await batchRef.get();

    if (!batchDoc.exists) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    }

    // 5️⃣ Update the Batch Data
    const updatedBatchData = {
      name,
      courseId,
      semesters,
      students,
      updatedAt: new Date().toISOString(),
    };

    await batchRef.update(updatedBatchData);

    return NextResponse.json(
      { message: "Batch updated", batchId: id },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
