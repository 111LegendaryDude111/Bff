import "./App.css";
import { useNavigate } from "react-router-dom";
import { Profile } from "./types";
import { PostsList } from "./widgets/Posts/Posts";
/*
  Страницы:
      1) авторизация
      2) посты
      3) детальная карточка поста
      4) профиль (личный кабинет )

*/

function App() {
  const navigate = useNavigate();

  const getPosts = async () => {
    const userFromLs = localStorage.getItem("user");

    if (!userFromLs) {
      navigate("/login");

      return;
    }

    const user: Profile = JSON.parse(userFromLs);

    const res = await fetch("http://localhost:3000/posts", {
      headers: {
        accessToken: user.token,
        refreshToken: user.refreshToken,
      },
      credentials: "include",
    });

    if (res.status > 300) {
      navigate("/login");
      return;
    }

    const data = await res.json();

    console.log(data);
  };

  const setCookie = () => {
    fetch("http://localhost:3000/set-cookie", {
      method: "GET",
      credentials: "include",
    })
      .then((response) => console.log(response.data))
      .catch((error) => console.error("Error:", error));
  };

  const getCurrentPost = async () => {
    const userFromLs = localStorage.getItem("user");

    if (!userFromLs) {
      navigate("/login");

      return;
    }

    const user: Profile = JSON.parse(userFromLs);

    const res = await fetch(`http://localhost:3000/posts/${5}`, {
      headers: {
        accessToken: user.token,
        refreshToken: user.refreshToken,
      },
      credentials: "include",
    });

    if (res.status > 300) {
      navigate("/login");
      return;
    }

    const data = await res.json();

    console.log(data);
  };

  return (
    <div className="flex flex-col justify-center w-full">
      This Main App
      <div className="flex justify-center gap-10">
        <button onClick={setCookie}>Set Cookie</button>
        <button onClick={getPosts}>getPosts</button>
        <button onClick={getCurrentPost}>getCurrentPost</button>
      </div>
      <PostsList />
    </div>
  );
}

export default App;
