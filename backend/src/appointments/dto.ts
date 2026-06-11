import { IsString, IsInt, IsOptional, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAppointmentDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  clientId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  mechanicId?: number;

  @Type(() => Number)
  @IsInt()
  vehicleId: number;

  @IsDateString()
  dateTime: string;

  @IsString()
  category: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}

export class UpdateAppointmentDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  mechanicId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  vehicleId?: number;

  @IsOptional()
  @IsDateString()
  dateTime?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}

export class UpdateAppointmentStatusDto {
  @IsString()
  status: string;
}