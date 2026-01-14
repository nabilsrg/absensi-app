import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { HrAppModule } from './hr-app.module';

async function bootstrap() {
  const app = await NestFactory.create(HrAppModule);
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  await app.listen(process.env.HR_PORT ?? 3003);
}
bootstrap();
