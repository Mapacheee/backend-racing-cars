import { IsNumber } from 'class-validator';

export class NEATConfigDto {
  @IsNumber()
  populationSize: number;

  @IsNumber()
  mutationRate: number;

  @IsNumber()
  elitism: number;

  @IsNumber()
  inputNodes: number;

  @IsNumber()
  outputNodes: number;
}
