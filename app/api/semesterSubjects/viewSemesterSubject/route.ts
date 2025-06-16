import { NextRequest, NextResponse } from "next/server";
import { firestore } from "@/lib/firebase/firebaseAdmin"; // adjust path if necessary
import { getToken } from "next-auth/jwt";

export async function GET(req: NextRequest) {
  try {
    // 1️⃣ Authenticate with NextAuth
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (token.role !== "admin") {
      return NextResponse.json({ error: "Admins only" }, { status: 403 });
    }

    // 2️⃣ Extract query parameter
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing semesterSubject ID" }, { status: 400 });
    }

    // 3️⃣ Fetch document from Firestore
    const doc = await firestore.collection("semesterSubjects").doc(id).get();

    if (!doc.exists) {
      return NextResponse.json({ error: "SemesterSubject not found" }, { status: 404 });
    }

    // 4️⃣ Return the document data
    return NextResponse.json(doc.data(), { status: 200 });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
