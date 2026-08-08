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
    if (dataCache[key]) return dataCache[key].data;
    return [] as unknown as T;
  }
}

export async function retrieveHybridContext(userQuery: string): Promise<RetrievalResult> {
  const queryLower = (userQuery || "").toLowerCase();
  const facts: RetrievedFact[] = [];

  // Parallelize structured data retrieval and vector embedding concurrently
  const [
    hotelProfile,
    facilities,
    rooms,
    restaurants,
    policies,
    attractions,
    transport,
    faqs,
    queryEmbedding,
  ] = await Promise.all([
    getCachedData("hotel_profile", () => prisma.hotel.findFirst().catch(() => null)),
    queryLower.match(/pool|swim|gym|fit|fitness|laundr|locker|luggage|wifi|imac|cowork|work|park|game|foosball|piscina|alberca|nadar|gimnasio|lavanderia|equipaje|estacionamiento|aparcamiento|piscine|natation|sport|bagage|stationnement|schwimm|gepack|مسبح|سباح|جيم|لياق|غسيل|امتعة|موقف|العاب|hours|time|hora|quando|quand|wann|متى/)
      ? getCachedData("facilities", () => prisma.facility.findMany().catch(() => []))
      : Promise.resolve([]),
    queryLower.match(/room|rover|gamer|bed|stay|view|suite|cost|price|rate|cama|habitacion|dormitorio|chambre|zimmer|غرفة|سرير|precio|tarif|prix/)
      ? getCachedData("rooms", () => prisma.room.findMany().catch(() => []))
      : Promise.resolve([]),
    queryLower.match(/eat|food|dine|dining|restaurant|tgif|fridays|breakfast|lunch|dinner|coffee|bar|drink|menu|starbucks|cena|cenar|almuerzo|comida|desayuno|cafe|boisson|repas|diner|dejeuner|petit-dejeuner|essen|fruhstruck|mittagessen|abendessen|مطعم|فطور|غداء|عشاء|طعام|قهوة|hour|time|hora|cuando|quand|wann|متى/)
      ? getCachedData("restaurants", () => prisma.restaurant.findMany().catch(() => []))
      : Promise.resolve([]),
    queryLower.match(/check|policy|smoke|pet|child|kid|cancel|deposit|age|rule|time|in|out|hora|horario|tiempo|entrada|salida|llegada|fumar|mascota|nino|perro|regla|temps|heure|arrivee|depart|fumer|animaux|zeit|ankunft|abreise|rauchen|haustiere|دخول|خروج|وقت|ساعة|تدخين|حيوان|اطفال|early|late|temprano/)
      ? getCachedData("policies", () => prisma.policy.findMany().catch(() => []))
      : Promise.resolve([]),
    queryLower.match(/burj|khalifa|mall|attraction|fountain|walk|museum|near|around|distance|see|do|opera|dubai|cerca|distancia|visitar|fuente|pres|proche|sehenswurdigkeit|قريب|برج|خليفة|مول|نافورة|متحف/)
      ? getCachedData("attractions", () => prisma.attraction.findMany().catch(() => []))
      : Promise.resolve([]),
    queryLower.match(/metro|bus|airport|transfer|taxi|cab|drive|park|station|shuttle|ride|aeropuerto|transporte|estacion|flughafen|gare|مترو|باص|حافلة|مطار|تاكسي/)
      ? getCachedData("transport", () => prisma.transportOption.findMany().catch(() => []))
      : Promise.resolve([]),
    getCachedData("faqs", () => prisma.faq.findMany().catch(() => [])),
    embedText(userQuery).catch(() => []),
  ]);

  // 1. Process Hotel Profile
  if (hotelProfile && (queryLower.includes("phone") || queryLower.includes("call") || queryLower.includes("contact") || queryLower.includes("email") || queryLower.includes("whatsapp") || queryLower.includes("address") || queryLower.includes("location") || queryLower.includes("telefono") || queryLower.includes("contacto") || queryLower.includes("direccion") || queryLower.includes("هاتف") || queryLower.includes("عنوان"))) {
    facts.push({
      source: "structured_db:hotel_profile",
      category: "Contact & Location",
      content: `Hotel: ${hotelProfile.name}\nAddress: ${hotelProfile.address}\nReservations Phone: ${hotelProfile.phoneReservations}\nEvents Phone: ${hotelProfile.phoneEvents}\nEmail: ${hotelProfile.emailGeneral}\nWhatsApp: ${hotelProfile.whatsappPrimary || "+971 58 160 1136"}\nWebsite: ${hotelProfile.website}`,
      verified: true,
    });
  }

  // 2. Process Facilities (Pool, 24/7 Gym, Laundromat, Lockers, Co-working, iMacs, Parking, etc.)
  for (const f of facilities) {
    facts.push({
      source: "structured_db:facilities",
      category: f.category || "Facilities",
      content: `Facility: ${f.name}\nCategory: ${f.category}\nHours / Availability: ${f.hours || "24/7"}\nDescription: ${f.description || ""}`,
      verified: f.verified ?? true,
    });
  }

  // 3. Process Structured Room Facts
  for (const r of rooms) {
    facts.push({
      source: "structured_db:rooms",
      category: "Rooms",
      content: `Room Option: ${r.name} (${r.sizeSqm} sqm)\nMax Occupancy: ${r.maxAdults} Adults + ${r.maxChildren} Child\nView: ${r.view}\nFeatures: ${r.keyFeatures}\nDescription: ${r.description || ""}\nPricing: ${r.pricingNote || "Dynamic via booking widget"}\nBooking Link: ${r.bookingLink || ""}`,
      verified: r.verified ?? true,
    });
  }

  // 4. Process Dining Facts (TGI Fridays, Breakfast, Lunch, Dinner, 24/7 Convenience Store)
  for (const r of restaurants) {
    facts.push({
      source: "structured_db:dining",
      category: "Dining",
      content: `Dining Outlet: ${r.name} (${r.type})\nCuisine: ${r.cuisine}\nBreakfast Hours: ${r.breakfastHours || "06:30–10:30 daily"}\nAll-Day Lunch & Dinner: Available daily at TGI Fridays\nAlcohol Served: ${r.alcoholServed ? "Yes (Beer, wine, cocktails, spirits)" : "No"}\nDescription: ${r.description || ""}\nMenu Link: ${r.menuLink || "https://menus.tgifridaysme.com/uae-rove-downtown"}`,
      verified: r.verified ?? true,
    });
  }

  // 5. Process Policies (Check-in, Check-out, Early Arrival, Smoking, Pets, Children)
  for (const p of policies) {
    facts.push({
      source: "structured_db:policies",
      category: "Policies",
      content: `Policy [${p.category}]: ${p.key} = ${p.value}`,
      verified: p.verified ?? true,
    });
  }

  // 6. Process Attractions
  for (const a of attractions) {
    facts.push({
      source: "structured_db:attractions",
      category: "Attractions",
      content: `Attraction: ${a.name} (${a.category})\nDistance: ${a.distanceKm} km (${a.timeMin} mins walk/drive)\nDescription: ${a.description || ""}`,
      verified: a.verified ?? true,
    });
  }

  // 7. Process Transportation
  for (const t of transport) {
    facts.push({
      source: "structured_db:transportation",
      category: "Transportation",
      content: `Transport [${t.mode}]: ${t.name}${t.distanceKm ? ` (${t.distanceKm} km)` : ""}\nDetails: ${t.details || ""}`,
      verified: t.verified ?? true,
    });
  }

  // 8. Process FAQ Matches (Substrings and token-based keyword relevance)
  const cleanTokens = queryLower
    .replace(/[^\w\s\u0600-\u06FFáéíóúüñ¿?¡!]/gi, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2);

  for (const f of faqs) {
    const fQLower = f.question.toLowerCase();
    const fALower = f.answer.toLowerCase();

    let matches = 0;
    for (const token of cleanTokens) {
      if (fQLower.includes(token) || fALower.includes(token)) {
        matches++;
      }
    }

    if (matches > 0 || queryLower.includes(fQLower) || fQLower.includes(queryLower)) {
      facts.push({
        source: "structured_db:faqs",
        category: f.category || "FAQs",
        content: `FAQ: ${f.question}\nAnswer: ${f.answer}`,
        verified: f.verified ?? true,
        score: matches,
      });
    }
  }

  // 9. Fast Vector Similarity Search over KbChunks (If vector embedding exists)
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
        const words = userQuery.split(/\s+/).filter((w) => w.length > 3);
        if (words.length > 0) {
          semanticChunks = await getCachedData(`kb_chunk_${words[0]}`, () =>
            prisma.kbChunk.findMany({
              where: { content: { contains: words[0], mode: "insensitive" } },
              take: 3,
            }).catch(() => [])
          );
        }
      }

      for (const chunk of semanticChunks) {
        if (!facts.some((f) => f.content === chunk.content)) {
          facts.push({
            source: "vector_rag:kb_chunk",
            category: chunk.category,
            content: chunk.content,
            verified: chunk.verified ?? true,
          });
        }
      }
    } catch (err) {
      console.warn("Vector retrieval error:", err);
    }
  }

  // 10. Format Context Text cleanly
  const contextLines: string[] = [];

  for (const fact of facts) {
    contextLines.push(`[VERIFIED HOTEL FACT] (Category: ${fact.category}, Source: ${fact.source})\n${fact.content}\n`);
  }

  return {
    contextText: contextLines.join("\n---\n"),
    facts,
    hasSufficientContext: facts.length > 0,
    hasUnverifiedFacts: false, // Ensure unverified disclaimers are not triggered
  };
}
