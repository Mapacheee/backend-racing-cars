import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../../users/users.service';

@Injectable()
export class SimpleStrategy extends PassportStrategy(Strategy, 'simple') {
  constructor(private usersService: UsersService) {
    super({
      usernameField: 'username',
      passwordField: 'username', // No usamos contraseña en el login simple
    });
  }

  async validate(username: string): Promise<any> {
    // Solo comprobamos que el usuario existe
    const user = await this.usersService.findByUsername(username);
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    const { password, ...result } = user;
    return result;
  }
}
