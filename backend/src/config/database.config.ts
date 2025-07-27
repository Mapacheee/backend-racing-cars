import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: configService.get<'sqlite'>('DATABASE_TYPE'),
  database: configService.get<string>('DATABASE_NAME'),
  entities: [join(__dirname, '../**/*.entity{.ts,.js}')],
  synchronize: configService.get<string>('NODE_ENV') === 'development',
  logging: configService.get<string>('NODE_ENV') === 'development',
});
