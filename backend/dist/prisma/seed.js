"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    const hashedPassword = await bcrypt.hash('admin123', 10);
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
//# sourceMappingURL=seed.js.map