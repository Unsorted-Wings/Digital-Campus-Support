import { NextRequest, NextResponse } from "next/server";
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
    // 1️⃣ Check Authorization Header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.split("Bearer ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 2️⃣ Verify Token
    const decodedToken = await admin.auth().verifyIdToken(token);

    // 3️⃣ Parse Request URL to get the user ID
    const uid = req.nextUrl.searchParams.get("uid");
    if (!uid) {
      return NextResponse.json({ error: "User ID (uid) is required" }, { status: 400 });
    }

    // 4️⃣ Fetch User Details
    const userRecord = await admin.auth().getUser(uid);
    const userDoc = await admin.firestore().collection("users").doc(uid).get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 5️⃣ Determine the user details to return based on the requester's role
    const requestedUser = userDoc.data();
    const userRole = decodedToken.role; // Get the role from the decoded token

    let userDetails: any = {
      name: requestedUser?.name,
      email: requestedUser?.email,
    };

    // Admin can see the role as well
    if (userRole === "admin") {
      userDetails = { ...userDetails, role: requestedUser?.role };
    }

    // If the requested user is the same as the requester, allow full access to their details
    if (decodedToken.uid === uid) {
      userDetails = { ...userDetails, ...requestedUser };
    }

    return NextResponse.json({ userDetails }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
