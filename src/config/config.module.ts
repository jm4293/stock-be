import { ConfigModuleOptions } from '@nestjs/config';
import * as Joi from 'joi';

export const configModule: ConfigModuleOptions = {
  isGlobal: true,
  envFilePath: ['.env'],
  validationSchema: Joi.object({
    PORT: Joi.number().default(42200),
    NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
    // DATABASE_HOST: Joi.string().required(),
    // DATABASE_PORT: Joi.number().default(5432),
    // DATABASE_USER: Joi.string().required(),
    // DATABASE_PASSWORD: Joi.string().required(),
    // DATABASE_NAME: Joi.string().required(),
    // DATABASE_SYNCHRONIZE: Joi.boolean().default(false),
  }),
};
