"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Send, Search, MoreVertical, BarChart2, Check, X } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export default function ChatPage() {
  const [selectedChat, setSelectedChat] = useState<number | null>(0);
  const [message, setMessage] = useState("");
  const [showPollDialog, setShowPollDialog] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [pollError, setPollError] = useState("");

  // Mock data (replace with real data)
  const chats = [
    { id: 0, name: "Study Group", lastMessage: "Hey, let’s meet at 2 PM!", time: "12:30 PM" },
    { id: 1, name: "Prof. Smith", lastMessage: "Check the Calculus notes here: /docs/math-lecture.pdf", time: "10:15 AM" },
    { id: 2, name: "Jane Doe", lastMessage: "Can you send the notes?", time: "Yesterday" },
    { id: 3, name: "CS Club", lastMessage: "Event this Friday!", time: "Monday" },
  ];

  const currentUserId = 1; // Hardcode "You" as user ID 1

  const messages = [
    { id: 1, type: "message", sender: "You", senderId: 1, text: "Hey everyone, ready for the quiz?", time: "12:25 PM", isSent: true },
    { id: 2, type: "message", sender: "Mike", senderId: 2, text: "Yeah, just reviewing now!", time: "12:26 PM", isSent: false },
    { id: 3, type: "message", sender: "You", senderId: 1, text: "Cool, see you at 2!", time: "12:30 PM", isSent: true },
    {
      id: 4,
      type: "poll",
      sender: "You",
      senderId: 1,
      time: "12:35 PM",
      isSent: true,
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
    { id: 5, type: "message", sender: "Prof. Smith", senderId: 4, text: "Check the Calculus notes here: /docs/math-lecture.pdf", time: "10:15 AM", isSent: false },
  ];

  const handleSend = () => {
    if (message.trim()) {
      console.log("Sending:", message); // Replace with actual send logic
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
    const newPoll = {
      id: messages.length + 1,
      type: "poll",
      sender: "You",
      senderId: currentUserId,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isSent: true,
      poll: {
        id: messages.filter((m) => m.type === "poll").length + 1,
        question: pollQuestion,
        options: pollOptions.map((opt) => ({ text: opt, votes: 0 })),
        allowMultiple,
        votes: [],
      },
    };
    messages.push(newPoll); // Update messages array (use state in production)
    setPollQuestion("");
    setPollOptions(["", ""]);
    setAllowMultiple(false);
    setShowPollDialog(false);
    setPollError("");
    console.log("Poll created:", newPoll);
  };

  const handleVote = (pollId: number, optionIdx: number) => {
    const pollMsg = messages.find((m) => m.type === "poll" && m.poll?.id === pollId);
    if (!pollMsg || pollMsg.type !== "poll") return;

    const existingVote = pollMsg.poll?.votes.find((v) => v.userId === currentUserId);
    if (pollMsg.poll && !pollMsg.poll.allowMultiple && existingVote) {
      // Remove existing vote
      pollMsg.poll.votes = pollMsg.poll?.votes.filter((v) => v.userId !== currentUserId);
      pollMsg.poll.options[existingVote.optionIdx].votes -= 1;
    }

    // Add new vote
    pollMsg.poll?.votes.push({ userId: currentUserId, optionIdx });
    if (pollMsg.poll && pollMsg.poll.options[optionIdx]) {
      pollMsg.poll.options[optionIdx].votes += 1;
    }

    // Trigger re-render (use state in production)
    messages[messages.indexOf(pollMsg)] = { ...pollMsg };
    console.log("Voted:", { pollId, optionIdx, userId: currentUserId });
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
    <div className="flex h-[calc(100vh-5rem)] gap-6 p-6">
      {/* Left Sidebar: Chat List */}
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
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setSelectedChat(chat.id)}
              className={cn(
                "flex items-center gap-3 p-4 border-b border-border/50 cursor-pointer transition-all duration-300",
                selectedChat === chat.id
                  ? "bg-primary/20 border-l-4 border-primary rounded-l-lg"
                  : "hover:bg-primary/10"
              )}
            >
              <Avatar className="w-10 h-10">
                <AvatarImage src={`/chat-${chat.id}.jpg`} alt={chat.name} />
                <AvatarFallback className="bg-primary/20 text-primary">
                  {chat.name.charAt(0)}
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

      {/* Right: Active Chat */}
      {selectedChat !== null ? (
        <Card className="flex-1 bg-card/95 backdrop-blur-md shadow-xl rounded-xl flex flex-col relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-secondary/5 opacity-30 pointer-events-none" />
          <CardHeader className="border-b border-border p-4 flex items-center justify-between sticky top-0 bg-card/95 z-10">
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
              className="text-foreground hover:bg-primary/10 p-2 rounded-full"
            >
              <MoreVertical className="h-5 w-5" />
            </Button>
          </CardHeader>
          <ScrollArea className="flex-1 p-6 relative z-10">
            <div className="space-y-4">
              {messages
                .filter((msg) => msg.id <= 4 || chats[selectedChat].name === "Study Group") // Simulate group-specific polls
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
                          "max-w-[70%] p-3 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg",
                          msg.isSent
                            ? "bg-primary text-primary-foreground rounded-br-none"
                            : "bg-muted/70 text-foreground rounded-bl-none"
                        )}
                      >
                        <p className="text-xs font-medium text-opacity-80">
                          {msg.sender}
                        </p>
                        <p className="text-sm mt-1">{renderMessageContent(msg.text || "")}</p>
                        <p className="text-xs mt-1 text-right">
                          {msg.time}
                        </p>
                      </div>
                    ) : (
                      <div
                        className={cn(
                          "max-w-[70%] p-4 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg",
                          msg.isSent
                            ? "bg-primary/10 text-foreground rounded-br-none"
                            : "bg-muted/70 text-foreground rounded-bl-none"
                        )}
                      >
                        <p className="text-xs font-medium text-opacity-80">{msg.sender}</p>
                        <p className="text-sm font-semibold mt-1">{msg.poll?.question}</p>
                        <div className="mt-3 space-y-2">
                          {msg.poll?.options.map((opt, idx) => {
                            const totalVotes = msg.poll?.options.reduce((sum, o) => sum + o.votes, 0);
                            const percentage = totalVotes ? (opt.votes / totalVotes) * 100 : 0;
                            const userVoted = msg.poll?.votes.some(
                              (v) => v.userId === currentUserId && v.optionIdx === idx
                            );
                            return (
                              <div
                                key={idx}
                                className="flex items-center gap-2 p-2 bg-muted/50 rounded-md cursor-pointer hover:bg-primary/10 transition-all duration-200"
                                onClick={() => handleVote(msg.poll.id, idx)}
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
                                      className="bg-primary/20 h-1.5 rounded-full"
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                </div>
                                <span className="text-xs text-muted-foreground">{opt.votes} votes</span>
                              </div>
                            );
                          })}
                        </div>
                        <p className="text-xs mt-2 text-right text-muted-foreground">{msg.time}</p>
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
            </div>
          </ScrollArea>
          <CardContent className="p-4 border-t border-border bg-card/95 relative z-10">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={() => setShowPollDialog(true)}
                className="text-foreground hover:bg-primary/10 p-2 rounded-full"
              >
                <BarChart2 className="h-5 w-5" />
              </Button>
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-muted/50 border-border focus:ring-primary focus:border-primary rounded-xl"
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
              />
              <Button
                onClick={handleSend}
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl p-2"
              >
                <Send className="h-5 w-5" />
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
                className="bg-muted/50 border-border focus:ring-primary focus:border-primary rounded-lg"
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
                    className="bg-muted/50 border-border focus:ring-primary focus:border-primary rounded-lg"
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
                className="mt-2 w-full border-border text-foreground hover:bg-primary/10"
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
                className="border-border text-foreground hover:bg-primary/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreatePoll}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
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