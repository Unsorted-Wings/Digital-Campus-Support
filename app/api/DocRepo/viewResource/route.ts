// app/api/resources/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { firestore } from "@/lib/firebase/firebaseAdmin";
import * as admin from "firebase-admin";
import { getToken } from "next-auth/jwt";


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

        const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (token.role === "faculty") {
            const notesQuerySnapshot = await firestore
                .collection("resources")
                .where("createdBy", "==", token.id)
                .where("type", "==", "notes")
                .get();

            const notes = notesQuerySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            return NextResponse.json(notes, { status: 200 });
        }
     else if (token.role === "student") {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");

    const notesQuerySnapshot = await firestore
        .collection("resources")
        .where("courseId", "==", courseId)
        .where("type", "==", "notes")
        .get();

    const notes = await Promise.all(
        notesQuerySnapshot.docs.map(async (doc) => {
            const noteData = doc.data();
            const facultyId = noteData.createdBy;
            let facultyName = null;

            try {
                const facultyDoc = await firestore.collection("faculties").doc(facultyId).get();
                if (facultyDoc.exists) {
                    const facultyData = facultyDoc.data();
                    facultyName = facultyData?.name; // Adjust if it's "fullName" or something else
                }
            } catch (error) {
                console.error(`Error fetching faculty with ID ${facultyId}:`, error);
            }

            return {
                id: doc.id,
                ...noteData,
                facultyName, // Add the name to the response
            };
        })
    );

    return NextResponse.json(notes, { status: 200 });
}



    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
