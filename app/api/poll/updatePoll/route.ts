import { NextRequest, NextResponse } from "next/server";
import { db, auth } from "@/lib/firebase/firebaseAdmin";

export async function PUT(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(token);

    if (decodedToken.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    const { id, question, options, allowMultipleSelection } = await req.json();

    if (!id) return NextResponse.json({ error: "Poll ID is required" }, { status: 400 });

    const pollRef = db.collection("polls").doc(id);
    const pollSnap = await pollRef.get();

    if (!pollSnap.exists) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 });
    }

    const updateData: any = {
      updatedAt: new Date().toISOString(),
    };

    if (question) updateData.question = question;
    if (options && Array.isArray(options)) updateData.options = options;
    if (allowMultipleSelection !== undefined) updateData.allowMultipleSelection = allowMultipleSelection;

    await pollRef.update(updateData);

    return NextResponse.json({ message: "Poll updated successfully" }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
