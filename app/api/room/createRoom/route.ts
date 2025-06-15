import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { firestore } from "@/lib/firebase/firebaseAdmin";

export async function POST(req: NextRequest) {
  try {
    // 1️⃣ Authenticate user via NextAuth JWT
    // const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    // if (!token) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    // // 2️⃣ Only admin users can create rooms
    // if (token.role !== "admin") {
    //   return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    // }

    // 3️⃣ Parse request body
    const { name, type, members } = await req.json();

    // 4️⃣ Validate input
    if (!name || !type || !Array.isArray(members)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 5️⃣ Create new room in Firestore
    const id = firestore.collection("rooms").doc().id;
    const now = new Date().toISOString();

    const room = {
      id,
      name,
      type,
      members,
      createdAt: now,
      updatedAt: now,
    };

    await firestore.collection("rooms").doc(id).set(room);

    return NextResponse.json({ message: "Room created", id }, { status: 201 });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
