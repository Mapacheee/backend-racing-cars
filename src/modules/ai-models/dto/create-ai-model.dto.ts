import { IsNotEmpty, IsArray, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { GenomeDto } from './genome.dto';
import { NEATConfigDto } from './neat-config.dto';

export class CreateAiModelDto {
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GenomeDto)
  neatGenomes: GenomeDto[];

  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => NEATConfigDto)
  config: NEATConfigDto;
}
