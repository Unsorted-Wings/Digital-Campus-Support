import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt"; // Import the getToken function from NextAuth
import { firestore } from "@/lib/firebase/firebaseAdmin"; // Assuming you have this db connection to Firestore

export async function POST(req: NextRequest) {
  try {
    // 1️⃣ Get the token from the request using NextAuth's JWT helper
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    // 2️⃣ Check if the token exists, if not, return unauthorized
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 3️⃣ Check if the user has an 'admin' role
    if (token.role !== "admin") {
      return NextResponse.json({ error: "Only admins can create resources" }, { status: 403 });
    }

    // 4️⃣ Parse the body of the request
    const body = await req.json();
    const { name, type, description, fileUrl } = body;

    // 5️⃣ Validate required fields
    if (!name || !type || !description || !fileUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 6️⃣ Create a new resource document in Firestore
    const now = new Date().toISOString();
    const id = firestore.collection("resources").doc().id;

    const resource = {
      id,
      name,
      type,
      description,
      createdBy: token.sub, // Use token.sub (which is the user ID) as createdBy
      fileUrl,
      createdAt: now,
      updatedAt: now,
    };

    // 7️⃣ Save the new resource to Firestore
    await firestore.collection("resources").doc(id).set(resource);
    return NextResponse.json({ message: "Resource created", id }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
