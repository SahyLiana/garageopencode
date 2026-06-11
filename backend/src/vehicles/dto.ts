import { IsString, IsInt, IsOptional, Min } from 'class-validator';

export class CreateVehicleDto {
  @IsInt()
  clientId: number;

  @IsString()
  make: string;

  @IsString()
  model: string;

  @IsInt()
  @Min(1900)
  year: number;

  @IsString()
  licensePlate: string;

  @IsOptional()
  @IsString()
  vin?: string;
}

export class UpdateVehicleDto {
  @IsOptional()
  @IsString()
  make?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsInt()
  year?: number;

  @IsOptional()
  @IsString()
  licensePlate?: string;

  @IsOptional()
  @IsString()
  vin?: string;
}