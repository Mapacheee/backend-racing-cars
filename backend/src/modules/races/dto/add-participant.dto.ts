import { IsNotEmpty, IsString } from 'class-validator';

export class AddParticipantDto {
  @IsNotEmpty()
  @IsString()
  aiModelId: string;
}
