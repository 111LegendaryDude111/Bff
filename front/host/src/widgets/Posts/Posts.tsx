import { useEffect, useState } from "react";

interface Post {
  body: string;
  id: number;
  title: string;
  userId: number;
}

export const PostsList = () => {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    fetch("http://localhost:3000/posts", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        console.log({ data });

        setPosts(data);
      });
  }, []);

  return (
    <>
      <h1>Posts</h1>
      <div className="flex flex-col  p-5 gap-4">
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
