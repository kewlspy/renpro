const { PrismaClient } = require("../src/generated/prisma");

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.workOrder.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.lease.deleteMany({});
  await prisma.room.deleteMany({});
  await prisma.property.deleteMany({});
  await prisma.user.deleteMany({});

  const owner = await prisma.user.create({
    data: {
      id: "f3b2a0b6-9af4-4b53-9a9b-8d0a58497eb1",
      email: "owner@example.com",
      name: "John Owner",
      password: "hashedpassword123",
      phone: "09171234567",
      role: "OWNER",
    },
  });

  const tenant = await prisma.user.create({
    data: {
      id: "b7e0a4c4-82a8-4b1c-92c7-d5a278ed76fe",
      email: "tenant1@example.com",
      name: "Maria Tenant",
      password: "hashedpassword123",
      phone: "09991234567",
      role: "TENANT",
    },
  });

  const property = await prisma.property.create({
    data: {
      id: "c8fbe109-6c32-4dab-a625-94e58b25caf3",
      name: "Sunrise Apartment",
      address: "123 Sunrise Street, Manila",
      ownerId: owner.id,
    },
  });

  const room = await prisma.room.create({
    data: {
      id: "a7df6c44-1c0b-4b33-a51d-5430cd8c7841",
      name: "Unit 101",
      description: "1 Bedroom Unit",
      propertyId: property.id,
    },
  });

  const lease = await prisma.lease.create({
    data: {
      id: "8f2b41d1-1308-4e38-8569-6d938ed52c52",
      tenantId: tenant.id,
      roomId: room.id,
      startDate: new Date("2024-01-01"),
      endDate: new Date("2024-12-31"),
      rent: 15000.0,
      rentDueDate: 5,
    },
  });

  await prisma.payment.create({
    data: {
      id: "9c9c43d0-a16f-49fd-b123-80be1bb8a5fe",
      leaseId: lease.id,
      amount: 15000.0,
      paidAt: new Date("2024-02-05T08:30:00"),
    },
  });

  await prisma.workOrder.create({
    data: {
      id: "6f23a4c5-59ec-4b92-9c54-0fefdbc0facf",
      leaseId: lease.id,
      tenantId: tenant.id,
      title: "Aircon not cooling",
      description: "The AC is making noise and blowing warm air.",
      status: "PENDING",
      priority: "High",
    },
  });

  console.log("✅ Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
