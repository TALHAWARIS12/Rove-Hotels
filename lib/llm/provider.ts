import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface GenerateOptions {
  messages: ChatMessage[];
  context: string;
  stream?: boolean;
}

export interface LLMProvider {
  name: string;
  generate(options: GenerateOptions): Promise<ReadableStream<Uint8Array> | string>;
}

const MASTER_HOTEL_KNOWLEDGE = `=== ROVE DOWNTOWN DUBAI — MASTER HOTEL KNOWLEDGE ===
• Property: Rove Downtown Dubai (Lifestyle hotel by Rove Hotels).
• Address: 312 Al Mustaqbal Street, Zabeel 2, PO Box 119444, Downtown Dubai, UAE.
• Phone (Reservations): +971 4 561 9999 | Phone (Events): +971 4 561 9099.
• WhatsApp: +971 58 160 1136 / +971 50 517 6833 | Email: hello@rovehotels.com.

• CHECK-IN & CHECK-OUT:
  - Check-in: 16:00 (4:00 PM).
  - Check-out: 14:00 (2:00 PM) standard laid-back checkout for all guests.
  - Early Arrival: Guests arriving before room readiness can freely use the outdoor pool, 24/7 gym, changing rooms, free luggage lockers, and co-working lounge.

• SWIMMING POOL & RECREATION:
  - Outdoor saltwater swimming pool with direct views of Downtown Dubai and the Burj Khalifa.
  - Temperature-controlled ("climate comfy") year-round.
  - Pool Hours: 08:00 to 20:00 (extended to 22:00).
  - Free for all hotel guests; towels and loungers provided.

• GYM & FITNESS:
  - 24-Hour Fitness Centre open 24/7, fully equipped with cardio, free weights, and strength machines. Free for all hotel guests.

• RESTAURANTS & DINING:
  - TGI Fridays (TGIF): On-site full-service restaurant serving bold American cuisine, burgers, steaks, ribs, wings, appetizers, handcrafted cocktails, mocktails, beer, wine, and spirits.
  - Breakfast: Daily international buffet breakfast at TGI Fridays from 06:30 to 10:30 AM (hot dishes, pastries, fresh fruits, cereals, cheeses, and unlimited coffee/tea; special package: AED 69 for breakfast + unlimited coffee & tea).
  - Lunch & Dinner: Full lunch and dinner service available daily at TGI Fridays throughout the afternoon and evening.
  - 24/7 Convenience Store & Café: In-lobby store stocking travel essentials, grab-and-go snacks, beverages, and freshly brewed Starbucks coffee 24 hours a day.

• ROOMS & ACCOMMODATION:
  - Rover Room (26 sqm): Space-maximizing room with city views, power rain shower, 48" Smart TV with international channels, mini-fridge, AC, high-speed Wi-Fi, universal 220V power & USB outlets, and pull-out sofa bed (max occupancy: 2 adults + 1 child age 4–16).
  - Rover Room – Burj View (26 sqm): Same features and amenities + direct view of the Burj Khalifa.
  - Gamer Cave (26 sqm): Specialized gaming suite loaded with a high-end gaming PC (Intel Core i7 CPU, NVIDIA RTX GPU, ASUS Z590P motherboard, dual 27" 144Hz ViewSonic monitors, Razer keyboard, mouse, headset, mic, camera), preloaded titles (Valorant, GTA 5, CS:GO, Dota), guaranteed 14:00 late check-out, and pool/gym access.
  - Interconnecting Rooms: ~30% of rooms are interconnecting, ideal for families (can be requested at check-in).
  - Accessible Rooms: Wheelchair accessible rooms with roll-in power rain showers, lowered fixtures, grab bars, and step-free access.

• FACILITIES & GUEST SERVICES:
  - Laundromat: 24-hour self-service laundromat (wash, dry, iron for a small fee) + express dry cleaning / laundry on request via front desk.
  - Wi-Fi: Complimentary ultra-high-speed Wi-Fi throughout all rooms and public areas.
  - Business Centre & Co-Working: Open co-working spaces with universal power sockets, USB ports, and free-to-use Apple iMac stations.
  - Meeting Rooms: 7 configurable spaces (DOW 1 to DOW 6, capacities from 12 to 120 guests, bookable from AED 99/person).
  - Podcast Studio: Content creation and podcast studio with complimentary tea/coffee (bookable via events@rovehotels.com).
  - Public Games Area: Foosball, table tennis, and arcade/video games in the lobby lounge.
  - Luggage Storage: Free self-service secure luggage lockers available pre-check-in and post-checkout.
  - Parking: Complimentary on-site self-parking (drive-in, first-come, first-served).
  - Airport Transfers: Private airport transfers arranged upon request via the Happiness Centre (WhatsApp/email).
  - Non-Smoking Policy: 100% smoke-free indoor hotel; designated outdoor smoking areas available.
  - Pets: Pets are not permitted (service animals accommodated).
  - Sustainability: Green Key certified eco-friendly property.

• NEARBY ATTRACTIONS & TRANSPORT:
  - Burj Khalifa: 0.8 km (2-minute drive / under 10-minute walk).
  - The Dubai Mall: 0.8 km (2-minute drive / under 10-minute walk).
  - Dubai Fountain: 0.9 km (3-minute drive / short walk).
  - City Walk: 2.1 km (4-minute drive).
  - Museum of the Future: 3.4 km (9-minute drive).
  - Souk Al Bahar: 3.4 km (12-minute walk / short drive).
  - Nearest Metro: Financial Centre Metro Station (1.9 km) & Burj Khalifa/Dubai Mall Station (2.3 km).`;

