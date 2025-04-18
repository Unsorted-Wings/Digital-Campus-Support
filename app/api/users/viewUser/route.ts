import { NextRequest, NextResponse } from "next/server";
import { firestore } from "@/lib/firebase/firebaseAdmin"; // Ensure this is pointing to your Firestore admin instance
import { getToken } from "next-auth/jwt";

export async function GET(req: NextRequest) {
  try {
    // 1️⃣ Check Authorization Header and Verify Token using NextAuth
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2️⃣ Parse Request URL to get the user ID (uid)
    const uid = req.nextUrl.searchParams.get("uid");
    if (!uid) {
      return NextResponse.json({ error: "User ID (uid) is required" }, { status: 400 });
    }

    // 3️⃣ Fetch User Details from Firestore
    const userDoc = await firestore.collection("users").doc(uid).get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 4️⃣ Determine the user details to return based on the requester's role
    const requestedUser = userDoc.data();
    const userRole = token.role; // Get the role from the decoded token

    let userDetails: any = {
      name: requestedUser?.name,
      email: requestedUser?.email,
    };

    // Admin can see the role as well
    if (userRole === "admin") {
      userDetails = { ...userDetails, role: requestedUser?.role };
    }

    // If the requested user is the same as the requester, allow full access to their details
    if (token.uid === uid) {
      userDetails = { ...userDetails, ...requestedUser };
    }

    return NextResponse.json({ userDetails }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
