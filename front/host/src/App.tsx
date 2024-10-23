import "./App.css";
import { useNavigate } from "react-router-dom";
import { ProfileType } from "./types";
import { PostsList } from "./widgets/Posts/Posts";

function App() {
  const navigate = useNavigate();

  const xcrf = document.cookie
    .split(";")
    .find((el) => el.includes("XSRF-TOKEN"));

  console.log({ xcrf });

  const getPosts = async () => {
    const userFromLs = localStorage.getItem("user");

    if (!userFromLs) {
      navigate("/login");

      return;
    }

    const user: ProfileType = JSON.parse(userFromLs);

    const xcsrf =
      document.cookie.split(";").find((el) => el.includes("XSRF-TOKEN")) ?? "";

    const res = await fetch("http://localhost:3000/posts", {
      headers: {
        accessToken: user.token,
        refreshToken: user.refreshToken,
        ["X-CSRF"]: xcsrf,
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

  const getCurrentPost = async () => {
    const userFromLs = localStorage.getItem("user");

    if (!userFromLs) {
      navigate("/login");

      return;
    }

    const user: ProfileType = JSON.parse(userFromLs);

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
    <div>
      <header className="border border-emerald-700 flex justify-end">
        <div
          onClick={() => {
            navigate("/profile");
          }}
        >
          Profile
        </div>
      </header>

      <div className="flex flex-col justify-center w-full">
        This Main App
        <div className="flex justify-center gap-10">
          <button onClick={getPosts}>getPosts</button>
          <button onClick={getCurrentPost}>getCurrentPost</button>
        </div>
        <hr />
        <PostsList />
      </div>
    </div>
  );
}

export default App;
