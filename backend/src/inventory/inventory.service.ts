import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateInventoryItemDto, UpdateInventoryItemDto, AssignItemDto } from './dto';

@Injectable()
export class InventoryService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  findAll() {
    return this.prisma.inventoryItem.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: number) {
    const item = await this.prisma.inventoryItem.findUnique({
      where: { id },
    });
    if (!item) throw new NotFoundException('Item not found');
    return item;
  }

  create(dto: CreateInventoryItemDto) {
    return this.prisma.inventoryItem.create({ data: dto });
  }

  async update(id: number, dto: UpdateInventoryItemDto) {
    await this.findOne(id);
    return this.prisma.inventoryItem.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.inventoryItem.delete({ where: { id } });
  }

  async assignToAppointment(appointmentId: number, dto: AssignItemDto) {
    const appt = await this.prisma.appointment.findUnique({ where: { id: appointmentId } });
    if (!appt) throw new NotFoundException('Appointment not found');
    if (appt.status === 'COMPLETED' || appt.paymentStatus === 'PAID') {
      throw new BadRequestException('Cannot assign tools to a completed or paid appointment.');
    }

    const item = await this.findOne(dto.itemId);
    
    if (item.quantity < dto.quantity) {
      throw new BadRequestException(`Insufficient stock. Only ${item.quantity} available.`);
    }

    // 1. Reduce inventory quantity
    await this.prisma.inventoryItem.update({
      where: { id: dto.itemId },
      data: { quantity: item.quantity - dto.quantity },
    });

    // 2. Create UsedPart record as APPROVED
    return this.prisma.usedPart.create({
      data: {
        appointmentId,
        itemId: dto.itemId,
        quantity: dto.quantity,
        status: 'APPROVED',
      },
      include: { item: true },
    });
  }

  async requestItem(appointmentId: number, dto: AssignItemDto) {
    const appt = await this.prisma.appointment.findUnique({ 
      where: { id: appointmentId },
      include: { mechanic: true, vehicle: true },
    });
    if (!appt) throw new NotFoundException('Appointment not found');
    if (appt.status === 'COMPLETED' || appt.paymentStatus === 'PAID') {
      throw new BadRequestException('Cannot request tools for a completed or paid appointment.');
    }

    const usedPart = await this.prisma.usedPart.create({
      data: {
        appointmentId,
        itemId: dto.itemId,
        quantity: dto.quantity,
        status: 'REQUESTED',
      },
      include: { item: true },
    });

    // Notify admin users
    const adminUsers = await this.prisma.user.findMany({ where: { role: 'ADMIN' } });
    for (const admin of adminUsers) {
      await this.notificationsService.createNotification({
        type: 'PART_REQUESTED',
        message: `Mechanic ${appt.mechanic?.name || 'Unknown'} requested ${dto.quantity} ${usedPart.item.name} for appointment ${appointmentId}`,
        userId: admin.id,
        relatedEntityId: usedPart.id.toString(),
      });
    }

    return usedPart;
  }

  async approveRequest(usedPartId: number) {
    const request = await this.prisma.usedPart.findUnique({ 
      where: { id: usedPartId },
      include: { 
        item: true, 
        appointment: { 
          include: { client: true, mechanic: true, vehicle: true } 
        } 
      } 
    });
    if (!request) throw new NotFoundException('Request not found');
    if (request.status !== 'REQUESTED') throw new BadRequestException('Request is already processed');

    const item = await this.findOne(request.itemId);
    if (item.quantity < request.quantity) {
      throw new BadRequestException(`Insufficient stock. Only ${item.quantity} available.`);
    }

    // Deduct inventory
    await this.prisma.inventoryItem.update({
      where: { id: request.itemId },
      data: { quantity: item.quantity - request.quantity },
    });

    // Update used part status
    const updatedPart = await this.prisma.usedPart.update({
      where: { id: usedPartId },
      data: { status: 'APPROVED' },
      include: { item: true },
    });

    // Notify mechanic
    if (request.appointment.mechanicId) {
      await this.notificationsService.createNotification({
        type: 'PART_APPROVED',
        message: `Your part request for ${request.item.name} has been approved`,
        userId: request.appointment.mechanicId,
        relatedEntityId: usedPartId.toString(),
      });
    }

    // Notify client
    await this.notificationsService.createNotification({
      type: 'PART_APPROVED',
      message: `Parts for your appointment (${request.appointment.vehicle.make} ${request.appointment.vehicle.model}) have been approved`,
      userId: request.appointment.clientId,
      relatedEntityId: usedPartId.toString(),
    });

    // Auto-update appointment status to IN_PROGRESS if not already completed/cancelled
    if (request.appointment && !['COMPLETED', 'CANCELLED', 'IN_PROGRESS'].includes(request.appointment.status)) {
      await this.prisma.appointment.update({
        where: { id: request.appointmentId },
        data: { status: 'IN_PROGRESS' },
      });
    }

    return updatedPart;
  }

  async rejectRequest(usedPartId: number) {
    const request = await this.prisma.usedPart.findUnique({ where: { id: usedPartId } });
    if (!request) throw new NotFoundException('Request not found');
    if (request.status !== 'REQUESTED') throw new BadRequestException('Request is already processed');

    return this.prisma.usedPart.update({
      where: { id: usedPartId },
      data: { status: 'REJECTED' },
      include: { item: true },
    });
  }

  async getAssignmentsForAppointment(appointmentId: number) {
    return this.prisma.usedPart.findMany({
      where: { appointmentId },
      include: { item: true },
    });
  }
}
