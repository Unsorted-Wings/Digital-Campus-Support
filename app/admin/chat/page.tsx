"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Users, Settings, Trash2, Send } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";

interface Faculty {
    id: number;
    name: string;
}

interface Message {
    id: number;
    senderId: number;
    content: string;
    timestamp: string;
}

interface Group {
    id: number;
    name: string;
    members: number[];
    admins: number[];
    ownerId: number;
    permissions: "admin-only" | "everyone";
    messages: Message[];
}

export default function AdminChatPage() {
    const [facultyList] = useState<Faculty[]>([
        { id: 1, name: "Dr. John Smith" },
        { id: 2, name: "Prof. Jane Doe" },
        { id: 3, name: "Dr. Alan Brown" },
    ]);

    const [groups, setGroups] = useState<Group[]>([
        {
            id: 1,
            name: "Math Faculty Chat",
            members: [1, 2],
            admins: [1],
            ownerId: 1,
            permissions: "admin-only",
            messages: [
                { id: 1, senderId: 1, content: "Welcome to the group!", timestamp: "2025-04-19T10:00:00Z" },
                { id: 2, senderId: 2, content: "Thanks for setting this up!", timestamp: "2025-04-19T10:05:00Z" },
            ],
        },
        {
            id: 2,
            name: "Physics Discussion",
            members: [2, 3],
            admins: [2],
            ownerId: 2,
            permissions: "everyone",
            messages: [
                { id: 1, senderId: 2, content: "Any updates on the lab schedule?", timestamp: "2025-04-19T11:00:00Z" },
            ],
        },
    ]);

    const [selectedGroup, setSelectedGroup] = useState<Group | null>(groups[0] || null);
    const [openDialog, setOpenDialog] = useState<"create" | "info" | null>(null);
    const [newGroup, setNewGroup] = useState<{ name: string; members: number[]; permissions: "admin-only" | "everyone" }>({
        name: "",
        members: [],
        permissions: "admin-only",
    });
    const [messageInput, setMessageInput] = useState("");
    const [error, setError] = useState<string>("");
    const scrollRef = useRef<HTMLDivElement>(null);

    // Hardcode current user as Dr. John Smith (ID 1) for testing
    const currentUserId = 1;

    // Scroll to bottom of messages on update
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [selectedGroup?.messages]);

    const handleCreateGroup = () => {
        if (!newGroup.name.trim()) {
            setError("Group name is required.");
            return;
        }
        if (!newGroup.members.length) {
            setError("At least one member is required.");
            return;
        }
        const newId = groups.length + 1;
        const newGroupData = {
            id: newId,
            name: newGroup.name,
            members: [...newGroup.members, currentUserId],
            admins: [currentUserId],
            ownerId: currentUserId,
            permissions: newGroup.permissions,
            messages: [],
        };
        setGroups([...groups, newGroupData]);
        setSelectedGroup(newGroupData);
        console.log("Created group:", newGroup);
        setNewGroup({ name: "", members: [], permissions: "admin-only" });
        setOpenDialog(null);
        setError("");
    };

    const handleManageMembers = (group: Group, updates: { members?: number[]; admins?: number[] }) => {
        setGroups(
            groups.map((g) =>
                g.id === group.id
                    ? {
                        ...g,
                        members: updates.members || g.members,
                        admins: updates.admins || g.admins,
                    }
                    : g
            )
        );
        setSelectedGroup((prev) =>
            prev && prev.id === group.id
                ? { ...prev, members: updates.members || prev.members, admins: updates.admins || prev.admins }
                : prev
        );
        console.log("Updated group:", group.id, updates);
    };

    const handleUpdateSettings = (group: Group, updates: { name?: string; permissions?: "admin-only" | "everyone" }) => {
        setGroups(
            groups.map((g) =>
                g.id === group.id
                    ? {
                        ...g,
                        name: updates.name || g.name,
                        permissions: updates.permissions || g.permissions,
                    }
                    : g
            )
        );
        setSelectedGroup((prev) =>
            prev && prev.id === group.id
                ? { ...prev, name: updates.name || prev.name, permissions: updates.permissions || prev.permissions }
                : prev
        );
        console.log("Updated settings:", group.id, updates);
        setOpenDialog(null);
    };

    const handleDeleteGroup = (groupId: number) => {
        setGroups(groups.filter((g) => g.id !== groupId));
        setSelectedGroup(groups[0] || null);
        console.log("Deleted group:", groupId);
        setOpenDialog(null);
    };

    const handleSendMessage = () => {
        if (!messageInput.trim() || !selectedGroup) return;
        const newMessage = {
            id: (selectedGroup.messages.length + 1),
            senderId: currentUserId,
            content: messageInput,
            timestamp: new Date().toISOString(),
        };
        setGroups(
            groups.map((g) =>
                g.id === selectedGroup.id
                    ? { ...g, messages: [...g.messages, newMessage] }
                    : g
            )
        );
        setSelectedGroup((prev) =>
            prev ? { ...prev, messages: [...prev.messages, newMessage] } : prev
        );
        setMessageInput("");
        console.log("Sent message:", newMessage);
    };

    const isAdminOrOwner = (group: Group) => group.admins.includes(currentUserId) || group.ownerId === currentUserId;
    const isOwner = (group: Group) => group.ownerId === currentUserId;

    return (
        <div className="flex min-h-[calc(100vh-5rem)] bg-background">
            {/* Sidebar */}
            <div className="w-[30%] border-r bg-muted/50 flex flex-col">
                <div className="p-4 border-b">
                    <Button
                        onClick={() => setOpenDialog("create")}
                        className="w-full bg-primary/10 text-foreground hover:bg-primary/20 rounded-full"
                    >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Create Group
                    </Button>
                </div>
                <ScrollArea className="flex-1">
                    {groups.map((group) => (
                        <div
                            key={group.id}
                            className={`p-4 border-b cursor-pointer hover:bg-primary/5 transition-all duration-300 ${selectedGroup?.id === group.id ? "bg-primary/10" : ""
                                }`}
                            onClick={() => setSelectedGroup(group)}
                        >
                            <div className="flex items-center gap-3">
                                <MessageSquare className="h-8 w-8 text-primary" />
                                <div className="flex-1">
                                    <p className="text-foreground font-semibold">{group.name}</p>
                                    <p className="text-sm text-muted-foreground truncate">
                                        {group.messages.length > 0
                                            ? `${facultyList.find((f) => f.id === group.messages[group.messages.length - 1].senderId)?.name || "Unknown"}: ${group.messages[group.messages.length - 1].content
                                            }`
                                            : "No messages yet"}
                                    </p>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {group.messages.length > 0
                                        ? format(new Date(group.messages[group.messages.length - 1].timestamp), "HH:mm")
                                        : ""}
                                </p>
                            </div>
                        </div>
                    ))}
                </ScrollArea>
            </div>

            {/* Chat Area */}
            <div className="w-[70%] flex flex-col">
                {selectedGroup ? (
                    <>
                        {/* Chat Header */}
                        <CardHeader className="bg-card/95 backdrop-blur-md shadow-sm flex flex-row items-center justify-between p-4">
                            <div className="flex items-center gap-3">
                                <MessageSquare className="h-5 w-5 text-primary" />
                                <div>
                                    <p className="text-foreground font-bold text-lg">{selectedGroup.name}</p>
                                    <p className="text-sm text-muted-foreground">{selectedGroup.members.length} members</p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                onClick={() => setOpenDialog("info")}
                                className="text-foreground hover:bg-primary/10"
                            >
                                <Settings className="h-5 w-5" />
                            </Button>
                        </CardHeader>

                        {/* Messages */}
                        <ScrollArea className="flex-1 p-4 bg-card/95 backdrop-blur-md" ref={scrollRef}>
                            <div className="space-y-4">
                                {selectedGroup.messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`flex ${message.senderId === currentUserId ? "justify-end" : "justify-start"}`}
                                    >
                                        <div
                                            className={`max-w-[70%] p-3 rounded-lg relative ${message.senderId === currentUserId ? "bg-primary/10 text-foreground" : "bg-muted/50 text-foreground"
                                                }`}
                                            style={{
                                                borderRadius:
                                                    message.senderId === currentUserId
                                                        ? "12px 12px 0 12px"
                                                        : "12px 12px 12px 0",
                                            }}
                                        >
                                            <p className="text-sm font-semibold">
                                                {facultyList.find((f) => f.id === message.senderId)?.name || "Unknown"}
                                            </p>
                                            <p className="text-sm">{message.content}</p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {format(new Date(message.timestamp), "HH:mm")}
                                            </p>
                                            <div
                                                className={`absolute bottom-0 ${message.senderId === currentUserId ? "right-[-6px]" : "left-[-6px]"
                                                    }`}
                                                style={{
                                                    width: 0,
                                                    height: 0,
                                                    border: `6px solid transparent`,
                                                    borderTopColor:
                                                        message.senderId === currentUserId ? "rgba(var(--primary), 0.1)" : "rgba(var(--muted), 0.5)",
                                                    borderBottom: 0,
                                                    borderRight: message.senderId === currentUserId ? 0 : "6px solid transparent",
                                                    borderLeft: message.senderId === currentUserId ? "6px solid transparent" : 0,
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>

                        {/* Message Input */}
                        <div className="p-4 bg-card/95 backdrop-blur-md border-t">
                            <div className="flex items-center gap-2">
                                <Input
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-muted/50 border-border rounded-full"
                                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                                />
                                <Button
                                    onClick={handleSendMessage}
                                    className="bg-primary/10 text-foreground hover:bg-primary/20 rounded-full"
                                >
                                    <Send className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center bg-card/95 backdrop-blur-md">
                        <p className="text-muted-foreground">Select a group to start chatting</p>
                    </div>
                )}
            </div>

            {/* Create Group Dialog */}
            <Dialog open={openDialog === "create"} onOpenChange={(open) => !open && setOpenDialog(null)}>
                <DialogContent className="bg-card/95 backdrop-blur-md shadow-xl rounded-xl">
                    <DialogHeader>
                        <DialogTitle className="text-foreground">Create New Group</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 p-4">
                        {error && <p className="text-destructive text-sm">{error}</p>}
                        <div>
                            <Label htmlFor="groupName" className="text-foreground">Group Name</Label>
                            <Input
                                id="groupName"
                                value={newGroup.name}
                                onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                                className="bg-muted/50 border-border"
                                placeholder="Enter group name"
                            />
                        </div>
                        <div>
                            <Label htmlFor="members" className="text-foreground">Add Members</Label>
                            <Select
                                onValueChange={(value) => {
                                    if (!newGroup.members.includes(Number(value))) {
                                        setNewGroup({ ...newGroup, members: [...newGroup.members, Number(value)] });
                                    }
                                }}
                            >
                                <SelectTrigger className="bg-muted/50 border-border">
                                    <SelectValue placeholder="Select members" />
                                </SelectTrigger>
                                <SelectContent>
                                    {facultyList.map((faculty) => (
                                        <SelectItem key={faculty.id} value={faculty.id.toString()}>
                                            {faculty.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {newGroup.members.map((id) => (
                                    <div
                                        key={id}
                                        className="flex items-center gap-1 bg-primary/10 text-foreground px-2 py-1 rounded-full text-sm"
                                    >
                                        {facultyList.find((f) => f.id === id)?.name}
                                        <button
                                            onClick={() => setNewGroup({ ...newGroup, members: newGroup.members.filter((m) => m !== id) })}
                                            className="text-destructive"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="permissions" className="text-foreground">Permissions</Label>
                            <Select
                                value={newGroup.permissions}
                                onValueChange={(value) =>
                                    setNewGroup({ ...newGroup, permissions: value as "admin-only" | "everyone" })
                                }
                            >
                                <SelectTrigger className="bg-muted/50 border-border">
                                    <SelectValue placeholder="Select permissions" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="admin-only">Admin Only</SelectItem>
                                    <SelectItem value="everyone">Everyone Can Edit</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button
                            onClick={handleCreateGroup}
                            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                            Create Group
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Group Info Dialog */}
            <Dialog open={openDialog === "info"} onOpenChange={(open) => !open && setOpenDialog(null)}>
                <DialogContent className="bg-card/95 backdrop-blur-md shadow-xl rounded-xl">
                    <DialogHeader>
                        <DialogTitle className="text-foreground">Group Info: {selectedGroup?.name}</DialogTitle>
                    </DialogHeader>
                    {selectedGroup ? (
                        <div className="space-y-4 p-4">
                            {isAdminOrOwner(selectedGroup) ? (
                                <>
                                    {/* Manage Members */}
                                    <div>
                                        <Label htmlFor="addMembers" className="text-foreground">Add Members</Label>
                                        <Select
                                            onValueChange={(value) => {
                                                const id = Number(value);
                                                if (!selectedGroup.members.includes(id)) {
                                                    handleManageMembers(selectedGroup, {
                                                        members: [...selectedGroup.members, id],
                                                    });
                                                }
                                            }}
                                        >
                                            <SelectTrigger className="bg-muted/50 border-border">
                                                <SelectValue placeholder="Select members" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {facultyList
                                                    .filter((f) => !selectedGroup.members.includes(f.id))
                                                    .map((faculty) => (
                                                        <SelectItem key={faculty.id} value={faculty.id.toString()}>
                                                            {faculty.name}
                                                        </SelectItem>
                                                    ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label className="text-foreground">Members</Label>
                                        <ScrollArea className="h-[200px]">
                                            {selectedGroup.members.map((memberId) => {
                                                const isAdmin = selectedGroup.admins.includes(memberId);
                                                const isMemberOwner = selectedGroup.ownerId === memberId;
                                                return (
                                                    <div
                                                        key={memberId}
                                                        className="flex items-center justify-between bg-muted/50 p-2 rounded-lg mb-2"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <Users className="h-5 w-5 text-primary" />
                                                            <span className="text-foreground">
                                                                {facultyList.find((f) => f.id === memberId)?.name || "Unknown"}
                                                                {isMemberOwner && " (Owner)"}
                                                                {isAdmin && !isMemberOwner && " (Admin)"}
                                                            </span>
                                                        </div>
                                                        {!isMemberOwner && (
                                                            <div className="flex gap-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        const newAdmins = isAdmin
                                                                            ? selectedGroup.admins.filter((id) => id !== memberId)
                                                                            : [...selectedGroup.admins, memberId];
                                                                        handleManageMembers(selectedGroup, { admins: newAdmins });
                                                                    }}
                                                                    className="border-border text-foreground hover:bg-primary/10"
                                                                >
                                                                    {isAdmin ? "Demote" : "Promote to Admin"}
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        handleManageMembers(selectedGroup, {
                                                                            members: selectedGroup.members.filter((id) => id !== memberId),
                                                                            admins: selectedGroup.admins.filter((id) => id !== memberId),
                                                                        });
                                                                    }}
                                                                    className="border-destructive text-destructive hover:bg-destructive/10"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </ScrollArea>
                                    </div>

                                    {/* Group Settings */}
                                    <div>
                                        <Label htmlFor="groupName" className="text-foreground">Group Name</Label>
                                        <Input
                                            id="groupName"
                                            value={selectedGroup.name}
                                            onChange={(e) => setSelectedGroup({ ...selectedGroup, name: e.target.value })}
                                            className="bg-muted/50 border-border"
                                            placeholder="Enter group name"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="permissions" className="text-foreground">Permissions</Label>
                                        <Select
                                            value={selectedGroup.permissions}
                                            onValueChange={(value) =>
                                                setSelectedGroup({ ...selectedGroup, permissions: value as "admin-only" | "everyone" })
                                            }
                                        >
                                            <SelectTrigger className="bg-muted/50 border-border">
                                                <SelectValue placeholder="Select permissions" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="admin-only">Admin Only</SelectItem>
                                                <SelectItem value="everyone">Everyone Can Edit</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Button
                                        onClick={() =>
                                            handleUpdateSettings(selectedGroup, {
                                                name: selectedGroup.name,
                                                permissions: selectedGroup.permissions,
                                            })
                                        }
                                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                                    >
                                        Save Settings
                                    </Button>
                                    {isOwner(selectedGroup) && (
                                        <Button
                                            variant="destructive"
                                            onClick={() => handleDeleteGroup(selectedGroup.id)}
                                            className="w-full"
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete Group
                                        </Button>
                                    )}
                                </>
                            ) : (
                                <div className="p-4">
                                    <p className="text-foreground">Members: {selectedGroup.members.length}</p>
                                    <ScrollArea className="h-[200px] mt-2">
                                        {selectedGroup.members.map((memberId) => (
                                            <div key={memberId} className="flex items-center gap-2 p-2">
                                                <Users className="h-5 w-5 text-primary" />
                                                <span className="text-foreground">
                                                    {facultyList.find((f) => f.id === memberId)?.name || "Unknown"}
                                                    {selectedGroup.ownerId === memberId && " (Owner)"}
                                                    {selectedGroup.admins.includes(memberId) && selectedGroup.ownerId !== memberId && " (Admin)"}
                                                </span>
                                            </div>
                                        ))}
                                    </ScrollArea>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="p-4">
                            <p className="text-foreground">No group selected.</p>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}