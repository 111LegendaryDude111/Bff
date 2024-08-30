import { ACCESS_TOKEN, REFRESH_TOKEN } from "./constants";
import { RefetchTokenParams, SendDataParams, Tokens } from "./types";

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

function typeGuard<Field extends string, Object extends {}>(
  field: Field,
  obj: Object
) {
  return field in obj;
}

async function refetchToken<T>({ cookies, data, res }: RefetchTokenParams<T>) {
  const shouldRedirectToLoginPage = !("REFRESH_TOKEN" in cookies);

  if (shouldRedirectToLoginPage) {
    res.status(401).json("НАДА Авторизироваться");
    return;
  }

  const response = await fetch("https://dummyjson.com/auth/refresh", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      refreshToken: cookies.REFRESH_TOKEN,
      expiresInMins: 30,
    }),
  });

  const newTokens = (await response.json()) as Tokens;

  res
    .cookie(ACCESS_TOKEN, newTokens.token, {
      maxAge: 6_000,
      httpOnly: true,
      secure: false,
    })
    .cookie(REFRESH_TOKEN, newTokens.refreshToken, {
      maxAge: 60 * 60 * 24 * 7,
      httpOnly: true,
      secure: false,
    })
    .status(200)
    .json(data);
}

async function sendData<Data>(params: SendDataParams<Data>) {
  const { cookies, data, res } = params;

  const isAuthorize = cookies && "ACCESS_TOKEN" in cookies;

  if (!isAuthorize) {
    refetchToken<Data>({ data, res, cookies });
    return;
  }

  res
    .cookie(ACCESS_TOKEN, cookies.ACCESS_TOKEN, {
      maxAge: 6_000,
      httpOnly: true,
      secure: false,
    })
    .cookie(REFRESH_TOKEN, cookies.REFRESH_TOKEN, {
      maxAge: 60 * 60 * 24 * 7, // 1 неделя
      httpOnly: true,
      secure: false,
    })
    .status(200)
    .json(data);
}

export { refetchToken, sendData, typeGuard, getDataFromFetch };
