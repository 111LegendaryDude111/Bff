import { useEffect, useState } from "react";
import { Profile } from "../../types";
import { useNavigate } from "react-router-dom";

interface Post {
  body: string;
  id: number;
  title: string;
  userId: number;
}

export const PostsList = () => {
  const navigate = useNavigate();

  const [posts, setPosts] = useState<Post[]>([]);

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
      credentials: "include",
    })
      .then((res) => {
        if (res.status > 300) {
          navigate("/login");
          return;
        }

        return res.json();
      })
      .then((data) => {
        console.log({ data });

        setPosts(data);
      });
  }, [navigate]);

  return (
    <>
      <h1>Posts</h1>
      <div className="flex flex-col overflow-scroll p-5 gap-4">
        {posts.map((p) => {
          return (
            <div
              className="border-2 border-yellow-800 rounded-s-lg"
              key={p.title}
            >
              <div className="flex justify-between px-10">
                <span> post id: {p.id}</span>
                <span> post title: {p.title}</span>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};
