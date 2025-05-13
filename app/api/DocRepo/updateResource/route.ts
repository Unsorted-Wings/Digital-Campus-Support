import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";
import { firestore, admin } from "@/lib/firebase/firebaseAdmin";

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
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const public_id = formData.get("public_id") as string; // Check for public_id

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const stream = bufferToStream(buffer);

    let uploaded;

    if (public_id) {
      // Update existing file
      try {
        console.log('reupload')
        uploaded = await new Promise((resolve, reject) => {
          const cloudStream = cloudinary.uploader.upload_stream(
            { public_id: public_id, resource_type: "auto" }, // Use public_id for update
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.pipe(cloudStream);
        });
      } catch (updateError) {
        console.error("Error updating file:", updateError);
        return NextResponse.json(
          { error: "Failed to update file", details: updateError },
          { status: 500 }
        );
      }
    } else {
      // Upload new file
      console.log('new upload')

      uploaded = await new Promise((resolve, reject) => {
        const cloudStream = cloudinary.uploader.upload_stream(
          { resource_type: "auto", folder: "docs" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.pipe(cloudStream);
      });
    }
    return NextResponse.json({ message: "Upload/Update successful", data: uploaded });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
