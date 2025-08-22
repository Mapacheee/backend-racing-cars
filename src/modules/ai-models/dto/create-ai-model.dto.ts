import {
  IsNotEmpty,
  IsObject,
  ValidateNested,
  IsOptional,
  IsJSON,
} from 'class-validator';
import { Type } from 'class-transformer';
import { NEATConfigDto } from './neat-config.dto';
import { NetworkMetadataDto } from './network.dto';

export class CreateAiModelDto {
  @IsNotEmpty()
  @IsJSON()
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
