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

interface Chat {
  id: number;
  name: string;
  lastMessage: string;
  time: string;
}

interface Poll {
  id: number;
  question: string;
  options: { text: string; votes: number }[];
  allowMultiple: boolean;
  votes: { userId: number; optionIdx: number }[];
}

interface Message {
  id: number;
  chatId: number;
  type: "message" | "poll";
  sender: string;
  senderId: number;
  text?: string;
  time: string;
  isSent: boolean;
  readBy?: number[];
  reactions: { [userId: number]: string };
  poll?: Poll;
}

export default function ChatPage() {
  const [selectedChat, setSelectedChat] = useState<number | null>(0);
  const [message, setMessage] = useState("");
  const [showPollDialog, setShowPollDialog] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [pollError, setPollError] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const chats: Chat[] = [
    { id: 0, name: "Study Group", lastMessage: "Hey, let’s meet at 2 PM!", time: "12:30 PM" },
    { id: 1, name: "Prof. Smith", lastMessage: "Check the Calculus notes here: /docs/math-lecture.pdf", time: "10:15 AM" },
    { id: 2, name: "Jane Doe", lastMessage: "Can you send the notes?", time: "Yesterday" },
    { id: 3, name: "CS Club", lastMessage: "Event this Friday!", time: "Monday" },
  ];

  const currentUserId = 1;

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      chatId: 0,
      type: "message",
      sender: "You",
      senderId: 1,
      text: "Hey everyone, ready for the quiz?",
      time: "2025-04-22T12:25:00Z",
      isSent: true,
      readBy: [1],
      reactions: {},
    },
    {
      id: 2,
      chatId: 0,
      type: "message",
      sender: "Mike",
      senderId: 2,
      text: "Yeah, just reviewing now!",
      time: "2025-04-22T12:26:00Z",
      isSent: false,
      readBy: [2],
      reactions: { 1: "👍" },
    },
    {
      id: 3,
      chatId: 0,
      type: "message",
      sender: "You",
      senderId: 1,
      text: "Cool, see you at 2!",
      time: "2025-04-22T12:30:00Z",
      isSent: true,
      readBy: [1],
      reactions: {},
    },
    {
      id: 4,
      chatId: 0,
      type: "poll",
      sender: "You",
      senderId: 1,
      time: "2025-04-22T12:35:00Z",
      isSent: true,
      readBy: [1],
      reactions: {},
      poll: {
        id: 1,
        question: "What time for the study session?",
        options: [
          { text: "2 PM", votes: 2 },
          { text: "4 PM", votes: 1 },
        ],
        allowMultiple: false,
        votes: [
          { userId: 1, optionIdx: 0 },
          { userId: 2, optionIdx: 0 },
          { userId: 3, optionIdx: 1 },
        ],
      },
    },
    {
      id: 5,
      chatId: 1,
      type: "message",
      sender: "Prof. Smith",
      senderId: 4,
      text: "Check the Calculus notes here: /docs/math-lecture.pdf",
      time: "2025-04-22T10:15:00Z",
      isSent: false,
      readBy: [4],
      reactions: {},
    },
  ]);

  // Simulate read receipts
  useEffect(() => {
    const timer = setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) => ({
          ...m,
          readBy: m.readBy?.includes(currentUserId) ? m.readBy : [...(m.readBy || []), 2, 3, 4],
        }))
      );
    }, 5000);
    return () => clearTimeout(timer);
  }, [messages, currentUserId]);

  // Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    if (isToday(date)) return format(date, "HH:mm");
    if (isYesterday(date)) return `Yesterday ${format(date, "HH:mm")}`;
    return format(date, "MMM d, yyyy HH:mm");
  };

  const handleSend = () => {
    if (message.trim()) {
      const newMessage: Message = {
        id: messages.length + 1,
        chatId: selectedChat!,
        type: "message",
        sender: "You",
        senderId: currentUserId,
        text: message,
        time: new Date().toISOString(),
        isSent: true,
        readBy: [currentUserId],
        reactions: {},
      };
      setMessages([...messages, newMessage]);
      setMessage("");
    }
  };

  const handleCreatePoll = () => {
    if (!pollQuestion.trim()) {
      setPollError("Poll question is required.");
      return;
    }
    if (pollOptions.length < 2 || pollOptions.some((opt) => !opt.trim())) {
      setPollError("At least two non-empty options are required.");
      return;
    }
    const newPoll: Message = {
      id: messages.length + 1,
      chatId: selectedChat!,
      type: "poll",
      sender: "You",
      senderId: currentUserId,
      time: new Date().toISOString(),
      isSent: true,
      readBy: [currentUserId],
      reactions: {},
      poll: {
        id: messages.filter((m) => m.type === "poll").length + 1,
        question: pollQuestion,
        options: pollOptions.map((opt) => ({ text: opt, votes: 0 })),
        allowMultiple,
        votes: [],
      },
    };
    setMessages([...messages, newPoll]);
    setPollQuestion("");
    setPollOptions(["", ""]);
    setAllowMultiple(false);
    setShowPollDialog(false);
    setPollError("");
  };

  const handleVote = (pollId: number, optionIdx: number) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.type !== "poll" || msg.poll?.id !== pollId) return msg;
        const poll = { ...msg.poll! };
        const existingVote = poll.votes.find((v) => v.userId === currentUserId);
        if (!poll.allowMultiple && existingVote) {
          poll.votes = poll.votes.filter((v) => v.userId !== currentUserId);
          poll.options[existingVote.optionIdx].votes -= 1;
        }
        poll.votes.push({ userId: currentUserId, optionIdx });
        poll.options[optionIdx].votes += 1;
        return { ...msg, poll };
      })
    );
  };

  const handleReactMessage = (messageId: number, emoji: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId
          ? { ...m, reactions: { ...m.reactions, [currentUserId]: emoji } }
          : m
      )
    );
  };

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
    <div className="flex h-[calc(100vh-5rem)] gap-6 p-6 bg-background">
      {/* Sidebar */}
      <Card className="w-[250px] bg-card/95 backdrop-blur-md shadow-xl rounded-xl border-r border-border/50 flex flex-col">
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
          {chats.map((chat) => (
            <div
              key={chat.id}
              role="button"
              aria-label={`Select ${chat.name}`}
              onClick={() => setSelectedChat(chat.id)}
              className={cn(
                "flex items-center gap-3 p-4 border-b border-border/50 cursor-pointer transition-all duration-300",
                selectedChat === chat.id
                  ? "bg-primary/20 border-l-4 border-primary"
                  : "hover:bg-primary/10"
              )}
            >
              <Avatar className="w-10 h-10">
                <AvatarImage src={`/chat-${chat.id}.jpg`} alt={chat.name} />
                <AvatarFallback className="bg-primary/20 text-primary">
                  {chat.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 max-w-[220px]">
                <p className="text-foreground font-medium truncate">{chat.name}</p>
                <p className="text-xs text-muted-foreground truncate">{chat.lastMessage}</p>
              </div>
              <p className="text-xs text-muted-foreground flex-shrink-0">{chat.time}</p>
            </div>
          ))}
        </ScrollArea>
      </Card>

      {/* Chat Area */}
      {selectedChat !== null ? (
        <Card className="flex-1 bg-card/95 backdrop-blur-md shadow-xl rounded-xl flex flex-col">
          <CardHeader className="border-b border-border/30 p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-t-xl sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={`/chat-${selectedChat}.jpg`} alt={chats[selectedChat].name} />
                  <AvatarFallback className="bg-primary/20 text-primary">
                    {chats[selectedChat].name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-xl font-semibold text-foreground">
                  {chats[selectedChat].name}
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
          <ScrollArea className="flex-1 p-6" ref={scrollRef}>
            <div className="space-y-4">
              {messages
                .filter((msg) => msg.chatId === selectedChat)
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
                        <AvatarImage src={`/user-${msg.sender}.jpg`} alt={msg.sender} />
                        <AvatarFallback className="bg-primary/20 text-primary">
                          {msg.sender.charAt(0)}
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
                        <p className="text-xs font-medium">{msg.sender}</p>
                        <p className="text-sm mt-1">{renderMessageContent(msg.text || "")}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <p className="text-xs text-muted-foreground">{formatTimestamp(msg.time)}</p>
                          {msg.isSent && (
                            <CheckCheck
                              className={cn(
                                "h-4 w-4",
                                msg.readBy?.length === 3 ? "text-primary" : "text-muted-foreground"
                              )}
                            />
                          )}
                        </div>
                        {Object.keys(msg.reactions).length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {Object.entries(msg.reactions).map(([userId, emoji]) => (
                              <span key={userId} className="text-xs">{emoji}</span>
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
                        <p className="text-xs font-medium">{msg.sender}</p>
                        <p className="text-sm font-semibold mt-1">{msg.poll?.question}</p>
                        <div className="mt-3 space-y-2">
                          {msg.poll?.options.map((opt, idx) => {
                            const totalVotes = msg.poll?.options.reduce((sum, o) => sum + o.votes, 0) || 0;
                            const percentage = totalVotes ? (opt.votes / totalVotes) * 100 : 0;
                            const userVoted = msg.poll?.votes.some(
                              (v) => v.userId === currentUserId && v.optionIdx === idx
                            );
                            return (
                              <div
                                key={idx}
                                className="flex items-center gap-2 p-2 bg-muted/50 rounded-md cursor-pointer hover:bg-primary/10 transition-all duration-200"
                                onClick={() => handleVote(msg.poll!.id, idx)}
                              >
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-foreground">
                                      {idx + 1}. {opt.text}
                                    </span>
                                    {userVoted && <Check className="h-4 w-4 text-primary" />}
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
                                <span className="text-xs text-muted-foreground">{opt.votes} votes</span>
                              </div>
                            );
                          })}
                        </div>
                        <div className="flex items-center gap-1 mt-2">
                          <p className="text-xs text-muted-foreground">{formatTimestamp(msg.time)}</p>
                          {msg.isSent && (
                            <CheckCheck
                              className={cn(
                                "h-4 w-4",
                                msg.readBy?.length === 3 ? "text-primary" : "text-muted-foreground"
                              )}
                            />
                          )}
                        </div>
                        {Object.keys(msg.reactions).length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {Object.entries(msg.reactions).map(([userId, emoji]) => (
                              <span key={userId} className="text-xs">{emoji}</span>
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
                        <AvatarFallback className="bg-primary/20 text-primary">Y</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
              {isTyping && (
                <div className="text-sm text-muted-foreground italic">Typing...</div>
              )}
            </div>
          </ScrollArea>
          <CardContent className="p-4 border-t border-border/30 bg-card/95">
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
            </div>
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