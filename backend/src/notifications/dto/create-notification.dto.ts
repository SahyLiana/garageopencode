import { NotificationType } from '../notification.entity';

export class CreateNotificationDto {
  type: NotificationType;
  message: string;
  userId: string;
  relatedEntityId?: string;
}
