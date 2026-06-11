import { IsString, IsOptional, IsInt } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  content: string;

  @IsOptional()
  @IsInt()
  appointmentId?: number;
}