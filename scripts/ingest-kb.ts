import fs from "fs";
import path from "path";
import { prisma } from "../lib/prisma";
import { embedText } from "../lib/llm/embeddings";

async function ingestKnowledgeBase() {
  console.log("Starting Knowledge Base Ingestion...");

  // 1. Ensure primary Hotel record exists
  const hotel = await prisma.hotel.upsert({
    where: { id: "rove_downtown_dubai" },
    update: {
      name: "Rove Downtown",
      brand: "Rove Hotels",
      address: "312 Al Mustaqbal Street, Zabeel 2, PO Box 119444, Downtown Dubai, UAE",
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
      address: "312 Al Mustaqbal Street, Zabeel 2, PO Box 119444, Downtown Dubai, UAE",
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
      keyFeatures: "AC, high-speed Wi-Fi, mini-fridge, power rain shower, 48\" Smart TV, sofa bed, universal 220V power & USB outlets",
      description: "Efficient, space-maximizing 26 sqm room with a playful nod to local Dubai design and city skyline views.",
      pricingNote: "Dynamic pricing. Visible via booking widget at reservations.rovehotels.com.",
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
      keyFeatures: "Same great amenities as Rover Room + direct, iconic Burj Khalifa view",
      description: "Rover Room product featuring direct, unobstructed views of the iconic Burj Khalifa from your window.",
      pricingNote: "Dynamic pricing. Visible via booking widget.",
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
      keyFeatures: "Gaming PC (Intel Core i7 CPU, NVIDIA RTX GPU, ASUS Z590P motherboard), dual 27\" 144Hz ViewSonic monitors, Razer keyboard, mouse, headset, mic, camera, late check-out 2:00 PM, pool & gym access",
      description: "Dedicated gaming suite loaded with high-performance PC hardware and preloaded popular esports titles (Valorant, GTA 5, Dota, CS:GO).",
      pricingNote: "Dynamic pricing. Visible via booking widget.",
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

  // 3. Ingest Restaurants & Dining
  const diningData = [
    {
      outletId: "tgif_downtown",
      name: "TGI Fridays (TGIF)",
      type: "On-site restaurant & bar",
      cuisine: "American (burgers, steaks, ribs, wings, salads, handcrafted cocktails, mocktails, beer, wine, spirits)",
      breakfastHours: "06:30–10:30 daily",
      alcoholServed: true,
      description: "Full-service on-site restaurant serving breakfast, all-day lunch, and dinner in a lively, energetic atmosphere. Features full bar and signature dishes.",
      menuLink: "https://menus.tgifridaysme.com/uae-rove-downtown",
      verified: true,
    },
    {
      outletId: "convenience_store",
      name: "Rove Convenience Store & Café",
      type: "In-lobby 24/7 store & café",
      cuisine: "Snacks, grab-and-go meals, freshly brewed Starbucks coffee",
      breakfastHours: "24/7",
      alcoholServed: false,
      description: "24-hour in-lobby convenience store stocking travel essentials, packaged snacks, cold beverages, and freshly brewed Starbucks coffee.",
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
    { facilityId: "outdoor_pool", name: "Outdoor Saltwater Swimming Pool", category: "Recreation", hours: "08:00–20:00 (extended to 22:00)", description: "Temperature-controlled outdoor saltwater pool with direct views of the Burj Khalifa and Downtown Dubai. Free for all hotel guests, sun loungers and towels provided. Accessible even before check-in!" },
    { facilityId: "gym_24hr", name: "24-Hour Fitness Centre", category: "Fitness", hours: "24/7", description: "Fully equipped 24/7 fitness center with cardio equipment, free weights, and strength machines. Complimentary for hotel guests." },
    { facilityId: "laundromat_24hr", name: "24-Hour Laundromat", category: "Services", hours: "24/7", description: "Self-service laundromat with modern washing machines, tumble dryers, and ironing stations for a small fee. Express laundry and dry cleaning available via front desk." },
    { facilityId: "wifi_highspeed", name: "High-Speed Wi-Fi", category: "Technology", hours: "24/7", description: "Complimentary ultra-high-speed Wi-Fi across all guest rooms, lobby, pool, and co-working areas." },
    { facilityId: "business_imacs", name: "Business iMac Stations", category: "Business", hours: "24/7", description: "Complimentary Apple iMac desktop stations in the co-working lounge for guest productivity." },
    { facilityId: "coworking_space", name: "Co-Working Hub", category: "Business", hours: "24/7", description: "Open co-working spaces with high-speed Wi-Fi, ergonomic seating, universal 220V power outlets, and USB ports." },
    { facilityId: "meeting_rooms_7", name: "Meeting & Event Spaces", category: "Events", hours: "On Request", description: "7 configurable meeting rooms with AV equipment, catering, and flexible seating for 12 to 120 guests." },
    { facilityId: "podcast_studio", name: "Podcast Studio", category: "Media", hours: "Bookable", description: "Dedicated soundproof podcast and media creation studio with complimentary coffee and tea." },
    { facilityId: "luggage_lockers", name: "Self-Service Luggage Lockers", category: "Services", hours: "24/7", description: "Complimentary self-service secure luggage storage lockers available before check-in and after check-out." },
    { facilityId: "public_games", name: "Public Games Area", category: "Recreation", hours: "24/7", description: "Foosball, table tennis, and arcade/video games in the lobby lounge for all guests." },
    { facilityId: "self_parking", name: "Self-Parking", category: "Transport", hours: "24/7", description: "Complimentary on-site drive-in self-parking on a first-come, first-served basis." },
    { facilityId: "airport_transfer", name: "Airport Transfer Service", category: "Transport", hours: "On Request", description: "Private airport transfers to/from Dubai International Airport (DXB) arranged via Happiness Centre (hello@rovehotels.com or WhatsApp)." },
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
    { name: "Burj Khalifa", distanceKm: 0.8, timeMin: 2, category: "Landmark", description: "World's tallest building (828m) with observation decks 'At The Top' and 'SKY'. Less than 10 minutes walk or 2 minutes drive." },
    { name: "Dubai Fountain", distanceKm: 0.9, timeMin: 3, category: "Landmark", description: "World's largest choreographed fountain show on Burj Lake, performing nightly." },
    { name: "The Dubai Mall", distanceKm: 0.8, timeMin: 2, category: "Shopping", description: "One of the world's premier shopping and leisure destinations with over 1,200 stores, aquarium, and ice rink." },
    { name: "City Walk", distanceKm: 2.1, timeMin: 4, category: "Lifestyle", description: "Vibrant outdoor lifestyle, retail, and dining district." },
    { name: "Souk Al Bahar", distanceKm: 3.4, timeMin: 12, category: "Shopping", description: "Traditional Arabian-style shopping and dining promenade overlooking the Burj Lake." },
    { name: "Downtown Boulevard", distanceKm: 2.4, timeMin: 10, category: "Recreation", description: "Scenic running and walking promenade through the heart of Downtown Dubai." },
    { name: "Museum of the Future", distanceKm: 3.4, timeMin: 9, category: "Landmark", description: "Iconic architectural and technological landmark showcasing innovation." },
    { name: "Ras Al Khor Wildlife Sanctuary", distanceKm: 11.3, timeMin: 13, category: "Nature", description: "Protected wetland reserve famous for thousands of pink flamingos and migratory birds." },
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
    { mode: "metro", name: "Financial Centre Station", distanceKm: 1.9, details: "Nearest Dubai Metro Red Line station connecting to DXB Airport and Dubai Marina." },
    { mode: "metro", name: "Burj Khalifa / Dubai Mall Station", distanceKm: 2.3, details: "Alternative metro access point with air-conditioned link to Dubai Mall." },
    { mode: "bus", name: "Dubai Mall Metro Station Bus Stop", distanceKm: 2.3, details: "Connects to the citywide Dubai bus network." },
    { mode: "transfer", name: "Hotel Airport Transfer", distanceKm: 0.0, details: "Private door-to-door transfer booked via Happiness Centre (hello@rovehotels.com or WhatsApp +971 58 160 1136)." },
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
    { key: "check_out_time", value: "14:00 (2:00 PM) laid-back checkout", category: "Check-out" },
    { key: "early_arrival", value: "All hotel facilities (saltwater pool, 24/7 gym, changing rooms, luggage lockers, co-working lounge, iMacs) are available to guests immediately upon arrival, even before room readiness", category: "Check-in" },
    { key: "pool_hours", value: "08:00 to 20:00 (extended to 22:00) daily; outdoor saltwater temperature-controlled pool with Burj Khalifa views", category: "Facilities" },
    { key: "gym_hours", value: "Open 24 hours a day, 7 days a week (24/7)", category: "Facilities" },
    { key: "dining_hours", value: "Breakfast buffet 06:30–10:30 AM daily at TGI Fridays. Lunch and dinner served all day through late evening. 24/7 lobby store & Starbucks coffee.", category: "Dining" },
    { key: "smoking_policy", value: "100% non-smoking indoor property; designated outdoor smoking areas available", category: "General" },
    { key: "pet_policy", value: "Pets are not allowed (service animals permitted)", category: "General" },
    { key: "child_policy", value: "Max 2 adults + 1 child (4–16 yrs) per room; pull-out sofa bed provided in Rover Rooms", category: "Family" },
    { key: "interconnecting_rooms", value: "~30% of rooms are interconnecting; can be requested at check-in for families", category: "Family" },
    { key: "eco_policy", value: "Green Key certified eco-friendly and sustainable hotel", category: "Sustainability" },
  ];

  for (const p of policiesData) {
    await prisma.policy.upsert({
      where: { key: p.key },
      update: { ...p, verified: true },
      create: { ...p, verified: true, hotelId: hotel.id },
    });
  }

  // 9. Comprehensive Multilingual & FAQ Entries
  const faqsList = [
    { q: "What time is check-in and check-out?", a: "Check-in is from 4:00 PM (16:00) and check-out is extended to 2:00 PM (14:00) standard for all guests.", cat: "Policies" },
    { q: "Can I use hotel facilities before check-in?", a: "Yes! You can freely enjoy our outdoor saltwater pool, 24/7 gym, changing rooms, free luggage lockers, and co-working lounge as soon as you arrive, even before your room is ready.", cat: "Policies" },
    { q: "What are the pool hours?", a: "The outdoor saltwater pool is open daily from 8:00 AM to 8:00 PM (and extended to 10:00 PM). It is temperature-controlled and offers direct views of the Burj Khalifa.", cat: "Facilities" },
    { q: "À que hora es el pool?", a: "La piscina al aire libre de Rove Downtown está abierta todos los días de 08:00 a 20:00 (extendido hasta las 22:00). Es una piscina de agua salada con temperatura controlada y vistas al Burj Khalifa.", cat: "Facilities" },
    { q: "At what time is dinner?", a: "Our on-site restaurant, TGI Fridays, serves lunch and dinner all day through the afternoon and evening, offering classic American burgers, steaks, ribs, and cocktails. Breakfast buffet is from 06:30 to 10:30 AM daily.", cat: "Dining" },
    { q: "A qué hora es la cena?", a: "En Rove Downtown Dubai, nuestro restaurante TGI Fridays ofrece servicio completo de almuerzo y cena durante toda la tarde y noche, con deliciosas hamburguesas, carnes y cócteles.", cat: "Dining" },
    { q: "What are the gym hours?", a: "The fitness center is open 24 hours a day, 7 days a week (24/7) with modern cardio, free weights, and strength equipment.", cat: "Facilities" },
    { q: "Are pets allowed at Rove Downtown?", a: "No, pets are not allowed at Rove Downtown (service animals are permitted).", cat: "Policies" },
    { q: "Is parking available at Rove Downtown?", a: "Yes, complimentary on-site self-parking is available for hotel guests on a first-come, first-served basis.", cat: "Facilities" },
    { q: "Is smoking allowed in the hotel?", a: "Rove Downtown is a 100% non-smoking indoor property. Smoking is strictly limited to designated outdoor areas.", cat: "Policies" },
    { q: "Does the hotel offer airport transfers?", a: "Yes, private airport transfers can be arranged for a fee through our Happiness Centre via WhatsApp (+971 58 160 1136) or email (hello@rovehotels.com).", cat: "Transportation" },
    { q: "Are rooms wheelchair accessible?", a: "Yes, Rove Downtown features fully accessible rooms with roll-in power rain showers, lowered fixtures, grab bars, and step-free access throughout the hotel.", cat: "Accessibility" },
    { q: "How far is Dubai Mall and Burj Khalifa?", a: "Dubai Mall and Burj Khalifa are both less than a 10-minute walk (approx. 0.8 km) or a 2-minute drive from Rove Downtown.", cat: "Attractions" },
    { q: "Is Wi-Fi free?", a: "Yes, complimentary high-speed Wi-Fi is available for all guests across rooms and all public areas.", cat: "Amenities" },
    { q: "Is breakfast included and what time is it served?", a: "Breakfast buffet is served daily at TGI Fridays from 6:30 AM to 10:30 AM featuring freshly cooked hot dishes, fruits, pastries, cereals, cheeses, and unlimited coffee/tea (special deal: AED 69).", cat: "Dining" },
    { q: "Does the hotel serve alcohol?", a: "Yes, alcohol is served at the on-site TGI Fridays restaurant and bar (beer, wine, spirits, and handcrafted cocktails).", cat: "Dining" },
    { q: "What is the Gamer Cave room?", a: "The Gamer Cave is a specialized 26 sqm gaming suite equipped with an Intel i7 CPU, NVIDIA RTX GPU, ASUS motherboard, dual 27\" 144Hz ViewSonic monitors, Razer gear, preloaded top titles (Valorant, GTA 5, CS:GO, Dota), guaranteed 2:00 PM late check-out, and pool/gym access.", cat: "Rooms" },
    { q: "Is there a luggage room?", a: "Yes, we provide free self-service secure luggage lockers available for all guests before check-in and after check-out.", cat: "Facilities" },
    { q: "Is there a laundromat on-site?", a: "Yes, we have a 24-hour self-service laundromat with washers, dryers, and irons (for a small fee), plus express dry cleaning on request.", cat: "Facilities" },
  ];

  for (const f of faqsList) {
    await prisma.faq.upsert({
      where: { question: f.q },
      update: { answer: f.a, category: f.cat, verified: true },
      create: { question: f.q, answer: f.a, category: f.cat, verified: true, hotelId: hotel.id },
    });
  }

  // 10. Extract RAG KbChunks from Markdown Prose
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
      content: `Room Type: ${r.name}\nSize: ${r.sizeSqm} sqm\nOccupancy: ${r.maxAdults} Adults + ${r.maxChildren} Child\nView: ${r.view}\nFeatures: ${r.keyFeatures}\nDescription: ${r.description}\nPricing: ${r.pricingNote}`,
      category: "Rooms",
      sourceUrl: r.bookingLink,
      verified: true,
    });
  }

  // Add facility chunks
  for (const fac of facilitiesData) {
    chunksToCreate.push({
      content: `Facility: ${fac.name}\nCategory: ${fac.category}\nHours: ${fac.hours}\nDescription: ${fac.description}`,
      category: "Facilities",
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

  // Delete old chunks and recreate with vector embeddings
  await prisma.kbChunk.deleteMany({ where: { hotelId: hotel.id } });

  console.log(`Generating embeddings for ${chunksToCreate.length} KB chunks...`);
  let chunkIndex = 0;
  for (const item of chunksToCreate) {
    chunkIndex++;
    const embedding = await embedText(item.content).catch(() => []);

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
