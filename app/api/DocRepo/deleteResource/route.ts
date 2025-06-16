import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import * as admin from "firebase-admin";
import { v2 as cloudinary } from "cloudinary";

// Init Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

// Init Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function DELETE(req: NextRequest) {
  try {
    // Auth
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // if (token.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // Body
    const {resource_id,cloudinaryResourceType } = await req.json();
    if (!resource_id || !cloudinaryResourceType) return NextResponse.json({ error: "Missing resource ID" }, { status: 400 });

    const docRef = admin.firestore().collection("resources").doc(resource_id);
    const doc = await docRef.get();
    if (!doc.exists) return NextResponse.json({ error: "Resource not found" }, { status: 404 });

    const data = doc.data();
    const assetId = data?.asset_id;

    // Delete from Cloudinary using asset_id
    if (assetId) {
      try {
        await cloudinary.api.delete_resources([assetId], { resource_type: cloudinaryResourceType  });
      } catch (err: any) {
        console.warn("Cloudinary deletion failed:", err);
        // Optional: still proceed with Firestore deletion even if Cloudinary fails
      }
    }

    // Delete Firestore doc
    await docRef.delete();

    return NextResponse.json({ message: "Resource deleted", resource_id }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
