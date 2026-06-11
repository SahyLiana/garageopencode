import { NotificationType } from '../notification.entity';
export declare class CreateNotificationDto {
    type: NotificationType;
    message: string;
    userId: string;
    relatedEntityId?: string;
}
