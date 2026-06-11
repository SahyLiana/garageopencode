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
exports.InventoryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
let InventoryService = class InventoryService {
    constructor(prisma, notificationsService) {
        this.prisma = prisma;
        this.notificationsService = notificationsService;
    }
    findAll() {
        return this.prisma.inventoryItem.findMany({
            orderBy: { name: 'asc' },
        });
    }
    async findOne(id) {
        const item = await this.prisma.inventoryItem.findUnique({
            where: { id },
        });
        if (!item)
            throw new common_1.NotFoundException('Item not found');
        return item;
    }
    create(dto) {
        return this.prisma.inventoryItem.create({ data: dto });
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.prisma.inventoryItem.update({
            where: { id },
            data: dto,
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.inventoryItem.delete({ where: { id } });
    }
    async assignToAppointment(appointmentId, dto) {
        const appt = await this.prisma.appointment.findUnique({ where: { id: appointmentId } });
        if (!appt)
            throw new common_1.NotFoundException('Appointment not found');
        if (appt.status === 'COMPLETED' || appt.paymentStatus === 'PAID') {
            throw new common_1.BadRequestException('Cannot assign tools to a completed or paid appointment.');
        }
        const item = await this.findOne(dto.itemId);
        if (item.quantity < dto.quantity) {
            throw new common_1.BadRequestException(`Insufficient stock. Only ${item.quantity} available.`);
        }
        await this.prisma.inventoryItem.update({
            where: { id: dto.itemId },
            data: { quantity: item.quantity - dto.quantity },
        });
        return this.prisma.usedPart.create({
            data: {
                appointmentId,
                itemId: dto.itemId,
                quantity: dto.quantity,
                status: 'APPROVED',
            },
            include: { item: true },
        });
    }
    async requestItem(appointmentId, dto) {
        const appt = await this.prisma.appointment.findUnique({
            where: { id: appointmentId },
            include: { mechanic: true, vehicle: true },
        });
        if (!appt)
            throw new common_1.NotFoundException('Appointment not found');
        if (appt.status === 'COMPLETED' || appt.paymentStatus === 'PAID') {
            throw new common_1.BadRequestException('Cannot request tools for a completed or paid appointment.');
        }
        const usedPart = await this.prisma.usedPart.create({
            data: {
                appointmentId,
                itemId: dto.itemId,
                quantity: dto.quantity,
                status: 'REQUESTED',
            },
            include: { item: true },
        });
        const adminUsers = await this.prisma.user.findMany({ where: { role: 'ADMIN' } });
        for (const admin of adminUsers) {
            await this.notificationsService.createNotification({
                type: 'PART_REQUESTED',
                message: `Mechanic ${appt.mechanic?.name || 'Unknown'} requested ${dto.quantity} ${usedPart.item.name} for appointment ${appointmentId}`,
                userId: admin.id,
                relatedEntityId: usedPart.id.toString(),
            });
        }
        return usedPart;
    }
    async approveRequest(usedPartId) {
        const request = await this.prisma.usedPart.findUnique({
            where: { id: usedPartId },
            include: {
                item: true,
                appointment: {
                    include: { client: true, mechanic: true, vehicle: true }
                }
            }
        });
        if (!request)
            throw new common_1.NotFoundException('Request not found');
        if (request.status !== 'REQUESTED')
            throw new common_1.BadRequestException('Request is already processed');
        const item = await this.findOne(request.itemId);
        if (item.quantity < request.quantity) {
            throw new common_1.BadRequestException(`Insufficient stock. Only ${item.quantity} available.`);
        }
        await this.prisma.inventoryItem.update({
            where: { id: request.itemId },
            data: { quantity: item.quantity - request.quantity },
        });
        const updatedPart = await this.prisma.usedPart.update({
            where: { id: usedPartId },
            data: { status: 'APPROVED' },
            include: { item: true },
        });
        if (request.appointment.mechanicId) {
            await this.notificationsService.createNotification({
                type: 'PART_APPROVED',
                message: `Your part request for ${request.item.name} has been approved`,
                userId: request.appointment.mechanicId,
                relatedEntityId: usedPartId.toString(),
            });
        }
        await this.notificationsService.createNotification({
            type: 'PART_APPROVED',
            message: `Parts for your appointment (${request.appointment.vehicle.make} ${request.appointment.vehicle.model}) have been approved`,
            userId: request.appointment.clientId,
            relatedEntityId: usedPartId.toString(),
        });
        if (request.appointment && !['COMPLETED', 'CANCELLED', 'IN_PROGRESS'].includes(request.appointment.status)) {
            await this.prisma.appointment.update({
                where: { id: request.appointmentId },
                data: { status: 'IN_PROGRESS' },
            });
        }
        return updatedPart;
    }
    async rejectRequest(usedPartId) {
        const request = await this.prisma.usedPart.findUnique({ where: { id: usedPartId } });
        if (!request)
            throw new common_1.NotFoundException('Request not found');
        if (request.status !== 'REQUESTED')
            throw new common_1.BadRequestException('Request is already processed');
        return this.prisma.usedPart.update({
            where: { id: usedPartId },
            data: { status: 'REJECTED' },
            include: { item: true },
        });
    }
    async getAssignmentsForAppointment(appointmentId) {
        return this.prisma.usedPart.findMany({
            where: { appointmentId },
            include: { item: true },
        });
    }
};
exports.InventoryService = InventoryService;
exports.InventoryService = InventoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService])
], InventoryService);
//# sourceMappingURL=inventory.service.js.map