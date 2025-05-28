import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
// import admin from "firebase-admin";
import { firestore, admin } from "@/lib/firebase/firebaseAdmin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

export async function POST(req: NextRequest) {
  try {
    // Authorization using NextAuth JWT Token
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    console.log(token)
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify if the user has the "admin" role
    const { role } = token; // Assuming the role is included in the JWT token
    // if (role !== "admin") {
    //   return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    // }

    if (token.role === 'student') {
      const {
        userId,
        assignmentId, 
        assignmentDocUrl,
        uploadedAt
      } = await req.json();
     
      if (!userId || !assignmentDocUrl || !uploadedAt || !assignmentId) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
      }

      const assignmentRef = firestore.collection("assignments").doc(assignmentId);

      const submission = {
        userId,
        assignmentDocUrl,
        uploadedAt
      };

      await assignmentRef.update({
        submittedBy: admin.firestore.FieldValue.arrayUnion(submission)
      });

      return NextResponse.json({ message: "Assignment submitted" }, { status: 200 });
    }

    else if (token.role === 'faculty') {
      const {
        title,
        description,
        courseId,
        batchId,
        semesterId,
        subjectId,
        teacherId,
        dueDate,
        assignmentDocUrl
      } = await req.json();

      if (!title || !description || !courseId || !batchId || !semesterId || !subjectId || !teacherId || !dueDate || !assignmentDocUrl) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
      }

      const ref = firestore.collection("assignments").doc();
      const newAssignment = {
        id: ref.id,
        title,
        description,
        courseId,
        batchId,
        semesterId,
        subjectId,
        teacherId,
        dueDate,
        assignmentDocUrl,
        submittedBy: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await ref.set(newAssignment);

      return NextResponse.json({ message: "Assignment created", id: ref.id }, { status: 201 });

    }
    // Body

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