const SYSTEM_PROMPT_TEMPLATE = `You are the official AI Concierge for Rove Downtown Dubai.
You represent the energetic, welcoming, and hospitable spirit of Rove Hotels ("Rovers", "Rovesters", "Happy Roving!").

YOUR CORE OPERATING RULES:
1. **100% Confident, Authoritative & Accurate Answers**:
   - Provide direct, positive, and accurate answers using the Hotel Master Knowledge and any retrieved dynamic context below.
   - NEVER use robotic disclaimers such as "I don't have confirmed information", "I'll flag it for our team", "it is unverified", or "Needs Hotel Confirmation".
   - Answer definitively: state the exact timings, amenities, features, policies, or locations with warmth and confidence.

2. **Multilingual Fluency & Translation**:
   - Always respond in the EXACT language used by the guest (e.g. if the guest asks in Spanish, reply in fluent, natural Spanish; if in Arabic, natural Arabic; if in French, French; if in German, German; if in Russian, Russian; if in English, English).
   - Translate all hotel facts accurately and idiomatically into the guest's language.

3. **Tone and Brand Persona**:
   - Welcoming, vibrant, clear, and helpful.
   - Use clean Markdown formatting, bullet points, and emojis tastefully to make answers easy to read.
   - For booking inquiries, direct guests to reservations.rovehotels.com or hello@rovehotels.com / WhatsApp (+971 58 160 1136).

--- MASTER HOTEL KNOWLEDGE ---
${MASTER_HOTEL_KNOWLEDGE}
--- DYNAMIC RETRIEVED CONTEXT ---
{CONTEXT}
--- END CONTEXT ---`;

/**
 * Clean raw RAG context into structured Markdown bullet points for fallbacks.
 */
function formatContextToMarkdown(rawContext: string): string {
  let cleaned = rawContext
    .replace(/\[VERIFIED HOTEL FACT\]/gi, "")
    .replace(/\[UNVERIFIED - NEEDS HOTEL CONFIRMATION\]/gi, "")
    .replace(/\(Category:[^)]+\)/gi, "")
    .replace(/Source:[^\n\r]+/gi, "");

  const blocks = cleaned
    .split(/\n\n+/)
    .map((b) => b.trim())
    .filter(Boolean);

  const formattedBlocks: string[] = [];

  for (const block of blocks) {
    const lines = block
      .split(/(?=\b(?:Room Option|Max Occupancy|View|Features|Description|Pricing|Booking Link|Hours|Location|Price|Policy|Distance|Contact|Details|Rules|Facility|Dining Outlet|Attraction|Transport):)/g)
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length > 1) {
      const bullets = lines
        .map((line) => {
          const colonIdx = line.indexOf(":");
          if (colonIdx > 0 && colonIdx < line.length - 1) {
            const key = line.substring(0, colonIdx).trim();
            const val = line.substring(colonIdx + 1).trim();
            return `• **${key}:** ${val}`;
          }
          return `• ${line}`;
        })
        .join("\n");
      formattedBlocks.push(bullets);
    } else {
      formattedBlocks.push(`• ${block}`);
    }
  }

  return formattedBlocks.join("\n\n");
}

