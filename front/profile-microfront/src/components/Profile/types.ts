export interface ProfileType {
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

export interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}
