# Rove Downtown Dubai — AI Concierge Web Application

A full-stack, enterprise-grade AI Concierge web application built for **Rove Downtown Dubai**. Features a provider-agnostic hybrid RAG architecture (PostgreSQL + pgvector), guest chat streaming UI with multilingual support, admin management dashboard with NextAuth, automated knowledge base ingestion pipeline, document parser (PDF/DOCX/MD), unanswered questions queue, analytics, and downloadable QR code generation.

---

## 🌟 Key Capabilities & Features

1. **Strict Context Grounding (Zero Hallucination)**:
   - Grounded strictly on `Rove_Downtown_Hotel_Knowledge_Base.md` verified facts.
   - For unverified / missing facts (e.g. dynamic room pricing, exact deposit policy), explicitly responds with *"I don't have a confirmed answer for that yet — I'll flag it for our team..."* and logs to the `UnknownQuestion` queue.

2. **Provider-Agnostic LLM & Embedding Adapter**:
   - **LLM Adapter**: Switchable runtime providers (`AnthropicProvider` via `@anthropic-ai/sdk` or `OpenAIProvider` via `openai` SDK) controlled by `LLM_PROVIDER` (`anthropic` | `openai`).
   - **Embedding Adapter**: Voyage AI (`voyage-3-lite`) for Anthropic and OpenAI `text-embedding-3-small` for OpenAI, normalized and stored in pgvector columns.
   - **Mock Fallback**: Automatic deterministic local fallback when API keys are unconfigured during offline development.

3. **Hybrid RAG Retrieval Engine**:
   - Priority 1: Direct SQL queries on structured relational tables (`Room`, `Restaurant`, `Facility`, `MeetingRoom`, `Attraction`, `Policy`, `Faq`, `Offer`, `Contact`).
   - Priority 2: Vector similarity search (`pgvector` `<=>` distance) over RAG chunks (`KbChunk`).

4. **Guest Chat UI & Welcome Screen**:
   - Verbatim welcome headline: *"Welcome to Rove Downtown Dubai! Instant answers, anytime. 🌍 Ask your question in any language."*
   - Streaming token-by-token text output, typing indicator, markdown rendering (`react-markdown` + `remark-gfm`).
   - Rotated suggested question chips from 150+ curated KB questions.
   - Thumbs up/down feedback widget logged into `Feedback` table.

5. **Admin Management Dashboard (`/admin`)**:
   - **Authentication**: NextAuth.js credentials provider with bcrypt password hashing against `Admin` table.
   - **Re-Index Knowledge**: One-click re-indexing pipeline executing `scripts/ingest-kb.ts` end-to-end and showing chunk delta reporting.
   - **Document Parser**: Upload PDF/DOCX/MD files to parse, chunk, embed, and insert into active vector store.
   - **Unanswered Queue**: Review `UnknownQuestion` entries, publish official answers, and auto-embed into vector storage.
   - **Conversations & Analytics**: Session transcripts, guest rating breakdown, and top question category metrics.
   - **QR Code Generator**: Downloadable brand-styled PNG/SVG QR codes for mobile scanning.

---

## 🚀 Quick Start (Local Setup)

### 1. Prerequisites
- **Node.js**: v18+ or v20+
- **Docker Desktop**: required for local PostgreSQL + pgvector container.

### 2. Start PostgreSQL + pgvector
```bash
docker-compose up -d
```
*Starts PostgreSQL with pgvector on port 5432 (database: `rove_db`, user: `postgres`, password: `postgres_password`).*

### 3. Environment Setup
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure `DATABASE_URL` is set to:
```env
DATABASE_URL="postgresql://postgres:postgres_password@localhost:5432/rove_db?schema=public"
```

### 4. Database Setup & Knowledge Base Ingestion
Generate Prisma client and push schema:
```bash
npm run db:push
```
Seed admin user credentials (`admin@rovehotels.com` / `admin_rove_2026`):
```bash
npx tsx scripts/seed-admin.ts
```
Run Knowledge Base Ingestion pipeline:
```bash
npm run ingest
```
*Parses `Rove_Downtown_Hotel_Knowledge_Base.md`, creates database records, generates vector embeddings, and populates `KbChunk`.*

### 5. Launch Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

- **Guest Welcome Screen**: `http://localhost:3000`
- **Guest Chat Interface**: `http://localhost:3000/chat`
- **Admin Login**: `http://localhost:3000/admin/login`
- **Admin Dashboard**: `http://localhost:3000/admin`

---

## 🧪 Testing

Run unit & integration test suites:
```bash
npm run test:unit
```

Run Playwright E2E smoke tests:
```bash
npm run test:e2e
```

---

## ☁️ Production Deployment (Vercel + Railway/Render)

### 1. Database (Railway / Render / Supabase)
1. Provision a PostgreSQL database instance with the `pgvector` extension enabled.
2. Note the connection URL and set `DATABASE_URL` in your hosting platform.

### 2. Deploy Application to Vercel
1. Connect repository to **Vercel**.
2. Add environment variables:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (e.g. `https://rove-concierge.vercel.app`)
   - `LLM_PROVIDER` (`anthropic` or `openai`)
   - `ANTHROPIC_API_KEY` / `OPENAI_API_KEY` / `VOYAGE_API_KEY`
3. Set Build Command: `npx prisma db push && npx tsx scripts/ingest-kb.ts && npx tsx scripts/seed-admin.ts && next build`
4. Deploy!
