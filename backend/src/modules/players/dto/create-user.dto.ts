import { Exclude } from 'class-transformer';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreatePlayerDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @Exclude()
  @IsNotEmpty()
  @IsString()
  @Length(4, 4)
  password: string;
}
