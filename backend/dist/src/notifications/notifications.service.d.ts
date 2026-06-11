import { PrismaService } from '../prisma/prisma.service';
export declare class NotificationsService {
    private prisma;
    constructor(prisma: PrismaService);
    createNotification(data: {
        type: string;
        message: string;
        userId: number;
        relatedEntityId?: string;
    }): Promise<{
        type: string;
        message: string;
        isRead: boolean;
        relatedEntityId: string | null;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        userId: number;
    }>;
    getNotificationsForUser(userId: number, isRead?: boolean, page?: number, limit?: number): Promise<{
        data: {
            type: string;
            message: string;
            isRead: boolean;
            relatedEntityId: string | null;
            createdAt: Date;
            updatedAt: Date;
            id: number;
            userId: number;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getUnreadCount(userId: number): Promise<number>;
    markAsRead(id: number, userId: number): Promise<{
        type: string;
        message: string;
        isRead: boolean;
        relatedEntityId: string | null;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        userId: number;
    }>;
    markAllAsReadForUser(userId: number): Promise<void>;
}
