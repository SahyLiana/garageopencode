import {
  Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query,
} from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto, UpdateVehicleDto } from './dto';
import { JwtGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtGuard, RolesGuard)
@Controller('vehicles')
export class VehiclesController {
  constructor(private vehiclesService: VehiclesService) {}

  @Get()
  findAll(@CurrentUser() user: any, @Query('clientId') clientId?: string) {
    if (user.role === 'CLIENT') return this.vehiclesService.findByClient(user.id);
    if (clientId) return this.vehiclesService.findByClient(+clientId);
    return this.vehiclesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vehiclesService.findOne(+id);
  }

  @Post()
  create(@Body() dto: CreateVehicleDto, @CurrentUser() user: any) {
    if (user.role === 'CLIENT') dto.clientId = user.id;
    return this.vehiclesService.create(dto);
  }

  @Roles('ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateVehicleDto) {
    return this.vehiclesService.update(+id, dto);
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.vehiclesService.remove(+id);
  }
}