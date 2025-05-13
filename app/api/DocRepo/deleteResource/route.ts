import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { firestore, admin } from "@/lib/firebase/firebaseAdmin"; // Assuming you're using Firestore

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function DELETE(req: NextRequest) {
  try {
    const { public_id } = await req.json(); // Expecting the public_id in the request body

    if (!public_id) {
      return NextResponse.json({ error: "Missing public_id for deletion" }, { status: 400 });
    }
    // const result = await cloudinary.uploader.destroy(public_id, { resource_type: "raw" }); 
    const result = await cloudinary.uploader.destroy(public_id); 

    console.log(result)

    if (result.result === "ok") {
     
      // const assignmentRef = firestore.collection('assignments').doc(documentId);
      // await assignmentRef.update({ fileUrl: admin.firestore.FieldValue.delete() });
      // Or, if you have a collection of files, you might query and delete based on the public_id

      return NextResponse.json({ message: "File deleted successfully", data: result });
    } else if (result.result === "not found") {
      return NextResponse.json({ error: "File not found on Cloudinary" }, { status: 404 });
    } else {
      return NextResponse.json({ error: "Failed to delete file on Cloudinary", details: result }, { status: 500 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


// async function deleteAssignment(publicId: string) {
//     try {
//       const response = await fetch('/api/deleteAssignment', {
//         method: 'DELETE',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ public_id: publicId }),
//       });
  
//       const data = await response.json();
  
//       if (response.ok) {
//         console.log('Assignment deleted:', data);
//         // Optionally, update your UI after successful deletion
//       } else {
//         console.error('Error deleting assignment:', data.error);
//         // Handle the error in your UI
//       }
//     } catch (error) {
//       console.error('An unexpected error occurred:', error);
//     }
//   }
  
  // Example usage:
  // deleteAssignment('your_cloudinary_public_id');