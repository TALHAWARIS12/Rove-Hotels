import { prisma } from "../prisma";
import { embedText } from "../llm/embeddings";

export interface RetrievedFact {
  source: string;
  category: string;
  content: string;
  verified: boolean;
  score?: number;
}

export interface RetrievalResult {
  contextText: string;
  facts: RetrievedFact[];
  hasSufficientContext: boolean;
  hasUnverifiedFacts: boolean;
}

// Lightweight in-memory TTL cache (60 seconds) for static hotel knowledge
interface CacheEntry<T> {
  data: T;
  expiry: number;
}

const CACHE_TTL_MS = 60 * 1000; // 1 minute cache TTL
const dataCache: Record<string, CacheEntry<any>> = {};

async function getCachedData<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const now = Date.now();
  if (dataCache[key] && dataCache[key].expiry > now) {
    return dataCache[key].data;
  }
  try {
    const data = await fetcher();
    dataCache[key] = { data, expiry: now + CACHE_TTL_MS };
    return data;
  } catch (err) {
    // If DB fetch fails, return stale cache if available, or empty array
    if (dataCache[key]) return dataCache[key].data;
    return [] as unknown as T;
  }
}

export async function retrieveHybridContext(userQuery: string): Promise<RetrievalResult> {
  const queryLower = userQuery.toLowerCase();
  const facts: RetrievedFact[] = [];

  // Parallelize structured data retrieval and vector embedding concurrently
  const [
    rooms,
    restaurants,
    policies,
    attractions,
    transport,
    faqs,
    queryEmbedding,
  ] = await Promise.all([
    queryLower.match(/room|rover|gamer|bed|stay|view|suite|cost|price|rate/)
      ? getCachedData("rooms", () => prisma.room.findMany())
      : Promise.resolve([]),
    queryLower.match(/eat|food|dine|dining|restaurant|tgif|fridays|breakfast|lunch|dinner|coffee|bar|drink|menu/)
      ? getCachedData("restaurants", () => prisma.restaurant.findMany())
      : Promise.resolve([]),
    queryLower.match(/check|policy|smoke|pet|child|kid|cancel|deposit|age|rule|time|in|out/)
      ? getCachedData("policies", () => prisma.policy.findMany())
      : Promise.resolve([]),
    queryLower.match(/burj|khalifa|mall|attraction|fountain|walk|museum|near|around|distance|see|do|opera|dubai/)
      ? getCachedData("attractions", () => prisma.attraction.findMany())
      : Promise.resolve([]),
    queryLower.match(/metro|bus|airport|transfer|taxi|cab|drive|park|station|shuttle|ride/)
      ? getCachedData("transport", () => prisma.transportOption.findMany())
      : Promise.resolve([]),
    getCachedData("faqs", () => prisma.faq.findMany()),
    embedText(userQuery).catch(() => []),
  ]);

  // 1. Process Structured Room Facts
  for (const r of rooms) {
    if (queryLower.includes(r.name.toLowerCase()) || queryLower.includes(r.roomId) || queryLower.includes("room") || queryLower.includes("stay") || queryLower.includes("suite") || queryLower.includes("view")) {
      facts.push({
        source: "structured_db:rooms",
        category: "Rooms",
        content: `Room Option: ${r.name} (${r.sizeSqm} sqm)\nMax Occupancy: ${r.maxAdults} Adults + ${r.maxChildren} Child\nView: ${r.view}\nFeatures: ${r.keyFeatures}\nDescription: ${r.description || ""}\nPricing: ${r.pricingNote || "Dynamic"}\nBooking Link: ${r.bookingLink || ""}`,
        verified: r.verified,
      });
    }
  }

  // 2. Process Dining Facts
  for (const r of restaurants) {
    facts.push({
      source: "structured_db:dining",
      category: "Dining",
      content: `Dining Outlet: ${r.name} (${r.type})\nCuisine: ${r.cuisine}\nBreakfast Hours: ${r.breakfastHours || "N/A"}\nAlcohol Served: ${r.alcoholServed ? "Yes" : "No"}\nDescription: ${r.description || ""}\nMenu Link: ${r.menuLink || "N/A"}`,
      verified: r.verified,
    });
  }

  // 3. Process Policies
  for (const p of policies) {
    facts.push({
      source: "structured_db:policies",
      category: "Policies",
      content: `Policy [${p.category}]: ${p.key} = ${p.value}`,
      verified: p.verified,
    });
  }

  // 4. Process Attractions
  for (const a of attractions) {
    if (queryLower.includes(a.name.toLowerCase()) || queryLower.includes("attraction") || queryLower.includes("near") || queryLower.includes("distance") || queryLower.includes("do") || queryLower.includes("see")) {
      facts.push({
        source: "structured_db:attractions",
        category: "Attractions",
        content: `Attraction: ${a.name} (${a.category})\nDistance: ${a.distanceKm} km (${a.timeMin} mins walk/drive)\nDescription: ${a.description || ""}`,
        verified: a.verified,
      });
    }
  }

  // 5. Process Transportation
  for (const t of transport) {
    facts.push({
      source: "structured_db:transportation",
      category: "Transportation",
      content: `Transport [${t.mode}]: ${t.name}${t.distanceKm ? ` (${t.distanceKm} km)` : ""}\nDetails: ${t.details || ""}`,
      verified: t.verified,
    });
  }

  // 6. Process FAQ Exact & Partial Matches
  for (const f of faqs) {
    if (queryLower.includes(f.question.toLowerCase()) || f.question.toLowerCase().includes(queryLower)) {
      facts.push({
        source: "structured_db:faqs",
        category: f.category,
        content: `FAQ: ${f.question}\nAnswer: ${f.answer}`,
        verified: f.verified,
      });
    }
  }

  // 7. Fast Vector Similarity Search over KbChunks (If vector embedding exists)
  if (queryEmbedding && queryEmbedding.length > 0) {
    try {
      const vectorString = `[${queryEmbedding.join(",")}]`;
      let semanticChunks: { id: string; content: string; category: string; sourceUrl: string | null; verified: boolean }[] = [];

      try {
        semanticChunks = await prisma.$queryRawUnsafe<any[]>(
          `SELECT id, content, category, "sourceUrl", verified
           FROM "KbChunk"
           WHERE embedding IS NOT NULL
           ORDER BY embedding <=> $1::vector ASC
           LIMIT 3`,
          vectorString
        );
      } catch {
        // Keyword fallback
        const words = userQuery.split(" ").filter((w) => w.length > 3);
        if (words.length > 0) {
          semanticChunks = await getCachedData(`kb_chunk_${words[0]}`, () =>
            prisma.kbChunk.findMany({
              where: { content: { contains: words[0], mode: "insensitive" } },
              take: 3,
            })
          );
        }
      }

      for (const chunk of semanticChunks) {
        if (!facts.some((f) => f.content === chunk.content)) {
          facts.push({
            source: "vector_rag:kb_chunk",
            category: chunk.category,
            content: chunk.content,
            verified: chunk.verified,
          });
        }
      }
    } catch (err) {
      console.warn("Vector retrieval error:", err);
    }
  }

  // 8. Format Context Text and Verification Flags
  let hasUnverified = false;
  const contextLines: string[] = [];

  for (const fact of facts) {
    const verificationLabel = fact.verified ? "[VERIFIED HOTEL FACT]" : "[UNVERIFIED / Needs Hotel Confirmation]";
    if (!fact.verified) hasUnverified = true;
    contextLines.push(`${verificationLabel} (Category: ${fact.category}, Source: ${fact.source})\n${fact.content}\n`);
  }

  return {
    contextText: contextLines.join("\n---\n"),
    facts,
    hasSufficientContext: facts.length > 0,
    hasUnverifiedFacts: hasUnverified,
  };
}
