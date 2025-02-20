import { ResEnum } from '../../../type/enum/res';
import { ResConfig } from '../../../config';

export class KisResConfig extends ResConfig {
  constructor(result: ResEnum, message?: string, data?: unknown) {
    super(result, message, data);
  }

  static Success<T>(params: { message?: string; data?: T }) {
    return ResConfig.Success<T>(params);
  }
}
