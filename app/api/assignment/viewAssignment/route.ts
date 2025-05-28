import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import * as admin from "firebase-admin";

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        }),
    });
}

export async function GET(req: NextRequest) {
  try {
    // Authorization using NextAuth JWT Token
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");
    console.log(token)
    if (!courseId) {
      return NextResponse.json({ error: "Missing courseId" }, { status: 400 });
    }

    // Fetch assignments from Firestore by courseId
    const snapshot = await admin
      .firestore()
      .collection("assignments")
      .where("courseId", "==", courseId)
      .get();

    const assignments = snapshot.docs.map((doc) => {
      const data = doc.data();

      // Filter submittedBy array to only include entry with matching uid
      const submittedBy = (data.submittedBy || []).filter(
        (entry: any) => entry.userId === token.id
      );

      return {
        id: doc.id,
        assignmentDocUrl: data.assignmentDocUrl,
        batchId: data.batchId,
        courseId: data.courseId,
        createdAt: data.createdAt,
        description: data.description,
        dueDate: data.dueDate,
        semesterId: data.semesterId,
        subjectId: data.subjectId,
        submittedBy, // filtered array
        teacherId: data.teacherId,
        title: data.title,
        updatedAt: data.updatedAt,
      };
    });

    // Fetch all subjects
    const subjectsSnapshot = await admin.firestore().collection("subjects").get();
    const subjects: Record<string, any> = {};
    subjectsSnapshot.docs.forEach((doc) => {
      subjects[doc.id] = doc.data();
    });

    // Combine assignment with subject name
    const assignmentsWithSubjects = assignments.map((assignment) => {
      const subjectDetails = subjects[assignment.subjectId] || { name: "Unknown Subject" };
      return {
        ...assignment,
        subject: subjectDetails.name,
      };
    });

    return NextResponse.json(assignmentsWithSubjects, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
