import { User } from '../database/entities';
import { IJwtToken } from './interface';

declare module 'express-serve-static-core' {
  interface Request {
    user: IJwtToken;
  }
}
