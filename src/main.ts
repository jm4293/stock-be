import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { validationPipeConfig } from './config';
import * as admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: ['http://localhost:31180', 'http://8134293.iptime.org:9900'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.useGlobalPipes(validationPipeConfig);

  app.use(cookieParser());

  const serviceAccount = {
    projectId: configService.get('FIREBASE_PROJECT_ID'),
    clientEmail: configService.get('FIREBASE_CLIENT_EMAIL'),
    privateKey: configService.get('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n'),
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  await app.listen(configService.get('SERVER_PORT') as string, () => {
    console.log(`Server is running on ${configService.get('SERVER_PORT')}`);
  });
}
bootstrap();