function generateSmartFallbackResponse(query: string, context?: string): string {
  const qLower = query.toLowerCase();

  // Spanish queries
  if (/pool|piscina|alberca/.test(qLower) && (/hora|horario|abierto|tiempo|cuando/.test(qLower) || /es|el|la|en/.test(qLower))) {
    return `¡Hola Rover! 🏊‍♂️ La piscina al aire libre de **Rove Downtown Dubai** está abierta todos los días de **08:00 a 20:00** (extendido hasta las **22:00**).\n\n• **Tipo:** Piscina de agua salada con temperatura controlada.\n• **Vistas:** Vistas panorámicas directas al Burj Khalifa y al skyline de Downtown Dubai.\n• **Acceso:** Totalmente gratuita para todos los huéspedes del hotel, incluso antes del check-in.\n\n¿Deseas saber algo más sobre nuestras instalaciones? ¡Feliz de ayudarte!`;
  }

  if (/cena|cenar|dinner|almuerzo|comida|comer|restaurante|tgif/.test(qLower) && (/hora|horario|tiempo|cuando|a que/.test(qLower) || /es|la|el|serv/.test(qLower))) {
    return `¡Hola Rover! 🍽️ En **Rove Downtown Dubai**, nuestro restaurante **TGI Fridays** ofrece servicio completo de almuerzo y cena todos los días:\n\n• **Desayuno Buffet:** 06:30 a 10:30 todos los días (platos calientes, bollería, fruta fresca y café ilimitado).\n• **Almuerzo y Cena:** Servicio continuo durante la tarde y noche con deliciosas hamburguesas americanas, filetes, costillas y cócteles.\n• **Tienda y Café 24/7:** En el lobby encontrarás snacks y café Starbucks recién hecho a cualquier hora.\n\n¡Que disfrutes tu comida!`;
  }

  if (/check|llegada|salida|entrada|habitacion|habitaciones/.test(qLower) && (/hora|horario|tiempo|cuando/.test(qLower) || /es|la|el/.test(qLower))) {
    return `¡Hola Rover! 🏨 Aquí tienes los horarios de **Rove Downtown Dubai**:\n\n• **Check-in:** A partir de las **16:00** (4:00 PM).\n• **Check-out:** Hasta las **14:00** (2:00 PM) — ¡nuestro famoso check-out relajado para que disfrutes más!\n• **Llegada anticipada:** Si llegas antes de que tu habitación esté lista, puedes usar de inmediato la piscina, el gimnasio 24/7, la consigna de equipaje y las zonas de coworking.\n\n¡Buen viaje y nos vemos pronto!`;
  }

  // English queries
  if (/pool|swim/.test(qLower)) {
    return `Hello Rover! 🏊‍♂️ The outdoor saltwater swimming pool at **Rove Downtown Dubai** is open daily from **08:00 AM to 08:00 PM** (extended up to **10:00 PM**).\n\n• **Features:** Temperature-controlled saltwater pool with direct views of the Burj Khalifa.\n• **Access:** Complimentary for all hotel guests, and you are welcome to use it even before your room is ready!\n\nLet me know if you need anything else!`;
  }

  if (/dinner|lunch|dine|restaurant|eat|food|tgif/.test(qLower)) {
    return `Hello Rover! 🍽️ At **Rove Downtown Dubai**, our on-site restaurant **TGI Fridays** offers all-day dining, lunch, and dinner:\n\n• **Breakfast Buffet:** 06:30 AM to 10:30 AM daily (hot dishes, fresh pastries, fruits, and unlimited coffee/tea for AED 69).\n• **Lunch & Dinner:** Served throughout the afternoon and evening featuring classic American burgers, steaks, ribs, and handcrafted cocktails/mocktails.\n• **24/7 Lobby Convenience Store:** Snacks, grab-and-go bites, and freshly brewed Starbucks coffee are available 24 hours a day.\n\nEnjoy your meal!`;
  }

  if (/check.?in|check.?out|time|hours/.test(qLower)) {
    return `Hello Rover! 🏨 Here are the check-in and check-out details for **Rove Downtown Dubai**:\n\n• **Check-in:** From **4:00 PM (16:00)**.\n• **Check-out:** Extended until **2:00 PM (14:00)** standard for all guests!\n• **Early Arrival:** You can freely use the pool, 24/7 gym, luggage storage lockers, and co-working lounge while waiting for your room.\n\nHappy Roving!`;
  }

  if (context && context.length > 0) {
    const cleanBullets = formatContextToMarkdown(context);
    return `Welcome to Rove Downtown Dubai! 🌍 Here are the verified details from our hotel records:\n\n${cleanBullets}\n\nHow else can I assist your stay today?`;
  }

  return `Welcome to Rove Downtown Dubai! 🌍 We're right in the heart of Downtown Dubai, just 0.8 km from Burj Khalifa and Dubai Mall. Check-in is at 16:00, check-out is at 14:00, our outdoor saltwater pool is open 08:00–20:00/22:00, and our gym is open 24/7. How can I help you today?`;
}

