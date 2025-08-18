import { IsNumber, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class MutationRatesDto {
  @IsNumber()
  addNode: number;

  @IsNumber()
  addConnection: number;

  @IsNumber()
  weightMutation: number;

  @IsNumber()
  disableConnection: number;

  @IsNumber()
  weightPerturbation: number;
}

export class SpeciationDto {
  @IsNumber()
  compatibilityThreshold: number;

  @IsNumber()
  c1: number;

  @IsNumber()
  c2: number;

  @IsNumber()
  c3: number;
}

export class SurvivalDto {
  @IsNumber()
  survivalRate: number;

  @IsNumber()
  eliteSize: number;
}

export class NEATConfigDto {
  @IsNumber()
  populationSize: number;

  @IsNumber()
  inputNodes: number;

  @IsNumber()
  outputNodes: number;

  @IsObject()
  @ValidateNested()
  @Type(() => MutationRatesDto)
  mutationRates: MutationRatesDto;

  @IsObject()
  @ValidateNested()
  @Type(() => SpeciationDto)
  speciation: SpeciationDto;

  @IsObject()
  @ValidateNested()
  @Type(() => SurvivalDto)
  survival: SurvivalDto;
}
