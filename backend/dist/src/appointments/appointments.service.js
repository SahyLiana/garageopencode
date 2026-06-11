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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
const users_service_1 = require("../users/users.service");
const fs = __importStar(require("fs"));
const path_1 = require("path");
let AppointmentsService = class AppointmentsService {
    constructor(prisma, notificationsService, usersService) {
        this.prisma = prisma;
        this.notificationsService = notificationsService;
        this.usersService = usersService;
    }
    findAll() {
        return this.prisma.appointment.findMany({
            include: {
                client: { select: { id: true, name: true, email: true } },
                mechanic: { select: { id: true, name: true, email: true } },
                vehicle: true,
                usedParts: { include: { item: true } },
            },
        });
    }
    findByMechanic(mechanicId) {
        return this.prisma.appointment.findMany({
            where: { mechanicId },
            include: {
                client: { select: { id: true, name: true, email: true } },
                vehicle: true,
                usedParts: { include: { item: true } },
            },
        });
    }
    findByClient(clientId) {
        return this.prisma.appointment.findMany({
            where: { clientId },
            include: {
                mechanic: { select: { id: true, name: true, email: true } },
                vehicle: true,
                usedParts: { include: { item: true } },
            },
        });
    }
    async findOne(id) {
        const appointment = await this.prisma.appointment.findUnique({
            where: { id },
            include: {
                client: { select: { id: true, name: true, email: true } },
                mechanic: { select: { id: true, name: true, email: true } },
                vehicle: true,
                usedParts: { include: { item: true } },
                comments: {
                    include: {
                        author: { select: { id: true, name: true, email: true } },
                    },
                    orderBy: { createdAt: "desc" },
                },
            },
        });
        if (!appointment)
            throw new common_1.NotFoundException("Appointment not found");
        return appointment;
    }
    async create(dto, user) {
        const clientId = user.role === "CLIENT" ? user.id : dto.clientId || user.id;
        const appointmentDate = new Date(dto.dateTime);
        if (appointmentDate < new Date()) {
            throw new common_1.ForbiddenException("Cannot book an appointment in the past");
        }
        const client = await this.prisma.user.findUnique({ where: { id: clientId } });
        const vehicle = await this.prisma.vehicle.findUnique({ where: { id: dto.vehicleId } });
        if (!client || !vehicle) {
            throw new common_1.NotFoundException("Client or vehicle not found");
        }
        const appointment = await this.prisma.appointment.create({
            data: {
                clientId,
                mechanicId: dto.mechanicId || null,
                vehicleId: dto.vehicleId,
                dateTime: appointmentDate,
                category: dto.category,
                description: dto.description,
                imageUrl: dto.imageUrl,
                status: "SCHEDULED",
            },
        });
        const adminUsers = await this.prisma.user.findMany({ where: { role: "ADMIN" } });
        for (const admin of adminUsers) {
            await this.notificationsService.createNotification({
                type: "APPOINTMENT_CREATED",
                message: `New appointment created by ${client.name} for ${vehicle.make} ${vehicle.model}`,
                userId: admin.id,
                relatedEntityId: appointment.id.toString(),
            });
        }
        return appointment;
    }
    async update(id, dto) {
        const appointment = await this.findOne(id);
        const data = { ...dto };
        const mechanicAssigned = dto.mechanicId && dto.mechanicId !== appointment.mechanicId;
        if (mechanicAssigned && appointment.status === 'SCHEDULED') {
            data.status = 'CONFIRMED';
        }
        const updatedAppointment = await this.prisma.appointment.update({
            where: { id },
            data: {
                ...data,
                dateTime: dto.dateTime ? new Date(dto.dateTime) : undefined,
            },
            include: {
                client: true,
                mechanic: true,
                vehicle: true,
            },
        });
        if (mechanicAssigned && updatedAppointment.mechanic) {
            await this.notificationsService.createNotification({
                type: 'MECHANIC_ASSIGNED',
                message: `Mechanic ${updatedAppointment.mechanic.name} has been assigned to your appointment`,
                userId: appointment.clientId,
                relatedEntityId: id.toString(),
            });
            await this.notificationsService.createNotification({
                type: 'MECHANIC_ASSIGNED',
                message: `You have been assigned to appointment for ${updatedAppointment.vehicle.make} ${updatedAppointment.vehicle.model}`,
                userId: updatedAppointment.mechanic.id,
                relatedEntityId: id.toString(),
            });
        }
        return updatedAppointment;
    }
    async updateStatus(id, status, user) {
        const appointment = await this.findOne(id);
        if (user.role === "MECHANIC" && appointment.mechanicId !== user.id) {
            throw new common_1.ForbiddenException("You can only update your own appointments");
        }
        if (user.role === "CLIENT" && status !== "CANCEL_REQUESTED") {
            throw new common_1.ForbiddenException("Clients can only request cancellation");
        }
        if (user.role === "MECHANIC" &&
            !["IN_PROGRESS", "COMPLETED", "CANCEL_REQUESTED"].includes(status)) {
            throw new common_1.ForbiddenException("Mechanics can only set IN_PROGRESS, COMPLETED, or request cancellation");
        }
        if (status === "CANCELLED" &&
            (appointment.status === "COMPLETED" || appointment.paymentStatus === "PAID")) {
            throw new common_1.ForbiddenException("Cannot cancel a completed or paid appointment");
        }
        if (["CANCELLED", "CANCEL_REQUESTED"].includes(appointment.status) &&
            user.role !== "ADMIN") {
            throw new common_1.ForbiddenException("Cannot update status of a cancelled appointment");
        }
        if (status === "COMPLETED") {
            const parts = await this.prisma.usedPart.findMany({
                where: { appointmentId: id, status: "APPROVED" },
                include: { item: true },
            });
            const total = parts.reduce((acc, p) => acc + p.quantity * p.item.price, 0);
            const updated = await this.prisma.appointment.update({
                where: { id },
                data: { status, totalAmount: total },
                include: { client: true, mechanic: true, vehicle: true },
            });
            await this.notificationsService.createNotification({
                type: 'STATUS_UPDATED',
                message: `Appointment #${id} completed. Total: $${total.toFixed(2)}`,
                userId: updated.clientId,
                relatedEntityId: id.toString(),
            });
            if (updated.mechanicId) {
                await this.notificationsService.createNotification({
                    type: 'STATUS_UPDATED',
                    message: `Appointment #${id} for ${updated.vehicle.make} ${updated.vehicle.model} completed`,
                    userId: updated.mechanicId,
                    relatedEntityId: id.toString(),
                });
            }
            return updated;
        }
        if (status === "CANCELLED") {
            const approvedParts = await this.prisma.usedPart.findMany({
                where: { appointmentId: id, status: "APPROVED" },
            });
            for (const part of approvedParts) {
                await this.prisma.inventoryItem.update({
                    where: { id: part.itemId },
                    data: { quantity: { increment: part.quantity } },
                });
            }
            await this.prisma.usedPart.deleteMany({
                where: { appointmentId: id },
            });
        }
        const updated = await this.prisma.appointment.update({
            where: { id },
            data: { status },
            include: { client: true, mechanic: true, vehicle: true },
        });
        await this.notificationsService.createNotification({
            type: 'STATUS_UPDATED',
            message: `Appointment #${id} status changed to ${status}`,
            userId: updated.clientId,
            relatedEntityId: id.toString(),
        });
        if (updated.mechanicId && updated.mechanicId !== updated.clientId) {
            await this.notificationsService.createNotification({
                type: 'STATUS_UPDATED',
                message: `Appointment #${id} for ${updated.vehicle.make} ${updated.vehicle.model} status changed to ${status}`,
                userId: updated.mechanicId,
                relatedEntityId: id.toString(),
            });
        }
        const adminUsers = await this.prisma.user.findMany({ where: { role: "ADMIN" } });
        for (const admin of adminUsers) {
            if (admin.id !== updated.clientId && admin.id !== updated.mechanicId) {
                await this.notificationsService.createNotification({
                    type: 'STATUS_UPDATED',
                    message: `Appointment #${id} (${updated.vehicle.make} ${updated.vehicle.model}) status changed to ${status}`,
                    userId: admin.id,
                    relatedEntityId: id.toString(),
                });
            }
        }
        return updated;
    }
    async confirmPayment(id, user) {
        const appointment = await this.findOne(id);
        if (user.role !== "CLIENT" || appointment.clientId !== user.id) {
            throw new common_1.ForbiddenException("Unauthorized payment attempt");
        }
        if (appointment.status === "CANCELLED") {
            throw new common_1.BadRequestException("Cannot process payment for a cancelled appointment");
        }
        if (appointment.paymentStatus === "PAID") {
            throw new common_1.BadRequestException("Service already paid");
        }
        return this.prisma.appointment.update({
            where: { id },
            data: {
                paymentStatus: "PAID",
                paidAt: new Date(),
            },
        });
    }
    async updateImage(id, imageUrl) {
        const appointment = await this.findOne(id);
        if (["CANCELLED", "CANCEL_REQUESTED"].includes(appointment.status)) {
            throw new common_1.ForbiddenException("Cannot update image of a cancelled appointment");
        }
        if (appointment.imageUrl) {
            const oldPath = (0, path_1.join)(process.cwd(), "uploads", appointment.imageUrl);
            try {
                if (fs.existsSync(oldPath))
                    fs.unlinkSync(oldPath);
            }
            catch (err) { }
        }
        return this.prisma.appointment.update({
            where: { id },
            data: { imageUrl },
        });
    }
    async remove(id, user) {
        throw new common_1.ForbiddenException("Deletions are disabled. Please use the cancellation status instead.");
    }
};
exports.AppointmentsService = AppointmentsService;
exports.AppointmentsService = AppointmentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService,
        users_service_1.UsersService])
], AppointmentsService);
//# sourceMappingURL=appointments.service.js.map