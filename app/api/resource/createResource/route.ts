import { NextRequest, NextResponse } from "next/server";
import { auth, db } from "@/lib/firebase/firebaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.split("Bearer ")[1];
    const decoded = await auth.verifyIdToken(token);

    if (!decoded.admin) {
      return NextResponse.json({ error: "Only admins can create resources" }, { status: 403 });
    }

    const body = await req.json();
    const { name, type, description, fileUrl } = body;

    if (!name || !type || !description || !fileUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const now = new Date().toISOString();
    const id = db.collection("resources").doc().id;

    const resource = {
      id,
      name,
      type,
      description,
      createdBy: decoded.uid,
      fileUrl,
      createdAt: now,
      updatedAt: now,
    };

    await db.collection("resources").doc(id).set(resource);
    return NextResponse.json({ message: "Resource created", id }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
