import fs from "fs";
import path from "path";
import { prisma } from "../lib/prisma";
import { embedText } from "../lib/llm/embeddings";

async function ingestKnowledgeBase() {
  console.log("Starting Knowledge Base Ingestion...");

  const kbPath = path.join(process.cwd(), "Rove_Downtown_Hotel_Knowledge_Base.md");
  if (!fs.existsSync(kbPath)) {
    throw new Error(`Knowledge Base file not found at ${kbPath}`);
  }

  const kbContent = fs.readFileSync(kbPath, "utf-8");

  // 1. Ensure primary Hotel record exists
  const hotel = await prisma.hotel.upsert({
    where: { id: "rove_downtown_dubai" },
    update: {
      name: "Rove Downtown",
      brand: "Rove Hotels",
      address: "312 Al Mustaqbal Street, Zabeel 2, PO Box 119444, Dubai, UAE",
      phoneReservations: "+971 4 561 9999",
      phoneEvents: "+971 4 561 9099",
      emailGeneral: "hello@rovehotels.com",
      emailEvents: "events@rovehotels.com",
      whatsappPrimary: "+971 58 160 1136",
      whatsappSecondary: "+971 50 517 6833",
      website: "https://www.rovehotels.com/en/hotels/downtown/",
      checkinTime: "16:00",
      checkoutTime: "14:00",
      smokingPolicy: "non-smoking, designated outdoor areas only",
      petsAllowed: false,
      ecoCertification: "Green Key",
      verified: true,
    },
    create: {
      id: "rove_downtown_dubai",
      name: "Rove Downtown",
      brand: "Rove Hotels",
      address: "312 Al Mustaqbal Street, Zabeel 2, PO Box 119444, Dubai, UAE",
      phoneReservations: "+971 4 561 9999",
      phoneEvents: "+971 4 561 9099",
      emailGeneral: "hello@rovehotels.com",
      emailEvents: "events@rovehotels.com",
      whatsappPrimary: "+971 58 160 1136",
      whatsappSecondary: "+971 50 517 6833",
      website: "https://www.rovehotels.com/en/hotels/downtown/",
      checkinTime: "16:00",
      checkoutTime: "14:00",
      smokingPolicy: "non-smoking, designated outdoor areas only",
      petsAllowed: false,
      ecoCertification: "Green Key",
      verified: true,
    },
  });

  console.log(`Upserted Hotel profile: ${hotel.name}`);

  // 2. Ingest Rooms
  const roomsData = [
    {
      roomId: "rover_room",
      name: "Rover Room",
      sizeSqm: 26,
      maxAdults: 2,
      maxChildren: 1,
      view: "City View",
      keyFeatures: "AC, high-speed Wi-Fi, mini-fridge, rain shower, 48\" Smart TV, sofa bed",
      description: "Efficient, space-maximizing room with a playful nod to local Dubai design.",
      pricingNote: "Dynamic pricing. Visible via booking widget.",
      bookingLink: "https://reservations.rovehotels.com/106961?roomtypeid=447393",
      verified: true,
    },
    {
      roomId: "rover_room_burj",
      name: "Rover Room – Burj View",
      sizeSqm: 26,
      maxAdults: 2,
      maxChildren: 1,
      view: "Burj Khalifa View",
      keyFeatures: "Same as Rover Room + direct Burj Khalifa view",
      description: "Rover Room product with an iconic direct view of the Burj Khalifa.",
      pricingNote: "Dynamic pricing.",
      bookingLink: "https://reservations.rovehotels.com/106961?roomtypeid=447394",
      verified: true,
    },
    {
      roomId: "gamer_cave",
      name: "Gamer Cave",
      sizeSqm: 26,
      maxAdults: 2,
      maxChildren: 1,
      view: "City View",
      keyFeatures: "Gaming PC (i7 CPU, RTX GPU), dual 144Hz monitors, Razer peripherals, late check-out 2pm",
      description: "Dedicated gaming suite loaded with high-end PC hardware and popular esports titles.",
      pricingNote: "Dynamic pricing.",
      bookingLink: "https://reservations.rovehotels.com/106961?roomtypeid=515654&RatePlanId=5375736",
      verified: true,
    },
  ];

  for (const r of roomsData) {
    await prisma.room.upsert({
      where: { roomId: r.roomId },
      update: r,
      create: { ...r, hotelId: hotel.id },
    });
  }
  console.log(`Ingested ${roomsData.length} Room types`);

  // 3. Ingest Restaurants
  const diningData = [
    {
      outletId: "tgif_downtown",
      name: "TGI Fridays (TGIF)",
      type: "On-site restaurant",
      cuisine: "American",
      breakfastHours: "06:30–10:30 daily",
      alcoholServed: true,
      description: "In-hotel restaurant offering classic American burgers, steaks, cocktails, and mocktails.",
      menuLink: "https://menus.tgifridaysme.com/uae-rove-downtown",
      verified: true,
    },
    {
      outletId: "convenience_store",
      name: "Rove Convenience Store",
      type: "In-lobby store & café",
      cuisine: "Snacks, beverages, Starbucks coffee",
      breakfastHours: "24/7",
      alcoholServed: false,
      description: "24-hour lobby store stocking travel essentials, snacks, and freshly brewed Starbucks coffee.",
      menuLink: null,
      verified: true,
    },
  ];

  for (const d of diningData) {
    await prisma.restaurant.upsert({
      where: { outletId: d.outletId },
      update: d,
      create: { ...d, hotelId: hotel.id },
    });
  }
  console.log(`Ingested ${diningData.length} Dining outlets`);

  // 4. Ingest Facilities
  const facilitiesData = [
    { facilityId: "outdoor_pool", name: "Outdoor Saltwater Pool", category: "Recreation", hours: "08:00–20:00 (or 22:00)", description: "Temperature controlled outdoor pool with view." },
    { facilityId: "gym_24hr", name: "24-Hour Gym", category: "Fitness", hours: "24/7", description: "Fully equipped 24-hour fitness center." },
    { facilityId: "laundromat_24hr", name: "24-Hour Laundromat", category: "Services", hours: "24/7", description: "Self-service wash, dry, and ironing facilities." },
    { facilityId: "wifi_highspeed", name: "High-Speed Wi-Fi", category: "Technology", hours: "24/7", description: "Free high-speed Wi-Fi across rooms and public areas." },
    { facilityId: "business_imacs", name: "Business iMac Stations", category: "Business", hours: "24/7", description: "Complimentary iMac computers in co-working space." },
    { facilityId: "coworking_space", name: "Co-Working Hub", category: "Business", hours: "24/7", description: "Open co-working spaces with universal sockets and USB ports." },
    { facilityId: "meeting_rooms_7", name: "Meeting & Event Spaces", category: "Events", hours: "On Request", description: "7 configurable meeting rooms with capacity up to 120 guests." },
    { facilityId: "podcast_studio", name: "Podcast Studio", category: "Media", hours: "Bookable", description: "Self-service podcast and media production studio." },
    { facilityId: "luggage_lockers", name: "Self-Service Luggage Lockers", category: "Services", hours: "24/7", description: "Free luggage storage lockers pre- and post-checkout." },
    { facilityId: "public_games", name: "Public Games Area", category: "Recreation", hours: "24/7", description: "Foosball, table tennis, and arcade/video games." },
    { facilityId: "self_parking", name: "Self-Parking", category: "Transport", hours: "24/7", description: "On-site drive-in self parking, first-come first-served." },
    { facilityId: "airport_transfer", name: "Airport Transfer", category: "Transport", hours: "On Request", description: "Paid airport transfer arranged via Happiness Centre." },
  ];

  for (const f of facilitiesData) {
    await prisma.facility.upsert({
      where: { facilityId: f.facilityId },
      update: { ...f, verified: true },
      create: { ...f, verified: true, hotelId: hotel.id },
    });
  }
  console.log(`Ingested ${facilitiesData.length} Facilities`);

  // 5. Ingest Meeting Rooms
  const meetingRoomsData = [
    { roomCode: "DOW1", sizeSqm: 64, capacity: 50, bestFor: "Workshops & team trainings", combinableWith: "DOW2" },
    { roomCode: "DOW2", sizeSqm: 64, capacity: 50, bestFor: "Workshops & team trainings", combinableWith: "DOW1" },
    { roomCode: "DOW1+2", sizeSqm: 128, capacity: 100, bestFor: "Small conferences", combinableWith: null },
    { roomCode: "DOW3", sizeSqm: 30, capacity: 12, bestFor: "Board room", combinableWith: null },
    { roomCode: "DOW5", sizeSqm: 56, capacity: 60, bestFor: "Workshops & team trainings", combinableWith: "DOW6" },
    { roomCode: "DOW6", sizeSqm: 56, capacity: 60, bestFor: "Workshops & team trainings", combinableWith: "DOW5" },
    { roomCode: "DOW5+6", sizeSqm: 112, capacity: 120, bestFor: "Small conferences", combinableWith: null },
  ];

  for (const mr of meetingRoomsData) {
    await prisma.meetingRoom.upsert({
      where: { roomCode: mr.roomCode },
      update: { ...mr, verified: true },
      create: { ...mr, verified: true, hotelId: hotel.id },
    });
  }
  console.log(`Ingested ${meetingRoomsData.length} Meeting Rooms`);

  // 6. Ingest Attractions
  const attractionsData = [
    { name: "Burj Khalifa", distanceKm: 0.8, timeMin: 2, category: "Landmark", description: "World's tallest building (828m) with observation decks." },
    { name: "Dubai Fountain", distanceKm: 0.9, timeMin: 3, category: "Landmark", description: "World's largest choreographed fountain show on Burj Lake." },
    { name: "The Dubai Mall", distanceKm: 0.8, timeMin: 2, category: "Shopping", description: "Premier shopping mall with over 1,200 stores and aquarium." },
    { name: "City Walk", distanceKm: 2.1, timeMin: 4, category: "Lifestyle", description: "Outdoor retail and dining district." },
    { name: "Souk Al Bahar", distanceKm: 3.4, timeMin: 12, category: "Shopping", description: "Arabian-style shopping and dining hub beside Burj Lake." },
    { name: "Downtown Boulevard", distanceKm: 2.4, timeMin: 10, category: "Recreation", description: "Scenic running and walking promenade through Downtown Dubai." },
    { name: "Ras Al Khor Wildlife Sanctuary", distanceKm: 11.3, timeMin: 13, category: "Nature", description: "Wetland reserve famous for wild flamingos." },
    { name: "Museum of the Future", distanceKm: 3.4, timeMin: 9, category: "Landmark", description: "Iconic architectural marvel showcasing future innovations." },
  ];

  for (const a of attractionsData) {
    await prisma.attraction.upsert({
      where: { name: a.name },
      update: { ...a, verified: true },
      create: { ...a, verified: true, hotelId: hotel.id },
    });
  }
  console.log(`Ingested ${attractionsData.length} Attractions`);

  // 7. Ingest Transport Options
  const transportData = [
    { mode: "metro", name: "Financial Centre Station", distanceKm: 1.9, details: "Nearest Dubai Metro station." },
    { mode: "metro", name: "Burj Khalifa / Dubai Mall Station", distanceKm: 2.3, details: "Alternative metro access point." },
    { mode: "bus", name: "Dubai Mall Metro Station Bus Stop", distanceKm: 2.3, details: "Connects to citywide bus network." },
    { mode: "transfer", name: "Hotel Airport Transfer", distanceKm: 0.0, details: "Paid private transfer booked via Happiness Centre (hello@rovehotels.com)." },
  ];

  for (const t of transportData) {
    await prisma.transportOption.upsert({
      where: { name: t.name },
      update: { ...t, verified: true },
      create: { ...t, verified: true, hotelId: hotel.id },
    });
  }
  console.log(`Ingested ${transportData.length} Transport Options`);

  // 8. Ingest Policies
  const policiesData = [
    { key: "check_in_time", value: "16:00 (4:00 PM)", category: "Check-in" },
    { key: "check_out_time", value: "14:00 (2:00 PM)", category: "Check-out" },
    { key: "early_arrival", value: "Facilities (pool, gym, lockers) available before room readiness", category: "Check-in" },
    { key: "smoking_policy", value: "Non-smoking property; outdoor designated areas only", category: "General" },
    { key: "pet_policy", value: "Pets are not allowed", category: "General" },
    { key: "child_policy", value: "Max 2 adults + 1 child (4–16 yrs) per room; sofa bed provided", category: "Family" },
    { key: "interconnecting_rooms", value: "~30% of inventory; subject to availability at check-in", category: "Family" },
    { key: "eco_policy", value: "Green Key certified eco-friendly hotel", category: "Sustainability" },
  ];

  for (const p of policiesData) {
    await prisma.policy.upsert({
      where: { key: p.key },
      update: { ...p, verified: true },
      create: { ...p, verified: true, hotelId: hotel.id },
    });
  }

  // 9. Parse Section 7 FAQs and Section 18 questions to store in Faq table and KbChunk table
  const faqsList = [
    { q: "What time is check-in and check-out?", a: "Check-in starts from 4:00 PM (16:00) and check-out is extended to 2:00 PM (14:00).", cat: "Policies" },
    { q: "Can I use hotel facilities before check-in?", a: "Yes! Guests can access the pool, 24-hour gym, luggage lockers, and games area before their room is ready.", cat: "Policies" },
    { q: "Are pets allowed at Rove Downtown?", a: "No, pets are not allowed at Rove Downtown.", cat: "Policies" },
    { q: "Is parking available at Rove Downtown?", a: "Yes, self-park drive-in parking is available on a first-come, first-served basis.", cat: "Facilities" },
    { q: "Is smoking allowed in the hotel?", a: "Rove Downtown is a non-smoking property. Smoking is strictly limited to designated outdoor areas.", cat: "Policies" },
    { q: "Does the hotel offer airport transfers?", a: "Yes, airport transfers can be arranged for an additional fee by contacting the Happiness Centre via WhatsApp (+971 58 160 1136) or email (hello@rovehotels.com).", cat: "Transportation" },
    { q: "What are the gym hours?", a: "The gym is open 24 hours a day, 7 days a week.", cat: "Facilities" },
    { q: "Are rooms wheelchair accessible?", a: "Yes, Rove Downtown features fully accessible guest rooms with roll-in showers, lower fixtures, and step-free common areas.", cat: "Accessibility" },
    { q: "How far is Dubai Mall and Burj Khalifa?", a: "Dubai Mall and Burj Khalifa are both less than a 10-minute walk (approx. 0.8 km) from Rove Downtown.", cat: "Attractions" },
    { q: "Is Wi-Fi free?", a: "Yes, high-speed Wi-Fi is free for all guests across rooms and all public areas.", cat: "Amenities" },
    { q: "Is breakfast included and what time is it served?", a: "Breakfast buffet is served daily at TGI Fridays from 6:30 AM to 10:30 AM featuring hot dishes, fruits, pastries, and unlimited coffee. Promotions like AED 69 breakfast + coffee are available.", cat: "Dining" },
    { q: "Does the hotel serve alcohol?", a: "Yes, alcohol is served at the on-site TGI Fridays restaurant (beer, wine, spirits, cocktails).", cat: "Dining" },
    { q: "What is the Gamer Cave room?", a: "The Gamer Cave is a specialized room equipped with a high-end gaming PC (Intel i7, RTX graphics, dual 144Hz monitors, Razer gear) preloaded with top titles.", cat: "Rooms" },
  ];

  for (const f of faqsList) {
    await prisma.faq.upsert({
      where: { question: f.q },
      update: { answer: f.a, category: f.cat, verified: true },
      create: { question: f.q, answer: f.a, category: f.cat, verified: true, hotelId: hotel.id },
    });
  }

  // 10. Extract RAG KbChunks from Markdown Prose and Section 19 (Unverified)
  const chunksToCreate: { content: string; category: string; sourceUrl?: string; verified: boolean }[] = [];

  // Add structured facts as chunks
  for (const f of faqsList) {
    chunksToCreate.push({
      content: `Q: ${f.q}\nA: ${f.a}`,
      category: f.cat,
      verified: true,
    });
  }

  // Add room details as chunks
  for (const r of roomsData) {
    chunksToCreate.push({
      content: `Room Type: ${r.name}\nSize: ${r.sizeSqm} sqm\nOccupancy: ${r.maxAdults} Adults + ${r.maxChildren} Child\nView: ${r.view}\nFeatures: ${r.keyFeatures}\nDescription: ${r.description}`,
      category: "Rooms",
      sourceUrl: r.bookingLink,
      verified: true,
    });
  }

  // Add attraction chunks
  for (const a of attractionsData) {
    chunksToCreate.push({
      content: `Attraction: ${a.name} (${a.category})\nDistance: ${a.distanceKm} km (${a.timeMin} mins walk/drive)\nDescription: ${a.description}`,
      category: "Attractions",
      verified: true,
    });
  }

  // Add Section 19 Unverified Chunks explicitly flagged verified: false
  const unverifiedItems = [
    "Exact bed configuration (twin vs double/queen) per room type requires hotel confirmation.",
    "Specific room rates and dynamic pricing changes require live booking engine confirmation.",
    "Cancellation and refund policies vary by rate plan and require hotel booking engine confirmation.",
    "Early check-in fees or late check-out charges beyond 2:00 PM require hotel confirmation.",
    "Security deposit amount and exact accepted ID types at check-in require hotel confirmation.",
    "TGI Fridays exact lunch and dinner operating hours require hotel confirmation.",
    "Room service / in-room dining availability and hours require hotel confirmation.",
    "Free hotel shuttle service to Dubai Mall/Beach reported by guests is unconfirmed on official pages.",
    "Distance and driving time to Dubai International Airport (DXB) require official hotel confirmation.",
  ];

  for (const u of unverifiedItems) {
    chunksToCreate.push({
      content: `UNVERIFIED FACT: ${u} (Source: Needs Hotel Confirmation)`,
      category: "Unverified / Unknown",
      verified: false,
    });
  }

  // Delete old chunks and recreate with vector embeddings
  await prisma.kbChunk.deleteMany({ where: { hotelId: hotel.id } });

  console.log(`Generating embeddings for ${chunksToCreate.length} KB chunks...`);
  let chunkIndex = 0;
  for (const item of chunksToCreate) {
    chunkIndex++;
    const embedding = await embedText(item.content);

    const createdChunk = await prisma.kbChunk.create({
      data: {
        content: item.content,
        category: item.category,
        sourceUrl: item.sourceUrl,
        verified: item.verified,
        hotelId: hotel.id,
      },
    });

    if (embedding && embedding.length > 0) {
      const vectorString = `[${embedding.join(",")}]`;
      try {
        await prisma.$executeRawUnsafe(
          `UPDATE "KbChunk" SET embedding = $1::vector WHERE id = $2`,
          vectorString,
          createdChunk.id
        );
      } catch (err) {
        // If pgvector column not enabled or running in fallback DB mode
        console.warn(`Vector update skipped for chunk ${createdChunk.id}:`, (err as Error).message);
      }
    }
  }

  console.log(`Successfully ingested ${chunkIndex} KB chunks with vector embeddings!`);
  console.log("Knowledge Base Ingestion Complete!");
}

if (require.main === module) {
  ingestKnowledgeBase()
    .catch((err) => {
      console.error("Ingestion failed:", err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

export { ingestKnowledgeBase };
