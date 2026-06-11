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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let DashboardService = class DashboardService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getStats() {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(today.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0);
        const newClientsCount = await this.prisma.user.count({
            where: {
                role: "CLIENT",
                createdAt: { gte: startOfWeek },
            },
        });
        const uncompletedCount = await this.prisma.appointment.count({
            where: {
                status: { notIn: ["COMPLETED", "CANCELLED"] },
            },
        });
        const weeklyAppointments = await this.prisma.appointment.findMany({
            where: {
                OR: [
                    { createdAt: { gte: sevenDaysAgo } },
                    { paidAt: { gte: sevenDaysAgo } },
                ],
            },
            select: {
                createdAt: true,
                dateTime: true,
                paidAt: true,
                totalAmount: true,
                status: true,
                paymentStatus: true,
            },
        });
        const weeklyRevenue = [];
        const weeklyStatusTrends = [];
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        let totalAppointmentsAskedInWindow = 0;
        for (let i = 0; i < 7; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() - (6 - i));
            const dayStart = new Date(d);
            dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(d);
            dayEnd.setHours(23, 59, 59, 999);
            const startMs = dayStart.getTime();
            const endMs = dayEnd.getTime();
            const revenueAppts = weeklyAppointments.filter((a) => {
                if (!a.paidAt)
                    return false;
                const paidMs = new Date(a.paidAt).getTime();
                return paidMs >= startMs && paidMs <= endMs;
            });
            const amount = revenueAppts.reduce((sum, a) => sum + Number(a.totalAmount || 0), 0);
            weeklyRevenue.push({
                day: dayNames[d.getDay()],
                amount,
            });
            const statusAppts = weeklyAppointments.filter((a) => {
                const createdMs = new Date(a.createdAt).getTime();
                return createdMs >= startMs && createdMs <= endMs;
            });
            totalAppointmentsAskedInWindow += statusAppts.length;
            weeklyStatusTrends.push({
                day: dayNames[d.getDay()],
                asked: statusAppts.length,
                completed: statusAppts.filter((a) => a.status === "COMPLETED").length,
                pending: statusAppts.filter((a) => a.status !== "COMPLETED" && a.status !== "CANCELLED").length,
                cancelled: statusAppts.filter((a) => a.status === "CANCELLED").length,
            });
        }
        return {
            newClientsCount,
            weeklyAppointmentsCount: totalAppointmentsAskedInWindow,
            uncompletedCount,
            weeklyRevenue,
            weeklyStatusTrends,
        };
    }
    async getUnfinishedAppointments(page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [appointments, total] = await Promise.all([
            this.prisma.appointment.findMany({
                where: {
                    status: {
                        notIn: ["COMPLETED", "CANCELLED"],
                    },
                },
                include: {
                    client: { select: { id: true, name: true, email: true } },
                    vehicle: {
                        select: { id: true, make: true, model: true, licensePlate: true },
                    },
                    mechanic: { select: { id: true, name: true } },
                },
                orderBy: {
                    dateTime: "desc",
                },
                skip,
                take: limit,
            }),
            this.prisma.appointment.count({
                where: {
                    status: {
                        notIn: ["COMPLETED", "CANCELLED"],
                    },
                },
            }),
        ]);
        return {
            data: appointments,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map