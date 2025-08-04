import { IsString, IsNotEmpty, Length } from 'class-validator';

export class PlayerLoginDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  @Length(4, 4, { message: 'La contraseña debe tener exactamente 4 dígitos' })
  password: string;
}
