import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
// import multer from "multer";
import { Readable } from "stream";
import { firestore, admin } from "@/lib/firebase/firebaseAdmin";
import { getToken } from "next-auth/jwt";
import { UploadApiResponse } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}
// Helper: Converts buffer to readable stream
function bufferToStream(buffer: Buffer): Readable {
  const readable = new Readable();
  readable.push(buffer);
  readable.push(null);
  return readable;
}

// Middleware: parses multipart/form-data (Node.js built-in workaround)
export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify if the user has the "admin" role
    const { role } = token; // Assuming the role is included in the JWT token
    // if (role !== "admin") {
    //   return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    // }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    } 

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const stream = bufferToStream(buffer);

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
          
    const ref = firestore.collection("resources").doc();
    const newDoc = {
      id: ref.id,
      asset_id: uploaded.asset_id,
      name:formData.get("name")?.toString() || "",
      type: formData.get("type")?.toString() || "",
      description: formData.get("description")?.toString() || "",
      courseId: formData.get("courseId")?.toString() || "",
      batchId: formData.get("batchId")?.toString() || "",
      subjectId: formData.get("subjectId")?.toString() || "",
      semesterId: formData.get("semesterId")?.toString() || "",
      createdBy: token.id,
      fileUrl: uploaded.secure_url,
      createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
     cloudinaryResourceType: uploaded.resource_type,
      };
    await ref.set(newDoc);
    

    return NextResponse.json({
      message: "Upload successful", data: {
        ...uploaded,
        resource_id: ref.id,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


