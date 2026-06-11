import {
  Controller, Get, Post, Body, Param, Delete, UseGuards, Query,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto';
import { JwtGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtGuard)
@Controller('comments')
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  @Get()
  findAll(@Query('appointmentId') appointmentId?: string) {
    if (appointmentId) return this.commentsService.findByAppointment(+appointmentId);
    return [];
  }

  @Post()
  create(@Body() dto: CreateCommentDto, @CurrentUser() user: any) {
    return this.commentsService.create(dto, user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.commentsService.remove(+id, user);
  }
}