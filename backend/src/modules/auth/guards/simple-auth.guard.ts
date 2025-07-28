import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class SimpleAuthGuard extends AuthGuard('simple') {}
@Injectable()
export class SimpleAuthGuard extends AuthGuard('simple-token') {}
