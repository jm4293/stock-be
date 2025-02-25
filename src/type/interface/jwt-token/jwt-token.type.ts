export interface IJwtToken {
  userSeq: number;
  email: string;
  expiresIn?: number;
}
