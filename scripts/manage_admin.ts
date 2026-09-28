import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.adminUser.findMany({
    select: { id: true, email: true, createdAt: true },
  });

  console.log("Found admin users in database:", users);

  if (users.length === 0) {
    console.log("No admin users found! Creating default admin user (admin@portfolio.dev / admin123!)...");
    const hashedPassword = await bcrypt.hash("admin123!", 12);
    const created = await prisma.adminUser.create({
      data: {
        email: "admin@portfolio.dev",
        passwordHash: hashedPassword,
      },
    });
    console.log("Created admin user:", created.email);
  }
}

main()
  .catch((e) => {
    console.error("Error managing admin users:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
