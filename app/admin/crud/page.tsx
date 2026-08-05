"use client";

import React, { useState, useEffect } from "react";
import { Database, Plus, Save, FileText, CheckCircle2 } from "lucide-react";

export default function AdminCrudPage() {
  const [faqs, setFaqs] = useState<{ id: string; question: string; answer: string; category: string }[]>([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [category, setCategory] = useState("General");
  const [statusMsg, setStatusMsg] = useState("");

  const fetchFaqs = async () => {
    try {
      const res = await fetch("/api/admin/crud/faqs");
      const data = await res.json();
      if (Array.isArray(data)) setFaqs(data);
    } catch (e) {
      console.warn("Failed to load FAQs:", e);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const handleAddFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || !newAnswer.trim()) return;

    try {
      const res = await fetch("/api/admin/crud/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: newQuestion, answer: newAnswer, category }),
      });

      if (res.ok) {
        setStatusMsg("FAQ saved! Remember to click 'Re-Index Knowledge' on the main dashboard to update the AI chatbot's vector store.");
        setNewQuestion("");
        setNewAnswer("");
        fetchFaqs();
      }
    } catch (err) {
      setStatusMsg("Failed to save FAQ.");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="card p-5 sm:p-6 flex items-center justify-between">
        <div>
          <h1 className="heading-display text-xl sm:text-2xl flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
            <Database className="w-5 h-5" style={{ color: "var(--tertiary-accent)" }} />
            <span>Structured Knowledge Base Manager</span>
          </h1>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Direct CRUD management over relational hotel records and FAQs.</p>
        </div>
      </div>

      {statusMsg && (
        <div className="p-4 rounded-xl text-xs font-semibold flex items-center space-x-2" style={{ backgroundColor: "var(--success-bg)", color: "var(--success)", border: "1px solid color-mix(in srgb, var(--success) 30%, transparent)" }}>
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Add New FAQ Form */}
      <div className="card p-5 sm:p-6 space-y-4">
        <h2 className="font-semibold text-sm flex items-center space-x-2" style={{ color: "var(--text-primary)" }}>
          <Plus className="w-4 h-4" style={{ color: "var(--accent)" }} />
          <span>Add / Update Verified FAQ Entry</span>
        </h2>

        <form onSubmit={handleAddFaq} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block mb-1 font-medium" style={{ color: "var(--text-secondary)" }}>Question</label>
              <input
                type="text"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="e.g. What is the breakfast buffet hours?"
                required
                className="input-field"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium" style={{ color: "var(--text-secondary)" }}>Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Dining, Policies, etc."
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 font-medium" style={{ color: "var(--text-secondary)" }}>Answer</label>
            <textarea
              rows={3}
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              placeholder="Verified answer statement..."
              required
              className="input-field"
            />
          </div>

          <button
            type="submit"
            className="btn-primary text-xs"
          >
            <Save className="w-4 h-4" />
            <span>Save Verified Record</span>
          </button>
        </form>
      </div>

      {/* List Existing FAQs */}
      <div className="card p-5 sm:p-6 space-y-4">
        <h2 className="font-semibold text-sm flex items-center space-x-2" style={{ color: "var(--text-primary)" }}>
          <FileText className="w-4 h-4" style={{ color: "var(--tertiary-accent)" }} />
          <span>Existing FAQ Database Records</span>
        </h2>

        <div className="space-y-3">
          {faqs.map((f, i) => (
            <div key={i} className="card-raised p-4 space-y-1 text-xs">
              <div className="flex items-center justify-between font-bold" style={{ color: "var(--accent)" }}>
                <span>Q: {f.question}</span>
                <span className="badge badge-muted">{f.category}</span>
              </div>
              <p style={{ color: "var(--text-secondary)" }}>A: {f.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
