import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors({
    origin: (process.env.CORS_ORIGIN || 'http://localhost:3002').split(','),
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      // Mobile bodies may send extra fields; don't reject them.
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads/' });
  const port = Number(process.env.PORT || 3001);
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`G-mall portal API listening on http://localhost:${port}`);
}
bootstrap();
