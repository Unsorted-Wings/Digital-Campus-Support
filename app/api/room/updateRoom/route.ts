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

export async function PUT(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.split("Bearer ")[1];
    const decoded = await admin.auth().verifyIdToken(token);
    if (decoded.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id, name, type, members } = await req.json();

    if (!id) return NextResponse.json({ error: "Missing room ID" }, { status: 400 });

    const ref = admin.firestore().collection("rooms").doc(id);
    const doc = await ref.get();
    if (!doc.exists) return NextResponse.json({ error: "Room not found" }, { status: 404 });

    const updatedData: any = {
      updatedAt: new Date().toISOString(),
    };
    if (name) updatedData.name = name;
    if (type) updatedData.type = type;
    if (Array.isArray(members)) updatedData.members = members;

    await ref.update(updatedData);

    return NextResponse.json({ message: "Room updated successfully", id }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
