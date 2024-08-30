import { useState } from "react";
import styles from "./styles.module.css";
import { useNavigate } from "react-router-dom";
import { Profile } from "../../types";

export const SignIn = () => {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState(null);
  const [data, setData] = useState<Profile | null>(null);
  const navigate = useNavigate();

  /*
    Credentials

    username: 'emilys',
    password: 'emilyspass',
  
  */

  const onSubmit = (props?: RequestInit["signal"]) => {
    fetch("http://localhost:3000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ username: login, password }),
      signal: props,
    })
      .then((resp) => {
        if (resp.status > 300) {
          throw Error(resp.statusText);
        }

        return resp.json();
      })
      .then((data: Profile) => {
        console.log(" success =====>", { data });

        setData(data);

        localStorage.setItem("user", JSON.stringify(data));

        navigate("/");
      })
      .catch((err) => {
        setError(err.message);
      });
  };

  return (
    <>
      {error && (
        <div className={styles.errorBlock}>
          <div>Error</div>
          <div>{error}</div>
        </div>
      )}
      <div className={styles.mainBlock}>
        <form
          onSubmit={(e) => {
            e.preventDefault();

            onSubmit();
          }}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 40,
            padding: 50,
          }}
        >
          <label className={styles.label}>
            <div>Login</div>
            <input
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              className={styles.input}
            />
          </label>
          <label className={styles.label}>
            <div>Password</div>
            <input
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
            }}
          >
            <button
              type="submit"
              style={{
                width: 300,
              }}
            >
              Отправить
            </button>
          </div>
        </form>
      </div>
    </>
  );
};
