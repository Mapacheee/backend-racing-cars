import { IsNumber, IsObject, IsOptional } from 'class-validator';

export class UpdateParticipantDto {
  @IsOptional()
  @IsNumber()
  position?: number;

  @IsOptional()
  @IsNumber()
  finishingTime?: number;

  @IsOptional()
  @IsObject()
  performanceMetrics?: Record<string, any>;
}
