import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { SignIn } from "./pages/SignIn/SignIn.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <div>
        <App />
      </div>
    ),
    // element: <SignIn />,
  },
  {
    path: "/login",
    element: <SignIn />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <RouterProvider router={router} />
);
