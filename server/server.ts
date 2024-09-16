import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { Post, Profile, Tokens } from "./types";
import { getDataFromFetch, sendData, typeGuard } from "./helpers";
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

app.get("/set-cookie", (req, res) => {
  res.cookie("myCookie", "cookieValue", {
    httpOnly: true,
    sameSite: "none",
    secure: false,
  });

  const cookie = req.cookies;
  const headers = req.headers.cookie;

  // console.log({ cookie, headers });

  res
    .cookie(ACCESS_TOKEN, ACCESS_TOKEN, {
      // maxAge: 60 * 60 * 24 * 7, // 1 неделя
      maxAge: 6_000, // 1 неделя
      httpOnly: true,
      secure: false,
    })
    .cookie(REFRESH_TOKEN, REFRESH_TOKEN, {
      // maxAge: 60 * 60 * 24 * 7, // 1 неделя
      maxAge: 60 * 60 * 24 * 7,
      httpOnly: true,
      secure: false,
    })
    .status(200);

  res.send("Cookie has been set");
});

// list of posts
app.get("/posts", async (req, res: express.Response) => {
  const { cookies } = req;

  const getPosts = async () =>
    await getDataFromFetch("https://jsonplaceholder.typicode.com/posts");

  sendData<Post[]>({
    getData: getPosts as () => Promise<Post[]>,
    res,
    cookies,
  });
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

  const isSuccess = typeGuard("token", data) && typeGuard("refreshToken", data);

  if (isSuccess) {
    res
      .cookie(ACCESS_TOKEN, data.token, {
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
*/

/*

    {
    "id": 1,
    "username": "emilys",
    "email": "emily.johnson@x.dummyjson.com",
    "firstName": "Emily",
    "lastName": "Johnson",
    "gender": "female",
    "image": "https://dummyjson.com/icon/emilys/128",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJlbWlseXMiLCJlbWFpbCI6ImVtaWx5LmpvaG5zb25AeC5kdW1teWpzb24uY29tIiwiZmlyc3ROYW1lIjoiRW1pbHkiLCJsYXN0TmFtZSI6IkpvaG5zb24iLCJnZW5kZXIiOiJmZW1hbGUiLCJpbWFnZSI6Imh0dHBzOi8vZHVtbXlqc29uLmNvbS9pY29uL2VtaWx5cy8xMjgiLCJpYXQiOjE3MjIyODc0NDEsImV4cCI6MTcyMjI4OTI0MX0.VL_vMqD9-BzpXddeAwl3QIXKk7VIM8RXFSzmH9lGigQ",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJlbWlseXMiLCJlbWFpbCI6ImVtaWx5LmpvaG5zb25AeC5kdW1teWpzb24uY29tIiwiZmlyc3ROYW1lIjoiRW1pbHkiLCJsYXN0TmFtZSI6IkpvaG5zb24iLCJnZW5kZXIiOiJmZW1hbGUiLCJpbWFnZSI6Imh0dHBzOi8vZHVtbXlqc29uLmNvbS9pY29uL2VtaWx5cy8xMjgiLCJpYXQiOjE3MjIyODc0NDEsImV4cCI6MTcyNDg3OTQ0MX0.l_MznGdy-NrX4_mmeyHY0ZzoQlnPlgbdGCh-Ifh0zgg"
}



!! Login user and get token


  fetch('https://dummyjson.com/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'emilys',
    password: 'emilyspass',
    expiresInMins: 30, // optional, defaults to 60
  })
  })
    .then(res => res.json())
    .then(console.log);


  !! REFRESH
fetch('https://dummyjson.com/auth/refresh', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        refreshToken: ' YOUR_REFRESH_TOKEN_HERE ',
        expiresInMins: 30,
        optional, defaults to 60
    })
}).then(res=>res.json()).then(console.log);

*/
