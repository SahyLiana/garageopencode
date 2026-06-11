import { PrismaService } from "../prisma/prisma.service";
export declare class DashboardService {
    private prisma;
    constructor(prisma: PrismaService);
    getStats(): Promise<{
        newClientsCount: number;
        weeklyAppointmentsCount: number;
        uncompletedCount: number;
        weeklyRevenue: {
            day: string;
            amount: number;
        }[];
        weeklyStatusTrends: {
            day: string;
            asked: number;
            completed: number;
            pending: number;
            cancelled: number;
        }[];
    }>;
    getUnfinishedAppointments(page?: number, limit?: number): Promise<{
        data: ({
            client: {
                id: number;
                email: string;
                name: string;
            };
            mechanic: {
                id: number;
                name: string;
            } | null;
            vehicle: {
                id: number;
                make: string;
                model: string;
                licensePlate: string;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            category: string;
            description: string;
            clientId: number;
            mechanicId: number | null;
            vehicleId: number;
            dateTime: Date;
            imageUrl: string | null;
            status: string;
            totalAmount: number | null;
            paidAt: Date | null;
            paymentStatus: string;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
}
