import {
  IsNotEmpty,
  IsObject,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { NEATConfigDto } from './neat-config.dto';
import { NetworkMetadataDto } from './network.dto';

export class CreateAiModelDto {
  @IsNotEmpty()
  @IsObject()
  networkData: any;

  @IsOptional()
  @ValidateNested()
  @Type(() => NetworkMetadataDto)
  metadata?: NetworkMetadataDto;

  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => NEATConfigDto)
  neatConfig: NEATConfigDto;
}
