import { NextRequest, NextResponse } from "next/server";
import { auth, db } from "@/lib/firebase/firebaseAdmin";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.split("Bearer ")[1];
    const decoded = await auth.verifyIdToken(token);

    if (!decoded.admin) {
      return NextResponse.json(
        { error: "Only admins can view resources" },
        { status: 403 }
      );
    }

    const snapshot = await db.collection("resources").get();
    const data = snapshot.docs.map((doc) => doc.data());

    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
