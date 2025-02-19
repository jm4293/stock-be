import { ResDto } from '../../../common/res/res-dto';
import { ResEnum } from '../../../type/enum/res';

export class KisRes extends ResDto {
  constructor(result: ResEnum, message?: string, data?: unknown) {
    super(result, message, data);
  }

  static Success<T>(params: { message?: string; data?: T }) {
    return ResDto.Success<T>(params);
  }
}
