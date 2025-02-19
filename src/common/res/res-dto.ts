import { ResEnum } from '../../type/enum/res';

export class ResDto<T = unknown> {
  constructor(
    private readonly result: ResEnum,
    private readonly message?: string,
    private readonly data?: T,
  ) {}

  static Success<T>(params: { message?: string; data?: T }) {
    const { message, data } = params;

    return new ResDto<T>(ResEnum.SUCCESS, message, data);
  }

  static Fail(params: { message?: string }) {
    const { message } = params;

    return new ResDto<null>(ResEnum.FAIL, message, null);
  }
}
