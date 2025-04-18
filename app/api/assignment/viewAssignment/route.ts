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

    // Verify if the user has the "admin" role
    const { role } = token; // Assuming the role is included in the JWT token
    if (role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch assignments from Firestore
    const snapshot = await admin.firestore().collection("assignments").get();
    const assignments = snapshot.docs.map((doc) => doc.data());

    return NextResponse.json(assignments, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
