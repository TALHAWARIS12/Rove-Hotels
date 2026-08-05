import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";

async function seedAdmin() {
  console.log("Seeding Admin accounts...");

  const accounts = [
    {
      email: process.env.ADMIN_EMAIL || "admin@admin.com",
      password: process.env.ADMIN_PASSWORD || "rovehotels1234@",
    },
    {
      email: "admin@rovehotels.com",
      password: "admin_rove_2026",
    },
  ];

  for (const acc of accounts) {
    const passwordHash = await bcrypt.hash(acc.password, 10);
    const admin = await prisma.admin.upsert({
      where: { email: acc.email },
      update: {
        passwordHash,
        role: "admin",
      },
      create: {
        email: acc.email,
        passwordHash,
        role: "admin",
      },
    });
    console.log(`Admin account seeded successfully: ${admin.email}`);
  }
}

if (require.main === module) {
  seedAdmin()
    .catch((err) => {
      console.error("Admin seeding failed:", err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

export { seedAdmin };
