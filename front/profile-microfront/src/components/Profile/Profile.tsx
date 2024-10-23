import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProfileType, Post } from "./types";

export const Profile = () => {
  const navigate = useNavigate();
  const [myPosts, setMyPosts] = useState<Post[]>([]);

  useEffect(() => {
    const userFromLs = localStorage.getItem("user");

    if (!userFromLs) {
      navigate("/login");

      return;
    }

    const user: ProfileType = JSON.parse(userFromLs);
    const xcsrf =
      document.cookie.split(";").find((el) => el.includes("XSRF-TOKEN")) ?? "";
    fetch(`http://localhost:3000/usersPosts/${user.id}`, {
      headers: {
        accessToken: user.token,
        refreshToken: user.refreshToken,
        ["X-CSRF"]: xcsrf,
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
        setMyPosts(data);
      });
  }, [navigate]);

  return (
    <div>
      <button className="absolute top-0 left-0" onClick={() => navigate(-1)}>
        GO back
      </button>
      <div>My Posts: </div>
      <div className="flex flex-col gap-5">
        {myPosts.map((post) => {
          const { id, body, title } = post;
          return (
            <div key={id} className="border border-teal-800">
              <div>
                title {"\u2014 "}
                {title}
              </div>
              <hr />
              <div>
                <strong>body:</strong> <br /> {body}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
