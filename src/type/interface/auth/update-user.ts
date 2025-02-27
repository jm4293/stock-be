export interface IUpdateUser {
  userSeq: number;
  nickname: string;
  name: string;
  birthdate: Date | null;
  thumbnail: string | null;
}
