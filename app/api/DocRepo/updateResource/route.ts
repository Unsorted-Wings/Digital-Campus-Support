import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";
import { firestore, admin } from "@/lib/firebase/firebaseAdmin";
import { UploadApiResponse } from "cloudinary";
import { getToken } from "next-auth/jwt";
import { forceWebSockets } from "firebase/database";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper: Converts buffer to readable stream
function bufferToStream(buffer: Buffer): Readable {
  const readable = new Readable();
  readable.push(buffer);
  readable.push(null);
  return readable;
}

// POST endpoint: Handles both upload and update
export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const resource_id = formData.get("resource_id") as string; // Check for resource_id
    const cloudinaryResourceType = formData.get("cloudinaryResourceType") as "auto" | "image" | "video" | "raw" | undefined || "auto";
    console.log(cloudinaryResourceType, typeof (cloudinaryResourceType))
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const stream = bufferToStream(buffer);

    let uploaded;

    if (resource_id) {
      try {

        const document = admin.firestore().collection("resources").doc(resource_id);
        const doc = await document.get();
        if (!doc.exists) return NextResponse.json({ error: "Resource not found" }, { status: 404 });
        const data = doc.data();
        const assetId = data?.asset_id;
        await cloudinary.uploader.destroy(assetId, {
          resource_type: cloudinaryResourceType // Pass 'image' here
        });
        console.log("Old resource deleted from Cloudinary successfully.");
        const uploaded = await new Promise<UploadApiResponse>((resolve, reject) => {
          const cloudStream = cloudinary.uploader.upload_stream(
            { resource_type: "auto", folder: "docs" },
            (error: Error | undefined, result: UploadApiResponse | undefined) => {
              if (error || !result) {
                return reject(error || new Error("Upload failed"));
              }
              resolve(result);
            }
          );
          stream.pipe(cloudStream);
        });

        console.log("Uploaded to Cloudinary:", uploaded);

        const updates = {
          asset_id: uploaded.asset_id,
          name: formData.get("name")?.toString() || "",
          description: formData.get("description")?.toString() || "",
          courseId: formData.get("courseId")?.toString() || "",
          batchId: formData.get("batchId")?.toString() || "",
          subjectId: formData.get("subjectId")?.toString() || "",
          semesterId: formData.get("semesterId")?.toString() || "",
          createdBy: token.id,
          fileUrl: uploaded.secure_url,
          updatedAt: admin.firestore.Timestamp.now(),
          cloudinaryResourceType: uploaded.resource_type,

        };

        const docRef = firestore.collection("resources").doc(resource_id);
        await docRef.update(updates);
        return NextResponse.json({
          message: "Upload successful", data: {
            ...uploaded,
            resource_id: resource_id, // Include resource_id in response
          },
        });
      } catch (updateError) {
        console.error("Error updating file:", updateError);
        return NextResponse.json(
          { error: "Failed to update file", details: updateError },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json({ message: "Resource_id not provided" });
    }
    return NextResponse.json({ message: "Upload/Update successful", data: uploaded });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
