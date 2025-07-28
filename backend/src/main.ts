import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Habilitar CORS para el frontend
  app.enableCors({
    origin: '*', // En producción, esto debería ser la URL específica del frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Configurar prefijo global de API
  app.setGlobalPrefix('api');

  // Configurar validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Eliminar propiedades no decoradas
      forbidNonWhitelisted: true, // Lanzar error si hay propiedades no decoradas
      transform: true, // Transformar automáticamente los payloads a los DTOs
    }),
  );

  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);
  console.log(`Aplicación iniciada en: http://localhost:${port}/api`);
}
bootstrap();
