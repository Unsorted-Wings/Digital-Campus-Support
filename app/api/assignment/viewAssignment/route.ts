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

        // Fetch assignments from Firestore
        const snapshot = await admin.firestore().collection("assignments").get();
        const assignments = snapshot.docs.map((doc) => ({
            id: doc.id,
            assignmentDocUrl: doc.data().assignmentDocUrl,
            batchId: doc.data().batchId,
            courseId: doc.data().courseId,
            createdAt: doc.data().createdAt,
            description: doc.data().description,
            dueDate: doc.data().dueDate,
            semesterId: doc.data().semesterId,
            subjectId: doc.data().subjectId, // Corrected to subjectId
            submittedBy: doc.data().submittedBy,
            teacherId: doc.data().teacherId,
            title: doc.data().title,
            updatedAt: doc.data().updatedAt,
        }));

        // Fetch subjects
        const subjectsSnapshot = await admin.firestore().collection("subjects").get();
        const subjects: Record<string, any> = {};
        subjectsSnapshot.docs.forEach((doc) => {
            subjects[doc.id] = doc.data();
        });

        // Combine assignment data with subject details
        const assignmentsWithSubjects = assignments.map((assignment) => {
            const subjectId = assignment.subjectId; // Use subjectId from the assignment
            const subjectDetails = subjects[subjectId] || { name: "Unknown Subject" };
            return {
                ...assignment,
                subject: subjectDetails.name, // Changed to only include subject name.  You can add other subject fields as needed.
            };
        });

        return NextResponse.json(assignmentsWithSubjects, { status: 200 });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}