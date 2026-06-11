import {
  Controller, Get, Post, Body, Patch, Param, Delete, UseGuards,
  UseInterceptors, UploadedFile, ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto, UpdateAppointmentDto, UpdateAppointmentStatusDto } from './dto';
import { JwtGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

const storage = diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
  },
});

@UseGuards(JwtGuard, RolesGuard)
@Controller('appointments')
export class AppointmentsController {
  constructor(private appointmentsService: AppointmentsService) {}

  @Get()
  findAll(@CurrentUser() user: any) {
    if (user.role === 'MECHANIC') return this.appointmentsService.findByMechanic(user.id);
    if (user.role === 'CLIENT') return this.appointmentsService.findByClient(user.id);
    return this.appointmentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.appointmentsService.findOne(+id);
  }

  @Post()
  @UseInterceptors(FileInterceptor('image', { storage }))
  create(
    @Body() dto: CreateAppointmentDto, 
    @CurrentUser() user: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      dto.imageUrl = file.filename;
    }
    return this.appointmentsService.create(dto, user);
  }

  @Roles('ADMIN', 'CLIENT', 'MECHANIC')
  @Patch(':id/image')
  @UseInterceptors(FileInterceptor('image', { storage }))
  updateImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.appointmentsService.updateImage(+id, file.filename);
  }

  @Roles('ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAppointmentDto) {
    return this.appointmentsService.update(+id, dto);
  }

  @Roles('ADMIN', 'MECHANIC', 'CLIENT')
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateAppointmentStatusDto,
    @CurrentUser() user: any,
  ) {
    return this.appointmentsService.updateStatus(+id, dto.status, user);
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.appointmentsService.remove(id, user);
  }

  @Post(':id/pay')
  @UseGuards(JwtGuard)
  pay(@Param('id') id: string, @CurrentUser() user: any) {
    return this.appointmentsService.confirmPayment(+id, user);
  }
}