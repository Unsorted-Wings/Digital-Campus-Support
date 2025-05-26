import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
// import multer from "multer";
import { Readable } from "stream";
import { firestore ,admin} from "@/lib/firebase/firebaseAdmin";
import { getToken } from "next-auth/jwt"; 


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

    const uploaded = await new Promise((resolve, reject) => {
      const cloudStream = cloudinary.uploader.upload_stream(
        { resource_type: "auto", folder: "docs" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.pipe(cloudStream);
    });

    return NextResponse.json({ message: "Upload successful", data: uploaded });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


