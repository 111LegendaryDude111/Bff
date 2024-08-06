import { useEffect } from "react";
import "./App.css";
import { useNavigate } from "react-router-dom";
import { Profile } from "./types";
/*
  Страницы:
      1) авторизация
      2) посты
      3) детальная карточка поста
      4) профиль (личный кабинет )

  Если 401 ответ с сервера перекидываем на авторизацию



*/

function App() {
  const navigate = useNavigate();

  useEffect(() => {
    const userFromLs = localStorage.getItem("user");

    if (!userFromLs) {
      navigate("/login");

      return;
    }

    const user: Profile = JSON.parse(userFromLs);

    fetch("http://localhost:3000/posts", {
      headers: {
        accessToken: user.token,
        refreshToken: user.refreshToken,
      },
    }).then((el) => console.log({ el }));
  }, [navigate]);

  return <div>This Main App</div>;
}

export default App;
