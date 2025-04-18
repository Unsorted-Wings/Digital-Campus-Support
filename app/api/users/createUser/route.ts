import { NextRequest, NextResponse } from "next/server";
import { firestore } from "@/lib/firebase/firebaseAdmin";
import { hash } from "bcryptjs";
import { getToken } from "next-auth/jwt";

export async function POST(req: NextRequest) {
  try {
    // 1️⃣ Verify Admin Token using NextAuth (JWT)
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token || token.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Only admins can create users" },
        { status: 403 }
      );
    }

    // 2️⃣ Parse Request Body
    const { email, password, name, role } = await req.json();
    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 3️⃣ Hash the Password
    const hashedPassword = await hash(password, 10);

    // 4️⃣ Create New User in Firestore (No Firebase Auth required)
    const newUserRef = firestore.collection("users").doc();
    await newUserRef.set({
      id: newUserRef.id,
      email,
      name,
      role,
      password: hashedPassword, // Store the hashed password
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // 5️⃣ Return Success Response
    return NextResponse.json(
      { message: "User created successfully", userId: newUserRef.id },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
