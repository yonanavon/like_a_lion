"use client";

import { useEffect, useState } from "react";
import { Megaphone } from "lucide-react";

interface Message {
  id: string;
  content: string;
}

export default function FlashMessages() {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    fetch("/api/messages")
      .then((r) => r.json())
      .then(setMessages)
      .catch(() => {});
  }, []);

  if (messages.length === 0) return null;

  return (
    <div className="space-y-2 mb-4">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2"
        >
          <Megaphone size={18} className="text-amber-600 mt-0.5 shrink-0" />
          <p className="text-amber-800 text-sm">{msg.content}</p>
        </div>
      ))}
    </div>
  );
}
