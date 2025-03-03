import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { validationPipeConfig } from './config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: ['http://localhost:31180', 'http://8134293.iptime.org:9900'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.useGlobalPipes(validationPipeConfig);

  app.use(cookieParser());

  await app.listen(process.env.SERVER_PORT as string, () => {
    console.log(`Server is running on ${process.env.SERVER_PORT}`);
  });
}
bootstrap();
