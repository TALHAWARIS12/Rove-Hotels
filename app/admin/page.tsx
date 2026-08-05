"use client";

import React, { useState } from "react";
import { RefreshCw, Database, FileText, HelpCircle, MessageSquare, CheckCircle, Layers, X } from "lucide-react";

const METRIC_CARDS = [
  {
    label: "Total RAG Chunks",
    value: "33",
    sub: "pgvector 1536-dim embeddings",
    icon: Layers,
    color: "var(--accent)",
  },
  {
    label: "Verified FAQs",
    value: "25+",
    sub: "Ground truth verified questions",
    icon: FileText,
    color: "var(--tertiary-accent)",
  },
  {
    label: "Unanswered Queue",
    value: "0",
    sub: "Pending admin review",
    icon: HelpCircle,
    color: "var(--success)",
  },
  {
    label: "System Status",
    value: "100%",
    sub: "Uptime & concierge availability",
    icon: MessageSquare,
    color: "#C084FC",
  },
];

const SYSTEM_STATUS = [
  {
    label: "LLM Adapter",
    desc: "Active: Anthropic Claude / OpenAI GPT — switchable via LLM_PROVIDER env",
    icon: CheckCircle,
  },
  {
    label: "Embedding Engine",
    desc: "Voyage AI / OpenAI text-embedding-3-small stored in pgvector column",
    icon: CheckCircle,
  },
  {
    label: "Database Engine",
    desc: "Neon PostgreSQL with pgvector extension — relational tables + vector embeddings",
    icon: Database,
  },
];

export default function AdminOverviewPage() {
  const [isReindexing, setIsReindexing] = useState(false);
  const [reindexLog, setReindexLog] = useState<{ msg: string; ok: boolean } | null>(null);

  const handleReindex = async () => {
    setIsReindexing(true);
    setReindexLog(null);
    try {
      const res = await fetch("/api/admin/reindex", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setReindexLog({
          msg: `Success! KB Re-indexed. Chunks before: ${data.counts.chunksBefore} → Chunks after: ${data.counts.chunksAfter}. FAQs: ${data.counts.faqs}.`,
          ok: true,
        });
      } else {
        setReindexLog({ msg: `Error: ${data.error || "Re-indexing failed"}`, ok: false });
      }
    } catch {
      setReindexLog({ msg: "Failed to communicate with re-index service.", ok: false });
    } finally {
      setIsReindexing(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header banner */}
      <div
        className="card p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1
            className="heading-display text-2xl sm:text-3xl mb-1"
            style={{ color: "var(--text-primary)" }}
          >
            Rove Concierge Control
          </h1>
          <p className="text-xs sm:text-sm" style={{ color: "var(--text-muted)" }}>
            Manage hotel knowledge base, monitor guest inquiries, review unanswered questions, and trigger RAG re-indexing.
          </p>
        </div>

        <button
          onClick={handleReindex}
          disabled={isReindexing}
          className="btn-primary flex-shrink-0"
          id="reindex-btn"
        >
          <RefreshCw className={`w-4 h-4 ${isReindexing ? "animate-spin" : ""}`} />
          <span>{isReindexing ? "Re-Indexing Knowledge..." : "Re-Index Knowledge"}</span>
        </button>
      </div>

      {/* Execution feedback banner */}
      {reindexLog && (
        <div
          className="p-4 rounded-xl flex items-center justify-between gap-3 text-xs font-semibold animate-slide-up"
          style={{
            backgroundColor: reindexLog.ok ? "var(--success-bg)" : "rgba(232,146,124,0.1)",
            border: `1px solid ${reindexLog.ok ? "color-mix(in srgb, var(--success) 30%, transparent)" : "color-mix(in srgb, var(--secondary-accent) 30%, transparent)"}`,
            color: reindexLog.ok ? "var(--success)" : "var(--secondary-accent)",
          }}
        >
          <span>{reindexLog.msg}</span>
          <button
            onClick={() => setReindexLog(null)}
            className="flex-shrink-0"
            aria-label="Dismiss"
            style={{ color: "var(--text-muted)" }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Metrics grid */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4">
        {METRIC_CARDS.map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <span
                className="text-xs font-medium"
                style={{ color: "var(--text-muted)" }}
              >
                {label}
              </span>
              <Icon className="w-5 h-5 flex-shrink-0" style={{ color }} />
            </div>
            <p
              className="heading-display text-2xl sm:text-3xl"
              style={{ color: "var(--text-primary)" }}
            >
              {value}
            </p>
            <p
              className="font-mono-sm mt-1.5"
              style={{ color: "var(--text-muted)" }}
            >
              {sub}
            </p>
          </div>
        ))}
      </div>

      {/* System architecture */}
      <div className="card p-5 sm:p-6">
        <h2
          className="font-semibold text-base mb-4"
          style={{ color: "var(--text-primary)" }}
        >
          System Architecture &amp; Runtime Configuration
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SYSTEM_STATUS.map(({ label, desc, icon: Icon }) => (
            <div
              key={label}
              className="card-raised p-4"
            >
              <div
                className="flex items-center gap-2 font-semibold text-xs mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                <Icon className="w-4 h-4 flex-shrink-0" style={{ color: "var(--success)" }} />
                <span>{label}</span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                {desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
