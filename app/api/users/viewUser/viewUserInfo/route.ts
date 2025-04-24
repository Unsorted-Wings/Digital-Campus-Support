import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { firestore } from "@/lib/firebase/firebaseAdmin";

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token || !token.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const snapshot = await firestore
    .collection("users")
    .where("email", "==", token.email)
    .limit(1)
    .get();

  if (snapshot.empty) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const user = snapshot.docs[0].data();

  return NextResponse.json({
    uid: snapshot.docs[0].id,
    email: user.email,
    name: user.name,
    role: user.role,
  });
}
