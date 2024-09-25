import { ACCESS_TOKEN, REFRESH_TOKEN } from "./constants";
import {
  RefetchTokenParams,
  SendDataParams,
  SendDataWithoutAuthorizationParams,
  Tokens,
} from "./types";

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

async function refetchToken({ cookies, res }: RefetchTokenParams) {
  const shouldRedirectToLoginPage = !("REFRESH_TOKEN" in cookies);

  if (shouldRedirectToLoginPage) {
    res.status(401).json("НАДА Авторизироваться");
    return;
  }

  try {
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

    if (!response.ok) {
      throw Error(`status: ${response.status} message: ${response.statusText}`);
    }

    const newTokens = (await response.json()) as Tokens;

    console.log({ newTokens, response });
    return {
      refreshToken: newTokens.refreshToken,
      acessToken: newTokens.token,
    };
  } catch (err) {
    res.status(401).json("НАДА Авторизироваться");

    return;
  }
}

async function sendData<Data>(params: SendDataParams<Data>) {
  const { cookies, getData, res } = params;

  //сделать валидацию не только на аксесс но и на валидность токена
  const isAuthorize = cookies && "ACCESS_TOKEN" in cookies;

  let access_token = cookies.ACCESS_TOKEN;
  let refresh_token = cookies.REFRESH_TOKEN;

  console.log({ isAuthorize });
  if (!isAuthorize) {
    const newPairOfTokens = await refetchToken({
      res,
      cookies,
    });

    console.log({ newPairOfTokens });

    if (!newPairOfTokens) {
      return;
    }

    access_token = newPairOfTokens.acessToken;
    refresh_token = newPairOfTokens.refreshToken;
  }

  const json = await getData();

  res
    .cookie(ACCESS_TOKEN, access_token, {
      maxAge: 6_000,
      httpOnly: true,
      secure: false,
    })
    .cookie(REFRESH_TOKEN, refresh_token, {
      maxAge: 60 * 60 * 24 * 7, // 1 неделя
      httpOnly: true,
      secure: false,
    })
    .status(200)
    .json(json);
}

async function sendDataWithoutAuthorization<Data>(
  params: SendDataWithoutAuthorizationParams<Data>
) {
  const { getData, res } = params;

  try {
    const json = await getData();

    res.status(200).json(json);
  } catch (err) {
    res.status(400);
  }
}

export {
  refetchToken,
  sendData,
  typeGuard,
  getDataFromFetch,
  sendDataWithoutAuthorization,
};
