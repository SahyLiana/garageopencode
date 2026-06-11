import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  findByAppointment(appointmentId: number) {
    return this.prisma.comment.findMany({
      where: { appointmentId },
      include: { author: { select: { id: true, name: true, role: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async create(dto: CreateCommentDto, authorId: number) {
    if (dto.appointmentId) {
      const appt = await this.prisma.appointment.findUnique({ where: { id: dto.appointmentId } });
      if (appt && ['CANCELLED', 'CANCEL_REQUESTED'].includes(appt.status)) {
        throw new ForbiddenException('Cannot send messages on a cancelled appointment');
      }
    }

    return this.prisma.comment.create({
      data: {
        content: dto.content,
        authorId,
        appointmentId: dto.appointmentId || null,
      },
      include: { author: { select: { id: true, name: true, role: true } } },
    });
  }

  async remove(id: number, user: any) {
    const comment = await this.prisma.comment.findUnique({ where: { id } });
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.authorId !== user.id && user.role !== 'ADMIN') {
      throw new ForbiddenException('Not authorized');
    }
    await this.prisma.comment.delete({ where: { id } });
    return { message: 'Comment deleted' };
  }
}