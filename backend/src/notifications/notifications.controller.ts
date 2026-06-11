import { Controller, Get, Post, Put, Param, Req, UseGuards, Query } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';

@Controller('notifications')
@UseGuards(JwtGuard)
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  async getNotifications(
    @Req() req: Request,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const userId = (req.user as any).id;
    const p = page ? parseInt(page) : 1;
    const l = limit ? parseInt(limit) : 10;
    return this.notificationsService.getNotificationsForUser(userId, undefined, p, l);
  }

  @Get('unread-count')
  async getUnreadCount(@Req() req: Request) {
    const userId = (req.user as any).id;
    const count = await this.notificationsService.getUnreadCount(userId);
    return { count };
  }

  @Put(':id/read')
  async markAsRead(@Param('id') id: string, @Req() req: Request) {
    const userId = (req.user as any).id;
    return this.notificationsService.markAsRead(parseInt(id), userId);
  }

  @Post('mark-all-read')
  async markAllAsRead(@Req() req: Request) {
    const userId = (req.user as any).id;
    await this.notificationsService.markAllAsReadForUser(userId);
    return { success: true };
  }
}