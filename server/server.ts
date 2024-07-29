// const express = require("express");
import express, { response } from "express";
const app = express();
const port = 3000;

/*



  - Логика выставления аксесс и рефреш токена. 
    Обновление токене. 
    В случае ошибки кидаем 401 на фронт
  
  
  
    - Вспомогательные ендпоинты под каждую страницу:


    1) авторизация
    2) посты
    3) детальная карточка поста
    4) профиль (личный кабинет )





  Апи:
- https://dummyjson.com/docs/auth —

    тут только авторизацию берем (он сам возвращает юзера с id 1 при авторизации, 
      поэтому в целом пофиг, матчится будет с jsonplaceholder хахах). 

- https://jsonplaceholder.typicode.com/ — 

        тут берем посты/юзеры/тудушки
*/

// В начале вашего приложения Express
// app.use((req, res: express.Response, next) => {

// });

const jsonMiddleware = express.json();

app.use(jsonMiddleware);

// Маршрут для главной страницы
app.get("/", (req, res: express.Response) => {
  res.send("Hello World!");
});

// Запуск сервера
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// list of posts
app.get("/posts", async (req, res: express.Response) => {
  const posts = await getDataFromFetch(
    "https://jsonplaceholder.typicode.com/posts"
  );

  res.status(200).json(posts);
});

// current post
app.get("/posts/:id", async (req, res: express.Response) => {
  const post = await getDataFromFetch(
    `https://jsonplaceholder.typicode.com/posts/${req.params.id}`
  );

  // console.log(req.params.id);
  console.log({ id: req.query?.userId });

  res.status(200).json(post);
});

interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

app.get("/usersPosts/:userId", async (req, res: express.Response) => {
  const allPost: Post[] = (await getDataFromFetch(
    `https://jsonplaceholder.typicode.com/posts/`
  )) as Post[];

  const usersList = allPost.filter((el) => {
    const userIdFromQuery = parseInt(req.params.userId);

    return el.userId === userIdFromQuery;
  });

  res.status(200).json(usersList);
});

// Aвторизация

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

app.post("/login", async (req, res: express.Response) => {
  const { username, password } = req.body;

  try {
    const response = await fetch("https://dummyjson.com/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        password,
        expiresInMins: 30,
      }),
    });
    const data = await response.json();

    if (response.ok) {
      res.status(200).json(data);
    } else {
      res.status(401).json(data);
    }
  } catch (err) {
    res.status(500).json({ message: "Ошибка сервера", err });
  }
});

async function getDataFromFetch(url: string) {
  let result: unknown | Error;

  try {
    const response = await fetch(url);

    result = response.json();
  } catch (err) {
    result = err;
  }

  return result;
}
