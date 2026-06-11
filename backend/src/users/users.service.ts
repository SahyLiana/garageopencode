import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import { PrismaService } from "../prisma/prisma.service";
import { CreateUserDto, UpdateUserDto } from "./dto";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });
    if (!user) throw new NotFoundException("User not found");
    return user;
  }

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException("Email already exists");

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    return this.prisma.user.create({
      data: { ...dto, password: hashedPassword },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });
  }

  async update(id: number, dto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException("User not found");

    return this.prisma.user.update({
      where: { id },
      data: dto,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });
  }

  async remove(id: number) {
    // 1. Verify user exists first
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException("User not found");
    }

    // 2. Execute deletion sequence inside a sequential transaction
    await this.prisma.$transaction(async (tx) => {
      // A. Handle Comments authored by this user
      await tx.comment.deleteMany({
        where: { authorId: id },
      });

      // B. Find all appointments tied to this user (as client OR mechanic)
      // We need these IDs to clean up dependent UsedParts first
      const targetAppointments = await tx.appointment.findMany({
        where: {
          OR: [{ clientId: id }, { mechanicId: id }],
        },
        select: { id: true },
      });
      const appointmentIds = targetAppointments.map((appt) => appt.id);

      // C. Delete UsedParts tied to those appointments
      if (appointmentIds.length > 0) {
        await tx.usedPart.deleteMany({
          where: { appointmentId: { in: appointmentIds } },
        });
      }

      // D. Delete the comments left inside those specific appointments
      if (appointmentIds.length > 0) {
        await tx.comment.deleteMany({
          where: { appointmentId: { in: appointmentIds } },
        });
      }

      // E. Now safely delete the Appointments themselves
      if (appointmentIds.length > 0) {
        await tx.appointment.deleteMany({
          where: { id: { in: appointmentIds } },
        });
      }

      // F. Delete Vehicles owned by this user
      await tx.vehicle.deleteMany({
        where: { clientId: id },
      });

      // G. Finally, delete the User record itself
      await tx.user.delete({
        where: { id },
      });
    });

    return { message: "User and all related records deleted successfully" };
  }
}
