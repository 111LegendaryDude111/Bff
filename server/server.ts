import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { Post, Profile } from "./types";
import {
  getDataFromFetch,
  sendData,
  sendDataWithoutAuthorization,
  typeGuard,
} from "./helpers";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "./constants";

const app = express();
const port = 3000;

const jsonMiddleware = express.json();

const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
};

app.use(cors(corsOptions));
app.use(jsonMiddleware);
app.use(cookieParser());

// Маршрут для главной страницы
app.get("/", (req, res: express.Response) => {
  res.send("Hello");
});

// Запуск сервера
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// list of posts
app.get("/posts", async (req, res: express.Response) => {
  const getPosts = async () =>
    await getDataFromFetch("https://jsonplaceholder.typicode.com/posts");

  sendDataWithoutAuthorization({ getData: getPosts, res });
});

// current post
app.get("/posts/:id", async (req, res: express.Response) => {
  const { params, cookies } = req;
  const getPost = async () =>
    await getDataFromFetch(
      `https://jsonplaceholder.typicode.com/posts/${params.id}`
    );

  sendData<Post>({ getData: getPost as () => Promise<Post>, res, cookies });
});

// get user by id
app.get("/usersPosts/:userId", async (req, res: express.Response) => {
  const { params, cookies } = req;

  const getAllPost = async () =>
    await getDataFromFetch(
      `https://jsonplaceholder.typicode.com/posts?userId=${params.userId}`
    );

  sendData<Post[]>({
    getData: getAllPost as () => Promise<Post[]>,
    res,
    cookies,
  });
});

// Aвторизация
app.post("/login", async (req, res: express.Response) => {
  const { username, password } = req.body;

  const response = await fetch("https://dummyjson.com/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username,
      password,
      expiresInMins: 30,
    }),
  });

  if (!response.ok) {
    res.status(response.status).json(JSON.stringify(response.statusText));
    return;
  }

  const data = (await response.json()) as Profile;

  const isSuccess =
    typeGuard("accessToken", data) && typeGuard("refreshToken", data);

  if (isSuccess) {
    res
      .cookie(ACCESS_TOKEN, data.accessToken, {
        maxAge: 6_000,
        httpOnly: true,
        secure: false,
      })
      .cookie(REFRESH_TOKEN, data.refreshToken, {
        maxAge: 60 * 60 * 24 * 7,
        httpOnly: true,
        secure: false,
      })
      .status(200)
      .json(data);

    return;
  }

  res.status(401).json(data);
});

/*
     username: 'emilys',
    password: 'emilyspass',

    https://dummyjson.com/docs/users
*/
