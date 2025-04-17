"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Send, Search, MoreVertical, BarChart2 } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export default function ChatPage() {
  const [selectedChat, setSelectedChat] = useState<number | null>(0);
  const [message, setMessage] = useState("");
  const [showPollForm, setShowPollForm] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
  const [polls, setPolls] = useState<{ id: number; question: string; options: { text: string; votes: number }[] }[]>([]);

  // Mock data (replace with real data)
  const chats = [
    { id: 0, name: "Study Group", lastMessage: "Hey, let’s meet at 2 PM!", time: "12:30 PM" },
    { id: 1, name: "Prof. Smith", lastMessage: "Check the Calculus notes here: /docs/math-lecture.pdf", time: "10:15 AM" },
    { id: 2, name: "Jane Doe", lastMessage: "Can you send the notes?", time: "Yesterday" },
    { id: 3, name: "CS Club", lastMessage: "Event this Friday!", time: "Monday" },
  ];

  const messages = [
    { id: 1, sender: "You", text: "Hey everyone, ready for the quiz?", time: "12:25 PM", isSent: true },
    { id: 2, sender: "Mike", text: "Yeah, just reviewing now!", time: "12:26 PM", isSent: false },
    { id: 3, sender: "You", text: "Cool, see you at 2!", time: "12:30 PM", isSent: true },
    { id: 4, sender: "Prof. Smith", text: "Check the Calculus notes here: /docs/math-lecture.pdf", time: "10:15 AM", isSent: false },
  ];

  const handleSend = () => {
    if (message.trim()) {
      console.log("Sending:", message); // Replace with actual send logic
      setMessage("");
    }
  };

  const handleCreatePoll = () => {
    if (pollQuestion.trim() && pollOptions.every((opt) => opt.trim())) {
      setPolls([
        ...polls,
        {
          id: polls.length + 1,
          question: pollQuestion,
          options: pollOptions.map((opt) => ({ text: opt, votes: 0 })),
        },
      ]);
      setPollQuestion("");
      setPollOptions(["", ""]);
      setShowPollForm(false);
      console.log("Poll created:", { question: pollQuestion, options: pollOptions });
    }
  };

  const handleVote = (pollId: number, optionIdx: number) => {
    setPolls((prevPolls) =>
      prevPolls.map((poll) =>
        poll.id === pollId
          ? {
              ...poll,
              options: poll.options.map((opt, idx) =>
                idx === optionIdx ? { ...opt, votes: opt.votes + 1 } : opt
              ),
            }
          : poll
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
            <Button
              variant="ghost"
              className="text-foreground hover:bg-primary/10 p-2 rounded-full"
            >
              <MoreVertical className="h-5 w-5" />
            </Button>
            </div>
          </CardHeader>
          <ScrollArea className="flex-1 p-6 relative z-10">
            <div className="space-y-4">
              {messages.map((msg) => (
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
                    <p className="text-sm mt-1">{renderMessageContent(msg.text)}</p>
                    <p className="text-xs mt-1 text-right">
                      {msg.time}
                    </p>
                  </div>
                  {msg.isSent && (
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarImage src="/user-you.jpg" alt="You" />
                      <AvatarFallback className="bg-primary/20 text-primary">Y</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {polls.map((poll) => (
                <div key={poll.id} className="max-w-[70%] mx-auto p-4 bg-card rounded-lg shadow-md border border-border">
                  <p className="text-sm font-semibold text-foreground">{poll.question}</p>
                  <div className="mt-3 space-y-2">
                    {poll.options.map((opt, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 bg-muted/50 rounded-md cursor-pointer hover:bg-primary/10 transition-all duration-200"
                        onClick={() => handleVote(poll.id, idx)}
                      >
                        <span className="text-sm text-foreground">{opt.text}</span>
                        <span className="text-xs text-muted-foreground">{opt.votes} votes</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <CardContent className="p-4 border-t border-border bg-card/95 relative z-10">
            {showPollForm ? (
              <div className="space-y-4">
                <Input
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  placeholder="Poll question"
                  className="bg-muted/50 border-border focus:ring-primary focus:border-primary rounded-lg"
                />
                {pollOptions.map((opt, idx) => (
                  <Input
                    key={idx}
                    value={opt}
                    onChange={(e) => {
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
                <Button
                  variant="ghost"
                  onClick={() => setShowPollForm(true)}
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