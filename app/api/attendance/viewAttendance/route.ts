import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { firestore } from "@/lib/firebase/firebaseAdmin";

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const studentId = url.searchParams.get("studentId");

    if (!studentId) {
      return NextResponse.json({ error: "Missing student ID" }, { status: 400 });
    }

    // ✅ Query Firestore for documents where studentId matches
    const snapshot = await firestore
      .collection("attendances")
      .where("studentId", "==", studentId)
      .get();

    if (snapshot.empty) {
      return NextResponse.json({ error: "No attendance records found" }, { status: 404 });
    }

    // Map over the results (even if you expect only one)
    const attendances = snapshot.docs.map((doc) => doc.data());

    return NextResponse.json(attendances, { status: 200 });
  } catch (err: any) {
    console.error("Server Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
