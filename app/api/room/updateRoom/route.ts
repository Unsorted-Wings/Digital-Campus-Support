import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt"; 
import { firestore } from "@/lib/firebase/firebaseAdmin"; 

export async function PUT(req: NextRequest) {
  try {
    // 1️⃣ Authenticate user via NextAuth JWT
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2️⃣ Check if the user is an admin (ensure the token includes 'role' or a similar field)
    if (token.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 3️⃣ Parse the request body
    const { id, name, type, members } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Missing room ID" }, { status: 400 });
    }

    // 4️⃣ Get the room document reference from Firestore
    const ref = firestore.collection("rooms").doc(id);
    const doc = await ref.get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // 5️⃣ Prepare the update data
    const updatedData: any = {
      updatedAt: new Date().toISOString(),
    };
    if (name) updatedData.name = name;
    if (type) updatedData.type = type;
    if (Array.isArray(members)) updatedData.members = members;

    // 6️⃣ Update the room in Firestore
    await ref.update(updatedData);

    return NextResponse.json({ message: "Room updated successfully", id }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
