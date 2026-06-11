import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);

  // Admin
  await prisma.user.upsert({
    where: { email: 'admin@garage.com' },
    update: {},
    create: {
      email: 'admin@garage.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
    },
  });

  // Mechanics
  const mechanicPass = await bcrypt.hash('mech123', 10);
  for (let i = 1; i <= 3; i++) {
    await prisma.user.upsert({
      where: { email: `mechanic${i}@garage.com` },
      update: {},
      create: {
        email: `mechanic${i}@garage.com`,
        password: mechanicPass,
        name: `Mechanic ${i}`,
        role: 'MECHANIC',
      },
    });
  }

  // Client
  const clientPass = await bcrypt.hash('client123', 10);
  await prisma.user.upsert({
    where: { email: 'client@garage.com' },
    update: {},
    create: {
      email: 'client@garage.com',
      password: clientPass,
      name: 'Test Client',
      role: 'CLIENT',
    },
  });

  // Inventory Items
  const items = [
    { name: 'Synthetic Oil (5W-30)', price: 45.0, quantity: 50, category: 'FLUIDS', description: 'Premium synthetic engine oil' },
    { name: 'Oil Filter', price: 15.0, quantity: 30, category: 'FILTERS', description: 'High-efficiency oil filter' },
    { name: 'Brake Pads (Set)', price: 85.0, quantity: 20, category: 'BRAKES', description: 'Ceramic brake pads' },
    { name: 'Air Filter', price: 25.0, quantity: 40, category: 'FILTERS', description: 'Standard air filter' },
    { name: 'Spark Plug', price: 8.5, quantity: 100, category: 'ELECTRICAL', description: 'Iridium spark plug' },
    { name: 'Wiper Blades', price: 35.0, quantity: 15, category: 'ACCESSORIES', description: 'All-weather wiper blades' },
    { name: 'Brake Fluid', price: 12.0, quantity: 10, category: 'FLUIDS', description: 'DOT 4 brake fluid' },
  ];

  for (const item of items) {
    await prisma.inventoryItem.create({ data: item });
  }

  console.log('Seed completed');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());