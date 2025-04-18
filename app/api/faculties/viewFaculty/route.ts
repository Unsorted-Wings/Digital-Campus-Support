import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt"; 
import { firestore } from "@/lib/firebase/firebaseAdmin";

export async function GET(req: NextRequest) {
  try {
    // 1️⃣ Check Authorization Header with NextAuth JWT Token
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { role, sub: uid } = token; // Assuming `sub` is the user ID (UID)

    // 2️⃣ Get `facultyId` from query params
    const url = new URL(req.url);
    const facultyId = url.searchParams.get("facultyId");

    if (!facultyId) {
      return NextResponse.json({ error: "Missing faculty ID" }, { status: 400 });
    }

    // 3️⃣ Fetch user and faculty data from Firestore
    const userDoc = await firestore.collection("users").doc(facultyId).get();
    const facultyDoc = await firestore.collection("faculty").doc(facultyId).get();

    if (!userDoc.exists || !facultyDoc.exists) {
      return NextResponse.json({ error: "Faculty not found" }, { status: 404 });
    }

    const userData = userDoc.data();
    const facultyData = facultyDoc.data();

    if (!userData || !facultyData) {
      return NextResponse.json({ error: "Incomplete faculty data" }, { status: 404 });
    }

    // 4️⃣ Return full details if requester is admin
    if (role === "admin") {
      return NextResponse.json({
        user: {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          role: userData.role,
          profilePicture: userData.profilePicture,
          createdAt: userData.createdAt,
          updatedAt: userData.updatedAt,
        },
        faculty: {
          id: facultyData.id,
          isMentor: facultyData.isMentor,
          qualification: facultyData.qualification,
          createdAt: facultyData.createdAt,
          updatedAt: facultyData.updatedAt,
        },
      }, { status: 200 });
    }

    // 5️⃣ Faculty viewing their own data
    if (uid === facultyId) {
      return NextResponse.json({
        user: {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          profilePicture: userData.profilePicture,
          createdAt: userData.createdAt,
          updatedAt: userData.updatedAt,
        },
        faculty: {
          id: facultyData.id,
          isMentor: facultyData.isMentor,
          qualification: facultyData.qualification,
          createdAt: facultyData.createdAt,
          updatedAt: facultyData.updatedAt,
        },
      }, { status: 200 });
    }

    // 6️⃣ Default: Public view with basic info
    return NextResponse.json({
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
      },
      faculty: {
        id: facultyData.id,
        isMentor: facultyData.isMentor,
        qualification: facultyData.qualification,
      },
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
