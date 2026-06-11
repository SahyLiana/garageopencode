import { 
  Controller, Get, Post, Body, Patch, Param, Delete, 
  UseGuards, ParseIntPipe 
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryItemDto, UpdateInventoryItemDto, AssignItemDto } from './dto';
import { JwtGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('inventory')
@UseGuards(JwtGuard, RolesGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  findAll() {
    return this.inventoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.inventoryService.findOne(id);
  }

  @Post()
  @Roles('ADMIN')
  create(@Body() dto: CreateInventoryItemDto) {
    return this.inventoryService.create(dto);
  }

  @Patch(':id')
  @Roles('ADMIN')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateInventoryItemDto) {
    return this.inventoryService.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.inventoryService.remove(id);
  }

  @Post('assign/:appointmentId')
  @Roles('ADMIN')
  assignToAppointment(
    @Param('appointmentId', ParseIntPipe) appointmentId: number,
    @Body() dto: AssignItemDto,
  ) {
    return this.inventoryService.assignToAppointment(appointmentId, dto);
  }

  @Post('request/:appointmentId')
  @Roles('ADMIN', 'MECHANIC')
  requestItem(
    @Param('appointmentId', ParseIntPipe) appointmentId: number,
    @Body() dto: AssignItemDto,
  ) {
    return this.inventoryService.requestItem(appointmentId, dto);
  }

  @Post('approve/:usedPartId')
  @Roles('ADMIN')
  approveRequest(@Param('usedPartId', ParseIntPipe) usedPartId: number) {
    return this.inventoryService.approveRequest(usedPartId);
  }

  @Post('reject/:usedPartId')
  @Roles('ADMIN')
  rejectRequest(@Param('usedPartId', ParseIntPipe) usedPartId: number) {
    return this.inventoryService.rejectRequest(usedPartId);
  }

  @Get('appointment/:appointmentId')
  getAssignments(@Param('appointmentId', ParseIntPipe) appointmentId: number) {
    return this.inventoryService.getAssignmentsForAppointment(appointmentId);
  }
}

