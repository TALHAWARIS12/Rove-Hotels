"use client";

import React, { useState } from "react";
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function AdminDocumentsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [resultMsg, setResultMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setResultMsg("");
    setErrorMsg("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/documents/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setResultMsg(data.message);
        setFile(null);
      } else {
        setErrorMsg(data.error || "Failed to process document");
      }
    } catch (err) {
      setErrorMsg("Error uploading document");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="card p-5 sm:p-6 flex items-center justify-between">
        <div>
          <h1 className="heading-display text-xl sm:text-2xl flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
            <Upload className="w-5 h-5" style={{ color: "#60A5FA" }} />
            <span>Document Knowledge Parser & Ingestion</span>
          </h1>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            Upload PDFs, DOCX files, or Markdown documents to automatically extract, chunk, embed, and insert into the AI Concierge vector store.
          </p>
        </div>
      </div>

      {resultMsg && (
        <div className="p-4 rounded-xl text-xs font-semibold flex items-center space-x-2" style={{ backgroundColor: "var(--success-bg)", color: "var(--success)", border: "1px solid color-mix(in srgb, var(--success) 30%, transparent)" }}>
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{resultMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl text-xs font-semibold flex items-center space-x-2" style={{ backgroundColor: "rgba(232, 146, 124, 0.12)", color: "var(--secondary-accent)", border: "1px solid color-mix(in srgb, var(--secondary-accent) 30%, transparent)" }}>
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="card p-6 sm:p-8">
        <form onSubmit={handleUpload} className="space-y-6 max-w-xl mx-auto text-center">
          <div className="border-2 border-dashed rounded-2xl p-6 sm:p-8 transition-colors flex flex-col items-center justify-center" style={{ backgroundColor: "var(--bg-surface-raised)", borderColor: "var(--border-strong)" }}>
            <FileText className="w-12 h-12 mb-3" style={{ color: "var(--text-muted)" }} />
            <p className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Select Document to Ingest</p>
            <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>Supports PDF, DOCX, Markdown (.md), or Plain Text (.txt)</p>

            <input
              type="file"
              accept=".pdf,.docx,.md,.txt"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold cursor-pointer"
              style={{ color: "var(--text-secondary)" }}
            />
          </div>

          <button
            type="submit"
            disabled={!file || uploading}
            className="btn-primary w-full py-3.5"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Parsing & Generating Vector Embeddings...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Parse & Merge into Knowledge Base</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
