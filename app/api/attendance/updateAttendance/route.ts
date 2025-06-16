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

    // 2️⃣ Verify that only admins can update attendance
    if (role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 3️⃣ Parse request body
    const { id, ...updates } = await req.json();

    // 4️⃣ Check if ID is provided
    if (!id) {
      return NextResponse.json({ error: "Missing attendance ID" }, { status: 400 });
    }

    // 5️⃣ Reference to the Firestore document
    const docRef = firestore.collection("attendances").doc(id);
    const doc = await docRef.get();

    // 6️⃣ If document does not exist, return an error
    if (!doc.exists) {
      return NextResponse.json({ error: "Attendance not found" }, { status: 404 });
    }

    // 7️⃣ Update the document with new data
    await docRef.update({
      ...updates,
      updatedAt: new Date().toISOString(),
    });

    // 8️⃣ Return success response
    return NextResponse.json({ message: "Attendance updated", id }, { status: 200 });
  } catch (err: any) {
    // 9️⃣ Handle errors
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
