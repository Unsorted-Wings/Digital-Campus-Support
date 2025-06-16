import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { firestore, getRealtimeDB } from "@/lib/firebase/firebaseAdmin";

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Fetch all rooms from Firestore
    const snapshot = await firestore.collection("rooms").get();
    const rooms = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((room: any) => room.members && room.members.includes(token.id));

    // 2. Fetch last message from Realtime DB for each room
    const db = getRealtimeDB();

    const roomsWithLastMessages = await Promise.all(
      rooms.map(async (room: any) => {
        const roomId = room.id;
        const messagesRef = db.ref(`chats/${roomId}`).limitToLast(1);

        const snapshot = await messagesRef.once("value");
        const messages = snapshot.val();

        let lastMessage = null;

        if (messages) {
          const [_, messageData] = Object.entries(messages)[0];
          lastMessage = messageData;
        }

        return {
          ...room,
          lastMessage,
        };
      })
    );

    return NextResponse.json(roomsWithLastMessages, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
