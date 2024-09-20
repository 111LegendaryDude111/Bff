import type { Response } from "express";

interface Profile {
  email: string;
  firstName: string;
  gender: string;
  id: 1;
  image: string;
  lastName: string;
  refreshToken: string;
  token: string;
  username: string;
}

interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

interface Tokens {
  token: string;
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
