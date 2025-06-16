import { ref, onValue, Unsubscribe } from "firebase/database";
import { realtimeDB } from "../firebase/firebaseConfig";

interface Message {
    id: string;
    senderId: string;
    senderName: string;
    message: string;
    roomId: string;
    type: "message" | "poll";
    readBy: string[];
    reactions: {
        [emoji: string]: string[];
    };
    timestamp: string;
    createdAt: string;
    updatedAt: string;
    isSent: boolean;
    pollOptions?: {
        id: string;
        text: string;
        votes: string[];
    }[];
    allowsMultipleVotes?: boolean;
}

export function fetchMessages(
    roomId: string,
    userId: string | undefined,
    callback: (messages: Message[]) => void
): Unsubscribe {
    const messagesRef = ref(realtimeDB, `chats/${roomId}`);

    const unsubscribe = onValue(messagesRef, (snapshot) => {
        const data = snapshot.val();

        if (!data) {
            callback([]);
            return;
        }

        const loadedMessages: Message[] = Object.entries(data).map(
            ([key, value]: [string, any]) => ({
                id: value.id,
                senderId: value.senderId,
                senderName: value.senderName,
                message: value.message,
                roomId: value.roomId,
                type: value.type,
                reactions: value.reaction,
                timestamp: value.timestamp,
                createdAt: value.createdAt,
                updatedAt: value.updatedAt,
                readBy: value.readBy,
                isSent: value.senderId === userId,
                pollOptions: value.pollOptions
                    ? value.pollOptions.map((opt: any) => ({
                        id: opt.id,
                        text: opt.text,
                        votes: opt.votes || [],
                    }))
                    : undefined,
                allowsMultipleVotes: value.allowsMultipleVotes || false,
            })
        );

        callback(loadedMessages);
    });

    return unsubscribe; // use this to clean up in useEffect
}
