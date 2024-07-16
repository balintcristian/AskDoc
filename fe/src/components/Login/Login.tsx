import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../../constants";
import "./Login.css";
const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: any) => {
    setLoading(true);
    e.preventDefault();

    try {
      const res = await api.post("/token/", { username, password });
      localStorage.setItem(ACCESS_TOKEN, res.data.access);
      localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
      navigate("/");
    } catch (error) {
      alert("Wrong user name or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <h1>Login</h1>
      <input
        className="form-input"
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
      />
      <input
        className="form-input"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      {loading && <div>Loading..</div>}
      <button className="form-button" type="submit">
        Login
      </button>
      <button className="form-button" type="button" onClick={() => navigate("/register")}>
        Register
      </button>
    </form>
  );
};

export default Login;
