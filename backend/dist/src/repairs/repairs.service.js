"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepairsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let RepairsService = class RepairsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll() {
        return this.prisma.repair.findMany({
            include: {
                vehicle: true,
                mechanic: { select: { id: true, name: true, email: true } },
            },
        });
    }
    findByMechanic(mechanicId) {
        return this.prisma.repair.findMany({
            where: { mechanicId },
            include: { vehicle: true, mechanic: { select: { id: true, name: true, email: true } } },
        });
    }
    async findByClient(userId) {
        const vehicles = await this.prisma.vehicle.findMany({ where: { clientId: userId }, select: { id: true } });
        const vehicleIds = vehicles.map((v) => v.id);
        return this.prisma.repair.findMany({
            where: { vehicleId: { in: vehicleIds } },
            include: { vehicle: true, mechanic: { select: { id: true, name: true, email: true } } },
        });
    }
    async findOne(id) {
        const repair = await this.prisma.repair.findUnique({
            where: { id },
            include: {
                vehicle: true,
                mechanic: { select: { id: true, name: true, email: true } },
                history: { orderBy: { changedAt: 'desc' } },
            },
        });
        if (!repair)
            throw new common_1.NotFoundException('Repair not found');
        return repair;
    }
    async create(dto) {
        const repair = await this.prisma.repair.create({
            data: {
                vehicleId: dto.vehicleId,
                mechanicId: dto.mechanicId,
                description: dto.description,
                cost: dto.cost,
                status: 'PENDING',
            },
        });
        await this.prisma.repairHistory.create({
            data: { repairId: repair.id, fromStatus: null, toStatus: 'PENDING' },
        });
        return repair;
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.prisma.repair.update({ where: { id }, data: dto });
    }
    async updateStatus(id, status, user) {
        const repair = await this.findOne(id);
        if (user.role === 'MECHANIC' && repair.mechanicId !== user.id) {
            throw new common_1.ForbiddenException('You can only update your own repairs');
        }
        if (user.role === 'CLIENT') {
            throw new common_1.ForbiddenException('Clients cannot update repair status directly');
        }
        const fromStatus = repair.status;
        const updated = await this.prisma.repair.update({
            where: { id },
            data: { status },
        });
        await this.prisma.repairHistory.create({
            data: { repairId: id, fromStatus, toStatus: status },
        });
        return updated;
    }
    getHistory(id) {
        return this.prisma.repairHistory.findMany({
            where: { repairId: id },
            orderBy: { changedAt: 'desc' },
        });
    }
    async remove(id, user) {
        throw new common_1.ForbiddenException('Repairs cannot be deleted for historical tracking. Use status instead.');
    }
};
exports.RepairsService = RepairsService;
exports.RepairsService = RepairsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RepairsService);
//# sourceMappingURL=repairs.service.js.map