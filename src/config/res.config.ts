import { ResEnum } from '../type/enum/res';

export class ResConfig<T = unknown> {
  constructor(
    private readonly result: ResEnum,
    private readonly message?: string,
    private readonly data?: T,
  ) {}

  static Success<T>(params: { message?: string; data?: T }) {
    const { message, data } = params;

    return new ResConfig<T>(ResEnum.SUCCESS, message, data);
  }

  static Fail(params: { message?: string }) {
    const { message } = params;

    return new ResConfig<null>(ResEnum.FAIL, message, null);
  }
}
