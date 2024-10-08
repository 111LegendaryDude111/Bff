import type { Response, Request } from "express";

interface Profile {
  email: string;
  firstName: string;
  gender: string;
  id: 1;
  image: string;
  lastName: string;
  refreshToken: string;
  accessToken: string;
  username: string;
}

interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

interface Tokens {
  accessToken: string;
  refreshToken: string;
}

interface RefetchTokenParams {
  cookies: any;
  res: Response<any, Record<string, any>>;
}

interface SendDataParams<Data> {
  cookies: any;
  getData: () => Promise<Data>;
  res: Response<any, Record<string, any>>;
  req?: Request;
}

interface SendDataWithoutAuthorizationParams<Data> {
  getData: () => Promise<Data>;
  res: Response<any, Record<string, any>>;
}

export type {
  RefetchTokenParams,
  SendDataParams,
  Profile,
  Post,
  Tokens,
  SendDataWithoutAuthorizationParams,
};