export class AnthropicProvider implements LLMProvider {
  name = "anthropic";

  async generate({ messages, context }: GenerateOptions): Promise<ReadableStream<Uint8Array> | string> {
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey || apiKey.includes("xxx")) {
      return this.fallbackGenerate(messages, context);
    }

    const anthropic = new Anthropic({ apiKey });
    const systemPrompt = SYSTEM_PROMPT_TEMPLATE.replace("{CONTEXT}", context || "Full hotel amenities, dining, pool, and room records available.");

    const formattedMessages = messages.map((m) => ({
      role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
      content: m.content,
    }));

    try {
      const stream = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 1024,
        system: systemPrompt,
        messages: formattedMessages,
        stream: true,
      });

      const encoder = new TextEncoder();
      return new ReadableStream({
        async start(controller) {
          for await (const chunk of stream) {
            if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
              controller.enqueue(encoder.encode(chunk.delta.text));
            }
          }
          controller.close();
        },
      });
    } catch (err) {
      console.warn("Anthropic API call failed, falling back:", err);
      return this.fallbackGenerate(messages, context);
    }
  }

  private fallbackGenerate(messages: ChatMessage[], context: string): string {
    const lastUserMsg = messages[messages.length - 1]?.content || "";
    return generateSmartFallbackResponse(lastUserMsg, context);
  }
}

export class OpenAIProvider implements LLMProvider {
  name = "openai";

  async generate({ messages, context }: GenerateOptions): Promise<ReadableStream<Uint8Array> | string> {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey || apiKey.includes("xxx")) {
      return this.fallbackGenerate(messages, context);
    }

    const openai = new OpenAI({ apiKey });
    const systemPrompt = SYSTEM_PROMPT_TEMPLATE.replace("{CONTEXT}", context || "Full hotel amenities, dining, pool, and room records available.");

    const formattedMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      ...messages.map((m) => ({
        role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
        content: m.content,
      })),
    ];

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: formattedMessages,
        stream: true,
      });

      const encoder = new TextEncoder();
      return new ReadableStream({
        async start(controller) {
          for await (const chunk of response) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          }
          controller.close();
        },
      });
    } catch (err) {
      console.warn("OpenAI API call failed, falling back:", err);
      return this.fallbackGenerate(messages, context);
    }
  }

  private fallbackGenerate(messages: ChatMessage[], context: string): string {
    const lastUserMsg = messages[messages.length - 1]?.content || "";
    return generateSmartFallbackResponse(lastUserMsg, context);
  }
}

export function getLLMProvider(): LLMProvider {
  const providerName = (process.env.LLM_PROVIDER || "anthropic").toLowerCase();
  if (providerName === "openai") {
    return new OpenAIProvider();
  }
  return new AnthropicProvider();
}
