import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-http-bearer';
import { AuthService } from '../auth.service';
import { UsersService } from '../../users/users.service';

@Injectable()
export class SimpleTokenStrategy extends PassportStrategy(Strategy, 'simple-token') {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {
    super();
  }

  async validate(token: string) {
    const payload = this.authService.validateSimpleToken(token);

    if (!payload) {
      throw new UnauthorizedException();
    }

    const user = await this.usersService.findOne(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }

    return { id: user.id, username: user.username, isAdmin: false };
  }
}
