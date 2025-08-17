import {
  IsString,
  IsNumber,
  IsArray,
  IsBoolean,
  IsOptional,
  ValidateNested,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

export class NodeGeneDto {
  @IsNumber()
  id: number;

  @IsString()
  @IsIn(['input', 'hidden', 'output'])
  type: 'input' | 'hidden' | 'output';

  @IsNumber()
  layer: number;

  @IsOptional()
  @IsNumber()
  value?: number;
}

export class GeneDto {
  @IsNumber()
  innovation: number;

  @IsNumber()
  from: number;

  @IsNumber()
  to: number;

  @IsNumber()
  weight: number;

  @IsBoolean()
  enabled: boolean;
}

export class GenomeDto {
  @IsString()
  id: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NodeGeneDto)
  nodeGenes: NodeGeneDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GeneDto)
  connectionGenes: GeneDto[];

  @IsNumber()
  fitness: number;

  @IsNumber()
  adjustedFitness: number;

  @IsOptional()
  @IsNumber()
  species?: number;
}
