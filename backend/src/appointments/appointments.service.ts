import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { NotificationsService } from "../notifications/notifications.service";
import { UsersService } from "../users/users.service";
import { CreateAppointmentDto, UpdateAppointmentDto } from "./dto";
import * as fs from "fs";
import { join } from "path";

@Injectable()
export class AppointmentsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private usersService: UsersService,
  ) {}

  findAll() {
    return this.prisma.appointment.findMany({
      include: {
        client: { select: { id: true, name: true, email: true } },
        mechanic: { select: { id: true, name: true, email: true } },
        vehicle: true,
        usedParts: { include: { item: true } },
      },
    });
  }

  findByMechanic(mechanicId: number) {
    return this.prisma.appointment.findMany({
      where: { mechanicId },
      include: {
        client: { select: { id: true, name: true, email: true } },
        vehicle: true,
        usedParts: { include: { item: true } },
      },
    });
  }

  findByClient(clientId: number) {
    return this.prisma.appointment.findMany({
      where: { clientId },
      include: {
        mechanic: { select: { id: true, name: true, email: true } },
        vehicle: true,
        usedParts: { include: { item: true } },
      },
    });
  }

  async findOne(id: number) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        client: { select: { id: true, name: true, email: true } },
        mechanic: { select: { id: true, name: true, email: true } },
        vehicle: true,
        usedParts: { include: { item: true } },
        comments: {
          include: {
            author: { select: { id: true, name: true, email: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });
    if (!appointment) throw new NotFoundException("Appointment not found");
    return appointment;
  }

  async create(dto: CreateAppointmentDto, user: any) {
    const clientId = user.role === "CLIENT" ? user.id : dto.clientId || user.id;
    const appointmentDate = new Date(dto.dateTime);
    if (appointmentDate < new Date()) {
      throw new ForbiddenException("Cannot book an appointment in the past");
    }

    // Fetch client and vehicle details
    const client = await this.prisma.user.findUnique({ where: { id: clientId } });
    const vehicle = await this.prisma.vehicle.findUnique({ where: { id: dto.vehicleId } });
    
    if (!client || !vehicle) {
      throw new NotFoundException("Client or vehicle not found");
    }

    const appointment = await this.prisma.appointment.create({
      data: {
        clientId,
        mechanicId: dto.mechanicId || null,
        vehicleId: dto.vehicleId,
        dateTime: appointmentDate,
        category: dto.category,
        description: dto.description,
        imageUrl: dto.imageUrl,
        status: "SCHEDULED",
      },
    });

    // Create notification for admin users
    const adminUsers = await this.prisma.user.findMany({ where: { role: "ADMIN" } });
    for (const admin of adminUsers) {
      await this.notificationsService.createNotification({
        type: "APPOINTMENT_CREATED",
        message: `New appointment created by ${client.name} for ${vehicle.make} ${vehicle.model}`,
        userId: admin.id,
        relatedEntityId: appointment.id.toString(),
      });
    }

    return appointment;
  }

  async update(id: number, dto: UpdateAppointmentDto) {
    const appointment = await this.findOne(id);
    
    // Auto-set status to CONFIRMED when mechanic is assigned
    const data: any = { ...dto };
    const mechanicAssigned = dto.mechanicId && dto.mechanicId !== appointment.mechanicId;
    
    if (mechanicAssigned && appointment.status === 'SCHEDULED') {
      data.status = 'CONFIRMED';
    }
    
    const updatedAppointment = await this.prisma.appointment.update({
      where: { id },
      data: {
        ...data,
        dateTime: dto.dateTime ? new Date(dto.dateTime) : undefined,
      },
      include: {
        client: true,
        mechanic: true,
        vehicle: true,
      },
    });

    // Send notifications if mechanic was assigned
    if (mechanicAssigned && updatedAppointment.mechanic) {
      // Notify client
      await this.notificationsService.createNotification({
        type: 'MECHANIC_ASSIGNED',
        message: `Mechanic ${updatedAppointment.mechanic.name} has been assigned to your appointment`,
        userId: appointment.clientId,
        relatedEntityId: id.toString(),
      });

      // Notify mechanic
      await this.notificationsService.createNotification({
        type: 'MECHANIC_ASSIGNED',
        message: `You have been assigned to appointment for ${updatedAppointment.vehicle.make} ${updatedAppointment.vehicle.model}`,
        userId: updatedAppointment.mechanic!.id,
        relatedEntityId: id.toString(),
      });
    }

    return updatedAppointment;
  }

  async updateStatus(id: number, status: string, user: any) {
    const appointment = await this.findOne(id);

    if (user.role === "MECHANIC" && appointment.mechanicId !== user.id) {
      throw new ForbiddenException("You can only update your own appointments");
    }

    if (user.role === "CLIENT" && status !== "CANCEL_REQUESTED") {
      throw new ForbiddenException("Clients can only request cancellation");
    }

    if (
      user.role === "MECHANIC" &&
      !["IN_PROGRESS", "COMPLETED", "CANCEL_REQUESTED"].includes(status)
    ) {
      throw new ForbiddenException(
        "Mechanics can only set IN_PROGRESS, COMPLETED, or request cancellation",
      );
    }

    // Prevent cancellation of completed or paid appointments
    if (
      status === "CANCELLED" &&
      (appointment.status === "COMPLETED" || appointment.paymentStatus === "PAID")
    ) {
      throw new ForbiddenException(
        "Cannot cancel a completed or paid appointment",
      );
    }

    if (
      ["CANCELLED", "CANCEL_REQUESTED"].includes(appointment.status) &&
      user.role !== "ADMIN"
    ) {
      throw new ForbiddenException(
        "Cannot update status of a cancelled appointment",
      );
    }

    // Auto-calculate total on completion
    if (status === "COMPLETED") {
      const parts = await this.prisma.usedPart.findMany({
        where: { appointmentId: id, status: "APPROVED" },
        include: { item: true },
      });
      const total = parts.reduce(
        (acc, p) => acc + p.quantity * p.item.price,
        0,
      );
      const updated = await this.prisma.appointment.update({
        where: { id },
        data: { status, totalAmount: total },
        include: { client: true, mechanic: true, vehicle: true },
      });
      await this.notificationsService.createNotification({
        type: 'STATUS_UPDATED',
        message: `Appointment #${id} completed. Total: $${total.toFixed(2)}`,
        userId: updated.clientId,
        relatedEntityId: id.toString(),
      });
      if (updated.mechanicId) {
        await this.notificationsService.createNotification({
          type: 'STATUS_UPDATED',
          message: `Appointment #${id} for ${updated.vehicle.make} ${updated.vehicle.model} completed`,
          userId: updated.mechanicId,
          relatedEntityId: id.toString(),
        });
      }
      return updated;
    }

    if (status === "CANCELLED") {
      const approvedParts = await this.prisma.usedPart.findMany({
        where: { appointmentId: id, status: "APPROVED" },
      });
      // Restore inventory
      for (const part of approvedParts) {
        await this.prisma.inventoryItem.update({
          where: { id: part.itemId },
          data: { quantity: { increment: part.quantity } },
        });
      }
      // Delete all used parts tracking for this cancelled appointment
      await this.prisma.usedPart.deleteMany({
        where: { appointmentId: id },
      });
    }

    const updated = await this.prisma.appointment.update({
      where: { id },
      data: { status },
      include: { client: true, mechanic: true, vehicle: true },
    });

    await this.notificationsService.createNotification({
      type: 'STATUS_UPDATED',
      message: `Appointment #${id} status changed to ${status}`,
      userId: updated.clientId,
      relatedEntityId: id.toString(),
    });

    if (updated.mechanicId && updated.mechanicId !== updated.clientId) {
      await this.notificationsService.createNotification({
        type: 'STATUS_UPDATED',
        message: `Appointment #${id} for ${updated.vehicle.make} ${updated.vehicle.model} status changed to ${status}`,
        userId: updated.mechanicId,
        relatedEntityId: id.toString(),
      });
    }

    const adminUsers = await this.prisma.user.findMany({ where: { role: "ADMIN" } });
    for (const admin of adminUsers) {
      if (admin.id !== updated.clientId && admin.id !== updated.mechanicId) {
        await this.notificationsService.createNotification({
          type: 'STATUS_UPDATED',
          message: `Appointment #${id} (${updated.vehicle.make} ${updated.vehicle.model}) status changed to ${status}`,
          userId: admin.id,
          relatedEntityId: id.toString(),
        });
      }
    }

    return updated;
  }

  async confirmPayment(id: number, user: any) {
    const appointment = await this.findOne(id);

    if (user.role !== "CLIENT" || appointment.clientId !== user.id) {
      throw new ForbiddenException("Unauthorized payment attempt");
    }
    if (appointment.status === "CANCELLED") {
      throw new BadRequestException(
        "Cannot process payment for a cancelled appointment",
      );
    }
    if (appointment.paymentStatus === "PAID") {
      throw new BadRequestException("Service already paid");
    }

    return this.prisma.appointment.update({
      where: { id },
      data: {
        paymentStatus: "PAID",
        paidAt: new Date(), // <-- STAMP THE CURRENT SYSTEM TIME HERE
      },
    });
  }

  async updateImage(id: number, imageUrl: string) {
    const appointment = await this.findOne(id);
    if (["CANCELLED", "CANCEL_REQUESTED"].includes(appointment.status)) {
      throw new ForbiddenException(
        "Cannot update image of a cancelled appointment",
      );
    }

    if (appointment.imageUrl) {
      const oldPath = join(process.cwd(), "uploads", appointment.imageUrl);
      try {
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      } catch (err) {}
    }

    return this.prisma.appointment.update({
      where: { id },
      data: { imageUrl },
    });
  }

  async remove(id: number, user: any) {
    throw new ForbiddenException(
      "Deletions are disabled. Please use the cancellation status instead.",
    );
  }
}
