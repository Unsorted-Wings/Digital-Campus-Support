import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt"; 
import { firestore } from "@/lib/firebase/firebaseAdmin"; 

export async function POST(req: NextRequest) {
  try {
    // 1️⃣ Get the token using NextAuth's JWT helper
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    // 2️⃣ Check if the token exists, if not return Unauthorized error
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 3️⃣ Check if the user has 'admin' role (assuming the role is set in the token)
    if (token.role !== "admin") {
      return NextResponse.json({ error: "Only admins can create resources" }, { status: 403 });
    }

    // 4️⃣ Parse the request body
    const body = await req.json();
    const { name, type, description, fileUrl } = body;

    // 5️⃣ Validate required fields
    if (!name || !type || !description || !fileUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 6️⃣ Create the resource
    const now = new Date().toISOString();
    const id = firestore.collection("resources").doc().id;

    const resource = {
      id,
      name,
      type,
      description,
      createdBy: token.sub, // Use the user ID from the token (NextAuth sub)
      fileUrl,
      createdAt: now,
      updatedAt: now,
    };

    // 7️⃣ Save the resource in Firestore
    await firestore.collection("resources").doc(id).set(resource);

    // 8️⃣ Return the response
    return NextResponse.json({ message: "Resource created", id }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
