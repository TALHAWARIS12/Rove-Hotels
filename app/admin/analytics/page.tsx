"use client";

import React, { useState, useEffect } from "react";
import { BarChart3, MessageSquare, ThumbsUp, Layers, CheckCircle2 } from "lucide-react";

interface AnalyticsData {
  totalConversations: number;
  totalMessages: number;
  totalFeedbacks: number;
  satisfactionRate: number;
  totalUnanswered: number;
  resolutionRate: number;
  totalFaqs: number;
  totalChunks: number;
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((res) => res.json())
      .then((resData) => setData(resData))
      .catch((e) => console.warn("Analytics error:", e));
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="card p-5 sm:p-6 flex items-center justify-between">
        <div>
          <h1 className="heading-display text-xl sm:text-2xl flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
            <BarChart3 className="w-5 h-5" style={{ color: "var(--secondary-accent)" }} />
            <span>AI Concierge Performance Analytics</span>
          </h1>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            Guest engagement, satisfaction sentiment, context accuracy, and inquiry resolution stats.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>Total Conversations</span>
            <MessageSquare className="w-4 h-4" style={{ color: "#C084FC" }} />
          </div>
          <p className="heading-display text-3xl sm:text-4xl" style={{ color: "var(--text-primary)" }}>{data?.totalConversations ?? 0}</p>
          <p className="font-mono-sm mt-1" style={{ color: "var(--text-muted)" }}>{data?.totalMessages ?? 0} total turn messages</p>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>Guest Satisfaction</span>
            <ThumbsUp className="w-4 h-4" style={{ color: "var(--success)" }} />
          </div>
          <p className="heading-display text-3xl sm:text-4xl" style={{ color: "var(--text-primary)" }}>{data?.satisfactionRate ?? 100}%</p>
          <p className="font-mono-sm mt-1" style={{ color: "var(--text-muted)" }}>Based on {data?.totalFeedbacks ?? 0} rated turns</p>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>Resolution Rate</span>
            <CheckCircle2 className="w-4 h-4" style={{ color: "var(--tertiary-accent)" }} />
          </div>
          <p className="heading-display text-3xl sm:text-4xl" style={{ color: "var(--text-primary)" }}>{data?.resolutionRate ?? 100}%</p>
          <p className="font-mono-sm mt-1" style={{ color: "var(--text-muted)" }}>{data?.totalUnanswered ?? 0} flagged questions</p>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>Active Knowledge Base</span>
            <Layers className="w-4 h-4" style={{ color: "var(--accent)" }} />
          </div>
          <p className="heading-display text-3xl sm:text-4xl" style={{ color: "var(--text-primary)" }}>{data?.totalChunks ?? 0}</p>
          <p className="font-mono-sm mt-1" style={{ color: "var(--text-muted)" }}>{data?.totalFaqs ?? 0} verified FAQs</p>
        </div>
      </div>

      <div className="card p-5 sm:p-6 space-y-4">
        <h2 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>Top Guest Query Categories</h2>
        <div className="space-y-4 text-xs">
          <div>
            <div className="flex justify-between mb-1" style={{ color: "var(--text-secondary)" }}>
              <span>Rooms & Gamer Cave</span>
              <span className="font-bold">38%</span>
            </div>
            <div className="w-full rounded-full h-2" style={{ backgroundColor: "var(--bg-surface-raised)" }}>
              <div className="h-2 rounded-full" style={{ width: "38%", backgroundColor: "var(--accent)" }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1" style={{ color: "var(--text-secondary)" }}>
              <span>Dining & TGI Fridays Breakfast</span>
              <span className="font-bold">27%</span>
            </div>
            <div className="w-full rounded-full h-2" style={{ backgroundColor: "var(--bg-surface-raised)" }}>
              <div className="h-2 rounded-full" style={{ width: "27%", backgroundColor: "var(--tertiary-accent)" }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1" style={{ color: "var(--text-secondary)" }}>
              <span>Location (Burj Khalifa & Dubai Mall)</span>
              <span className="font-bold">20%</span>
            </div>
            <div className="w-full rounded-full h-2" style={{ backgroundColor: "var(--bg-surface-raised)" }}>
              <div className="h-2 rounded-full" style={{ width: "20%", backgroundColor: "var(--success)" }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1" style={{ color: "var(--text-secondary)" }}>
              <span>Pool, Gym & Laundromat</span>
              <span className="font-bold">15%</span>
            </div>
            <div className="w-full rounded-full h-2" style={{ backgroundColor: "var(--bg-surface-raised)" }}>
              <div className="h-2 rounded-full" style={{ width: "15%", backgroundColor: "#60A5FA" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
