"use client";

import React, { useState, useEffect } from "react";
import { HelpCircle, CheckCircle2, Send } from "lucide-react";

interface UnknownQuestion {
  id: string;
  questionText: string;
  occurredCount: number;
  status: string;
  adminAnswer: string | null;
}

export default function AdminUnansweredPage() {
  const [questions, setQuestions] = useState<UnknownQuestion[]>([]);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [statusMsg, setStatusMsg] = useState("");

  const fetchQuestions = async () => {
    try {
      const res = await fetch("/api/admin/unanswered");
      const data = await res.json();
      if (Array.isArray(data)) setQuestions(data);
    } catch (e) {
      console.warn("Failed to fetch unanswered questions:", e);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleResolve = async (questionId: string) => {
    const answer = answers[questionId];
    if (!answer?.trim()) return;

    try {
      const res = await fetch("/api/admin/unanswered", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId, answer }),
      });

      if (res.ok) {
        setStatusMsg("Answer published! Added to verified FAQ database and re-embedded automatically.");
        setAnswers((prev) => ({ ...prev, [questionId]: "" }));
        fetchQuestions();
      }
    } catch (err) {
      setStatusMsg("Failed to submit answer.");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="card p-5 sm:p-6 flex items-center justify-between">
        <div>
          <h1 className="heading-display text-xl sm:text-2xl flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
            <HelpCircle className="w-5 h-5" style={{ color: "var(--success)" }} />
            <span>Unanswered & Unverified Questions Queue</span>
          </h1>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            Questions asked by guests that yielded unverified facts or insufficient context. Type an authoritative answer to automatically publish to the vector store.
          </p>
        </div>
      </div>

      {statusMsg && (
        <div className="p-4 rounded-xl text-xs font-semibold flex items-center space-x-2" style={{ backgroundColor: "var(--success-bg)", color: "var(--success)", border: "1px solid color-mix(in srgb, var(--success) 30%, transparent)" }}>
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      <div className="space-y-4">
        {questions.length === 0 ? (
          <div className="card p-8 text-center text-xs" style={{ color: "var(--text-muted)" }}>
            No unanswered questions in queue! All guest questions have been answered with verified context.
          </div>
        ) : (
          questions.map((q) => (
            <div key={q.id} className="card p-5 space-y-3">
              <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2">
                <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>"{q.questionText}"</span>
                <div className="flex items-center space-x-2">
                  <span className="badge badge-muted">
                    Occurred {q.occurredCount}x
                  </span>
                  <span className={`badge ${q.status === "resolved" ? "badge-success" : "badge-gold"}`}>
                    {q.status.toUpperCase()}
                  </span>
                </div>
              </div>

              {q.status === "resolved" ? (
                <div className="card-raised p-3 text-xs" style={{ color: "var(--text-secondary)" }}>
                  <span className="font-bold" style={{ color: "var(--success)" }}>Admin Answer: </span>
                  {q.adminAnswer}
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2">
                  <input
                    type="text"
                    value={answers[q.id] || ""}
                    onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                    placeholder="Type official hotel answer..."
                    className="input-field flex-1"
                  />
                  <button
                    onClick={() => handleResolve(q.id)}
                    disabled={!answers[q.id]?.trim()}
                    className="btn-primary text-xs flex-shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Publish Answer</span>
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
