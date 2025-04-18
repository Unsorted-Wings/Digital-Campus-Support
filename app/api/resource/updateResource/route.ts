import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt"; // Import the getToken function from NextAuth
import { firestore } from "@/lib/firebase/firebaseAdmin"; // Assuming you have this db connection to Firestore

export async function GET(req: NextRequest) {
  try {
    // 1️⃣ Get the token from the request using NextAuth's JWT helper
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    // 2️⃣ Check if the token exists, if not, return unauthorized
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 3️⃣ Check if the user has an 'admin' role
    if (token.role !== "admin") {
      return NextResponse.json(
        { error: "Only admins can view resources" },
        { status: 403 }
      );
    }

    // 4️⃣ Fetch the resources from Firestore
    const snapshot = await firestore.collection("resources").get();
    const data = snapshot.docs.map((doc) => doc.data());

    // 5️⃣ Return the resources
    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
