import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

export const typeormModule: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  useFactory: () => ({
    type: 'mysql',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER_NAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [__dirname + '/../database/model/**/*.entity{.ts,.js}'],
    synchronize: false,
  }),
  inject: [ConfigService],
};
