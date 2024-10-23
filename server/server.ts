import express, { NextFunction, Response, Request } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { Post, Profile, Tokens } from "./types";
import {
  checkIsAuthorize,
  getDataFromFetch,
  typeGuard,
  refetchToken,
} from "./helpers";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "./constants";
import csurf from "csurf";

const app = express();
const port = 3000;

const csrfProtection = csurf({
  cookie: true, // Хранение CSRF токена в cookie
});

const jsonMiddleware = express.json();

const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
};

app.use(cors(corsOptions));
app.use(jsonMiddleware);
app.use(cookieParser());

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// list of posts
app.get("/posts", async (req, res: express.Response) => {
  try {
    const json = await getDataFromFetch(
      "https://jsonplaceholder.typicode.com/posts"
    );

    res.status(200).json(json);
  } catch (err) {
    res.status(400);
  }
});

// current post
app.get("/posts/:id", async (req, res: express.Response) => {
  const { params, cookies } = req;

  let accessToken = cookies.ACCESS_TOKEN;
  let refreshToken = cookies.REFRESH_TOKEN;

  const isAuthorize = await checkIsAuthorize(cookies.ACCESS_TOKEN);

  if (!isAuthorize) {
    const newPairOfTokens = await refetchToken({ cookies });

    if ("status" in newPairOfTokens) {
      res.status(newPairOfTokens.status).json(newPairOfTokens.message);
      return;
    }

    accessToken = newPairOfTokens.accessToken;
    refreshToken = newPairOfTokens.refreshToken;
  }

  try {
    const json = await getDataFromFetch(
      `https://jsonplaceholder.typicode.com/posts/${params.id}`
    );

    res
      .cookie(ACCESS_TOKEN, accessToken, {
        maxAge: 6_000,
        httpOnly: true,
        secure: false,
      })
      .cookie(REFRESH_TOKEN, refreshToken, {
        maxAge: 60 * 60 * 24 * 7, // 1 неделя
        httpOnly: true,
        secure: false,
      })
      .status(200)
      .json(json);
  } catch (e) {
    res.status(400).json(e);
  }
});

// get user by id
app.get(
  "/usersPosts/:userId",
  csrfProtection,
  async (req, res: express.Response) => {
    const { params, cookies } = req;

    let accessToken = cookies.ACCESS_TOKEN;
    let refreshToken = cookies.REFRESH_TOKEN;

    const isAuthorize = await checkIsAuthorize(cookies.ACCESS_TOKEN);

    if (!isAuthorize) {
      const newPairOfTokens = await refetchToken({ cookies });

      if ("status" in newPairOfTokens) {
        res.status(newPairOfTokens.status).json(newPairOfTokens.message);
        return;
      }

      accessToken = newPairOfTokens.accessToken;
      refreshToken = newPairOfTokens.refreshToken;
    }

    try {
      const json = await getDataFromFetch(
        `https://jsonplaceholder.typicode.com/posts?userId=${params.userId}`
      );

      const XSRF =
        "csrfToken" in req && typeof req.csrfToken === "function"
          ? req.csrfToken()
          : null;

      res
        .cookie(ACCESS_TOKEN, accessToken, {
          maxAge: 6_000,
          httpOnly: true,
          secure: false,
        })
        .cookie(REFRESH_TOKEN, refreshToken, {
          maxAge: 60 * 60 * 24 * 7, // 1 неделя
          httpOnly: true,
          secure: false,
        })
        .cookie("XSRF-TOKEN", XSRF, {
          httpOnly: false,
          secure: false,
          sameSite: "strict",
        })
        .status(200)
        .json(json);
    } catch (e) {
      res.status(400).json(e);
    }
  }
);

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
