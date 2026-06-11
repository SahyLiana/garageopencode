import { NotificationsService } from './notifications.service';
import { Request } from 'express';
export declare class NotificationsController {
    private notificationsService;
    constructor(notificationsService: NotificationsService);
    getNotifications(req: Request, page?: string, limit?: string): Promise<{
        data: {
            id: number;
            type: string;
            message: string;
            isRead: boolean;
            userId: number;
            relatedEntityId: string | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getUnreadCount(req: Request): Promise<{
        count: number;
    }>;
    markAsRead(id: string, req: Request): Promise<{
        id: number;
        type: string;
        message: string;
        isRead: boolean;
        userId: number;
        relatedEntityId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    markAllAsRead(req: Request): Promise<{
        success: boolean;
    }>;
}
