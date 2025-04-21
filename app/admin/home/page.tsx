"use client";

import { useEffect, useState } from "react";

interface UserData {
  name: string;
  email: string;
  role: string;
  uid: string;
}

export default function UserInfo() {
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    // Get user data from localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  if (!user) {
    return <p className="text-muted-foreground">Loading user info...</p>;
  }

  return (
    <div className="p-4 rounded-lg border border-border bg-muted/10 max-w-md space-y-2">
      <h2 className="text-xl font-semibold">User Details</h2>
      <p><strong>Name:</strong> {user.name}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Role:</strong> {user.role}</p>
      <p><strong>UID:</strong> {user.uid}</p>
    </div>
  );
}
