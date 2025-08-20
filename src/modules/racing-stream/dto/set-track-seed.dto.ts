import { IsString } from 'class-validator';

export class SetTrackSeedDto {
  @IsString()
  roomId: string;

  @IsString()
  seed: string;
}
