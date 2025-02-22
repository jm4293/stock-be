import { ResConfig } from '../../../../config';
import { ResEnum } from '../../../enum';

export class KisResConfig extends ResConfig {
  constructor(result: ResEnum, message?: string, data?: unknown) {
    super(result, message, data);
  }

  static Success<T>(params: { message?: string; data?: T }) {
    return ResConfig.Success<T>(params);
  }
}
