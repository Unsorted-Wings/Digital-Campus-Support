import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt"; // Import the getToken function from NextAuth
import { firestore } from "@/lib/firebase/firebaseAdmin"; // Assuming you have this db connection to Firestore

export async function GET(req: NextRequest) {
  try {
    // 1️⃣ Get the token from the request
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2️⃣ Check if the user has admin role (ensure the token contains a 'role' field)
    if (token.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 3️⃣ Retrieve all rooms from Firestore
    const snapshot = await firestore.collection("rooms").get();
    const rooms = snapshot.docs.map((doc) => doc.data());

    // 4️⃣ Return the list of rooms
    return NextResponse.json(rooms, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
