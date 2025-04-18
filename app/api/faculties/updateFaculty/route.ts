// app/api/faculty/update/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt"; // Use NextAuth for token verification
import { firestore } from "@/lib/firebase/firebaseAdmin"; // Assuming you're using Firebase Firestore

export async function PUT(req: NextRequest) {
  try {
    // 1️⃣ Check Admin Authorization with NextAuth JWT token
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2️⃣ Check if the user has the 'admin' role
    if (token.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Only admins can update faculty" }, { status: 403 });
    }

    // 3️⃣ Parse Request Body
    const { facultyId, email, name, qualification, isMentor } = await req.json();
    if (!facultyId || !email || !name || !qualification || isMentor === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 4️⃣ Check if the faculty exists in 'users' and 'faculties'
    const userDoc = await firestore.collection("users").doc(facultyId).get();
    const facultyDoc = await firestore.collection("faculties").doc(facultyId).get();

    if (!userDoc.exists || !facultyDoc.exists) {
      return NextResponse.json({ error: "Faculty not found" }, { status: 404 });
    }

    // 5️⃣ Update User Data in 'users' Collection
    await firestore.collection("users").doc(facultyId).update({
      email,
      name,
      updatedAt: new Date().toISOString(),
    });

    // 6️⃣ Update Faculty Data in 'faculties' Collection
    await firestore.collection("faculties").doc(facultyId).update({
      qualification,
      isMentor,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ message: "Faculty updated successfully" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
