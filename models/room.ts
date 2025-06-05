import { Chat } from "./chat";

export type Room = {
    id: string;
    name: string;
    type: string;
    members: Array<string>;
    lastMessage : Chat | null;
    createdAt: string;
    updatedAt: string;
}