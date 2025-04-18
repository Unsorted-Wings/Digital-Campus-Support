import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt"; // Import getToken from NextAuth
import { firestore } from "@/lib/firebase/firebaseAdmin"; // Assuming you have a Firestore connection

export async function GET(req: NextRequest) {
  try {
    // 1️⃣ Get the token from the request using NextAuth's JWT helper
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    // 2️⃣ Check if the token exists; if not, return Unauthorized
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 3️⃣ Check if the user has 'admin' role (assuming you have 'role' in the token)
    if (token.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    // 4️⃣ Fetch polls from Firestore
    const snapshot = await firestore.collection("polls").get();
    const polls = snapshot.docs.map(doc => doc.data());

    // 5️⃣ Return the polls
    return NextResponse.json({ polls }, { status: 200 });
  } catch (err: any) {
    // 6️⃣ Handle errors
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
