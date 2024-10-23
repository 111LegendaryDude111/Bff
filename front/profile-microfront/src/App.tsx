import { useNavigate } from "react-router-dom";
import "./App.css";
import { Profile } from "./components/Profile";
import { useEffect } from "react";

function App() {
  const nav = useNavigate();

  useEffect(() => {
    nav("/profile");
  }, [nav]);

  return <Profile />;
}

export default App;
