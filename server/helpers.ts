import { ACCESS_TOKEN, REFRESH_TOKEN } from "./constants";
import {
  RefetchTokenParams,
  SendDataParams,
  SendDataWithoutAuthorizationParams,
  Tokens,
} from "./types";

/*

  Правки
- добавить проверку на валидность юзера через 'https://dummyjson.com/auth/me'



- микрофронты
- личный кабинет подгружается отдельным микрофронтом
- тесты - е2е
*/

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
  const shouldRedirectToLoginPage =
    !("REFRESH_TOKEN" in cookies) || cookies.REFRESH_TOKEN == "undefined";

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

    return {
      refreshToken: newTokens.refreshToken,
      accessToken: newTokens.accessToken,
    };
  } catch (err) {
    res.status(401).json("НАДА Авторизироваться");

    return;
  }
}

async function sendData<Data>(params: SendDataParams<Data>) {
  const { cookies, getData, res } = params;

  let access_token = cookies.ACCESS_TOKEN;
  let refresh_token = cookies.REFRESH_TOKEN;

  const authorizeData = await checkIsAuthorize(cookies.ACCESS_TOKEN);

  console.log({ authorizeData });

  if ("message" in authorizeData) {
    const newPairOfTokens = await refetchToken({
      res,
      cookies,
    });

    if (!newPairOfTokens) {
      throw Error("need access");
    }
    const { accessToken, refreshToken } = newPairOfTokens;

    access_token = accessToken;
    refresh_token = refreshToken;
  }

  try {
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
  } catch (e) {
    res.status(400).json(e);
  }
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

interface RequestError {
  message: string;
}

async function checkIsAuthorize(token: string): Promise<RequestError | any> {
  try {
    const response = await fetch("https://dummyjson.com/user/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        // Pass JWT via Authorization header
      },
      credentials: "include", // Include cookies (e.g., accessToken) in the request
    });
    const res = await response.json();

    return res;
  } catch (e) {
    return e;
  }
}
