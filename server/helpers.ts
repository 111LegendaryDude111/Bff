import { Tokens } from "./types";

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

interface RequestError {
  message: string;
}

async function checkIsAuthorize(token: string): Promise<RequestError | any> {
  try {
    const response = await fetch("https://dummyjson.com/user/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: "include", // Include cookies (e.g., accessToken) in the request
    });

    return true;
  } catch (e) {
    return false;
  }
}

async function refetchToken({
  cookies,
}: {
  cookies: any;
}): Promise<
  | { status: number; message: string }
  | { refreshToken: string; accessToken: string }
> {
  const shouldRedirectToLoginPage =
    !("REFRESH_TOKEN" in cookies) || cookies.REFRESH_TOKEN == "undefined";

  if (shouldRedirectToLoginPage) {
    return { status: 401, message: "НАДА Авторизироваться" };
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
      return { status: response.status, message: response.statusText };
    }

    const newTokens = (await response.json()) as Tokens;

    return {
      refreshToken: newTokens.refreshToken,
      accessToken: newTokens.accessToken,
    };
  } catch (err) {
    return { status: 401, message: "НАДА Авторизироваться" };
  }
}

export { refetchToken, typeGuard, getDataFromFetch, checkIsAuthorize };
