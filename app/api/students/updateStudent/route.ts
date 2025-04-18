// app/api/students/update/route.ts

import { NextRequest, NextResponse } from "next/server";
import { firestore } from "@/lib/firebase/firebaseAdmin"; // Adjust path if needed
import { getToken } from "next-auth/jwt";

export async function PUT(req: NextRequest) {
  try {
    // 1️⃣ Authenticate Admin via NextAuth
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token || token.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Only admins can update student data" }, { status: 403 });
    }

    // 2️⃣ Parse Request Body
    const { uid, email, name, role, profilePicture, rollNumber, course, description, isAlumni } = await req.json();

    // 3️⃣ Validate Required Fields
    if (!uid || !email || !name || !rollNumber || !course || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 4️⃣ Fetch User and Student from Firestore
    const userRef = firestore.collection("users").doc(uid);
    const studentRef = firestore.collection("students").doc(uid);

    const [userDoc, studentDoc] = await Promise.all([userRef.get(), studentRef.get()]);

    if (!userDoc.exists || !studentDoc.exists) {
      return NextResponse.json({ error: "User or Student not found" }, { status: 404 });
    }

    // 5️⃣ Update User Document
    const updatedUserData = {
      email,
      name,
      role,
      profilePicture: profilePicture || userDoc.data()?.profilePicture || "",
      updatedAt: new Date().toISOString(),
    };

    await userRef.update(updatedUserData);

    // 6️⃣ Update Student Document
    const existingStudent = studentDoc.data();

    const updatedStudentData = {
      rollNumber,
      course,
      description: description ?? existingStudent?.description ?? "",
      isAlumni: isAlumni ?? existingStudent?.isAlumni ?? false,
      updatedAt: new Date().toISOString(),
    };

    await studentRef.update(updatedStudentData);

    // 7️⃣ Return Success
    return NextResponse.json({ message: "Student and User updated successfully", studentId: uid }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
