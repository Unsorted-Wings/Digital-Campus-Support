import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { firestore } from "@/lib/firebase/firebaseAdmin";

export async function GET(req: NextRequest) {
  try {
    // 1️⃣ Authorization Check using NextAuth JWT Token
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2️⃣ Verify if the user is an admin
    const { role } = token; // Assuming the role is included in the JWT token
    if (role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 3️⃣ Fetch the attendances from Firestore
    const snapshot = await firestore.collection("attendances").get();
    const attendances = snapshot.docs.map((doc) => doc.data());

    // 4️⃣ Return the attendances data
    return NextResponse.json(attendances, { status: 200 });
  } catch (err: any) {
    // 5️⃣ Handle errors
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
