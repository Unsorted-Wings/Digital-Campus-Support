"use client";
import { AwaitedReactNode, JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal, useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Send, Search, MoreVertical, BarChart2 } from "lucide-react";
import Link from "next/link";
import { ref, onValue, off } from "firebase/database";
import { realtimeDB } from "@/lib/firebase/firebaseConfig"; // your firebase client instance

export default function ChatView() {

    const [chats, setChats] = useState<any[]>([]);
    const [messages, setMessages] = useState<any[]>([]);
    const [selectedChat, setSelectedChat] = useState<number | null>(null);
    const [message, setMessage] = useState("");
    const [showPollForm, setShowPollForm] = useState(false);
    const [pollQuestion, setPollQuestion] = useState("");
    const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
    const [polls, setPolls] = useState<any[]>([]);
    const [isFaculty, setIsFaculty] = useState(false);
    const [isAnnouncement, setIsAnnouncement] = useState(false);

    // Fetch chat rooms when the component mounts
    useEffect(() => {

        const userData = localStorage.getItem("user");
        const user = userData ? JSON.parse(userData) : null;

        fetch("/api/room/viewRoom")
            .then(res => res.json())
            .then(data => setChats(data))
            .catch(err => console.error("Error fetching rooms:", err));

    }, []);

    // Fetch messages when a chat is selected
    useEffect(() => {
        // fetchMessages();
        if (selectedChat === null) return;

        const userData = localStorage.getItem("user");
        const user = userData ? JSON.parse(userData) : null;
        const currentUserId = user?.uid;
        const roomId = chats[selectedChat]?.id;

        const chatRef = ref(realtimeDB, `chats/${roomId}`);

        // Real-time updates for messages
        const handleSnapshot = (snapshot: any) => {
            const messagesData = snapshot.val();

            if (!messagesData) return;

            const rawMessages = Object.entries(messagesData).map(([key, message]: any) => ({
                id: key,
                ...message,
                isSent: message.senderId === currentUserId,
            }));

            // Optional: Sort by timestamp for consistent ordering
            rawMessages.sort((a, b) => a.timestamp - b.timestamp);

            setMessages(rawMessages);
        };

        onValue(chatRef, handleSnapshot);

        if (user.role === "faculty") {
            setIsFaculty(true);
        }

        if (selectedChat !== null && chats[selectedChat]) {
            if (chats[selectedChat].type === "announcements") {
                setIsAnnouncement(true);
            }
        }

        // Cleanup listener when chat is changed or component unmounts
        return () => {
            off(chatRef); // Remove the listener when not needed
        };

    }, [selectedChat]);

    // Send message function
    const handleSend = async () => {
        const userData = localStorage.getItem("user");
        if (!userData) return;

        const user = JSON.parse(userData);
        const userId = user.uid;
        const userName = user.name;

        if (!userId || !userName || !message.trim() || selectedChat === null) return;

        const newMsg = {
            roomId: chats[selectedChat].id,
            senderId: userId,
            senderName: userName,
            message,
            type: chats[selectedChat].type,
        };

        try {
            const res = await fetch("/api/chat/createChat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newMsg),
            });

            const result = await res.json();

            if (res.ok) {
                // Immediately re-fetch all messages
                setMessage("");
            } else {
                console.error("Server error:", result.error);
            }
        } catch (err) {
            console.error("Error sending message:", err);
        }
    };

    // Create poll function
    const handleCreatePoll = () => {
        if (pollQuestion.trim() && pollOptions.every(opt => opt.trim())) {
            setPolls([
                ...polls,
                {
                    id: polls.length + 1,
                    question: pollQuestion,
                    options: pollOptions.map(opt => ({ text: opt, votes: 0 })),
                },
            ]);
            setPollQuestion("");
            setPollOptions(["", ""]);
            setShowPollForm(false);
        }
    };

    // Handle vote function
    const handleVote = (pollId: number, optionIdx: number) => {
        setPolls(prevPolls =>
            prevPolls.map(poll =>
                poll.id === pollId
                    ? {
                        ...poll,
                        options: poll.options.map((opt: { votes: number; }, idx: number) =>
                            idx === optionIdx ? { ...opt, votes: opt.votes + 1 } : opt
                        ),
                    }
                    : poll
            )
        );
    };

    const renderMessageContent = (text: string | undefined) => {
        if (!text) return null;

        const docLinkRegex = /\/docs\/[a-zA-Z0-9-]+\.pdf/;
        const match = text.match(docLinkRegex);
        if (match) {
            const link = match[0];
            return (
                <span>
                    {text.replace(link, "")}{" "}
                    <Link href="/student/docs" className="text-primary underline hover:text-primary/80">
                        {link}
                    </Link>
                </span>
            );
        }
        return text;
    };

    const bottomRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);


    return (
        <div className="flex h-[calc(100vh-5rem)] gap-6 p-6">
            {/* Sidebar */}
            <Card className="w-80 bg-card/95 backdrop-blur-md shadow-xl rounded-xl flex flex-col border-border relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-secondary/10 opacity-20 pointer-events-none" />
                <CardHeader className="p-4 border-b border-border relative z-10">
                    <CardTitle className="text-xl font-semibold text-foreground">Chats</CardTitle>
                    <div className="relative mt-2">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search chats..."
                            className="pl-9 bg-muted/50 border-border focus:ring-primary focus:border-primary rounded-lg text-sm"
                        />
                    </div>
                </CardHeader>
                <ScrollArea className="flex-1 relative z-10">
                    {chats.map((chat, idx) => (
                        <div
                            key={chat.id}
                            onClick={() => setSelectedChat(idx)}
                            className={cn(
                                "flex items-center gap-3 p-4 border-b border-border/50 cursor-pointer transition-all duration-300",
                                selectedChat === idx ? "bg-primary/20 border-l-4 border-primary rounded-l-lg" : "hover:bg-primary/10"
                            )}
                        >
                            <Avatar className="w-10 h-10">
                                <AvatarImage src={`/chat-${chat.id}.jpg`} alt={chat.name} />
                                <AvatarFallback className="bg-primary/20 text-primary">
                                    {chat.name?.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="text-foreground font-medium truncate">{chat.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{chat.lastMessage}</p>
                            </div>
                            <p className="text-xs text-muted-foreground flex-shrink-0">{chat.time}</p>
                        </div>
                    ))}
                </ScrollArea>
            </Card>

            {/* Chat Window */}
            {selectedChat !== null ? (
                <Card className="flex-1 bg-card/95 backdrop-blur-md shadow-xl rounded-xl flex flex-col relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-secondary/5 opacity-30 pointer-events-none" />
                    <CardHeader className="border-b border-border p-4 flex items-center justify-between sticky top-0 bg-card/95 z-10">
                        <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10">
                                <AvatarImage src={`/chat-${chats[selectedChat]?.id}.jpg`} alt={chats[selectedChat]?.name} />
                                <AvatarFallback className="bg-primary/20 text-primary">
                                    {chats[selectedChat]?.name?.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <CardTitle className="text-xl font-semibold text-foreground">
                                {chats[selectedChat]?.name}
                            </CardTitle>
                            <Button variant="ghost" className="text-foreground hover:bg-primary/10 p-2 rounded-full">
                                <MoreVertical className="h-5 w-5" />
                            </Button>
                        </div>
                    </CardHeader>
                    <ScrollArea className="flex-1 p-6 relative z-10">
                        <div className="space-y-4">
                            {messages.length === 0 ? (
                                <div className="text-center text-muted-foreground">
                                    No messages yet
                                </div>
                            ) : (
                                messages.map((msg, idx) => (
                                    <div
                                        key={idx}
                                        className={cn(
                                            "flex items-end gap-2",
                                            msg.isSent ? "justify-end" : "justify-start"
                                        )}
                                    >
                                        {!msg.isSent && (
                                            <Avatar className="w-8 h-8 flex-shrink-0">
                                                <AvatarFallback className="bg-primary/20 text-primary">
                                                    {msg.sender?.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                        )}
                                        <div
                                            className={cn(
                                                "max-w-[70%] p-3 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg",
                                                msg.isSent
                                                    ? "bg-primary text-primary-foreground rounded-br-none"
                                                    : "bg-muted/70 text-foreground rounded-bl-none"
                                            )}
                                        >
                                            <p className="text-xs font-medium text-opacity-80">{msg.senderName}</p>
                                            <p className="text-sm mt-1">{renderMessageContent(msg.message)}</p>
                                            <p className="text-xs mt-1 text-right">
                                                {new Date(msg.createdAt).toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}

                            {polls.map((poll) => (
                                <div
                                    key={poll.id}
                                    className="max-w-[70%] mx-auto p-4 bg-card rounded-lg shadow-md border border-border"
                                >
                                    <p className="text-sm font-semibold text-foreground">{poll.question}</p>
                                    <div className="mt-3 space-y-2">
                                        {poll.options.map((opt: { text: string; votes: number }, idx: Key | null | undefined) => (
                                            <div
                                                key={idx}
                                                className="flex items-center justify-between p-2 bg-muted/50 rounded-md cursor-pointer hover:bg-primary/10 transition-all duration-200"
                                                onClick={() => handleVote(poll.id, idx as number)}
                                            >
                                                <span className="text-sm text-foreground">{opt.text}</span>
                                                <span className="text-xs text-muted-foreground">{opt.votes} votes</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            <div ref={bottomRef} />
                        </div>
                    </ScrollArea>


                    <CardContent className="p-4 border-t border-border bg-card/95 relative z-10">
                        {showPollForm ? (
                            <div className="space-y-4">
                                <Input
                                    value={pollQuestion}
                                    onChange={e => setPollQuestion(e.target.value)}
                                    placeholder="Poll question"
                                    className="bg-muted/50 border-border focus:ring-primary focus:border-primary rounded-lg"
                                />
                                {pollOptions.map((opt, idx) => (
                                    <Input
                                        key={idx}
                                        value={opt}
                                        onChange={e => {
                                            const newOptions = [...pollOptions];
                                            newOptions[idx] = e.target.value;
                                            setPollOptions(newOptions);
                                        }}
                                        placeholder={`Option ${idx + 1}`}
                                        className="bg-muted/50 border-border focus:ring-primary focus:border-primary rounded-lg"
                                    />
                                ))}
                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => setPollOptions([...pollOptions, ""])}
                                        variant="outline"
                                        className="flex-1 border-border text-foreground hover:bg-primary/10"
                                    >
                                        Add Option
                                    </Button>
                                    <Button
                                        onClick={handleCreatePoll}
                                        className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg"
                                    >
                                        Create Poll
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                {
                                    isAnnouncement && !isFaculty ? (
                                        "You can only view this announcement"
                                    ) :
                                        (
                                            <>
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => setShowPollForm(true)}
                                                    className="text-foreground hover:bg-primary/10 p-2 rounded-full"
                                                >
                                                    <BarChart2 className="h-5 w-5" />
                                                </Button>
                                                <Input
                                                    value={message}
                                                    onChange={e => setMessage(e.target.value)}
                                                    placeholder="Type a message..."
                                                    className="flex-1 bg-muted/50 border-border focus:ring-primary focus:border-primary rounded-xl"
                                                    onKeyPress={e => e.key === "Enter" && handleSend()}
                                                />
                                                <Button
                                                    onClick={handleSend}
                                                    className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl p-2"
                                                >
                                                    <Send className="h-5 w-5" />
                                                </Button>
                                            </>
                                        )
                                }
                            </div>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                    Select a chat to start messaging
                </div>
            )}
        </div>
    );




}
