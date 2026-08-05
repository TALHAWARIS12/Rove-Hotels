"use client";

import React, { useState, useEffect } from "react";
import { MessageSquare, Calendar, User, Bot, ThumbsUp, ThumbsDown } from "lucide-react";

interface Message {
  id: string;
  role: string;
  content: string;
  createdAt: string;
  feedbacks?: { rating: number }[];
}

interface Conversation {
  id: string;
  sessionId: string;
  updatedAt: string;
  messages: Message[];
}

export default function AdminConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvo, setSelectedConvo] = useState<Conversation | null>(null);

  useEffect(() => {
    fetch("/api/admin/conversations")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setConversations(data);
          if (data.length > 0) setSelectedConvo(data[0]);
        }
      })
      .catch((e) => console.warn("Error fetching conversations:", e));
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="card p-5 sm:p-6 flex items-center justify-between">
        <div>
          <h1 className="heading-display text-xl sm:text-2xl flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
            <MessageSquare className="w-5 h-5" style={{ color: "#C084FC" }} />
            <span>Guest Conversation Sessions Log</span>
          </h1>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            Review guest interactions, streamed AI answers, and thumbs feedback.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Session List */}
        <div className="space-y-3">
          <h2 className="eyebrow">Past Sessions</h2>
          {conversations.length === 0 ? (
            <div className="card p-4 text-center text-xs" style={{ color: "var(--text-muted)" }}>
              No recorded chat sessions yet.
            </div>
          ) : (
            conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedConvo(c)}
                className="w-full text-left p-4 rounded-xl transition-all text-xs"
                style={{
                  backgroundColor: selectedConvo?.id === c.id ? "var(--bg-surface-raised)" : "var(--bg-surface)",
                  border: `1px solid ${selectedConvo?.id === c.id ? "var(--accent)" : "var(--border)"}`,
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold truncate max-w-[150px]" style={{ color: "var(--accent)" }}>
                    {c.sessionId}
                  </span>
                  <span className="font-mono-sm flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
                    <Calendar className="w-3 h-3" />
                    {new Date(c.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <p className="truncate" style={{ color: "var(--text-secondary)" }}>
                  {c.messages[c.messages.length - 1]?.content || "Empty session"}
                </p>
                <span className="font-mono-sm mt-2 block" style={{ color: "var(--text-muted)" }}>
                  {c.messages.length} messages turn
                </span>
              </button>
            ))
          )}
        </div>

        {/* Selected Conversation Transcript */}
        <div className="lg:col-span-2 card p-5 sm:p-6 space-y-4">
          <h2 className="font-semibold text-sm flex items-center justify-between pb-3" style={{ borderBottom: "1px solid var(--border)", color: "var(--text-primary)" }}>
            <span>Session Transcript: {selectedConvo?.sessionId || "None"}</span>
            <span className="eyebrow">{selectedConvo?.messages.length || 0} Turn Messages</span>
          </h2>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {!selectedConvo ? (
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Select a conversation session on the left to inspect transcript.</p>
            ) : (
              selectedConvo.messages.map((m) => (
                <div
                  key={m.id}
                  className="p-4 rounded-xl text-xs leading-relaxed space-y-2"
                  style={{
                    backgroundColor: m.role === "user" ? "var(--bg-page)" : "var(--bg-surface-raised)",
                    border: `1px solid ${m.role === "user" ? "var(--border)" : "var(--border-strong)"}`,
                  }}
                >
                  <div className="flex items-center justify-between font-semibold">
                    <span className="flex items-center space-x-1.5">
                      {m.role === "user" ? <User className="w-3.5 h-3.5" style={{ color: "var(--text-muted)" }} /> : <Bot className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />}
                      <span style={{ color: m.role === "user" ? "var(--text-secondary)" : "var(--accent)" }}>{m.role.toUpperCase()}</span>
                    </span>
                    <span className="font-mono-sm" style={{ color: "var(--text-muted)" }}>{new Date(m.createdAt).toLocaleTimeString()}</span>
                  </div>

                  <p className="whitespace-pre-wrap" style={{ color: "var(--text-primary)" }}>{m.content}</p>

                  {m.feedbacks && m.feedbacks.length > 0 && (
                    <div className="pt-2 text-[10px] flex items-center space-x-2" style={{ borderTop: "1px solid var(--border)" }}>
                      <span style={{ color: "var(--text-muted)" }}>Rating:</span>
                      {m.feedbacks[0].rating === 5 ? (
                        <span className="flex items-center gap-1 font-bold" style={{ color: "var(--success)" }}>
                          <ThumbsUp className="w-3 h-3" /> Helpful (5/5)
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 font-bold" style={{ color: "var(--secondary-accent)" }}>
                          <ThumbsDown className="w-3 h-3" /> Needs Improvement
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
