import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { firestore } from "@/lib/firebase/firebaseAdmin";

export async function GET(req: NextRequest) {
  try {
    // 1️⃣ Authenticate using NextAuth JWT
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (token.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    // 2️⃣ Extract semester ID from query params
    const url = new URL(req.url);
    const semesterId = url.searchParams.get("id");

    if (!semesterId) {
      return NextResponse.json({ error: "Missing semester ID" }, { status: 400 });
    }

    // 3️⃣ Fetch semester from Firestore
    const doc = await firestore.collection("semesterDetails").doc(semesterId).get();
    if (!doc.exists) {
      return NextResponse.json({ error: "Semester not found" }, { status: 404 });
    }

    // ✅ Return the semester data
    return NextResponse.json(doc.data(), { status: 200 });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
