"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Send, Search, MoreVertical, BarChart2, CheckCheck, X, Smile, Check } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { format, isToday, isYesterday } from "date-fns";
import Link from "next/link";
import { Room } from "@/models/room";
import { fetchMessages } from "@/lib/chat/fetchChat";

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  roomId: string;
  type: "message" | "poll";
  timestamp: string;
  isSent: boolean;
  reactions: {
    [emoji: string]: string[];
  };
  createdAt: string;
  updatedAt: string;
  readBy: string[];

  pollOptions?: {
    id: string;
    text: string;
    votes: string[];
  }[];
  allowsMultipleVotes?: boolean;
}

interface User {
  uid: string;
  email: string;
  name: string;
  role: string;
};

export default function ChatPage() {
  const [user, setUser] = useState<User | null>(null);
  const [selectedChat, setSelectedChat] = useState<Room | null>(null);
  const [message, setMessage] = useState("");
  const [showPollDialog, setShowPollDialog] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [pollError, setPollError] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [rooms, setRooms] = useState<Room[] | null>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  // Fetch user from local storage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Fetch rooms from the server
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await fetch("/api/room/viewRoom"); // Assuming your API route is at /api/room
        if (!res.ok) throw new Error("Failed to fetch rooms");

        const data = await res.json();
        setRooms(data);
      } catch (err: any) {
        console.error(err.message);
      }
    };

    fetchRooms();
  }, []);

  // fetch messages
  useEffect(() => {
    if (!selectedChat) return;

    const unsubscribe = fetchMessages(
      selectedChat.id,
      user?.uid,
      (fetchedMessages) => {
        setMessages(fetchedMessages);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [selectedChat, user?.uid]);

  // update read status when messages change
  useEffect(() => {
    if (!user || !selectedChat || messages.length === 0) return;

    const unreadMessageIds = messages
      .filter((msg) => !msg.readBy?.includes(user.uid))
      .map((msg) => msg.id);

    if (unreadMessageIds.length === 0) return;

    const updateReadStatus = async () => {
      try {
        const res = await fetch("/api/chat/updateChat/readBy", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            roomId: selectedChat.id,
            chatIds: unreadMessageIds,
            userId: user.uid,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          console.error("Failed to update read status:", data.error);
        }
      } catch (err) {
        console.error("Read status update error:", err);
      }
    };

    updateReadStatus();
  }, [messages, user, selectedChat]);

  // Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);

    if (isNaN(date.getTime())) return "";
    if (isToday(date)) return format(date, "HH:mm");
    if (isYesterday(date)) return `Yesterday ${format(date, "HH:mm")}`;
    return format(date, "MMM d, yyyy HH:mm");
  };

  const handleSend = async () => {
    if (!message.trim() && !user) return;

    try {
      const res = await fetch("/api/chat/createChat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",

        },
        body: JSON.stringify({
          senderId: user?.uid,
          senderName: user?.name,
          message: message,
          reaction: {
            "👍": 0,
            "❤️": 0,
            "😂": 0,
          },
          readBy: [user?.uid],
          roomId: selectedChat?.id,
          type: "message",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        return;
      }

      setMessage("")
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const handleCreatePoll = async () => {
    if (!selectedChat || !user) {
      setPollError("You must select a chat and be logged in to create a poll.");
      return;
    }

    if (!pollQuestion.trim()) {
      setPollError("Poll question is required.");
      return;
    }

    if (pollOptions.length < 2 || pollOptions.some((opt) => !opt.trim())) {
      setPollError("At least two non-empty options are required.");
      return;
    }

    const pollOptionObjects = pollOptions.map((opt, index) => ({
      id: `opt${index + 1}`,
      text: opt.trim(),
      votes: [],
    }));

    const pollPayload = {
      senderId: user.uid,
      senderName: user.name,
      message: pollQuestion.trim(),
      roomId: selectedChat.id,
      type: "poll",
      readBy: [user.uid],
      reaction: {},
      timestamp: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      pollOptions: pollOptionObjects,
      allowsMultipleVotes: allowMultiple,
    };

    try {
      const res = await fetch("/api/chat/createChat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pollPayload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create poll");
      }

      setPollQuestion("");
      setPollOptions(["", ""]);
      setAllowMultiple(false);
      setShowPollDialog(false);
      setPollError("");
    } catch (err: any) {
      console.error("Poll creation failed:", err.message);
      setPollError("Failed to create poll. Please try again.");
    }
  };

  const handleVote = async (chatId: string, optionIdx: number) => {
    if (!user || !selectedChat?.id) return;

    try {
      const res = await fetch("/api/chat/updateChat/pollVotes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatId,
          roomId: selectedChat.id,
          optionIdx,
          userId: user.uid,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Vote failed:", data.error);
      }
    } catch (err) {
      console.error("Vote error:", err);
    }
  };

  async function handleReactMessage(chatId: string, emoji: string) {

    if (!selectedChat && !user) return;

    const userId = user?.uid;
    const roomId = selectedChat?.id;

    const res = await fetch('/api/chat/updateChat/reaction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId, chatId, emoji, userId }),
    });

    const data = await res.json();
    if (data.error) {
      console.error('Failed to update reaction:', data.error);
    }
  }

  const renderMessageContent = (text: string) => {
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

  return (
    <div className="flex h-[calc(100vh-6.5rem)] gap-6 p-6 bg-background">
      {/* Sidebar */}
      <Card className="w-[300px] bg-card/95 backdrop-blur-md shadow-xl rounded-xl border-r border-border/50 flex flex-col">
        <CardHeader className="p-4 border-b border-border/30">
          <CardTitle className="text-xl font-semibold text-foreground">Chats</CardTitle>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search chats..."
              className="pl-9 bg-muted/50 border-border rounded-full shadow-sm focus:ring-2 focus:ring-primary transition-all duration-300"
            />
          </div>
        </CardHeader>
        <ScrollArea className="flex-1">
          {rooms?.map((room) => (
            <div
              key={room.id}
              role="button"
              aria-label={`Select ${room.name}`}
              onClick={() => setSelectedChat(room)}
              className={cn(
                "flex items-center gap-3 p-4 border-b border-border/50 cursor-pointer transition-all duration-300",
                selectedChat?.id === room.id
                  ? "bg-primary/20 border-l-4 border-primary rounded-l-lg"
                  : "hover:bg-primary/10"
              )}
            >
              <Avatar className="w-10 h-10">
                <AvatarImage src={`/chat-${room.id}.jpg`} alt={room.name} />
                <AvatarFallback className="bg-primary/20 text-primary">
                  {room.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-foreground font-medium truncate">{room.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {room.lastMessage
                    ? `${room.lastMessage.senderName}: ${room.lastMessage.type === "poll"
                      ? "📊 Poll"
                      : room.lastMessage.message
                    }`
                    : "No messages yet"
                  }

                </p>
              </div>
              <p className="text-xs text-muted-foreground flex-shrink-0">{formatTimestamp(room.lastMessage?.updatedAt ?? "")}</p>
            </div>
          ))}
        </ScrollArea>
      </Card>
      {/* Chat Area */}
      {selectedChat !== null ? (
        <Card className="flex-1 bg-card/95 backdrop-blur-md shadow-xl rounded-xl flex flex-col h-full min-h-0">
          <CardHeader className="border-b border-border/30 p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-t-xl sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={`/chat-${selectedChat}.jpg`} alt={selectedChat?.name} />
                  <AvatarFallback className="bg-primary/20 text-primary">
                    {selectedChat?.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-xl font-semibold text-foreground">
                  {selectedChat?.name}
                </CardTitle>
              </div>
              <Button
                variant="ghost"
                className="text-foreground hover:bg-primary/20 rounded-full p-2"
              >
                <MoreVertical className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>
          <ScrollArea className="flex-1 p-6 h-full min-h-0 " ref={scrollRef}>
            <div className="space-y-4">

              {
                messages.filter((msg) => msg.roomId === selectedChat?.id).length === 0 ? (
                  <div className="text-center text-sm text-muted mt-4">No messages yet</div>
                ) : (messages.filter((msg) => msg.roomId === selectedChat.id)
                  .map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex items-end gap-2",
                        msg.isSent ? "justify-end" : "justify-start"
                      )}
                    >
                      {!msg.isSent && (
                        <Avatar className="w-8 h-8 flex-shrink-0">
                          <AvatarImage src={`/user-${msg.senderId}.jpg`} alt={msg.senderName} />
                          <AvatarFallback className="bg-primary/20 text-primary">
                            {msg.senderName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      {msg.type === "message" ? (
                        <div
                          className={cn(
                            "max-w-[70%] p-3 rounded-lg shadow-sm transition-all duration-300 hover:shadow-md",
                            msg.isSent
                              ? "bg-gradient-to-r from-primary/80 to-primary/60 text-primary-foreground rounded-tr-none"
                              : "bg-muted/70 text-foreground rounded-tl-none"
                          )}
                        >
                          <p className="text-xs font-medium">{msg.senderName}</p>
                          <p className="text-sm mt-1">{renderMessageContent(msg.message || "")}</p>
                          <div className="flex items-center gap-1 mt-1 justify-end">
                            <p className="text-xs text-muted-foreground">{formatTimestamp(msg.updatedAt)}</p>
                            {msg.isSent && (
                              <CheckCheck
                                className={cn(
                                  "h-4 w-4",
                                  msg.readBy?.length === selectedChat.members.length
                                    ? "text-primary"
                                    : "text-muted-foreground"
                                )}
                              />
                            )}
                          </div>
                          {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                            <div className="flex gap-2 mt-1">
                              {Object.entries(msg.reactions)
                                .filter(([_, userIds]) => Array.isArray(userIds) && userIds.length > 0)
                                .map(([emoji, userIds]) => (
                                  <span key={emoji} className="text-xs">
                                    {emoji} {userIds.length}
                                  </span>
                                ))}
                            </div>
                          )}
                          <Select
                            onValueChange={(emoji) => handleReactMessage(msg.id, emoji)}
                          >
                            <SelectTrigger className="w-10 h-6 p-0 border-none bg-transparent">
                              <Smile className="h-4 w-4 text-muted-foreground" />
                            </SelectTrigger>
                            <SelectContent>
                              {["👍", "❤️", "😂"].map((emoji) => (
                                <SelectItem key={emoji} value={emoji}>{emoji}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ) : (
                        <div
                          className={cn(
                            "max-w-[70%] p-4 rounded-lg shadow-sm transition-all duration-300 hover:shadow-md",
                            msg.isSent
                              ? "bg-gradient-to-r from-primary/10 to-secondary/10 text-foreground rounded-tr-none"
                              : "bg-muted/70 text-foreground rounded-tl-none"
                          )}
                        >
                          <p className="text-xs font-medium">{msg.senderName}</p>
                          <p className="text-sm font-semibold mt-1">{msg.message}</p>
                          <div className="mt-3 space-y-2">
                            {msg.pollOptions?.map((opt, idx) => {
                              const totalVotes = msg.pollOptions?.reduce((sum, o) => sum + o.votes.length, 0) || 0;
                              const percentage = totalVotes ? (opt.votes.length / totalVotes) * 100 : 0;
                              const userVoted = user?.uid ? opt.votes.includes(user.uid) : false;

                              return (
                                <div
                                  key={idx}
                                  className="flex items-center gap-2 p-2 bg-muted/50 rounded-md cursor-pointer hover:bg-primary/10 transition-all duration-200"
                                  onClick={() => handleVote(msg.id, idx)}
                                >
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      {userVoted && <Check className="h-4 w-4 text-primary" />}
                                      <span className="text-sm text-foreground">
                                        {opt.text}
                                      </span>
                                    </div>
                                    <div className="w-full bg-muted/30 h-1.5 rounded-full mt-1">
                                      <div
                                        className={cn(
                                          "h-1.5 rounded-full",
                                          userVoted ? "bg-primary/50" : "bg-primary/30"
                                        )}
                                        style={{ width: `${percentage}%` }}
                                      />
                                    </div>
                                  </div>
                                  <span className="text-xs text-muted-foreground">{opt.votes.length} votes</span>
                                </div>
                              );
                            })}

                          </div>
                          <div className="flex items-center gap-1 mt-2 justify-end">
                            <p className="text-xs text-muted-foreground">{formatTimestamp(msg.updatedAt)}</p>
                            {msg.isSent && (
                              <CheckCheck
                                className={cn(
                                  "h-4 w-4",
                                  msg.readBy?.length === selectedChat.members.length
                                    ? "text-primary"
                                    : "text-muted-foreground"
                                )}
                              />
                            )}
                          </div>
                          {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                            <div className="flex gap-2 mt-1">
                              {Object.entries(msg.reactions)
                                .filter(([_, userIds]) => Array.isArray(userIds) && userIds.length > 0)
                                .map(([emoji, userIds]) => (
                                  <span key={emoji} className="text-xs">
                                    {emoji} {userIds.length}
                                  </span>
                                ))}
                            </div>
                          )}
                          <Select
                            onValueChange={(emoji) => handleReactMessage(msg.id, emoji)}
                          >
                            <SelectTrigger className="w-10 h-6 p-0 border-none bg-transparent">
                              <Smile className="h-4 w-4 text-muted-foreground" />
                            </SelectTrigger>
                            <SelectContent>
                              {["👍", "❤️", "😂"].map((emoji) => (
                                <SelectItem key={emoji} value={emoji}>{emoji}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      {msg.isSent && (
                        <Avatar className="w-8 h-8 flex-shrink-0">
                          <AvatarImage src="/user-you.jpg" alt="You" />
                          <AvatarFallback className="bg-primary/20 text-primary">{msg.senderName.charAt(0)}</AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  )))
              }

              {isTyping && (
                <div className="text-sm text-muted-foreground italic">Typing...</div>
              )}
            </div>
          </ScrollArea>
          <CardContent className="p-4 border-t border-border/30 bg-card/95">

            {selectedChat.type !== "announcements" ?
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  onClick={() => setShowPollDialog(true)}
                  className="text-foreground hover:bg-primary/20 rounded-full p-2"
                >
                  <BarChart2 className="h-5 w-5" />
                </Button>
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-muted/50 border-border rounded-full shadow-sm focus:ring-2 focus:ring-primary transition-all duration-300"
                  onKeyPress={(e) => e.key === "Enter" && handleSend()}
                />
                <Button
                  onClick={handleSend}
                  className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:bg-primary/90 rounded-full shadow-sm hover:shadow-md transition-all duration-300 p-2"
                >
                  <Send className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setIsTyping(!isTyping)}
                  className="text-muted-foreground hover:bg-primary/20 rounded-full p-2"
                >
                  Toggle Typing
                </Button>
              </div> : <div className="w-full text-center text-muted-foreground">You cannot send message to this group</div>}
          </CardContent>
        </Card> 
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          Select a chat to start messaging
        </div>
      )}

      {/* Poll Creation Dialog */}
      <Dialog open={showPollDialog} onOpenChange={setShowPollDialog}>
        <DialogContent className="bg-card/95 backdrop-blur-md shadow-xl rounded-xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Create Poll</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 p-4">
            {pollError && <p className="text-destructive text-sm">{pollError}</p>}
            <div>
              <Label htmlFor="pollQuestion" className="text-foreground">Question</Label>
              <Input
                id="pollQuestion"
                value={pollQuestion}
                onChange={(e) => setPollQuestion(e.target.value)}
                placeholder="Ask a question..."
                className="bg-muted/50 border-border rounded-lg focus:ring-2 focus:ring-primary transition-all duration-300"
              />
            </div>
            <div>
              <Label className="text-foreground">Options</Label>
              {pollOptions.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2 mt-2">
                  <Input
                    value={opt}
                    onChange={(e) => {
                      const newOptions = [...pollOptions];
                      newOptions[idx] = e.target.value;
                      setPollOptions(newOptions);
                    }}
                    placeholder={`Option ${idx + 1}`}
                    className="bg-muted/50 border-border rounded-lg focus:ring-2 focus:ring-primary transition-all duration-300"
                  />
                  {pollOptions.length > 2 && (
                    <Button
                      variant="ghost"
                      onClick={() => setPollOptions(pollOptions.filter((_, i) => i !== idx))}
                      className="text-destructive hover:bg-destructive/10 p-2"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                onClick={() => setPollOptions([...pollOptions, ""])}
                variant="outline"
                className="mt-2 w-full border-border text-foreground hover:bg-primary/20 transition-all duration-300"
              >
                Add Option
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="allowMultiple" className="text-foreground">Allow multiple answers</Label>
              <Switch
                id="allowMultiple"
                checked={allowMultiple}
                onCheckedChange={setAllowMultiple}
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowPollDialog(false)}
                className="border-border text-foreground hover:bg-primary/20 transition-all duration-300"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreatePoll}
                className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:bg-primary/90 rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
              >
                Create
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}