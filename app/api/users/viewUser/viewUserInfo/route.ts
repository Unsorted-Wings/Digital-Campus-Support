import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { firestore } from "@/lib/firebase/firebaseAdmin";

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token || !token.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch user
  const snapshot = await firestore
    .collection("users")
    .where("email", "==", token.email)
    .limit(1)
    .get();

  if (snapshot.empty) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const userDoc = snapshot.docs[0];
  const user = userDoc.data();

  // console.log(user);

  let courseId = null;
  let isAlumni = false;

  // If student, fetch courseId from students collection
  if (user.role === "student") {
    const studentDoc = await firestore
      .collection("students")
      .doc(userDoc.id)
      .get();
    if (studentDoc.exists) {
      courseId = studentDoc.data()?.courseId;
      isAlumni = studentDoc.data()?.isAlumni || false;
    }

  }

  if (user.role === "faculty") {
    // Fetch subjects from faculty collection
    const facultyDoc = await firestore
      .collection("faculties")
      .doc(userDoc.id)
      .get();
    if (facultyDoc.exists) {
      user.subjects = facultyDoc.data()?.subjects || [];
    } else {
      user.subjects = [];
    }
  }

  return NextResponse.json({
    uid: userDoc.id,
    email: user.email,
    name: user.name,
    role: user.role,
    ...(user.role === "student" && { courseId, isAlumni }),
    ...(user.role === "faculty" && { subjects: user.subjects || [] }),
  });
}
