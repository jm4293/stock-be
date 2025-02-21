import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ValidationPipeModule } from './config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: ['http://localhost:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    // credentials: true,
  });

  app.useGlobalPipes(ValidationPipeModule);

  app.use(cookieParser());

  await app.listen(process.env.SERVER_PORT as string, () => {
    console.log(`Server is running on ${process.env.SERVER_PORT}`);
  });
}
bootstrap();
