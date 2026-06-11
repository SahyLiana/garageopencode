"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const appointments = await prisma.appointment.findMany({
        where: { imageUrl: { not: null } },
        select: { id: true, imageUrl: true }
    });
    console.log(JSON.stringify(appointments, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
//# sourceMappingURL=check-images.js.map