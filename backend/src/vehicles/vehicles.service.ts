import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVehicleDto, UpdateVehicleDto } from './dto';

@Injectable()
export class VehiclesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.vehicle.findMany({ include: { client: { select: { id: true, name: true, email: true } } } });
  }

  findByClient(clientId: number) {
    return this.prisma.vehicle.findMany({ where: { clientId } });
  }

  async findOne(id: number) {
    const vehicle = await this.prisma.vehicle.findUnique({ where: { id }, include: { client: { select: { id: true, name: true, email: true } } } });
    if (!vehicle) throw new NotFoundException('Vehicle not found');
    return vehicle;
  }

  create(dto: CreateVehicleDto) {
    return this.prisma.vehicle.create({ data: dto });
  }

  async update(id: number, dto: UpdateVehicleDto) {
    await this.findOne(id);
    return this.prisma.vehicle.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.vehicle.delete({ where: { id } });
    return { message: 'Vehicle deleted' };
  }
}