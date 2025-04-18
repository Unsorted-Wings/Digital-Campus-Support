// app/api/faculty/create/route.ts

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getToken } from "next-auth/jwt"; 
import { firestore } from "@/lib/firebase/firebaseAdmin";
export async function POST(req: NextRequest) {
  try {
    // 1️⃣ Check Admin Authorization with NextAuth JWT token
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2️⃣ Check if the user has the 'admin' role
    if (token.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Only admins can add faculty" }, { status: 403 });
    }

    // 3️⃣ Parse Request Body
    const { email, password, name, qualification, isMentor } = await req.json();
    if (!email || !password || !name || !qualification || isMentor === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 4️⃣ Hash the Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5️⃣ Create Faculty Record in Firestore
    const facultyData = {
      email,
      password: hashedPassword, // Store the hashed password
      name,
      qualification,
      isMentor,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const facultyRef = firestore.collection("faculties").doc();
    await facultyRef.set(facultyData);

    // 6️⃣ Create User Record in Firestore (users collection)
    const userData = {
      email,
      name,
      role: "faculty", // Set the role as 'faculty'
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await firestore.collection("users").doc(facultyRef.id).set(userData);

    return NextResponse.json({ message: "Faculty created successfully", userId: facultyRef.id }, { status: 201 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
