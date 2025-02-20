import { ResEnum } from '../../../type/enum/res';
import { ResDto } from '../../../common';

export class KisRes extends ResDto {
  constructor(result: ResEnum, message?: string, data?: unknown) {
    super(result, message, data);
  }

  static Success<T>(params: { message?: string; data?: T }) {
    return ResDto.Success<T>(params);
  }
}
